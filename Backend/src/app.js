import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(cookieParser());
app.use(json());
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
));

app.use(express.urlencoded(
    {
        extended:true,
        limit:"16kb"
    }
))

app.use(express.static("public"))
app.use(cookieParser());
import userRoutes from './routes/user.routes.js';
app.use("/api/v1/users", userRoutes);

export default app;