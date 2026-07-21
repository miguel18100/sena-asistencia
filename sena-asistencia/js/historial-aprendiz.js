/* =========================================================
   historial-aprendiz.js
   Lógica de la pantalla "Mi historial de asistencia"
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const aprendizId = sessionStorage.getItem("sena_aprendiz_actual_id");

  if (!aprendizId) {
    window.location.href = "escanear-qr.html";
    return;
  }

  const aprendiz = obtenerAprendizPorId(aprendizId);
  if (!aprendiz) return;

  document.getElementById("txtNombreAprendiz").textContent = aprendiz.nombre;

  const registros = obtenerAsistencias()
    .filter((a) => a.aprendizId === aprendizId)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const lista = document.getElementById("listaHistorial");
  const estadoVacio = document.getElementById("estadoVacioHistorial");

  if (registros.length === 0) {
    estadoVacio.classList.remove("d-none");
    return;
  }

  lista.innerHTML = registros
    .map((r) => {
      const badge = r.estado === "Asistió" ? "badge-asistio" : "badge-inasistio";
      return `
        <div class="card-soft p-3 d-flex flex-row justify-content-between align-items-center">
          <div>
            <p class="fw-semibold mb-0">${formatearFecha(r.fecha)}</p>
            <p class="text-muted mb-0" style="font-size:0.8rem;">${r.hora || "—"}</p>
          </div>
          <span class="${badge}">${r.estado}</span>
        </div>`;
    })
    .join("");
});

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}
