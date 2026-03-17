import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is in the same directory as this file's parent's parent (Backend/.env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("Environment variables loaded from:", path.resolve(__dirname, '../../.env'));
