import { findOrCreateStudent } from "../models/studentModel.js";
import {
  createAttendance,
  findAttendanceByStudentAndDate,
  getAttendanceRecords,
  updateAttendance,
  deleteAttendance,
  countAbsencesByStudent,
} from "../models/attendanceModel.js";

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  return ["true", "1", "yes"].includes(String(value).toLowerCase());
}

export async function listAttendance(req, res, next) {
  try {
    const { searchId, group, date, sortField, sortDir, limit, offset } =
      req.query;
    const result = await getAttendanceRecords({
      searchId,
      group,
      date,
      sortField,
      sortDir,
      limit: Number(limit) || 200,
      offset: Number(offset) || 0,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createAttendanceRecord(req, res, next) {
  try {
    const {
      idType,
      idNumber,
      fullName,
      group,
      program,
      date,
      time,
      className,
      competence,
      teacher,
      status = "Presente",
    } = req.body;

    if (
      !idType ||
      !idNumber ||
      !date ||
      !time ||
      !className ||
      !competence ||
      !teacher ||
      !group ||
      !program
    ) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    const student = await findOrCreateStudent({
      idType,
      idNumber,
      fullName: fullName || "",
      group,
      program,
    });

    // Prevent duplicate record same student/date
    const existingAttendance = await findAttendanceByStudentAndDate(
      student.id,
      date,
    );
    if (existingAttendance) {
      return res.status(409).json({
        error:
          "Ya existe un registro de asistencia para este estudiante en la misma fecha.",
      });
    }

    const attendance = await createAttendance({
      studentId: student.id,
      attendanceDate: date,
      attendanceTime: time,
      className,
      competence,
      teacher,
      status,
    });

    const faltas = await countAbsencesByStudent(student.id);

    res.status(201).json({ attendance, faltas });
  } catch (error) {
    next(error);
  }
}

export async function updateAttendanceRecord(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const attendance = await updateAttendance(id, updates);
    if (!attendance) {
      return res.status(404).json({ error: "Registro no encontrado." });
    }
    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function deleteAttendanceRecord(req, res, next) {
  try {
    const { id } = req.params;
    await deleteAttendance(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
