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

  iniciarEscaner();

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

function iniciarEscaner() {
  const estadoEscaneo = document.getElementById("estadoEscaneo");

  lectorQR = new Html5Qrcode("qr-reader");

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
          manejarCodigoDetectado(textoDecodificado.trim().toUpperCase());
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
  if (lectorQR) {
    lectorQR.pause(true);
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

  // Detiene la cámara antes de salir
  if (lectorQR) {
    lectorQR.stop().catch(() => {});
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
