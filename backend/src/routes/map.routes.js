import express from "express";
import { getNearbyCaptains } from "../controllers/map.controller.js";

const router = express.Router();

router.get("/get-nearby-captains", getNearbyCaptains);

export default router;