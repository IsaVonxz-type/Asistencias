import {
  listStudents,
  getStudentAbsenceDates,
} from "../models/studentModel.js";

export async function listAllStudents(req, res, next) {
  try {
    const { search, group } = req.query;
    const students = await listStudents({ search, group });
    const formatted = students.map((s) => ({
      ...s,
      status: Number(s.total_faltas) >= 3 ? "En riesgo" : "Normal",
      total_faltas: Number(s.total_faltas),
      total_asistencias: Number(s.total_asistencias),
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
}

export async function getStudentAbsences(req, res, next) {
  try {
    const { id } = req.params;
    const dates = await getStudentAbsenceDates(id);
    res.json({ dates, total: dates.length });
  } catch (error) {
    next(error);
  }
}
