/* =========================================================
   reportes.js
   Lógica de la pantalla "Reportes de asistencia"
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  const selectFicha = document.getElementById("selectFichaReporte");
  const inputDesde = document.getElementById("inputDesde");
  const inputHasta = document.getElementById("inputHasta");
  const form = document.getElementById("formFiltrosReporte");

  // Poblar fichas
  const fichas = obtenerFichas();
  selectFicha.innerHTML = fichas
    .map((f) => `<option value="${f.id}">${f.codigo} - ${f.programa}</option>`)
    .join("");

  // Rango de fechas por defecto: últimos 30 días
  const hoy = new Date();
  const hace30dias = new Date();
  hace30dias.setDate(hoy.getDate() - 30);

  inputHasta.value = hoy.toISOString().slice(0, 10);
  inputDesde.value = hace30dias.toISOString().slice(0, 10);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generarReporte();
  });

  generarReporte();
});

function generarReporte() {
  const fichaId = document.getElementById("selectFichaReporte").value;
  const desde = document.getElementById("inputDesde").value;
  const hasta = document.getElementById("inputHasta").value;

  const datos = obtenerReporteAsistenciaPorAprendiz(fichaId, desde, hasta);

  const totalAsistencias = datos.reduce((acc, d) => acc + d.asistio, 0);
  const totalInasistencias = datos.reduce((acc, d) => acc + d.inasistio, 0);
  const totalRegistros = totalAsistencias + totalInasistencias;
  const porcentajeGeneral = totalRegistros > 0 ? Math.round((totalAsistencias / totalRegistros) * 100) : 0;

  document.getElementById("kpiAsistenciasTotales").textContent = totalAsistencias;
  document.getElementById("kpiInasistenciasTotales").textContent = totalInasistencias;
  document.getElementById("kpiPorcentajeGeneral").textContent = porcentajeGeneral;

  const tbody = document.getElementById("tablaReporte");
  const estadoVacio = document.getElementById("estadoVacioReporte");

  const datosConRegistros = datos.filter((d) => d.asistio + d.inasistio > 0);

  if (datosConRegistros.length === 0) {
    tbody.innerHTML = "";
    estadoVacio.classList.remove("d-none");
    return;
  }
  estadoVacio.classList.add("d-none");

  tbody.innerHTML = datosConRegistros
    .map(
      (d) => `
      <tr>
        <td>${d.aprendiz.nombre}</td>
        <td>${d.asistio}</td>
        <td>${d.inasistio}</td>
        <td>${d.porcentaje}%</td>
      </tr>`
    )
    .join("");
}
