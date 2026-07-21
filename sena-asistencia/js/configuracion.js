/* =========================================================
   configuracion.js
   Lógica de la pantalla "Configuración del sistema"
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  const instructor = obtenerInstructor();
  const fichas = obtenerFichas();

  // Poblar select de fichas
  const selectFicha = document.getElementById("selectFichaDefecto");
  selectFicha.innerHTML = fichas
    .map((f) => `<option value="${f.id}">${f.codigo} - ${f.programa}</option>`)
    .join("");

  // Precargar valores actuales
  document.getElementById("inputNombre").value = instructor.nombre;
  document.getElementById("inputCorreo").value = instructor.correo;
  selectFicha.value = instructor.fichaPorDefecto;
  document.getElementById("selectJornadaDefecto").value = instructor.jornadaPorDefecto;
  document.getElementById("inputDuracion").value = instructor.duracionSesionMin;
  document.getElementById("checkNotificaciones").checked = instructor.notificacionesCorreo;

  document.getElementById("formConfiguracion").addEventListener("submit", (e) => {
    e.preventDefault();

    const passwordNueva = document.getElementById("inputPasswordNueva").value;
    const passwordConfirmar = document.getElementById("inputPasswordConfirmar").value;

    if (passwordNueva && passwordNueva !== passwordConfirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const cambios = {
      nombre: document.getElementById("inputNombre").value.trim(),
      correo: document.getElementById("inputCorreo").value.trim(),
      fichaPorDefecto: selectFicha.value,
      jornadaPorDefecto: document.getElementById("selectJornadaDefecto").value,
      duracionSesionMin: Number(document.getElementById("inputDuracion").value),
      notificacionesCorreo: document.getElementById("checkNotificaciones").checked,
    };

    if (passwordNueva) {
      cambios.password = passwordNueva;
    }

    actualizarInstructor(cambios);

    const alerta = document.getElementById("alertaGuardado");
    alerta.classList.remove("d-none");
    document.getElementById("inputPasswordNueva").value = "";
    document.getElementById("inputPasswordConfirmar").value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => alerta.classList.add("d-none"), 3500);
  });
});
