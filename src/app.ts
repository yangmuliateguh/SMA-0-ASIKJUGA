import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimiter';
import { morganMiddleware } from './utils/logger';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalLimiter);

app.get('/', (_req: Request, res: Response) => {
  res.type('text/plain').send(`
███████╗███╗   ███╗ █████╗      ██████╗      █████╗  ██████╗  █████╗  █████╗ 
██╔════╝████╗ ████║██╔══██╗    ██╔═████╗    ██╔══██╗██╔════╝ ██╔══██╗██╔══██╗
███████╗██╔████╔██║███████║    ██║██╔██║    ███████║███████╗ ╚██████║███████║
╚════██║██║╚██╔╝██║██╔══██║    ████╔╝██║    ██╔══██║██╔═══██╗ ╚═══██║██╔══██║
███████║██║ ╚═╝ ██║██║  ██║    ╚██████╔╝    ██║  ██║╚██████╔╝ █████╔╝██║  ██║
╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝     ╚═════╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚═╝  ╚═╝

SMA 0 ASIKJUGA adalah sistem backend headless (RESTful API) untuk manajemen 
data akademik sekolah. Sistem ini menangani data secara terpusat agar dapat 
dikonsumsi oleh aplikasi Client (Web SPA, Mobile App, dll) secara fleksibel, 
aman, dan efisien.
  `);
});

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
