import express from 'express';
import { promises } from 'fs';
import cors from 'cors';

//cria logs da api automáticamente
import winston from 'winston';

import router from './routes/routes.js';

const fs = promises;

//definindo formato do log
const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
	level: 'silly',
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'grades-control-api.log' }),
	],
	format: combine(
		label({ label: 'grades-control-api' }),
		timestamp(),
		myFormat
	),
});

global.fileName = 'grades.json';

var app = express();
app.use(express.json());

// permite acesso ao endpoint por diferentes portas
app.use(cors());
app.use('/grade', router);

app.listen(3333, async () => {
	try {
		await fs.readFile(global.fileName, 'utf-8');
		logger.info('API Grades Control API started!');
	} catch (err) {
		logger.info(err.message);
	}
});
