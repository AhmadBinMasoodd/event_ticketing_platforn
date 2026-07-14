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
import organizerRoutes from './routes/organizer.routes.js';
import eventRoutes from './routes/event.route.js';
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/organizers", organizerRoutes);
app.use("/api/v1/events", eventRoutes);

export default app;