import express, { NextFunction, Request, Response } from 'express';
import config from './config';
import intiDB, { pool } from './config/db';

const app = express();
const port = config.port;

// Parser
app.use(express.json());

// initialzing DB
intiDB();

// logger middleware
const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`);
  next();
};

app.get('/', logger, (req: Request, res: Response) => {
  res.send('Hello Next Level Developer!');
});

// Usres CRUD
app.post('/users', async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(`INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`, [
      name,
      email,
    ]);

    // console.log(result.rows[0]);
    res.status(201).json({
      success: false,
      message: 'Data Inserted Successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get('/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);

    res.status(200).json({
      success: true,
      message: 'Users retrieved Successfully',
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

app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User Not Found',
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'User retrieved Successfully',
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE users SET name=$1, email=$2 WHERE id=$3  RETURNING *`,
      [name, email, req.params.id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User Not Found',
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'User updated Successfully',
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: 'User Not Found',
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'User delete Successfully',
        data: null,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// todos

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
