/* =========================================================
   confirmacion-asistencia.js
   Lógica de la pantalla "Asistencia registrada"
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const dataRaw = sessionStorage.getItem("sena_ultimo_registro");

  if (!dataRaw) {
    window.location.href = "escanear-qr.html";
    return;
  }

  const { aprendiz, sesion, hora } = JSON.parse(dataRaw);
  const ficha = obtenerFichaPorId(sesion.fichaId);

  document.getElementById("txtFecha").textContent = formatearFecha(sesion.fecha);
  document.getElementById("txtHora").textContent = hora;
  document.getElementById("txtFicha").textContent = ficha ? `${ficha.codigo} - ${ficha.programa}` : "—";

  document.getElementById("txtNombreAprendiz").textContent = aprendiz.nombre;
  document.getElementById("txtDocumento").textContent = aprendiz.documento;
  document.getElementById("txtPrograma").textContent = aprendiz.programa;

  // Guarda el aprendiz actual para la vista "Mi historial"
  sessionStorage.setItem("sena_aprendiz_actual_id", aprendiz.id);
});

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}
