import dotenv from "dotenv"
dotenv.config();

if(!process.env.PORT){
	console.error("PORT is not defined in the environmental variables.");
}

if(!process.env.MONGO_URI){
	console.error(`Mongo Uri is not defined in the environmental variables.`);
}

if(!process.env.CLIENT_URL){
	console.error(`Client URL is not defined in the environmental variables.`);
}

if(!process.env.JWT_SECRET){
	console.error(`JWT secret is not defined in the environmental variables`)
}

if(!process.env.GOOGLE_CLIENT_ID){
	console.error('Google client id is not defined in the environmental variables');
}

if(!process.env.GOOGLE_CLIENT_SECRET){
	console.error('Google client secret is not defined in the environmental variables');
}

if(!process.env.GOOGLE_REFRESH_TOKEN){
	console.error('Google refresh token is not defined in the environmental variables');
}

if(!process.env.GOOGLE_USER){
	console.error('Google user is not defined in the environmental variables');
}

export default{
	PORT: process.env.PORT,
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
	GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
	GOOGLE_USER: process.env.GOOGLE_USER
};