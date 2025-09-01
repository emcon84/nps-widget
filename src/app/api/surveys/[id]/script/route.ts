import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: surveyId } = await params;
  const url = new URL(request.url);
  const containerId =
    url.searchParams.get("container") || `nps-widget-${surveyId}`;
  const updateInterval = parseInt(
    url.searchParams.get("updateInterval") || "30000"
  ); // 30 segundos por defecto

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://${process.env.VERCEL_URL || "your-domain.vercel.app"}`
      : "http://localhost:3000";

  const script = `
(function() {
  'use strict';
  
  // Configuración del widget
  const WIDGET_CONFIG = {
    surveyId: '${surveyId}',
    containerId: '${containerId}',
    baseUrl: '${baseUrl}',
    updateInterval: ${updateInterval},
    maxRetries: 3,
    retryDelay: 5000
  };

  // Estado del widget
  let widgetState = {
    isInitialized: false,
    currentVersion: null,
    lastUpdated: null,
    updateTimer: null,
    retryCount: 0,
    isLoading: false
  };

  // Utilidades
  function log(message, type = 'info') {
    if (console && console[type]) {
      console[type](\`[NPS Widget \${WIDGET_CONFIG.surveyId}] \${message}\`);
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Función para mostrar estado de carga
  function showLoadingState() {
    const container = document.getElementById(WIDGET_CONFIG.containerId);
    if (container) {
      container.innerHTML = \`
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="
            width: 20px;
            height: 20px;
            border: 2px solid #dee2e6;
            border-top: 2px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 12px;
          "></div>
          <span style="color: #6c757d; font-size: 14px;">Cargando encuesta...</span>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      \`;
    }
  }

  // Función para mostrar errores
  function showErrorState(message) {
    const container = document.getElementById(WIDGET_CONFIG.containerId);
    if (container) {
      container.innerHTML = \`
        <div style="
          padding: 16px;
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          text-align: center;
        ">
          <strong>Error:</strong> \${message}
          <br>
          <button onclick="window.NPSWidget_\${WIDGET_CONFIG.surveyId.replace(/-/g, '_')}.retry()" style="
            margin-top: 8px;
            padding: 4px 8px;
            background: #721c24;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">
            Reintentar
          </button>
        </div>
      \`;
    }
  }

  // Función para verificar actualizaciones
  async function checkForUpdates() {
    try {
      const params = new URLSearchParams();
      if (widgetState.currentVersion) {
        params.append('version', widgetState.currentVersion.toString());
      }
      if (widgetState.lastUpdated) {
        params.append('lastUpdated', widgetState.lastUpdated);
      }

      const response = await fetch(\`\${WIDGET_CONFIG.baseUrl}/api/surveys/\${WIDGET_CONFIG.surveyId}/check-updates?\${params}\`);
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      
      if (data.hasUpdates) {
        log('Actualizaciones detectadas, recargando widget...');
        await loadSurvey();
      } else {
        // Actualizar la información de versión aunque no haya cambios
        widgetState.currentVersion = data.currentVersion;
        widgetState.lastUpdated = data.lastUpdated;
      }
      
      widgetState.retryCount = 0; // Reset retry count en caso de éxito
      
    } catch (error) {
      log(\`Error verificando actualizaciones: \${error.message}\`, 'warn');
      
      if (widgetState.retryCount < WIDGET_CONFIG.maxRetries) {
        widgetState.retryCount++;
        log(\`Reintentando en \${WIDGET_CONFIG.retryDelay}ms (intento \${widgetState.retryCount}/\${WIDGET_CONFIG.maxRetries})\`);
        setTimeout(checkForUpdates, WIDGET_CONFIG.retryDelay);
      } else {
        log('Máximo número de reintentos alcanzado para verificación de actualizaciones', 'error');
      }
    }
  }

  // Función para cargar la encuesta
  async function loadSurvey() {
    if (widgetState.isLoading) {
      return;
    }

    widgetState.isLoading = true;
    
    try {
      showLoadingState();
      
      const response = await fetch(\`\${WIDGET_CONFIG.baseUrl}/api/surveys/\${WIDGET_CONFIG.surveyId}/embed\`);
      
      if (!response.ok) {
        throw new Error(\`No se pudo cargar la encuesta: \${response.status} \${response.statusText}\`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.survey) {
        throw new Error('Datos de encuesta inválidos');
      }
      
      // Actualizar estado
      widgetState.currentVersion = data.survey.version;
      widgetState.lastUpdated = data.survey.lastUpdated;
      widgetState.retryCount = 0;
      
      // Renderizar widget
      renderWidget(data.survey);
      
      log('Widget cargado exitosamente');
      
    } catch (error) {
      log(\`Error cargando encuesta: \${error.message}\`, 'error');
      
      if (widgetState.retryCount < WIDGET_CONFIG.maxRetries) {
        widgetState.retryCount++;
        setTimeout(() => {
          widgetState.isLoading = false;
          loadSurvey();
        }, WIDGET_CONFIG.retryDelay);
      } else {
        showErrorState(error.message);
      }
    } finally {
      widgetState.isLoading = false;
    }
  }

  // Función para renderizar el widget
  function renderWidget(survey) {
    const container = document.getElementById(WIDGET_CONFIG.containerId);
    if (!container) {
      log('Contenedor del widget no encontrado', 'error');
      return;
    }

    // Aplicar estilos
    if (!document.getElementById('nps-widget-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'nps-widget-styles';
      styleElement.textContent = generateStyles(survey.style);
      document.head.appendChild(styleElement);
    } else {
      // Actualizar estilos existentes
      document.getElementById('nps-widget-styles').textContent = generateStyles(survey.style);
    }

    // Generar HTML
    const html = generateHTML(survey);
    container.innerHTML = html;

    // Aplicar eventos
    attachEventListeners(survey);
  }

  // Función para generar estilos CSS
  function generateStyles(style) {
    const primaryColor = style?.primaryColor || '#3b82f6';
    const backgroundColor = style?.backgroundColor || '#ffffff';
    const borderRadius = style?.borderRadius || '8px';
    const fontFamily = style?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    return \`
      .nps-widget {
        max-width: 600px;
        margin: 20px auto;
        padding: 24px;
        background: \${backgroundColor};
        border-radius: \${borderRadius};
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        font-family: \${fontFamily};
        border: 1px solid #e5e7eb;
      }
      
      .nps-element {
        margin-bottom: 20px;
      }
      
      .nps-label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        color: #374151;
        font-size: 14px;
      }
      
      .nps-required {
        color: #ef4444;
      }
      
      .nps-scale {
        display: flex;
        gap: 8px;
        justify-content: space-between;
        margin: 16px 0;
        flex-wrap: wrap;
      }
      
      .nps-button {
        flex: 1;
        min-width: 40px;
        padding: 12px 8px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        text-align: center;
        font-size: 14px;
      }
      
      .nps-button:hover {
        border-color: \${primaryColor};
        background: \${primaryColor}15;
      }
      
      .nps-button.selected {
        border-color: \${primaryColor};
        background: \${primaryColor};
        color: #fff;
      }
      
      .nps-input {
        width: 100%;
        padding: 12px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s ease;
      }
      
      .nps-input:focus {
        outline: none;
        border-color: \${primaryColor};
        box-shadow: 0 0 0 3px \${primaryColor}15;
      }
      
      .nps-textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
        transition: border-color 0.2s ease;
      }
      
      .nps-textarea:focus {
        outline: none;
        border-color: \${primaryColor};
        box-shadow: 0 0 0 3px \${primaryColor}15;
      }
      
      .nps-submit {
        background: \${primaryColor};
        color: #fff;
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        width: 100%;
      }
      
      .nps-submit:hover {
        background: \${primaryColor}dd;
        transform: translateY(-1px);
      }
      
      .nps-submit:disabled {
        background: #9ca3af;
        cursor: not-allowed;
        transform: none;
      }
      
      .nps-scale-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 12px;
        color: #6b7280;
      }
      
      .nps-success {
        text-align: center;
        padding: 40px;
        color: #10b981;
      }
      
      .nps-success h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
      }
      
      .nps-success p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
      
      .nps-retry-button {
        margin-top: 20px;
        background: \${primaryColor};
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      }
      
      @media (max-width: 600px) {
        .nps-widget {
          margin: 10px;
          padding: 16px;
        }
        
        .nps-scale {
          gap: 4px;
        }
        
        .nps-button {
          padding: 10px 4px;
          font-size: 12px;
        }
      }
    \`;
  }

  // Función para generar HTML
  function generateHTML(survey) {
    let html = '<div class="nps-widget">';
    
    if (survey.title) {
      html += \`<h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937;">\${survey.title}</h3>\`;
    }
    
    if (survey.description) {
      html += \`<p style="margin-bottom: 20px; color: #6b7280; font-size: 14px;">\${survey.description}</p>\`;
    }

    survey.elements.forEach(element => {
      html += '<div class="nps-element">';
      
      if (element.type === 'nps') {
        html += \`<label class="nps-label">\${element.label}\${element.required ? ' <span class="nps-required">*</span>' : ''}</label>\`;
        
        if (element.minLabel || element.maxLabel) {
          html += '<div class="nps-scale-labels">';
          html += \`<span>\${element.minLabel || 'No probable'}</span>\`;
          html += \`<span>\${element.maxLabel || 'Muy probable'}</span>\`;
          html += '</div>';
        }
        
        html += \`<div class="nps-scale" data-element-id="\${element.id}">\`;
        for (let i = element.minValue || 0; i <= (element.maxValue || 10); i++) {
          html += \`<button type="button" class="nps-button" data-value="\${i}">\${i}</button>\`;
        }
        html += '</div>';
        
      } else if (element.type === 'text-input') {
        html += \`<label class="nps-label">\${element.label}\${element.required ? ' <span class="nps-required">*</span>' : ''}</label>\`;
        html += \`<input type="text" class="nps-input" placeholder="\${element.placeholder || ''}" data-element-id="\${element.id}">\`;
        
      } else if (element.type === 'textarea') {
        html += \`<label class="nps-label">\${element.label}\${element.required ? ' <span class="nps-required">*</span>' : ''}</label>\`;
        html += \`<textarea class="nps-textarea" placeholder="\${element.placeholder || ''}" data-element-id="\${element.id}"></textarea>\`;
      }
      
      html += '</div>';
    });

    html += '<button type="submit" class="nps-submit">Enviar Encuesta</button>';
    html += '</div>';

    return html;
  }

  // Función para agregar event listeners
  function attachEventListeners(survey) {
    const container = document.getElementById(WIDGET_CONFIG.containerId);
    
    // Event listeners para botones NPS
    container.querySelectorAll('.nps-button').forEach(button => {
      button.addEventListener('click', function() {
        const scale = this.parentElement;
        scale.querySelectorAll('.nps-button').forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
      });
    });

    // Event listener para envío
    const submitButton = container.querySelector('.nps-submit');
    if (submitButton) {
      submitButton.addEventListener('click', function() {
        handleSubmit(survey, this);
      });
    }
  }

  // Función para manejar el envío
  async function handleSubmit(survey, submitButton) {
    const container = document.getElementById(WIDGET_CONFIG.containerId);
    const formData = {};
    let hasRequiredFields = true;

    // Recopilar datos del formulario
    survey.elements.forEach(element => {
      if (element.type === 'nps') {
        const selectedButton = container.querySelector(\`[data-element-id="\${element.id}"] .nps-button.selected\`);
        if (selectedButton) {
          formData[element.id] = parseInt(selectedButton.dataset.value);
        } else if (element.required) {
          hasRequiredFields = false;
        }
      } else if (element.type === 'text-input' || element.type === 'textarea') {
        const input = container.querySelector(\`[data-element-id="\${element.id}"]\`);
        if (input && input.value.trim()) {
          formData[element.id] = input.value.trim();
        } else if (element.required) {
          hasRequiredFields = false;
        }
      }
    });

    if (!hasRequiredFields) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    // Preparar datos para envío
    const submissionData = {
      timestamp: new Date().toISOString(),
      surveyId: survey.id,
      responses: formData,
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
      referrer: document.referrer || null
    };

    // Deshabilitar botón
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
      const response = await fetch(\`\${WIDGET_CONFIG.baseUrl}/api/surveys/\${survey.id}/submit\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const result = await response.json();
        log('Encuesta enviada exitosamente');
        
        // Mostrar mensaje de éxito
        container.innerHTML = \`
          <div class="nps-success">
            <h3>\${survey.settings?.successMessage || 'Gracias por tu feedback!'}</h3>
            <p>Tu respuesta ha sido registrada correctamente.</p>
            <button onclick="window.NPSWidget_\${WIDGET_CONFIG.surveyId.replace(/-/g, '_')}.reload()" class="nps-retry-button">
              Nueva Respuesta
            </button>
          </div>
        \`;
      } else {
        throw new Error(\`Error del servidor: \${response.status}\`);
      }
    } catch (error) {
      log(\`Error enviando encuesta: \${error.message}\`, 'error');
      
      // Mostrar error
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'background:#fef2f2;color:#dc2626;padding:12px;border-radius:6px;margin-top:16px;text-align:center;font-size:14px;';
      errorDiv.innerHTML = \`
        <strong>Error al enviar</strong><br>
        \${survey.settings?.errorMessage || 'Por favor intenta de nuevo más tarde.'}
      \`;
      container.appendChild(errorDiv);
      
      // Rehabilitar botón
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar Encuesta';
    }
  }

  // Función para inicializar el widget
  function init() {
    if (widgetState.isInitialized) {
      return;
    }

    log('Inicializando widget...');
    
    // Verificar que el contenedor existe
    const container = document.getElementById(WIDGET_CONFIG.containerId);
    if (!container) {
      log(\`Contenedor \${WIDGET_CONFIG.containerId} no encontrado. Esperando...\`, 'warn');
      setTimeout(init, 1000);
      return;
    }

    widgetState.isInitialized = true;
    
    // Cargar encuesta inicial
    loadSurvey();
    
    // Configurar actualizaciones automáticas
    if (WIDGET_CONFIG.updateInterval > 0) {
      widgetState.updateTimer = setInterval(checkForUpdates, WIDGET_CONFIG.updateInterval);
      log(\`Actualizaciones automáticas configuradas cada \${WIDGET_CONFIG.updateInterval}ms\`);
    }
  }

  // API pública del widget
  const widgetAPI = {
    reload: () => {
      widgetState.currentVersion = null;
      widgetState.lastUpdated = null;
      loadSurvey();
    },
    
    retry: () => {
      widgetState.retryCount = 0;
      loadSurvey();
    },
    
    checkUpdates: () => {
      checkForUpdates();
    },
    
    destroy: () => {
      if (widgetState.updateTimer) {
        clearInterval(widgetState.updateTimer);
        widgetState.updateTimer = null;
      }
      widgetState.isInitialized = false;
      log('Widget destruido');
    },
    
    getState: () => ({ ...widgetState }),
    
    getConfig: () => ({ ...WIDGET_CONFIG })
  };

  // Exponer API globalmente
  window[\`NPSWidget_\${WIDGET_CONFIG.surveyId.replace(/-/g, '_')}\`] = widgetAPI;

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Limpiar en caso de que la página se descargue
  window.addEventListener('beforeunload', () => {
    widgetAPI.destroy();
  });

})();
`;

  const response = NextResponse.json({
    script,
    instructions: `
Para usar este widget dinámico:

1. Incluye este script en tu página:
   <script src="${baseUrl}/api/surveys/${surveyId}/script?container=tu-contenedor-id&updateInterval=30000"></script>

2. Agrega un contenedor HTML donde quieres que aparezca el widget:
   <div id="${containerId}"></div>

El widget se actualizará automáticamente cada 30 segundos (configurable) y detectará cambios en la encuesta.
    `.trim(),
  });

  response.headers.set("Content-Type", "application/javascript");
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
