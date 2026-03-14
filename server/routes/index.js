import express from "express";
import attendanceRoutes from "./attendanceRoutes.js";
import studentRoutes from "./studentRoutes.js";

const router = express.Router();

router.use("/attendance", attendanceRoutes);
router.use("/students", studentRoutes);

export default router;
