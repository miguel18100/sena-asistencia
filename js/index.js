/* =========================================================
   index.js
   Lógica de la pantalla de inicio de sesión (index.html)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Si ya hay una sesión activa, mandar directo al dashboard
  if (estaAutenticado()) {
    window.location.href = "pages/dashboard.html";
    return;
  }

  const formLogin = document.getElementById("formLogin");
  const inputDocumento = document.getElementById("documento");
  const inputPassword = document.getElementById("password");
  const alertaLogin = document.getElementById("alertaLogin");
  const togglePassword = document.getElementById("togglePassword");
  const iconoOjo = document.getElementById("iconoOjo");

  // Mostrar / ocultar contraseña
  togglePassword.addEventListener("click", () => {
    const esPassword = inputPassword.type === "password";
    inputPassword.type = esPassword ? "text" : "password";
    iconoOjo.classList.toggle("bi-eye");
    iconoOjo.classList.toggle("bi-eye-slash");
  });

  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    ocultarAlerta();

    const documento = inputDocumento.value.trim();
    const password = inputPassword.value;

    if (!documento || !password) {
      mostrarAlerta("Por favor completa todos los campos.");
      return;
    }

    const exito = iniciarSesion(documento, password);

    if (exito) {
      window.location.href = "pages/dashboard.html";
    } else {
      mostrarAlerta("Documento o contraseña incorrectos. Intenta nuevamente.");
    }
  });

  function mostrarAlerta(mensaje) {
    alertaLogin.textContent = mensaje;
    alertaLogin.classList.remove("d-none");
  }

  function ocultarAlerta() {
    alertaLogin.classList.add("d-none");
  }
});
