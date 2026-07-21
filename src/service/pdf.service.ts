import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

interface DatosReporte {
  nombreEstudiante: string;
  grado: string;
  institucion: string;
  actividadesCompletadas: number;
  nivelGeneral: string;
  indicadores: {
    area: string;
    nivel: string;
    puntuacion: number;
    color: string;
  }[];
  tendencia: {
    semana: string;
    valor: number;
  }[];
  observacion: string;
  nombreDocente: string;
  fechaReporte: string;
}

function obtenerColorNivel(nivel: string): string {
  const colores: Record<string, string> = {
    Estable: "#5BBF99",
    Observación: "#F0B040",
    Seguimiento: "#F0B040",
    Prioritario: "#E05050",
  };
  return colores[nivel] || "#7A8FA0";
}

function generarBarraPorcentaje(puntuacion: number, color: string): string {
  return `
    <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
      <div style="flex: 1; background-color: #D4EAFF; border-radius: 4px; height: 10px;">
        <div style="width: ${puntuacion}%; background-color: ${color}; height: 10px; border-radius: 4px;"></div>
      </div>
      <span style="font-size: 12px; color: #7A8FA0; min-width: 30px;">${puntuacion}%</span>
    </div>
  `;
}

function generarHTMLReporte(datos: DatosReporte): string {
  const indicadoresHTML = datos.indicadores
    .map((ind) => {
      const colorNivel = obtenerColorNivel(ind.nivel);
      return `
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 600; color: #2A4A6A;">
              Área ${ind.area}
            </span>
            <span style="
              font-size: 11px;
              font-weight: 700;
              color: ${colorNivel};
              background-color: ${colorNivel}20;
              padding: 3px 10px;
              border-radius: 8px;
            ">
              ${ind.nivel}
            </span>
          </div>
          ${generarBarraPorcentaje(ind.puntuacion, colorNivel)}
        </div>
      `;
    })
    .join("");

  const alturaMaxBarra = 80;
  const tendenciaHTML = datos.tendencia
    .map((item) => {
      const altura = Math.round(alturaMaxBarra * item.valor);
      const color =
        item.valor >= 0.7
          ? "#5BBF99"
          : item.valor >= 0.5
            ? "#F0B040"
            : "#E05050";
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1;">
          <div style="height: ${alturaMaxBarra}px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="
              width: 36px;
              height: ${altura}px;
              background-color: ${color};
              border-radius: 4px;
              min-height: 6px;
            "></div>
          </div>
          <span style="font-size: 11px; color: #7A8FA0;">${item.semana}</span>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reporte SENT-IA</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #F4F7FF;
          color: #2A4A6A;
          padding: 32px;
        }
        .page {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }
        .header {
          background: linear-gradient(135deg, #5B9FD4, #9B7FD4);
          color: white;
          padding: 32px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .logo-sub {
          font-size: 11px;
          opacity: 0.8;
          margin-top: 2px;
        }
        .fecha {
          font-size: 12px;
          opacity: 0.8;
          text-align: right;
        }
        .estudiante-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          background-color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .estudiante-nombre {
          font-size: 22px;
          font-weight: 700;
        }
        .estudiante-sub {
          font-size: 13px;
          opacity: 0.85;
          margin-top: 4px;
        }
        .nivel-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          background-color: rgba(255,255,255,0.25);
          color: white;
        }
        .content {
          padding: 32px;
        }
        .seccion {
          margin-bottom: 32px;
        }
        .seccion-titulo {
          font-size: 11px;
          font-weight: 700;
          color: #7A8FA0;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #D4EAFF;
        }
        .stats-grid {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }
        .stat-card {
          flex: 1;
          background-color: #F4F7FF;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          border: 1px solid #D4EAFF;
        }
        .stat-numero {
          font-size: 28px;
          font-weight: 700;
          color: #5B9FD4;
        }
        .stat-label {
          font-size: 11px;
          color: #7A8FA0;
          margin-top: 4px;
        }
        .indicadores-container {
          background-color: #F4F7FF;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #D4EAFF;
        }
        .tendencia-container {
          background-color: #F4F7FF;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #D4EAFF;
        }
        .tendencia-barras {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          gap: 8px;
        }
        .leyenda {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #D4EAFF;
        }
        .leyenda-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #7A8FA0;
        }
        .leyenda-circulo {
          width: 10px;
          height: 10px;
          border-radius: 5px;
        }
        .observacion-box {
          background-color: #F4F7FF;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #D4EAFF;
          border-left: 4px solid #9B7FD4;
        }
        .observacion-texto {
          font-size: 14px;
          color: #2A4A6A;
          line-height: 1.6;
        }
        .observacion-vacia {
          font-size: 13px;
          color: #7A8FA0;
          font-style: italic;
        }
        .footer {
          background-color: #F4F7FF;
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #D4EAFF;
        }
        .footer-texto {
          font-size: 11px;
          color: #7A8FA0;
        }
        .footer-docente {
          font-size: 12px;
          font-weight: 600;
          color: #2A4A6A;
        }
        .confidencial {
          background-color: #9B7FD420;
          color: #9B7FD4;
          padding: 3px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div class="page">

        <!-- HEADER -->
        <div class="header">
          <div class="header-top">
            <div>
              <div class="logo">SENT-IA</div>
              <div class="logo-sub">Sistema de Seguimiento Emocional Estudiantil</div>
            </div>
            <div class="fecha">
              <div>Reporte generado</div>
              <div style="font-weight: 600;">${datos.fechaReporte}</div>
            </div>
          </div>
          <div class="estudiante-info">
            <div class="avatar">
              ${datos.nombreEstudiante[0]?.toUpperCase() || "E"}
            </div>
            <div>
              <div class="estudiante-nombre">${datos.nombreEstudiante}</div>
              <div class="estudiante-sub">
                ${datos.grado} · ${datos.institucion}
              </div>
              <div class="nivel-badge">
                Nivel general: ${datos.nivelGeneral}
              </div>
            </div>
          </div>
        </div>

        <!-- CONTENIDO -->
        <div class="content">

          <!-- ESTADÍSTICAS -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-numero">${datos.actividadesCompletadas}</div>
              <div class="stat-label">Actividades completadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-numero">${datos.indicadores.length}</div>
              <div class="stat-label">Áreas evaluadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-numero">${datos.tendencia.length}</div>
              <div class="stat-label">Semanas analizadas</div>
            </div>
          </div>

          <!-- INDICADORES -->
          <div class="seccion">
            <div class="seccion-titulo">Indicadores por área</div>
            <div class="indicadores-container">
              ${indicadoresHTML}
            </div>
          </div>

          <!-- TENDENCIA -->
          <div class="seccion">
            <div class="seccion-titulo">Tendencia últimas ${datos.tendencia.length} semanas</div>
            <div class="tendencia-container">
              <div class="tendencia-barras">
                ${tendenciaHTML}
              </div>
              <div class="leyenda">
                <div class="leyenda-item">
                  <div class="leyenda-circulo" style="background-color: #5BBF99;"></div>
                  Estable
                </div>
                <div class="leyenda-item">
                  <div class="leyenda-circulo" style="background-color: #F0B040;"></div>
                  Seguimiento
                </div>
                <div class="leyenda-item">
                  <div class="leyenda-circulo" style="background-color: #E05050;"></div>
                  Prioritario
                </div>
              </div>
            </div>
          </div>

          <!-- OBSERVACIÓN -->
          <div class="seccion">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #D4EAFF;">
              <span class="seccion-titulo" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
                Observación del docente
              </span>
              <span class="confidencial">Confidencial</span>
            </div>
            <div class="observacion-box">
              ${
                datos.observacion
                  ? `<div class="observacion-texto">${datos.observacion}</div>`
                  : `<div class="observacion-vacia">Sin observaciones registradas para este estudiante.</div>`
              }
            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="footer">
          <div>
            <div class="footer-texto">Documento confidencial · Uso exclusivo institucional</div>
            <div class="footer-texto">SENT-IA · Bienestar emocional estudiantil</div>
          </div>
          <div style="text-align: right;">
            <div class="footer-texto">Generado por</div>
            <div class="footer-docente">${datos.nombreDocente}</div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

export async function exportarReportePDF(datos: DatosReporte): Promise<void> {
  const html = generarHTMLReporte(datos);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) {
    throw new Error(
      "La función de compartir no está disponible en este dispositivo",
    );
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: `Reporte de ${datos.nombreEstudiante}`,
    UTI: "com.adobe.pdf",
  });
}
