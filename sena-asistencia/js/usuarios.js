/* =========================================================
   usuarios.js
   Lógica de la pantalla "Gestión de usuarios" (CRUD)
   ========================================================= */

const USUARIOS_POR_PAGINA = 4;
let paginaActualUsuarios = 1;
let modalUsuario = null;

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  modalUsuario = new bootstrap.Modal(document.getElementById("modalUsuario"));

  renderizarUsuarios();

  document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
    prepararModalParaCrear();
  });

  document.getElementById("formUsuario").addEventListener("submit", (e) => {
    e.preventDefault();
    guardarUsuario();
  });

  document.getElementById("modalUsuario").addEventListener("hidden.bs.modal", () => {
    document.getElementById("formUsuario").reset();
    document.getElementById("inputUsuarioId").value = "";
  });
});

function renderizarUsuarios() {
  const usuarios = obtenerUsuarios();
  const tbody = document.getElementById("tablaUsuarios");
  const estadoVacio = document.getElementById("estadoVacioUsuarios");

  if (usuarios.length === 0) {
    tbody.innerHTML = "";
    estadoVacio.classList.remove("d-none");
    document.getElementById("paginacionUsuarios").innerHTML = "";
    return;
  }
  estadoVacio.classList.add("d-none");

  const totalPaginas = Math.ceil(usuarios.length / USUARIOS_POR_PAGINA);
  paginaActualUsuarios = Math.min(paginaActualUsuarios, totalPaginas);
  const inicio = (paginaActualUsuarios - 1) * USUARIOS_POR_PAGINA;
  const usuariosPagina = usuarios.slice(inicio, inicio + USUARIOS_POR_PAGINA);

  tbody.innerHTML = usuariosPagina
    .map((u) => {
      const badge = u.estado === "Activo" ? "badge-activo" : "badge-inactivo";
      return `
        <tr>
          <td>${u.nombre}</td>
          <td>${u.correo}</td>
          <td>${u.rol}</td>
          <td><span class="${badge}">${u.estado}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-sena me-1" onclick="editarUsuario('${u.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmarEliminarUsuario('${u.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`;
    })
    .join("");

  renderizarPaginacionUsuarios(totalPaginas);
}

function renderizarPaginacionUsuarios(totalPaginas) {
  const contenedor = document.getElementById("paginacionUsuarios");
  if (totalPaginas <= 1) {
    contenedor.innerHTML = "";
    return;
  }

  let html = "";
  for (let i = 1; i <= totalPaginas; i++) {
    const activa = i === paginaActualUsuarios;
    html += `
      <li class="page-item ${activa ? "active" : ""}">
        <button class="page-link" style="color:${activa ? "#fff" : "#39A900"}; ${activa ? "background-color:#39A900; border-color:#39A900;" : ""}" onclick="cambiarPaginaUsuarios(${i})">${i}</button>
      </li>`;
  }
  contenedor.innerHTML = html;
}

function cambiarPaginaUsuarios(numero) {
  paginaActualUsuarios = numero;
  renderizarUsuarios();
}

function prepararModalParaCrear() {
  document.getElementById("tituloModalUsuario").textContent = "Nuevo usuario";
  document.getElementById("inputUsuarioId").value = "";
  document.getElementById("formUsuario").reset();
}

function editarUsuario(usuarioId) {
  const usuario = obtenerUsuarios().find((u) => u.id === usuarioId);
  if (!usuario) return;

  document.getElementById("tituloModalUsuario").textContent = "Editar usuario";
  document.getElementById("inputUsuarioId").value = usuario.id;
  document.getElementById("inputUsuarioNombre").value = usuario.nombre;
  document.getElementById("inputUsuarioCorreo").value = usuario.correo;
  document.getElementById("selectUsuarioRol").value = usuario.rol;
  document.getElementById("selectUsuarioEstado").value = usuario.estado;

  modalUsuario.show();
}

function guardarUsuario() {
  const id = document.getElementById("inputUsuarioId").value;
  const datos = {
    nombre: document.getElementById("inputUsuarioNombre").value.trim(),
    correo: document.getElementById("inputUsuarioCorreo").value.trim(),
    rol: document.getElementById("selectUsuarioRol").value,
    estado: document.getElementById("selectUsuarioEstado").value,
  };

  if (id) {
    actualizarUsuario(id, datos);
  } else {
    crearUsuario(datos);
  }

  modalUsuario.hide();
  renderizarUsuarios();
}

function confirmarEliminarUsuario(usuarioId) {
  const usuario = obtenerUsuarios().find((u) => u.id === usuarioId);
  if (!usuario) return;

  const confirmar = confirm(`¿Eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmar) return;

  eliminarUsuario(usuarioId);
  renderizarUsuarios();
}
