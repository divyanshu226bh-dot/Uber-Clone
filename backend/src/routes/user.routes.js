import express from "express";
const authRouter = express.Router();
import * as controllers from "../controllers/auth.controller.js";

/* 
- POST /api/auth/register (Rider)
- POST /api/auth/register-captain (Driver)
*/
authRouter.post("/register", controllers.registerUser);
authRouter.post("/register-captain", controllers.registerCaptain);

/* 
- POST /api/auth/login (Rider)
- POST /api/auth/login-captain (Driver)
*/
authRouter.post("/login", controllers.login);
authRouter.post("/login-captain", controllers.loginCaptain);

/*
- GET /api/auth/get-me
*/
authRouter.get("/get-me", controllers.getMe);

/* 
- GET /api/auth/rotate-token
*/
authRouter.get("/rotate-token", controllers.rotateToken);

/*
- GET /api/auth/logout
*/
authRouter.get("/logout", controllers.logout);

/*
- GET /api/auth/logout-all
*/
authRouter.get("/logout-all", controllers.logoutAll);


export default authRouter;