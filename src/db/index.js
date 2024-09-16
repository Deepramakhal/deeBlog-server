import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

const connectDB = async () =>{
    try {
        const connectionToDB = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`Database connected at host : ${connectionToDB.connection.host}`);
    } catch (error) {
        console.log("Database connection FAILED",error);
        process.exit(1)
    }
}

export default connectDB