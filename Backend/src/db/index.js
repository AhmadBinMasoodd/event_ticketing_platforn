import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const connectDB = async () => {
    try{
        console.log("Connecting to MongoDB...");
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}${DB_NAME}`)
        console.log(`\n MongoDb connected: ${connectionInstance.connection.host}`);
    }catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}
export default connectDB;