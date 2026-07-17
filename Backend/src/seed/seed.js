import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import connectDB from "../db/index.js";

import User, { Roles } from "../models/user.model.js";
import Organizer from "../models/organizer.model.js";
import Event, { EventStatus } from "../models/event.model.js";

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Cleaning database...");

        await Event.deleteMany({});
        await Organizer.deleteMany({});
        await User.deleteMany({});

        console.log("Creating users...");

        const users = await User.create([
            {
                name: "Admin",
                email: "admin@test.com",
                password: "Admin123@",
                role: Roles.ADMIN,
                phone: "03000000001",
            },
            {
                name: "Ali Organizer",
                email: "ali@test.com",
                password: "Organizer123@",
                role: Roles.ORGANIZER,
                phone: "03000000002",
            },
            {
                name: "Ahmed Organizer",
                email: "ahmed@test.com",
                password: "Organizer123@",
                role: Roles.ORGANIZER,
                phone: "03000000003",
            },
            {
                name: "Customer One",
                email: "customer1@test.com",
                password: "Customer123@",
                role: Roles.CUSTOMER,
                phone: "03000000004",
            },
            {
                name: "Customer Two",
                email: "customer2@test.com",
                password: "Customer123@",
                role: Roles.CUSTOMER,
                phone: "03000000005",
            },
            {
                name: "Customer Three",
                email: "customer3@test.com",
                password: "Customer123@",
                role: Roles.CUSTOMER,
                phone: "03000000006",
            },
        ]);

        console.log("Users created");

        console.log("Creating organizers...");

        const organizers = await Organizer.create([
            {
                owner: users[1]._id,
                businessName: "Tech Events",
                businessEmail: "events@test.com",
                businessPhone: "03110000001",
                address: "Johar Town",
                city: "Lahore",
                isVerified: true,
            },
            {
                owner: users[2]._id,
                businessName: "Future Conferences",
                businessEmail: "future@test.com",
                businessPhone: "03110000002",
                address: "Blue Area",
                city: "Islamabad",
                isVerified: true,
            },
        ]);

        console.log("Organizers created");

        console.log("Creating events...");

        const cities = [
            "Lahore",
            "Karachi",
            "Islamabad",
            "Faisalabad",
        ];

        const statuses = [
            EventStatus.UPCOMING,
            EventStatus.ONGOING,
            EventStatus.COMPLETED,
            EventStatus.CANCELLED,
        ];

        const events = [];

        for (let i = 1; i <= 10; i++) {
            events.push({
                organizer: organizers[i % 2]._id,

                title: `Tech Event ${i}`,

                description: `Description for Tech Event ${i}`,

                venue: `Expo Center Hall ${i}`,

                city: cities[i % cities.length],

                eventDate: new Date(
                    Date.now() + i * 24 * 60 * 60 * 1000
                ),

                startTime: "10:00 AM",

                endTime: "04:00 PM",

                capacity: 100 + i * 50,

                ticketsSold: i * 5,

                status: statuses[i % statuses.length],

                isPublished: i % 2 === 0,
            });
        }

        await Event.insertMany(events);

        console.log("Events created");

        console.log("\n================================");
        console.log("Database seeded successfully");
        console.log("================================");

        console.log("\nAdmin");
        console.log("admin@test.com");
        console.log("Admin123@");

        console.log("\nOrganizer");
        console.log("ali@test.com");
        console.log("Organizer123@");

        console.log("\nOrganizer");
        console.log("ahmed@test.com");
        console.log("Organizer123@");

        console.log("\nCustomer");
        console.log("customer1@test.com");
        console.log("Customer123@");

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();