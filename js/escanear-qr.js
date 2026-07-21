/* =========================================================
   escanear-qr.js
   -----------------------------------------------------------
   Lógica de la pantalla "Escanear código QR" (vista del
   aprendiz). Usa la librería html5-qrcode para leer el QR
   con la cámara real del dispositivo. Nota: por seguridad,
   los navegadores solo permiten acceso a cámara en HTTPS o
   en localhost.
   ========================================================= */

let lectorQR = null;
let codigoDetectado = null;
let modalDocumento = null;

document.addEventListener("DOMContentLoaded", () => {
  modalDocumento = new bootstrap.Modal(document.getElementById("modalDocumento"));

  // Si el aprendiz llegó a esta página a través del enlace codificado en el
  // QR (por ejemplo, escaneándolo con la cámara nativa del celular en vez
  // del escáner interno), la URL trae "?codigo=XXXXXX". En ese caso no hace
  // falta escanear de nuevo: se abre directo el modal para confirmar.
  const params = new URLSearchParams(window.location.search);
  const codigoDesdeUrl = params.get("codigo");

  if (codigoDesdeUrl) {
    iniciarEscaner({ arrancarCamara: false });
    manejarCodigoDetectado(codigoDesdeUrl.trim().toUpperCase());
  } else {
    iniciarEscaner({ arrancarCamara: true });
  }

  // Fallback: ingreso manual del código (útil si la cámara falla o en demo)
  document.getElementById("formCodigoManual").addEventListener("submit", (e) => {
    e.preventDefault();
    const codigo = document.getElementById("inputCodigoManual").value.trim().toUpperCase();
    if (codigo.length < 4) return;
    manejarCodigoDetectado(codigo);
  });

  document.getElementById("formConfirmarIdentidad").addEventListener("submit", (e) => {
    e.preventDefault();
    confirmarAsistencia();
  });
});

/**
 * El texto que decodifica la cámara puede venir como una URL completa
 * (https://.../escanear-qr.html?codigo=XXXXXX) si el QR se generó con la
 * versión nueva, o como el código plano si venía de una versión anterior.
 * Esta función normaliza ambos casos y siempre devuelve el código de 6
 * caracteres en mayúsculas.
 */
function extraerCodigoDeTexto(texto) {
  const limpio = texto.trim();
  try {
    const url = new URL(limpio);
    const codigoParam = url.searchParams.get("codigo");
    if (codigoParam) return codigoParam.trim().toUpperCase();
  } catch (e) {
    // No es una URL válida: se asume que el texto ya es el código plano
  }
  return limpio.toUpperCase();
}

function iniciarEscaner({ arrancarCamara = true } = {}) {
  const estadoEscaneo = document.getElementById("estadoEscaneo");

  lectorQR = new Html5Qrcode("qr-reader");

  if (!arrancarCamara) {
    // El código ya llegó por la URL (?codigo=...), así que no hace falta
    // encender la cámara: se muestra un mensaje informativo en su lugar.
    estadoEscaneo.innerHTML = `<i class="bi bi-check-circle text-success"></i> Código detectado desde el enlace`;
    return;
  }

  const config = { fps: 10, qrbox: { width: 200, height: 200 } };

  Html5Qrcode.getCameras()
    .then((camaras) => {
      if (!camaras || camaras.length === 0) {
        mostrarErrorCamara("No se detectó ninguna cámara disponible.");
        return;
      }
      // Prioriza cámara trasera en móviles
      const camaraId = camaras.find((c) => /back|trasera|rear/i.test(c.label))?.id || camaras[0].id;

      lectorQR
        .start(camaraId, config, (textoDecodificado) => {
          manejarCodigoDetectado(extraerCodigoDeTexto(textoDecodificado));
        })
        .catch(() => {
          mostrarErrorCamara("No fue posible iniciar la cámara. Usa el código manual abajo.");
        });
    })
    .catch(() => {
      mostrarErrorCamara("Debes permitir el acceso a la cámara para escanear el código.");
    });

  function mostrarErrorCamara(mensaje) {
    estadoEscaneo.innerHTML = `<i class="bi bi-exclamation-triangle text-warning"></i> ${mensaje}`;
  }
}

function manejarCodigoDetectado(codigo) {
  if (codigoDetectado === codigo) return; // evita abrir el modal repetidamente
  codigoDetectado = codigo;

  // Pausa el escaneo mientras el aprendiz confirma su identidad
  // (si la cámara nunca se inició porque el código llegó por URL, no hay
  // nada que pausar, así que se ignora el error)
  if (lectorQR) {
    try {
      lectorQR.pause(true);
    } catch (e) {
      /* la cámara no estaba activa */
    }
  }

  document.getElementById("codigoDetectadoTexto").textContent = codigo;
  document.getElementById("alertaModalDocumento").classList.add("d-none");
  document.getElementById("inputDocumentoAprendiz").value = "";
  modalDocumento.show();

  document.getElementById("modalDocumento").addEventListener(
    "hidden.bs.modal",
    () => {
      codigoDetectado = null;
      if (lectorQR) {
        try {
          lectorQR.resume();
        } catch (e) {
          /* si ya se detuvo, ignorar */
        }
      }
    },
    { once: true }
  );
}

function confirmarAsistencia() {
  const documento = document.getElementById("inputDocumentoAprendiz").value.trim();
  const alertaModal = document.getElementById("alertaModalDocumento");

  if (!documento) {
    alertaModal.textContent = "Ingresa tu número de documento.";
    alertaModal.classList.remove("d-none");
    return;
  }

  const resultado = registrarAsistenciaPorCodigo(codigoDetectado, documento);

  if (!resultado.ok) {
    alertaModal.textContent = resultado.mensaje;
    alertaModal.classList.remove("d-none");
    return;
  }

  // Detiene la cámara antes de salir (si nunca se inició, simplemente no hace nada)
  if (lectorQR) {
    try {
      const promesaStop = lectorQR.stop();
      if (promesaStop && typeof promesaStop.catch === "function") {
        promesaStop.catch(() => {});
      }
    } catch (e) {
      /* la cámara no estaba activa */
    }
  }

  // Guarda el resultado para mostrarlo en la pantalla de confirmación
  sessionStorage.setItem(
    "sena_ultimo_registro",
    JSON.stringify({
      aprendiz: resultado.aprendiz,
      sesion: resultado.sesion,
      hora: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true }),
    })
  );

  window.location.href = "confirmacion-asistencia.html";
}
