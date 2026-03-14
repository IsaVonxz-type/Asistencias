# Asistencia - Sistema de Gestión de Asistencia

Aplicación web completa para registrar y administrar la asistencia de estudiantes.

## Tecnologías

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Neon)
- **Gestión de paquetes:** pnpm

## Estructura

- `/server` - API REST + lógica MVC
- `/client` - UI React (dashboard responsive)

## Primeros pasos

1. Copia `.env.example` a `.env` y configura `DATABASE_URL` (Neon o Postgres local).

2. Instala dependencias (ya se ejecutó en este workspace):

   ```bash
   pnpm install
   ```

3. Crea las tablas en la base de datos:

   ```bash
   pnpm --filter server run migrate
   ```

4. Inicia la aplicación en desarrollo:
   - Backend: `pnpm --filter server dev`
   - Frontend: `pnpm --filter client dev`

   O desde la raíz:

   ```bash
   pnpm dev
   ```

5. Abre el frontend en el navegador:
   - http://localhost:5173

## Funcionalidades principales

- Formulario de registro de asistencia con validaciones.
- Panel de control con tabla, filtros, búsqueda, ordenamiento y exportación CSV.
- Contador de faltas por estudiante.
- Alerta visual cuando un estudiante acumula 3 o más faltas.
- Panel de estudiantes con estado (Normal / En riesgo).

## Extender

- Agregar autenticación.
- Implementar edición de registro con modal.
- Integrar reportes gráficos.
