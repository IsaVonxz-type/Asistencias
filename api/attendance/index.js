import {
  getAttendanceRecords,
  createAttendance,
  findAttendanceByStudentAndDate,
} from "../../server/models/attendanceModel.js";
import { findOrCreateStudent } from "../../server/models/studentModel.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { searchId, group, date, sortField, sortDir, limit, offset } =
        req.query;
      const records = await getAttendanceRecords({
        searchId,
        group,
        date,
        sortField,
        sortDir,
        limit: Number(limit) || 200,
        offset: Number(offset) || 0,
      });
      return res.status(200).json(records);
    }

    if (req.method === "POST") {
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

      return res.status(201).json({ attendance });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error interno" });
  }
}
