import { useEffect, useMemo, useState } from "react";
import { attendanceApi, studentsApi, downloadCsv } from "../api/api";

const ID_TYPES = ["CC", "TI", "CE", "Pasaporte"];

const defaultForm = {
  idType: "CC",
  idNumber: "",
  fullName: "",
  group: "",
  program: "",
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toLocaleTimeString([], { hour12: false }).slice(0, 5),
  className: "",
  competence: "",
  teacher: "",
  status: "Presente",
};

export default function Dashboard({ showToast }) {
  const [form, setForm] = useState(defaultForm);
  const [records, setRecords] = useState([]);
  const [riskIds, setRiskIds] = useState(new Set());
  const [filters, setFilters] = useState({ searchId: "", group: "", date: "" });
  const [loading, setLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      const students = await studentsApi.list({});
      const atRisk = new Set(
        students
          .filter((s) => s.status === "En riesgo")
          .map((s) => s.id_number),
      );
      setRiskIds(atRisk);
    } catch (error) {
      // ignore
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await attendanceApi.list(filters);
      setRecords(data);
    } catch (error) {
      showToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    loadAlerts();
  }, [filters]);

  const stats = useMemo(() => {
    const total = records.length;
    const faltas = records.filter((r) => r.status === "Falta").length;
    return { total, faltas, withAlert: riskIds.size };
  }, [records, riskIds]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!window.confirm("¿Confirmas registrar esta asistencia?")) return;
    try {
      await attendanceApi.create({
        idType: form.idType,
        idNumber: form.idNumber,
        fullName: form.fullName,
        group: form.group,
        program: form.program,
        date: form.date,
        time: form.time,
        className: form.className,
        competence: form.competence,
        teacher: form.teacher,
        status: form.status,
      });
      showToast({
        type: "success",
        message: "Asistencia registrada correctamente.",
      });
      setForm(defaultForm);
      loadRecords();
    } catch (error) {
      showToast({ type: "error", message: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este registro de asistencia?")) return;
    try {
      await attendanceApi.delete(id);
      showToast({ type: "success", message: "Registro eliminado." });
      loadRecords();
    } catch (error) {
      showToast({ type: "error", message: error.message });
    }
  };

  const handleEdit = async (record) => {
    const status = window.prompt("Estado (Presente/Falta)", record.status);
    if (!status) return;
    try {
      await attendanceApi.update(record.id, { status });
      showToast({ type: "success", message: "Registro actualizado." });
      loadRecords();
    } catch (error) {
      showToast({ type: "error", message: error.message });
    }
  };

  const exportCsv = () => {
    const data = records.map((r) => ({
      Grupo: r.group,
      "Tipo de identificación": r.id_type,
      "Número de identificación": r.id_number,
      Fecha: r.attendance_date,
      Hora: r.attendance_time,
      Clase: r.class_name,
      Competencia: r.competence,
      Profesor: r.teacher,
      Programa: r.program,
      Estado: r.status,
    }));
    downloadCsv(data, "asistencia.csv");
  };

  return (
    <div className="dashboard">
      <section className="form-card">
        <h2>Registrar asistencia</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="asis-label">
            Grupo
            <input
              className="asis-input"
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Tipo de identificación
            <select
              className="asis-input"
              value={form.idType}
              onChange={(e) => setForm({ ...form, idType: e.target.value })}
              required
            >
              {ID_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="asis-label">
            Número de identificación
            <input
              className="asis-input"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Nombre del profesor
            <input
              className="asis-input"
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Programa de formación
            <input
              className="asis-input"
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Nombre completo
            <input
              className="asis-input"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Fecha
            <input
              className="asis-input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Hora
            <input
              className="asis-input"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Clase / asignatura
            <input
              className="asis-input"
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Competencia
            <input
              className="asis-input"
              value={form.competence}
              onChange={(e) => setForm({ ...form, competence: e.target.value })}
              required
            />
          </label>
          <label className="asis-label">
            Estado
            <select
              className="asis-input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value="Presente">Presente</option>
              <option value="Falta">Falta</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              Registrar asistencia
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setForm(defaultForm)}
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Panel de control</h2>
          <div className="panel-actions">
            <button className="btn small" onClick={exportCsv}>
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-title">Total registros</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total faltas</div>
            <div className="stat-value">{stats.faltas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Estudiantes con alerta</div>
            <div className="stat-value">{stats.withAlert}</div>
          </div>
        </div>

        {stats.withAlert > 0 && (
          <div className="alert">
            ⚠️ {stats.withAlert} estudiante(s) han acumulado 3 días de
            inasistencia.
          </div>
        )}

        <div className="filters">
          <label>
            Buscar por identificación
            <input
              value={filters.searchId}
              onChange={(e) =>
                setFilters({ ...filters, searchId: e.target.value })
              }
              placeholder="Número de identificación"
            />
          </label>
          <label>
            Filtrar por grupo
            <input
              value={filters.group}
              onChange={(e) =>
                setFilters({ ...filters, group: e.target.value })
              }
              placeholder="Grupo"
            />
          </label>
          <label>
            Filtrar por fecha
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </label>
          <button className="btn" onClick={loadRecords} disabled={loading}>
            Buscar
          </button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Tipo</th>
                <th>Identificación</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Clase</th>
                <th>Competencia</th>
                <th>Profesor</th>
                <th>Programa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => {
                const isAlert = riskIds.has(row.id_number);
                return (
                  <tr key={row.id} className={isAlert ? "row-alert" : ""}>
                    <td>{row.group}</td>
                    <td>{row.id_type}</td>
                    <td>{row.id_number}</td>
                    <td>{row.attendance_date}</td>
                    <td>{row.attendance_time}</td>
                    <td>{row.class_name}</td>
                    <td>{row.competence}</td>
                    <td>{row.teacher}</td>
                    <td>{row.program}</td>
                    <td
                      className={
                        "status-label " +
                        (row.status === "Falta"
                          ? "status absent"
                          : "status present")
                      }
                    >
                      {row.status}
                    </td>
                    <td>
                      <button
                        className="btn tiny"
                        onClick={() => handleEdit(row)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn tiny danger"
                        onClick={() => handleDelete(row.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {records.length === 0 && !loading && (
            <div className="empty">No hay registros.</div>
          )}
        </div>
      </section>
    </div>
  );
}
