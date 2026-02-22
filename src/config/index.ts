import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  connection_str: process.env.Connection_String,
  port: process.env.PORT,
};

export default config;
