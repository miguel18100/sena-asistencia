/* =========================================================
   dashboard.js
   Lógica de la pantalla Dashboard del instructor
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  const instructor = obtenerInstructor();
  const fichas = obtenerFichas();
  const fichaPrincipal = fichas[0];

  document.getElementById("nombreInstructor").textContent = instructor ? instructor.nombre.split(" ")[0] : "Instructor";
  document.getElementById("fichaActivaLabel").textContent = fichaPrincipal
    ? `${fichaPrincipal.codigo} - ${fichaPrincipal.programa}`
    : "Sin ficha asignada";

  // KPIs
  const resumen = obtenerResumenDashboard();
  document.getElementById("kpiAprendices").textContent = resumen.totalAprendices;
  document.getElementById("kpiSesionesHoy").textContent = resumen.sesionesHoy;
  document.getElementById("kpiPromedio").textContent = resumen.asistenciaPromedio;

  // Últimas sesiones (máx 5, más recientes primero)
  const sesiones = obtenerSesiones().slice(0, 5);
  const tbody = document.getElementById("tablaUltimasSesiones");
  const estadoVacio = document.getElementById("estadoVacioSesiones");

  if (sesiones.length === 0) {
    estadoVacio.classList.remove("d-none");
  } else {
    tbody.innerHTML = sesiones
      .map((s) => {
        const ficha = obtenerFichaPorId(s.fichaId);
        const badgeClase = s.estado === "Finalizada" ? "badge-finalizada" : "badge-en-curso";
        return `
          <tr>
            <td>${formatearFecha(s.fecha)}</td>
            <td>${ficha ? ficha.codigo : "—"}</td>
            <td>${s.jornada}</td>
            <td>${s.estado === "Finalizada" ? s.asistenciaPromedio + "%" : "—"}</td>
            <td><span class="${badgeClase}">${s.estado}</span></td>
          </tr>`;
      })
      .join("");
  }
});

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}
