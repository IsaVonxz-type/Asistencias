import express from "express";
import {
  listAllStudents,
  getStudentAbsences,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", listAllStudents);
router.get("/:id/absences", getStudentAbsences);

export default router;
