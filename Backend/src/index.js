import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({path:"./.env"});
import {DB_NAME} from "./constant.js";

const PORT=process.env.PORT || 8000;

connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((err)=>{
    console.error("Error connecting to the database:", err);
    process.exit(1);
})