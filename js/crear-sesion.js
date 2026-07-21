/* =========================================================
   crear-sesion.js
   Lógica de la pantalla "Nueva sesión de asistencia"
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  const selectFicha = document.getElementById("selectFicha");
  const inputFecha = document.getElementById("inputFecha");
  const selectJornada = document.getElementById("selectJornada");
  const formCrearSesion = document.getElementById("formCrearSesion");
  const alertaCrearSesion = document.getElementById("alertaCrearSesion");

  const instructor = obtenerInstructor();
  const fichas = obtenerFichas();

  // Poblar select de fichas
  selectFicha.innerHTML = fichas
    .map((f) => `<option value="${f.id}">${f.codigo} - ${f.programa}</option>`)
    .join("");

  // Fecha por defecto: hoy
  inputFecha.value = obtenerFechaHoy();

  // Jornada por defecto (preferencia guardada del instructor)
  if (instructor && instructor.jornadaPorDefecto) {
    selectJornada.value = instructor.jornadaPorDefecto;
  }

  function actualizarResumenFicha() {
    const ficha = obtenerFichaPorId(selectFicha.value);
    if (!ficha) return;
    const totalAprendices = obtenerAprendices(ficha.id).length;

    document.getElementById("resumenTotalAprendices").textContent = totalAprendices;
    document.getElementById("resumenPrograma").textContent = ficha.programa;
    document.getElementById("resumenInstructor").textContent = ficha.instructor;
  }

  selectFicha.addEventListener("change", actualizarResumenFicha);
  actualizarResumenFicha();

  formCrearSesion.addEventListener("submit", (e) => {
    e.preventDefault();
    alertaCrearSesion.classList.add("d-none");

    if (!selectFicha.value || !inputFecha.value || !selectJornada.value) {
      alertaCrearSesion.textContent = "Por favor completa todos los campos.";
      alertaCrearSesion.classList.remove("d-none");
      return;
    }

    const nuevaSesion = crearSesion({
      fichaId: selectFicha.value,
      fecha: inputFecha.value,
      jornada: selectJornada.value,
    });

    // Redirige a la pantalla de generación de código QR
    window.location.href = `codigo-qr.html?sesion=${nuevaSesion.id}`;
  });
});
