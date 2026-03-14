import express from "express";
import {
  listAttendance,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/", listAttendance);
router.post("/", createAttendanceRecord);
router.put("/:id", updateAttendanceRecord);
router.delete("/:id", deleteAttendanceRecord);

export default router;
