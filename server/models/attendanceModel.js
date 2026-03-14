import { query } from "./db.js";

export async function createAttendance(record) {
  const {
    studentId,
    attendanceDate,
    attendanceTime,
    className,
    competence,
    teacher,
    status,
  } = record;

  const res = await query(
    `INSERT INTO attendance
      (student_id, attendance_date, attendance_time, class_name, competence, teacher, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      studentId,
      attendanceDate,
      attendanceTime,
      className,
      competence,
      teacher,
      status,
    ],
  );
  return res.rows[0];
}

export async function updateAttendance(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key}=$${idx}`);
    values.push(value);
    idx += 1;
  }

  if (!fields.length) return null;

  values.push(id);
  const res = await query(
    `UPDATE attendance SET ${fields.join(",")} WHERE id=$${idx} RETURNING *`,
    values,
  );
  return res.rows[0];
}

export async function deleteAttendance(id) {
  await query(`DELETE FROM attendance WHERE id=$1`, [id]);
}

export async function getAttendanceRecords({
  searchId,
  group,
  date,
  sortField = "attendance_date",
  sortDir = "desc",
  limit = 100,
  offset = 0,
}) {
  const filters = [];
  const params = [];

  if (searchId) {
    params.push(`%${searchId}%`);
    filters.push(`s.id_number ILIKE $${params.length}`);
  }

  if (group) {
    params.push(group);
    filters.push(`s."group" = $${params.length}`);
  }

  if (date) {
    params.push(date);
    filters.push(`a.attendance_date = $${params.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  // Prevent SQL injection by limiting sort fields
  const allowedSort = [
    "attendance_date",
    "attendance_time",
    "id_number",
    "class_name",
    "teacher",
    "status",
    "s.full_name",
  ];
  const sort = allowedSort.includes(sortField) ? sortField : "attendance_date";
  const direction = sortDir.toLowerCase() === "asc" ? "ASC" : "DESC";

  const sql = `
    SELECT a.*, s.id_type, s.id_number, s.full_name, s."group", s.program
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    ${where}
    ORDER BY ${sort} ${direction}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(limit, offset);
  const res = await query(sql, params);
  return res.rows;
}

export async function countAbsencesByStudent(studentId) {
  const res = await query(
    `SELECT COUNT(DISTINCT attendance_date) AS faltas
     FROM attendance
     WHERE student_id=$1 AND status='Falta'`,
    [studentId],
  );
  return parseInt(res.rows[0]?.faltas ?? 0, 10);
}

export async function findAttendanceByStudentAndDate(
  studentId,
  attendanceDate,
) {
  const res = await query(
    `SELECT * FROM attendance WHERE student_id=$1 AND attendance_date=$2 LIMIT 1`,
    [studentId, attendanceDate],
  );
  return res.rows[0];
}

export async function getAbsenceSummary(date) {
  const res = await query(
    `SELECT s.id, s.id_type, s.id_number, s.full_name, s."group", s.program,
            COUNT(DISTINCT a.attendance_date) AS faltas
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND a.status='Falta'
      ${date ? "WHERE a.attendance_date = $1" : ""}
      GROUP BY s.id
      ORDER BY faltas DESC, s.full_name`,
    date ? [date] : [],
  );
  return res.rows;
}
