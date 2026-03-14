import { useEffect, useState } from "react";
import { studentsApi, downloadCsv } from "../api/api";

export default function Students({ showToast }) {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ search: "", group: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await studentsApi.list(filters);
      setStudents(data);
    } catch (error) {
      showToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  const exportCsv = () => {
    const data = students.map((s) => ({
      Identificacion: `${s.id_type} ${s.id_number}`,
      Nombre: s.full_name,
      Grupo: s.group,
      Programa: s.program,
      "Total asistencias": s.total_asistencias,
      "Total faltas": s.total_faltas,
      Estado: s.status,
    }));
    downloadCsv(data, "estudiantes.csv");
  };

  return (
    <div className="students">
      <section className="panel">
        <div className="panel-header">
          <h2>Panel de estudiantes</h2>
          <div className="panel-actions">
            <button className="btn small" onClick={exportCsv} disabled={!students.length}>
              Exportar CSV
            </button>
          </div>
        </div>
        <div className="filters">
          <label>
            Buscar estudiante
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Nombre o identificación"
            />
          </label>
          <label>
            Grupo
            <input
              value={filters.group}
              onChange={(e) => setFilters({ ...filters, group: e.target.value })}
              placeholder="Grupo"
            />
          </label>
          <button className="btn" onClick={load} disabled={loading}>
            Buscar
          </button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Programa</th>
                <th>Grupo</th>
                <th>Asistencias</th>
                <th>Faltas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className={s.status === "En riesgo" ? "row-alert" : ""}>
                  <td>
                    {s.id_type} {s.id_number}
                  </td>
                  <td>{s.program}</td>
                  <td>{s.group}</td>
                  <td>{s.total_asistencias}</td>
                  <td>{s.total_faltas}</td>
                  <td>
                    <span className={`status ${s.status === "En riesgo" ? "danger" : "good"}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && !loading && <div className="empty">No se encontraron estudiantes.</div>}
        </div>
      </section>
    </div>
  );
}
