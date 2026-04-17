import express, { Express, Request, Response } from 'express';
import subjectRouter from './routes/subjects';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app: Express = express();
const PORT = 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

app.use(express.json());

app.use('/subjects', subjectRouter)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
