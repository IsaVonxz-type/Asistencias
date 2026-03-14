import { getStudentAbsenceDates } from "../../../server/models/studentModel.js";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  try {
    if (method === "GET") {
      const dates = await getStudentAbsenceDates(id);
      return res.status(200).json({ dates, total: dates.length });
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error interno" });
  }
}
