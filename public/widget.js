// NPS Widget - Popup Modal Version
(function (window, document) {
  "use strict";

  // Configuración global del widget
  const NPSWidget = {
    version: "1.0.0",
    baseUrl: window.location.origin,

    // Crear el widget popup
    create: function (surveyId, options = {}) {
      console.log("NPSWidget.create called with:", surveyId, options);
      this.surveyId = surveyId;
      this.options = {
        autoShow: options.autoShow !== false, // Por defecto true
        delay: options.delay || 2000, // 2 segundos de delay por defecto
        trigger: options.trigger || "time", // 'time', 'scroll', 'exit', 'manual'
        showOnce: options.showOnce !== false, // Por defecto true
        showErrors: options.showErrors !== false, // Mostrar errores
        ...options,
      };

      console.log("NPSWidget configuration:", this.options);
      this.loadSurveyConfig();
    },

    // Cargar configuración desde el servidor
    loadSurveyConfig: function () {
      const self = this;
      // Añadir timestamp para evitar cache en desarrollo
      const cacheBuster = this.options.noCache ? `?_t=${Date.now()}` : "";
      const url = `${this.baseUrl}/api/widget/${this.surveyId}${cacheBuster}`;
      console.log("Loading survey config from:", url);

      fetch(url)
        .then((response) => {
          console.log(
            "Survey config response:",
            response.status,
            response.statusText
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Survey config data:", data);
          if (data.success && data.widget) {
            self.config = data.widget;
            console.log("Survey config loaded successfully:", self.config);
            self.initWidget();
          } else {
            console.error("NPS Widget: Survey not found or inactive");
            self.showErrorNotification("Survey not available");
          }
        })
        .catch((error) => {
          console.error("NPS Widget: Error loading survey", error);
          self.showErrorNotification("Unable to load survey");
        });
    },

    // Inicializar el widget
    initWidget: function () {
      // Verificar si ya se mostró (localStorage)
      if (this.options.showOnce && this.hasBeenShown()) {
        return;
      }

      this.createStyles();
      this.createModal();

      if (this.options.autoShow) {
        this.setupTriggers();
      }
    },

    // Verificar si ya se mostró el widget
    hasBeenShown: function () {
      return (
        localStorage.getItem(`nps_widget_shown_${this.surveyId}`) === "true"
      );
    },

    // Marcar como mostrado
    markAsShown: function () {
      localStorage.setItem(`nps_widget_shown_${this.surveyId}`, "true");
    },

    // Crear estilos CSS
    createStyles: function () {
      if (document.getElementById("nps-widget-styles")) return;

      const styles = `
        .nps-widget-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .nps-widget-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        
        .nps-widget-modal {
          background: white;
          border-radius: 12px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          transform: scale(0.7);
          transition: transform 0.3s ease;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .nps-widget-overlay.show .nps-widget-modal {
          transform: scale(1);
        }
        
        .nps-widget-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #9ca3af;
          line-height: 1;
          padding: 4px;
        }
        
        .nps-widget-close:hover {
          color: #374151;
        }
        
        .nps-widget-title {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 8px 0;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .nps-widget-description {
          font-size: 16px;
          color: #6b7280;
          margin: 0 0 24px 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .nps-element {
          margin-bottom: 24px;
        }
        
        .nps-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .nps-required {
          color: #ef4444;
        }
        
        .nps-scale {
          display: flex;
          gap: 6px;
          margin: 16px 0;
          flex-wrap: wrap;
        }
        
        .nps-scale-button {
          flex: 1;
          min-width: 40px;
          padding: 12px 8px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .nps-scale-button:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .nps-scale-button.selected {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }
        
        .nps-input, .nps-textarea, .nps-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }
        
        .nps-input:focus, .nps-textarea:focus, .nps-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .nps-submit {
          background: #3b82f6;
          color: white;
          padding: 12px 32px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px;
        }
        
        .nps-submit:hover {
          background: #2563eb;
        }
        
        .nps-submit:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .nps-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          color: #6b7280;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .nps-success-message {
          text-align: center;
          padding: 32px;
          color: #059669;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .nps-error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-top: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `;

      const styleSheet = document.createElement("style");
      styleSheet.id = "nps-widget-styles";
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    },

    // Crear el modal
    createModal: function () {
      if (document.getElementById("nps-widget-overlay")) return;

      const overlay = document.createElement("div");
      overlay.id = "nps-widget-overlay";
      overlay.className = "nps-widget-overlay";

      const modal = document.createElement("div");
      modal.className = "nps-widget-modal";

      modal.innerHTML = this.generateModalContent();
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      this.bindEvents();
    },

    // Generar contenido del modal
    generateModalContent: function () {
      let html = `
        <button class="nps-widget-close" onclick="NPSWidget.hide()">&times;</button>
        <h2 class="nps-widget-title">${this.config.title}</h2>
      `;

      if (this.config.description) {
        html += `<p class="nps-widget-description">${this.config.description}</p>`;
      }

      html += '<form id="nps-widget-form">';

      this.config.elements.forEach((element) => {
        html += '<div class="nps-element">';

        if (element.type === "nps") {
          html += `
            <label class="nps-label">
              ${element.label}
              ${element.required ? '<span class="nps-required">*</span>' : ""}
            </label>
            <div class="nps-labels">
              <span>${element.minLabel || "Not likely"}</span>
              <span>${element.maxLabel || "Very likely"}</span>
            </div>
            <div class="nps-scale" data-element-id="${element.id}">
          `;

          for (let i = element.minValue; i <= element.maxValue; i++) {
            if (element.displayType === "emojis") {
              const emojis = [
                "😤",
                "😠",
                "😞",
                "🙁",
                "😐",
                "😕",
                "🙂",
                "😊",
                "😃",
                "😍",
                "🤩",
              ];
              const emojiIndex = Math.round(
                ((i - element.minValue) /
                  (element.maxValue - element.minValue)) *
                  (emojis.length - 1)
              );
              html += `<button type="button" class="nps-scale-button" data-value="${i}">${emojis[emojiIndex]}</button>`;
            } else {
              html += `<button type="button" class="nps-scale-button" data-value="${i}">${i}</button>`;
            }
          }
          html += "</div>";
        } else if (element.type === "text-input") {
          html += `
            <label class="nps-label">
              ${element.label}
              ${element.required ? '<span class="nps-required">*</span>' : ""}
            </label>
            <input type="text" class="nps-input" name="${element.id}" 
                   placeholder="${element.placeholder || ""}" 
                   ${element.maxLength ? 'maxlength="' + element.maxLength + '"' : ""}
                   ${element.required ? "required" : ""}>
          `;
        } else if (element.type === "textarea") {
          html += `
            <label class="nps-label">
              ${element.label}
              ${element.required ? '<span class="nps-required">*</span>' : ""}
            </label>
            <textarea class="nps-textarea" name="${element.id}" 
                      placeholder="${element.placeholder || ""}" 
                      rows="${element.rows || 4}"
                      ${element.maxLength ? 'maxlength="' + element.maxLength + '"' : ""}
                      ${element.required ? "required" : ""}></textarea>
          `;
        } else if (element.type === "select") {
          html += `
            <label class="nps-label">
              ${element.label}
              ${element.required ? '<span class="nps-required">*</span>' : ""}
            </label>
            <select class="nps-select" name="${element.id}" ${element.required ? "required" : ""}>
              <option value="">${element.placeholder || "Choose an option..."}</option>
              ${element.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
            </select>
          `;
        } else if (element.type === "heading") {
          html += `<h${element.level} style="margin: 0 0 16px 0; color: #111827;">${element.text}</h${element.level}>`;
        } else if (element.type === "text") {
          html += `<p style="margin: 0 0 16px 0; color: #374151;">${element.text}</p>`;
        }

        html += "</div>";
      });

      html += '<button type="submit" class="nps-submit">Submit Survey</button>';
      html += "</form>";

      return html;
    },

    // Configurar triggers
    setupTriggers: function () {
      const self = this;

      if (this.options.trigger === "time") {
        setTimeout(() => {
          self.show();
        }, this.options.delay);
      } else if (this.options.trigger === "scroll") {
        let scrollTriggered = false;
        window.addEventListener("scroll", function () {
          if (scrollTriggered) return;

          const scrollPercent =
            (window.scrollY /
              (document.body.scrollHeight - window.innerHeight)) *
            100;
          if (scrollPercent > (self.options.scrollPercent || 50)) {
            scrollTriggered = true;
            self.show();
          }
        });
      } else if (this.options.trigger === "exit") {
        document.addEventListener("mouseleave", function (e) {
          if (e.clientY <= 0) {
            self.show();
          }
        });
      }
    },

    // Enlazar eventos
    bindEvents: function () {
      const self = this;

      // Cerrar con overlay
      document
        .getElementById("nps-widget-overlay")
        .addEventListener("click", function (e) {
          if (e.target === this) {
            self.hide();
          }
        });

      // Escape key
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && self.isVisible()) {
          self.hide();
        }
      });

      // NPS scale buttons
      document.querySelectorAll(".nps-scale-button").forEach((button) => {
        button.addEventListener("click", function () {
          const scale = this.closest(".nps-scale");
          scale
            .querySelectorAll(".nps-scale-button")
            .forEach((btn) => btn.classList.remove("selected"));
          this.classList.add("selected");

          // Crear input hidden para el valor
          const elementId = scale.dataset.elementId;
          let hiddenInput = document.querySelector(
            `input[name="${elementId}"]`
          );
          if (!hiddenInput) {
            hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.name = elementId;
            scale.appendChild(hiddenInput);
          }
          hiddenInput.value = this.dataset.value;
        });
      });

      // Submit form
      document
        .getElementById("nps-widget-form")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          self.submitSurvey();
        });
    },

    // Mostrar widget
    show: function () {
      const overlay = document.getElementById("nps-widget-overlay");
      if (overlay) {
        overlay.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevenir scroll del body
      }
    },

    // Ocultar widget
    hide: function () {
      const overlay = document.getElementById("nps-widget-overlay");
      if (overlay) {
        overlay.classList.remove("show");
        document.body.style.overflow = ""; // Restaurar scroll del body

        // Marcar como mostrado después de interacción
        if (this.options.showOnce) {
          this.markAsShown();
        }
      }
    },

    // Verificar si está visible
    isVisible: function () {
      const overlay = document.getElementById("nps-widget-overlay");
      return overlay && overlay.classList.contains("show");
    },

    // Enviar survey
    submitSurvey: function () {
      const form = document.getElementById("nps-widget-form");
      const formData = new FormData(form);
      const data = {};

      // Convertir FormData a objeto
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Validar campos requeridos
      const requiredElements = this.config.elements.filter((el) => el.required);
      for (let element of requiredElements) {
        if (!data[element.id]) {
          this.showFormError(
            "Por favor, completa todos los campos requeridos."
          );
          return;
        }
      }

      // Deshabilitar botón de submit
      const submitBtn = form.querySelector(".nps-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      // Enviar datos
      fetch(`${this.baseUrl}/api/surveys/${this.surveyId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data,
          metadata: {
            userAgent: navigator.userAgent,
            pageUrl: window.location.href,
            timestamp: new Date().toISOString(),
          },
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            this.showSuccess();
          } else {
            this.showFormError(result.error || "Error al enviar la respuesta");
          }
        })
        .catch((error) => {
          console.error("Error submitting survey:", error);
          this.showFormError("Error de conexión. Por favor, intenta de nuevo.");
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Survey";
        });
    },

    // Mostrar mensaje de éxito
    showSuccess: function () {
      const modal = document.querySelector(".nps-widget-modal");
      const successMessage =
        this.config.settings?.successMessage || "¡Gracias por tu feedback!";

      modal.innerHTML = `
        <button class="nps-widget-close" onclick="NPSWidget.hide()">&times;</button>
        <div class="nps-success-message">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <div>${successMessage}</div>
        </div>
      `;

      // Auto-cerrar después de 3 segundos
      setTimeout(() => {
        this.hide();
      }, 3000);
    },

    // Mostrar mensaje de error en el formulario
    showFormError: function (message) {
      let errorDiv = document.querySelector(".nps-error-message");
      if (errorDiv) {
        errorDiv.remove();
      }

      errorDiv = document.createElement("div");
      errorDiv.className = "nps-error-message";
      errorDiv.textContent = message;

      const form = document.getElementById("nps-widget-form");
      form.appendChild(errorDiv);

      // Remover error después de 5 segundos
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 5000);
    },

    // Mostrar mensaje de error temporal
    showError: function (message) {
      // Solo mostrar en consola para no molestar al usuario
      console.warn("NPS Widget:", message);

      // Opcional: mostrar notificación discreta
      if (this.options.showErrors !== false) {
        const notification = document.createElement("div");
        notification.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 1000000;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        notification.textContent = `NPS Widget: ${message}`;

        document.body.appendChild(notification);

        // Remover después de 5 segundos
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 5000);
      }
    },
  };

  // Exponer NPSWidget globalmente
  window.NPSWidget = NPSWidget;
})(window, document);
