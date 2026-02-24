import express, { Request, Response } from 'express';
import config from './config';
import initDB, { pool } from './config/db';
import logger from './middleware/logger';
import { userRouter } from './modules/user/user.routes';
import { todoRouter } from './modules/todo/todo.routes';

const app = express();
const port = config.port;

// Parser
app.use(express.json());

// initialzing DB
initDB();

// logger middleware
app.get('/', logger, (req: Request, res: Response) => {
  res.send('Hello Next Level Developer!');
});

// Usres CRUD
app.use('/users', userRouter);

// Todos CRUD
app.use('/todos', todoRouter);

// Not Found Route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
    path: req.path,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
