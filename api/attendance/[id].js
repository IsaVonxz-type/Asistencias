import {
  updateAttendance,
  deleteAttendance,
} from "../../server/models/attendanceModel.js";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  try {
    if (method === "PUT") {
      const updates = req.body;
      const attendance = await updateAttendance(id, updates);
      if (!attendance) {
        return res.status(404).json({ error: "Registro no encontrado." });
      }
      return res.status(200).json(attendance);
    }

    if (method === "DELETE") {
      await deleteAttendance(id);
      return res.status(204).end();
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error interno" });
  }
}
