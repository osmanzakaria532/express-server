import express, { Request, Response } from 'express';
import config from './config';
import intiDB, { pool } from './config/db';
import logger from './middleware/logger';
import { userRouter } from './modules/user/user.routes';

const app = express();
const port = config.port;

// Parser
app.use(express.json());

// initialzing DB
intiDB();

// logger middleware

app.get('/', logger, (req: Request, res: Response) => {
  res.send('Hello Next Level Developer!');
});

// Usres CRUD
app.use('/users', userRouter);

// Todos CRUD
app.post('/todos', async (req: Request, res: Response) => {
  const { user_id, title } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO todos(user_id, title) VALUES($1, $2) RETURNING *`,
      [user_id, title],
    );
    res.status(201).json({
      success: true,
      message: 'todo created',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get('/todos', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM todos`);

    res.status(200).json({
      success: true,
      message: 'Todos retrieved Successfully',
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: error,
    });
  }
});

// Get single todo
app.get('/todos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// Update todo
app.put('/todos/:id', async (req, res) => {
  const { title, completed } = req.body;

  try {
    const result = await pool.query(
      'UPDATE todos SET title=$1, completed=$2 WHERE id=$3 RETURNING *',
      [title, completed, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM todos WHERE id=$1 RETURNING *', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ success: true, message: 'Todo deleted', data: null });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

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
