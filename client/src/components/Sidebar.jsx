import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Asistencia</div>
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Dashboard
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Estudiantes
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <small>v1.0 · pnpm</small>
      </div>
    </aside>
  );
}
