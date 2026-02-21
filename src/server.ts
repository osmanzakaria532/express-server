import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const app = express();
const port = 5000;

// Parser
app.use(express.json());

// DB
const pool = new Pool({
  connectionString: `${process.env.Connection_String}`,
});

const intiDB = async () => {
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      age INT,
      phone VARCHAR(15),
      address TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
    `,
  );

  await pool.query(
    `
      CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
  );
};

intiDB();

app.get('/', (req: Request, res: Response) => {
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
