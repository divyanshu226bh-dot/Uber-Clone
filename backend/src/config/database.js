import mongoose from "mongoose";
import config from "./config.js";

export default async function connectDb(){
	await mongoose.connect(config.MONGO_URI);
}