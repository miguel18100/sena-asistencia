/* =========================================================
   historial.js
   Lógica de la pantalla "Historial de asistencias"
   (vista del instructor: lista de sesiones + detalle)
   ========================================================= */

const REGISTROS_POR_PAGINA = 5;
let paginaActual = 1;
let modalDetalle = null;

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  modalDetalle = new bootstrap.Modal(document.getElementById("modalDetalleSesion"));

  poblarSelectFichas();
  renderizarTabla();

  document.getElementById("inputBuscar").addEventListener("input", () => {
    paginaActual = 1;
    renderizarTabla();
  });

  document.getElementById("selectFiltroFicha").addEventListener("change", () => {
    paginaActual = 1;
    renderizarTabla();
  });
});

function poblarSelectFichas() {
  const select = document.getElementById("selectFiltroFicha");
  const fichas = obtenerFichas();
  fichas.forEach((f) => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = `${f.codigo} - ${f.programa}`;
    select.appendChild(option);
  });
}

function obtenerSesionesFiltradas() {
  const textoBusqueda = document.getElementById("inputBuscar").value.trim().toLowerCase();
  const fichaFiltro = document.getElementById("selectFiltroFicha").value;

  let sesiones = obtenerSesiones();

  if (fichaFiltro) {
    sesiones = sesiones.filter((s) => s.fichaId === fichaFiltro);
  }

  if (textoBusqueda) {
    // Búsqueda por nombre/documento: filtra sesiones donde algún aprendiz coincida
    const asistencias = obtenerAsistencias();
    const aprendices = obtenerAprendices();

    const idsAprendicesCoincidentes = aprendices
      .filter(
        (a) =>
          a.nombre.toLowerCase().includes(textoBusqueda) || a.documento.includes(textoBusqueda)
      )
      .map((a) => a.id);

    const idsSesionesConCoincidencia = new Set(
      asistencias
        .filter((a) => idsAprendicesCoincidentes.includes(a.aprendizId))
        .map((a) => a.sesionId)
    );

    sesiones = sesiones.filter((s) => idsSesionesConCoincidencia.has(s.id));
  }

  return sesiones;
}

function renderizarTabla() {
  const sesiones = obtenerSesionesFiltradas();
  const tbody = document.getElementById("tablaHistorial");
  const estadoVacio = document.getElementById("estadoVacioHistorial");

  if (sesiones.length === 0) {
    tbody.innerHTML = "";
    estadoVacio.classList.remove("d-none");
    document.getElementById("paginacionHistorial").innerHTML = "";
    return;
  }
  estadoVacio.classList.add("d-none");

  const totalPaginas = Math.ceil(sesiones.length / REGISTROS_POR_PAGINA);
  paginaActual = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const sesionesPagina = sesiones.slice(inicio, inicio + REGISTROS_POR_PAGINA);

  tbody.innerHTML = sesionesPagina
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
          <td>
            <button class="btn btn-sm btn-outline-sena" onclick="verDetalleSesion('${s.id}')">
              <i class="bi bi-eye"></i>
            </button>
          </td>
        </tr>`;
    })
    .join("");

  renderizarPaginacion(totalPaginas);
}

function renderizarPaginacion(totalPaginas) {
  const contenedor = document.getElementById("paginacionHistorial");
  if (totalPaginas <= 1) {
    contenedor.innerHTML = "";
    return;
  }

  let html = "";
  for (let i = 1; i <= totalPaginas; i++) {
    html += `
      <li class="page-item ${i === paginaActual ? "active" : ""}">
        <button class="page-link" style="color:${i === paginaActual ? "#fff" : "#39A900"}; ${i === paginaActual ? "background-color:#39A900; border-color:#39A900;" : ""}" onclick="cambiarPagina(${i})">${i}</button>
      </li>`;
  }
  contenedor.innerHTML = html;
}

function cambiarPagina(numero) {
  paginaActual = numero;
  renderizarTabla();
}

function verDetalleSesion(sesionId) {
  const sesion = obtenerSesionPorId(sesionId);
  const ficha = obtenerFichaPorId(sesion.fichaId);
  const registros = obtenerAsistenciasPorSesion(sesionId);

  document.getElementById("detalleSesionInfo").innerHTML = `
    <p class="mb-1"><strong>Ficha:</strong> ${ficha ? ficha.codigo + " - " + ficha.programa : "—"}</p>
    <p class="mb-0"><strong>Fecha:</strong> ${formatearFecha(sesion.fecha)} · <strong>Jornada:</strong> ${sesion.jornada}</p>
  `;

  document.getElementById("tablaDetalleAprendices").innerHTML = registros
    .map((r) => {
      const aprendiz = obtenerAprendizPorId(r.aprendizId);
      const badge = r.estado === "Asistió" ? "badge-asistio" : "badge-inasistio";
      return `
        <tr>
          <td>${aprendiz ? aprendiz.nombre : "—"}</td>
          <td>${aprendiz ? aprendiz.documento : "—"}</td>
          <td>${r.hora || "—"}</td>
          <td><span class="${badge}">${r.estado}</span></td>
        </tr>`;
    })
    .join("");

  modalDetalle.show();
}

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}
