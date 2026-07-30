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
import TicketTypeRoutes from './routes/ticketType.route.js';
import orderRoutes from './routes/order.route.js';
import ticketRoutes from './routes/ticket.route.js';
import customerDashboardRoutes from './routes/dashboard/customer.dashboard.router.js';
import organizerDashboardRoutes from './routes/dashboard/organizer.dashboard.router.js';
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/organizers", organizerRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/ticket-types", TicketTypeRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/dashboard/customer", customerDashboardRoutes);
app.use("/api/v1/dashboard/organizer", organizerDashboardRoutes);

export default app;