export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "23505") {
    return res
      .status(409)
      .json({
        error:
          "Ya existe un registro de asistencia para este estudiante en la misma fecha.",
      });
  }

  const status = err.status || 500;
  res
    .status(status)
    .json({ error: err.message || "Error interno del servidor" });
}
