import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobApplicationsRoutes from './routes/jobApplicationsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dotenvResult = dotenv.config({ path: './.env' });

console.log(`[backend] process.cwd(): ${process.cwd()}`);
console.log(`[backend] .env exists: ${fs.existsSync(path.resolve(process.cwd(), '.env'))}`);
if (dotenvResult.error) {
  console.error(`[backend] dotenv error: ${dotenvResult.error.message}`);
}
console.log(`[backend] process.env.PORT: ${process.env.PORT}`);
console.log(`[backend] process.env.MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`[backend] process.env.JWT_SECRET loaded: ${Boolean(process.env.JWT_SECRET)}`);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', jobApplicationsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);




app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HireHub API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`[backend] Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `[backend] Port ${PORT} is already in use (EADDRINUSE). ` +
            `Stop the existing process or set PORT in your .env.`
        );
        process.exit(1);
      }
      console.error('[backend] Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error(`[backend] Startup failed:\n${err.message}`);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log('[backend] Shutting down...');
  try {
    if (!server) {
      process.exit(0);
      return;
    }

    server.close(() => {
      console.log('[backend] Server closed');
      process.exit(0);
    });
  } catch (e) {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
