const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || "Error en la petición");
  }
  return body;
}

export const attendanceApi = {
  list: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return request(`/attendance?${query}`);
  },
  create: (payload) => request(`/attendance`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/attendance/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => request(`/attendance/${id}`, { method: "DELETE" }),
};

export const studentsApi = {
  list: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return request(`/students?${query}`);
  },
  absences: (studentId) => request(`/students/${studentId}/absences`),
};

export function downloadCsv(data, filename) {
  const csv = data
    .map((row) =>
      Object.values(row)
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
