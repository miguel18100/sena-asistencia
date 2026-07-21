/* =========================================================
   codigo-qr.js
   Lógica de la pantalla "Generación de código QR"
   ========================================================= */

let sesionActualId = null;
let qrInstancia = null;
let intervaloRefresco = null;

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  const params = new URLSearchParams(window.location.search);
  sesionActualId = params.get("sesion") || (obtenerSesionActiva() ? obtenerSesionActiva().id : null);

  if (!sesionActualId) {
    window.location.href = "crear-sesion.html";
    return;
  }

  pintarSesion();

  document.getElementById("btnActualizarQR").addEventListener("click", () => {
    regenerarCodigoSesion(sesionActualId);
    pintarSesion();
  });

  document.getElementById("btnFinalizarSesion").addEventListener("click", () => {
    const confirmar = confirm("¿Seguro que deseas finalizar esta sesión? Los aprendices ya no podrán registrar asistencia.");
    if (!confirmar) return;

    finalizarSesion(sesionActualId);
    clearInterval(intervaloRefresco);
    window.location.href = "historial.html";
  });

  // Refresca el progreso de asistencia cada 4 segundos (simula "tiempo real")
  intervaloRefresco = setInterval(actualizarProgreso, 4000);
});

function pintarSesion() {
  const sesion = obtenerSesionPorId(sesionActualId);
  if (!sesion) return;

  const ficha = obtenerFichaPorId(sesion.fichaId);

  document.getElementById("qrFicha").textContent = ficha ? `${ficha.codigo}` : "—";
  document.getElementById("qrPrograma").textContent = ficha ? ficha.programa : "—";
  document.getElementById("qrFecha").textContent = formatearFechaCorta(sesion.fecha);
  document.getElementById("qrJornada").textContent = sesion.jornada;
  document.getElementById("qrHoraInicio").textContent = formatearHora12(sesion.horaInicio);
  document.getElementById("qrHoraFin").textContent = formatearHora12(sesion.horaFin);
  document.getElementById("qrCodigoTexto").textContent = sesion.codigo;

  const badge = document.getElementById("badgeEstadoSesion");
  badge.textContent = sesion.estado;
  badge.className = sesion.estado === "En curso" ? "badge-en-curso" : "badge-finalizada";

  pintarQR(sesion, ficha);
  actualizarProgreso();
}

function pintarQR(sesion, ficha) {
  const contenedor = document.getElementById("qrcodeCanvas");
  contenedor.innerHTML = "";

  // El QR incluye la sesión y la ficha completas (no solo el código corto).
  // Esto permite que, al escanear desde OTRO dispositivo/navegador (celular
  // del aprendiz), esa sesión se pueda "importar" a su localStorage y así
  // la validación del código encuentre la sesión aunque nunca se haya creado
  // en ese dispositivo. Sin esto, cada navegador tendría su propia "base de
  // datos" aislada y el QR solo funcionaría escaneado desde el mismo equipo.
  const payload = JSON.stringify({
    tipo: "sena_sesion_qr",
    sesion,
    ficha,
  });

  qrInstancia = new QRCode(contenedor, {
    text: payload,
    width: 220,
    height: 220,
    colorDark: "#1E5C1A",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function actualizarProgreso() {
  const sesion = obtenerSesionPorId(sesionActualId);
  if (!sesion) return;

  const ficha = obtenerFichaPorId(sesion.fichaId);
  const total = obtenerAprendices(ficha.id).length;
  const registrados = obtenerAsistenciasPorSesion(sesion.id).filter((a) => a.estado === "Asistió").length;

  document.getElementById("qrProgreso").textContent = `${registrados} de ${total} aprendices han registrado asistencia`;
}

function formatearFechaCorta(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

function formatearHora12(horaHHMM) {
  const [h, m] = horaHHMM.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  return `${hora12}:${String(m).padStart(2, "0")} ${periodo}`;
}
