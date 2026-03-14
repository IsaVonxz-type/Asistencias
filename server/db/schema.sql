-- Schema for Attendance Management

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    id_type VARCHAR(10) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    "group" VARCHAR(50),
    program VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (id_type, id_number)
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    attendance_time TIME NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    competence VARCHAR(255) NOT NULL,
    teacher VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Presente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (attendance_date);

CREATE INDEX IF NOT EXISTS idx_students_group ON students ("group");