import { listStudents } from "../../server/models/studentModel.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { search, group } = req.query;
      const students = await listStudents({ search, group });
      return res.status(200).json(
        students.map((s) => ({
          ...s,
          status: Number(s.total_faltas) >= 3 ? "En riesgo" : "Normal",
          total_faltas: Number(s.total_faltas),
          total_asistencias: Number(s.total_asistencias),
        })),
      );
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error interno" });
  }
}
