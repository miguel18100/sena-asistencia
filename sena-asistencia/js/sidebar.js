/* =========================================================
   sidebar.js
   -----------------------------------------------------------
   Genera el menú lateral (sidebar) del panel del instructor
   y lo inyecta en el contenedor #sidebar-container.
   Cada página solo necesita:
     <div id="sidebar-container"></div>
     <script src="../js/sidebar.js"></script>
   y pasar el nombre de la página activa vía atributo
   data-active en el <body>, ej: <body data-active="dashboard">
   ========================================================= */

const SIDEBAR_LINKS = [
  { id: "dashboard", href: "dashboard.html", icon: "bi-grid-1x2", label: "Dashboard" },
  { id: "crear-sesion", href: "crear-sesion.html", icon: "bi-plus-circle", label: "Crear sesión" },
  { id: "historial", href: "historial.html", icon: "bi-clock-history", label: "Historial" },
  { id: "reportes", href: "reportes.html", icon: "bi-bar-chart", label: "Reportes" },
  { id: "usuarios", href: "usuarios.html", icon: "bi-people", label: "Usuarios" },
  { id: "configuracion", href: "configuracion.html", icon: "bi-gear", label: "Configuración" },
];

function renderSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  const paginaActiva = document.body.getAttribute("data-active") || "";

  const linksHtml = SIDEBAR_LINKS.map((link) => {
    const activeClass = link.id === paginaActiva ? "active" : "";
    return `
      <a href="${link.href}" class="nav-link ${activeClass}">
        <i class="bi ${link.icon}"></i>
        <span>${link.label}</span>
      </a>`;
  }).join("");

  container.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebarMenu">
      <div class="sidebar-logo">
        <img
          src="/assets/logosena.png"
          alt="SENA"
        />
        <strong>SENA Asistencia</strong>
      </div>

      <nav class="sidebar-nav d-flex flex-column">
        ${linksHtml}
      </nav>

      <div class="sidebar-footer border-top pt-2 mt-2" style="border-color: rgba(255,255,255,0.12) !important;">
        <a href="#" class="nav-link" id="btnCerrarSesion">
          <i class="bi bi-box-arrow-right"></i>
          <span>Cerrar sesión</span>
        </a>
      </div>
    </aside>
  `;

  // Cerrar sesión
  document.getElementById("btnCerrarSesion").addEventListener("click", (e) => {
    e.preventDefault();
    cerrarSesion();
  });

  // Toggle móvil (botón hamburguesa en topbar)
  const btnToggle = document.getElementById("btnToggleSidebar");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const overlay = document.getElementById("sidebarOverlay");

  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      sidebarMenu.classList.toggle("show");
      overlay.classList.toggle("show");
    });
  }
  overlay.addEventListener("click", () => {
    sidebarMenu.classList.remove("show");
    overlay.classList.remove("show");
  });
}

document.addEventListener("DOMContentLoaded", renderSidebar);
