import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/Toast";
import { useState } from "react";

export default function App() {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header title={location.pathname === "/" ? "Dashboard" : "Estudiantes"} />
        <main className="content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard showToast={setToast} />}
            />
            <Route
              path="/students"
              element={<Students showToast={setToast} />}
            />
          </Routes>
        </main>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
