import express from 'express';

import { promises } from 'fs';
const fs = promises;

const router = express.Router();

// liberando para apenas uma rota router.get('/',cors(), async (_, res) => {
router.get('/', async (_, res) => {
	try {
		let data = await fs.readFile(global.fileName, 'utf-8');
		let json = JSON.parse(data);

		delete json.nextId;

		logger.info(`GET /grade - grades returned`);

		res.status(200).send(json.grades);
	} catch (err) {
		logger.err(`GET /grade - ${err.message}`);
		res.status(400).send({ error: err.message });
	}
});

router.get('/:id', async (req, res) => {
	try {
		let { id } = req.params;
		id = Number(id);

		let data = await fs.readFile(global.fileName, 'utf-8');

		let json = await JSON.parse(data);

		const grade = json.grades.find(grade => grade.id === id);

		if (grade) {
			logger.info(`GET /grade/${id} - ${grade}`);
			res.send(grade);
		} else {
			throw new Error(`Grade with id : ${id} doesn't exist`);
		}
	} catch (err) {
		res.status(400).send({ err: err.message });
		logger.err(`GET /grade/${id} - ${err.message}`);
	}
});

router.post('/', async (req, res) => {
	try {
		let grade = req.body;
		grade = { ...grade, timestamp: new Date() };
		let data = await fs.readFile(global.fileName, 'utf-8');
		let json = JSON.parse(data);

		grade = { id: json.nextId++, ...grade };
		json.grades.push(grade);

		await fs.writeFile(global.fileName, JSON.stringify(json));

		logger.info(`POST /grade - ${JSON.stringify(grade)}`);
		res.status(200).send(json.grades);
	} catch (err) {
		logger.err(`POST /grade - ${err.message}`);
		res.status(400).send({ error: err.message });
	}
});

router.put('/', async (req, res) => {
	try {
		let newGrade = req.body;

		let data = await fs.readFile(global.fileName, 'utf-8');
		let json = JSON.parse(data);

		let oldIndex = json.grades.findIndex(grade => grade.id === newGrade.id);
		let oldGrade = json.grades[oldIndex];
		json.grades[oldIndex] = newGrade;

		newGrade = { ...newGrade, timestamp: new Date() };

		await fs.writeFile(global.fileName, JSON.stringify(json));
		logger.info(`PUT /grade - Old grade: ${oldGrade} - New grade: ${newGrade}`);

		res.status(200).send(json.grades);
	} catch (err) {
		logger.err(`PUT /grade - ${err.message}`);
		res.status(400).send({ error: err.message });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		let { id } = req.params;
		id = Number(id);
		let data = await fs.readFile(global.fileName, 'utf-8');
		let json = JSON.parse(data);

		let filteredGrades = json.grades.filter(grade => grade.id !== id);
		json.grades = filteredGrades;

		await fs.writeFile(global.fileName, JSON.stringify(json));

		logger.info(`DELETE /grade/${id}`);

		res.status(200).send('grade deleted');
	} catch (err) {
		logger.err(`DELETE /grade/${id} - ${err.message}`);
		res.status(400).send({ error: err.message });
	}
});

router.post('/total-grade', async (req, res) => {
	try {
		const { subject, student } = req.body;
		let data = await fs.readFile(global.fileName, 'utf-8');
		let json = JSON.parse(data);

		let filteredGrades = json.grades.filter(
			grade => grade.student === student && grade.subject === subject
		);

		if (filteredGrades.length > 0) {
			var initialValue = 0;

			const total = filteredGrades.reduce(
				(accumulator, current) => accumulator + current.value,
				initialValue
			);

			logger.info(
				`POST /grade/MEDIA - student: ${student} - subject: ${subject} - total: ${total}`
			);

			res.send({ student, subject, total });
		} else {
			throw new Error(`Can't find data with the passed criteria `);
		}
	} catch (err) {
		res.status(400).send({ error: err.message });
		logger.err(`POST /grade/total- ${err.message}`);
	}
});

router.post('/media', async (req, res) => {
	try {
		const { type, subject } = req.body;
		let data = await fs.readFile(global.fileName, 'utf-8');
		let json = JSON.parse(data);

		let filteredGrades = json.grades.filter(
			grade => grade.subject === subject && grade.type === type
		);

		if (filteredGrades.length > 0) {
			var initialValue = 0;

			const media =
				filteredGrades.reduce(
					(accumulator, current) => accumulator + current.value,
					initialValue
				) / filteredGrades.length;

			logger.info(
				`POST /grade/MEDIA - subject: ${subject} - type: ${type} - media: ${media}`
			);

			res.send({ subject, type, media });
		} else {
			throw new Error(`Can't find data with the passed criteria `);
		}
	} catch (err) {
		res.status(400).send({ error: err.message });
		logger.err(`POST /grade/media- ${err.message}`);
	}
});

router.post('/top-grades', async (req, res) => {
	try {
		const { type, subject } = req.body;
		let data = await fs.readFile(global.fileName, 'utf-8');
		let json = JSON.parse(data);

		let filteredGrades = json.grades.filter(
			grade => grade.subject === subject && grade.type === type
		);

		if (filteredGrades.length > 0) {
			const topGrades = filteredGrades
				.sort((a, b) => b.value - a.value)
				.slice(0, 3);

			logger.info(
				`POST /grade/MEDIA - subject: ${subject} - type: ${type} - top grades: ${topGrades}`
			);

			res.send(topGrades);
		} else {
			throw new Error(`Can't find data with the passed criteria `);
		}
	} catch (err) {
		res.status(400).send({ error: err.message });
		logger.err(`POST /grade/media- ${err.message}`);
	}
});

export default router;
