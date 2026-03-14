import { query } from "./db.js";

export async function findOrCreateStudent({
  idType,
  idNumber,
  fullName,
  group,
  program,
}) {
  const existing = await query(
    `SELECT * FROM students WHERE id_type=$1 AND id_number=$2 LIMIT 1`,
    [idType, idNumber],
  );
  if (existing.rows.length > 0) {
    const student = existing.rows[0];
    // update static info if changed
    await query(
      `UPDATE students SET full_name=$1, "group"=$2, program=$3 WHERE id=$4`,
      [fullName, group, program, student.id],
    );
    return { ...student, full_name: fullName, group, program };
  }

  const result = await query(
    `INSERT INTO students (id_type, id_number, full_name, "group", program)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [idType, idNumber, fullName, group, program],
  );
  return result.rows[0];
}

export async function getStudentById(id) {
  const res = await query(`SELECT * FROM students WHERE id=$1`, [id]);
  return res.rows[0];
}

export async function findStudentByIdentity(idType, idNumber) {
  const res = await query(
    `SELECT * FROM students WHERE id_type=$1 AND id_number=$2 LIMIT 1`,
    [idType, idNumber],
  );
  return res.rows[0];
}

export async function listStudents({ search, group }) {
  const filters = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    filters.push(
      `(id_number ILIKE $${params.length} OR full_name ILIKE $${params.length})`,
    );
  }
  if (group) {
    params.push(group);
    filters.push(`"group" = $${params.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const sql = `
    SELECT
      s.*,
      COALESCE(SUM(CASE WHEN a.status = 'Falta' THEN 1 ELSE 0 END), 0) AS total_faltas,
      COALESCE(SUM(CASE WHEN a.status = 'Presente' THEN 1 ELSE 0 END), 0) AS total_asistencias
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id
    ${where}
    GROUP BY s.id
    ORDER BY s.full_name NULLS LAST, s.id
  `;
  const res = await query(sql, params);
  return res.rows;
}

export async function getStudentAbsenceDates(studentId) {
  const res = await query(
    `SELECT DISTINCT attendance_date
     FROM attendance
     WHERE student_id=$1 AND status='Falta'
     ORDER BY attendance_date DESC`,
    [studentId],
  );
  return res.rows.map((r) => r.attendance_date);
}
