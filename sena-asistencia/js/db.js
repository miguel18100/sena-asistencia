/* =========================================================
   db.js
   -----------------------------------------------------------
   Simula una base de datos usando localStorage.
   Aquí viven TODAS las funciones para leer/escribir datos:
   instructor, fichas, aprendices, sesiones y registros de
   asistencia. Ninguna página debería tocar localStorage
   directamente: siempre a través de las funciones de este
   archivo (así, si el día de mañana se conecta a PHP/MySQL,
   solo hay que reescribir este archivo).
   ========================================================= */

const DB_KEYS = {
  INSTRUCTOR: "sena_instructor",
  FICHAS: "sena_fichas",
  APRENDICES: "sena_aprendices",
  SESIONES: "sena_sesiones",
  ASISTENCIAS: "sena_asistencias",
  USUARIOS: "sena_usuarios",
  SESION_ACTIVA_ID: "sena_sesion_activa_id",
  AUTH: "sena_auth",
};

/* ---------------------------------------------------------
   Utilidades genéricas de almacenamiento
   --------------------------------------------------------- */
function dbGet(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function dbSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generarId(prefijo = "id") {
  return `${prefijo}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function generarCodigoSesion() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

/* ---------------------------------------------------------
   Datos semilla (se cargan solo la primera vez)
   --------------------------------------------------------- */
function inicializarBaseDeDatos() {
  // Instructor / usuario principal
  if (!localStorage.getItem(DB_KEYS.INSTRUCTOR)) {
    dbSet(DB_KEYS.INSTRUCTOR, {
      id: "instr_001",
      nombre: "Jesús Ariel Bonilla",
      correo: "jbonilla@sena.edu.co",
      documento: "1075263789",
      password: "sena2026",
      fichaPorDefecto: "ficha_3413974",
      jornadaPorDefecto: "Mañana",
      duracionSesionMin: 120,
      notificacionesCorreo: true,
    });
  }

  // Usuarios del sistema (gestión de usuarios - pantalla 10)
  if (!localStorage.getItem(DB_KEYS.USUARIOS)) {
    dbSet(DB_KEYS.USUARIOS, [
      { id: "usr_001", nombre: "Jesús Ariel Bonilla", correo: "jbonilla@sena.edu.co", rol: "Instructor", estado: "Activo" },
      { id: "usr_002", nombre: "Ana María López", correo: "alopez@sena.edu.co", rol: "Instructor", estado: "Activo" },
      { id: "usr_003", nombre: "Carlos Andrés Peña", correo: "capena@sena.edu.co", rol: "Instructor", estado: "Inactivo" },
      { id: "usr_004", nombre: "Laura Valentina Muñoz", correo: "lmunoz@sena.edu.co", rol: "Instructor", estado: "Activo" },
    ]);
  }

  // Fichas de formación
  if (!localStorage.getItem(DB_KEYS.FICHAS)) {
    dbSet(DB_KEYS.FICHAS, [
      {
        id: "ficha_3413974",
        codigo: "3413974",
        programa: "Tecnología en Análisis y Desarrollo de Software",
        instructor: "Jesús Ariel Bonilla",
      },
    ]);
  }

  // Aprendices matriculados
  if (!localStorage.getItem(DB_KEYS.APRENDICES)) {
    const nombres = [
      "Miguel Angel Estrada Torrentes",
      "María Camila Ortiz",
      "Juan David Perdomo",
      "Laura Sofía Ramírez",
      "Juan Miguel Muñoz Castañeda",
      "Nicolas Esteban Aldana Doria",
      "Valentina Rojas Cárdenas",
      "Santiago Losada Trujillo",
      "Daniela Fernanda Cuéllar",
      "Andrés Felipe Motta",
    ];
    const aprendices = nombres.map((nombre, i) => ({
      id: generarId("apr"),
      nombre,
      documento: `10${752600 + i * 37}`,
      fichaId: "ficha_3413974",
      programa: "Tecnología en Análisis y Desarrollo de Software",
    }));
    dbSet(DB_KEYS.APRENDICES, aprendices);
  }

  // Sesiones de asistencia (histórico de ejemplo)
  if (!localStorage.getItem(DB_KEYS.SESIONES)) {
    dbSet(DB_KEYS.SESIONES, [
      {
        id: "sesion_1",
        fichaId: "ficha_3413974",
        fecha: "2026-07-23",
        jornada: "Mañana",
        horaInicio: "08:00",
        horaFin: "10:00",
        codigo: "8F7A2B",
        estado: "Finalizada",
        asistenciaPromedio: 96,
      },
      {
        id: "sesion_2",
        fichaId: "ficha_3413974",
        fecha: "2026-07-22",
        jornada: "Mañana",
        horaInicio: "08:00",
        horaFin: "10:00",
        codigo: "K3M9QT",
        estado: "Finalizada",
        asistenciaPromedio: 93,
      },
      {
        id: "sesion_3",
        fichaId: "ficha_3413974",
        fecha: "2026-07-21",
        jornada: "Mañana",
        horaInicio: "08:00",
        horaFin: "10:00",
        codigo: "P7Z1XR",
        estado: "Finalizada",
        asistenciaPromedio: 89,
      },
    ]);
  }

  // Registros individuales de asistencia
  if (!localStorage.getItem(DB_KEYS.ASISTENCIAS)) {
    const aprendices = dbGet(DB_KEYS.APRENDICES, []);
    const asistencias = [];
    const sesiones = [
      { id: "sesion_1", fecha: "2026-07-23" },
      { id: "sesion_2", fecha: "2026-07-22" },
      { id: "sesion_3", fecha: "2026-07-21" },
    ];
    sesiones.forEach((s) => {
      aprendices.forEach((a, idx) => {
        const asistio = Math.random() > 0.12;
        asistencias.push({
          id: generarId("asis"),
          sesionId: s.id,
          aprendizId: a.id,
          fecha: s.fecha,
          hora: asistio ? `08:${String(5 + idx).padStart(2, "0")} AM` : null,
          estado: asistio ? "Asistió" : "Inasistió",
        });
      });
    });
    dbSet(DB_KEYS.ASISTENCIAS, asistencias);
  }
}

/* ---------------------------------------------------------
   Autenticación (simple, basada en localStorage)
   --------------------------------------------------------- */
function iniciarSesion(documentoOCorreo, password) {
  const instructor = dbGet(DB_KEYS.INSTRUCTOR, null);
  if (!instructor) return false;

  const coincideDocumento = documentoOCorreo.trim() === instructor.documento;
  const coincideCorreo = documentoOCorreo.trim().toLowerCase() === instructor.correo.toLowerCase();

  if ((coincideDocumento || coincideCorreo) && password === instructor.password) {
    dbSet(DB_KEYS.AUTH, { autenticado: true, instructorId: instructor.id, fecha: new Date().toISOString() });
    return true;
  }
  return false;
}

function cerrarSesion() {
  localStorage.removeItem(DB_KEYS.AUTH);
  window.location.href = "../index.html";
}

function estaAutenticado() {
  const auth = dbGet(DB_KEYS.AUTH, null);
  return !!(auth && auth.autenticado);
}

/**
 * Llamar al inicio de cada página protegida (todo excepto index.html).
 * Si no hay sesión, redirige al login.
 */
function protegerPagina() {
  if (!estaAutenticado()) {
    window.location.href = "../index.html";
  }
}

/* ---------------------------------------------------------
   Instructor
   --------------------------------------------------------- */
function obtenerInstructor() {
  return dbGet(DB_KEYS.INSTRUCTOR, null);
}

function actualizarInstructor(cambios) {
  const instructor = obtenerInstructor();
  const actualizado = { ...instructor, ...cambios };
  dbSet(DB_KEYS.INSTRUCTOR, actualizado);
  return actualizado;
}

/* ---------------------------------------------------------
   Usuarios del sistema (pantalla "Gestión de usuarios")
   --------------------------------------------------------- */
function obtenerUsuarios() {
  return dbGet(DB_KEYS.USUARIOS, []);
}

function crearUsuario({ nombre, correo, rol, estado }) {
  const usuarios = dbGet(DB_KEYS.USUARIOS, []);
  const nuevo = { id: generarId("usr"), nombre, correo, rol, estado };
  usuarios.push(nuevo);
  dbSet(DB_KEYS.USUARIOS, usuarios);
  return nuevo;
}

function actualizarUsuario(usuarioId, cambios) {
  const usuarios = dbGet(DB_KEYS.USUARIOS, []);
  const idx = usuarios.findIndex((u) => u.id === usuarioId);
  if (idx === -1) return null;
  usuarios[idx] = { ...usuarios[idx], ...cambios };
  dbSet(DB_KEYS.USUARIOS, usuarios);
  return usuarios[idx];
}

function eliminarUsuario(usuarioId) {
  const usuarios = dbGet(DB_KEYS.USUARIOS, []).filter((u) => u.id !== usuarioId);
  dbSet(DB_KEYS.USUARIOS, usuarios);
}

/* ---------------------------------------------------------
   Fichas
   --------------------------------------------------------- */

function obtenerFichas() {
  return dbGet(DB_KEYS.FICHAS, []);
}

function obtenerFichaPorId(fichaId) {
  return obtenerFichas().find((f) => f.id === fichaId) || null;
}

/* ---------------------------------------------------------
   Aprendices
   --------------------------------------------------------- */
function obtenerAprendices(fichaId = null) {
  const aprendices = dbGet(DB_KEYS.APRENDICES, []);
  if (!fichaId) return aprendices;
  return aprendices.filter((a) => a.fichaId === fichaId);
}

function obtenerAprendizPorId(aprendizId) {
  return obtenerAprendices().find((a) => a.id === aprendizId) || null;
}

/* ---------------------------------------------------------
   Sesiones de asistencia
   --------------------------------------------------------- */
function obtenerSesiones() {
  return dbGet(DB_KEYS.SESIONES, []).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

function obtenerSesionPorId(sesionId) {
  return obtenerSesiones().find((s) => s.id === sesionId) || null;
}

function obtenerSesionActiva() {
  const id = localStorage.getItem(DB_KEYS.SESION_ACTIVA_ID);
  if (!id) return null;
  const sesion = obtenerSesionPorId(id);
  return sesion && sesion.estado === "En curso" ? sesion : null;
}

function crearSesion({ fichaId, fecha, jornada, horaInicio, horaFin }) {
  const sesiones = dbGet(DB_KEYS.SESIONES, []);
  const nueva = {
    id: generarId("sesion"),
    fichaId,
    fecha,
    jornada,
    horaInicio: horaInicio || "08:00",
    horaFin: horaFin || "10:00",
    codigo: generarCodigoSesion(),
    estado: "En curso",
    asistenciaPromedio: 0,
  };
  sesiones.push(nueva);
  dbSet(DB_KEYS.SESIONES, sesiones);
  localStorage.setItem(DB_KEYS.SESION_ACTIVA_ID, nueva.id);
  return nueva;
}

function regenerarCodigoSesion(sesionId) {
  const sesiones = dbGet(DB_KEYS.SESIONES, []);
  const idx = sesiones.findIndex((s) => s.id === sesionId);
  if (idx === -1) return null;
  sesiones[idx].codigo = generarCodigoSesion();
  dbSet(DB_KEYS.SESIONES, sesiones);
  return sesiones[idx];
}

function finalizarSesion(sesionId) {
  const sesiones = dbGet(DB_KEYS.SESIONES, []);
  const idx = sesiones.findIndex((s) => s.id === sesionId);
  if (idx === -1) return null;

  sesiones[idx].estado = "Finalizada";
  sesiones[idx].asistenciaPromedio = calcularPorcentajeAsistenciaSesion(sesionId);
  dbSet(DB_KEYS.SESIONES, sesiones);

  if (localStorage.getItem(DB_KEYS.SESION_ACTIVA_ID) === sesionId) {
    localStorage.removeItem(DB_KEYS.SESION_ACTIVA_ID);
  }
  return sesiones[idx];
}

/* ---------------------------------------------------------
   Asistencias
   --------------------------------------------------------- */
function obtenerAsistencias() {
  return dbGet(DB_KEYS.ASISTENCIAS, []);
}

function obtenerAsistenciasPorSesion(sesionId) {
  return obtenerAsistencias().filter((a) => a.sesionId === sesionId);
}

function obtenerAsistenciaAprendizEnSesion(sesionId, aprendizId) {
  return obtenerAsistencias().find((a) => a.sesionId === sesionId && a.aprendizId === aprendizId) || null;
}

/**
 * Registra la asistencia de un aprendiz en una sesión, validando el código QR.
 * Retorna { ok: boolean, mensaje, aprendiz, sesion }
 */
function registrarAsistenciaPorCodigo(codigoSesion, documentoAprendiz) {
  const sesiones = dbGet(DB_KEYS.SESIONES, []);
  const sesion = sesiones.find((s) => s.codigo === codigoSesion.trim().toUpperCase());

  if (!sesion) {
    return { ok: false, mensaje: "Código de sesión inválido o expirado." };
  }
  if (sesion.estado !== "En curso") {
    return { ok: false, mensaje: "Esta sesión ya fue finalizada." };
  }

  const aprendices = dbGet(DB_KEYS.APRENDICES, []);
  const aprendiz = aprendices.find((a) => a.documento === documentoAprendiz.trim());

  if (!aprendiz) {
    return { ok: false, mensaje: "No se encontró un aprendiz con ese número de documento." };
  }

  const yaRegistrado = obtenerAsistenciaAprendizEnSesion(sesion.id, aprendiz.id);
  if (yaRegistrado) {
    return { ok: false, mensaje: "Ya registraste tu asistencia en esta sesión.", aprendiz, sesion };
  }

  const asistencias = dbGet(DB_KEYS.ASISTENCIAS, []);
  const ahora = new Date();
  asistencias.push({
    id: generarId("asis"),
    sesionId: sesion.id,
    aprendizId: aprendiz.id,
    fecha: sesion.fecha,
    hora: ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true }),
    estado: "Asistió",
  });
  dbSet(DB_KEYS.ASISTENCIAS, asistencias);

  return { ok: true, mensaje: "Asistencia registrada con éxito.", aprendiz, sesion };
}

/**
 * Importa una sesión "externa" (venida de un QR generado en otro dispositivo/
 * navegador) al localStorage de ESTE dispositivo, para que la validación de
 * asistencia pueda encontrarla. También importa la ficha asociada si no existe
 * localmente. No sobrescribe si ya existe una sesión con el mismo código.
 */
function importarSesionExterna(sesionExterna, fichaExterna) {
  if (!sesionExterna || !sesionExterna.codigo) return;

  // Importa la ficha si no existe localmente
  if (fichaExterna && fichaExterna.id) {
    const fichas = dbGet(DB_KEYS.FICHAS, []);
    if (!fichas.some((f) => f.id === fichaExterna.id)) {
      fichas.push(fichaExterna);
      dbSet(DB_KEYS.FICHAS, fichas);
    }
  }

  const sesiones = dbGet(DB_KEYS.SESIONES, []);
  const yaExiste = sesiones.some(
    (s) => s.codigo === sesionExterna.codigo || s.id === sesionExterna.id
  );
  if (yaExiste) return;

  sesiones.push(sesionExterna);
  dbSet(DB_KEYS.SESIONES, sesiones);
}

function calcularPorcentajeAsistenciaSesion(sesionId) {
  const sesion = obtenerSesionPorId(sesionId);
  if (!sesion) return 0;
  const totalAprendices = obtenerAprendices(sesion.fichaId).length;
  if (totalAprendices === 0) return 0;
  const asistieron = obtenerAsistenciasPorSesion(sesionId).filter((a) => a.estado === "Asistió").length;
  return Math.round((asistieron / totalAprendices) * 100);
}

/* ---------------------------------------------------------
   KPIs / estadísticas para dashboard y reportes
   --------------------------------------------------------- */
function obtenerResumenDashboard() {
  const aprendices = obtenerAprendices();
  const sesiones = obtenerSesiones();
  const sesionesHoy = sesiones.filter((s) => s.fecha === obtenerFechaHoy()).length;

  const finalizadas = sesiones.filter((s) => s.estado === "Finalizada");
  const promedio =
    finalizadas.length > 0
      ? Math.round(finalizadas.reduce((acc, s) => acc + s.asistenciaPromedio, 0) / finalizadas.length)
      : 0;

  return {
    totalAprendices: aprendices.length,
    sesionesHoy,
    asistenciaPromedio: promedio,
  };
}

function obtenerReporteAsistenciaPorAprendiz(fichaId, fechaDesde, fechaHasta) {
  const aprendices = obtenerAprendices(fichaId);
  const asistencias = obtenerAsistencias().filter(
    (a) => a.fecha >= fechaDesde && a.fecha <= fechaHasta
  );

  return aprendices.map((aprendiz) => {
    const registros = asistencias.filter((a) => a.aprendizId === aprendiz.id);
    const asistio = registros.filter((a) => a.estado === "Asistió").length;
    const inasistio = registros.filter((a) => a.estado === "Inasistió").length;
    const total = asistio + inasistio;
    const porcentaje = total > 0 ? Math.round((asistio / total) * 100) : 0;
    return { aprendiz, asistio, inasistio, porcentaje };
  });
}

function obtenerFechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------------------------------------------------
   Inicialización automática al cargar el script
   --------------------------------------------------------- */
inicializarBaseDeDatos();
