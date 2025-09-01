"use client";

import React, { useState } from "react";
import {
  FormElement,
  NPSElement,
  TextInputElement,
  TextAreaElement,
  SelectElement,
  HeadingElement,
  TextElement,
} from "@/types/form-elements";
import { Copy, Check, Download, Code } from "lucide-react";

interface CodeExportProps {
  elements: FormElement[];
  isOpen: boolean;
  onClose: () => void;
  formSettings?: {
    submitEndpoint: string;
    submitMethod: "POST" | "PUT" | "PATCH";
    webhookHeaders: Record<string, string>;
    successMessage: string;
    errorMessage: string;
  };
}

export function CodeExport({
  elements,
  isOpen,
  onClose,
  formSettings,
}: CodeExportProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"script" | "compact" | "html">(
    "compact"
  );

  if (!isOpen) return null;

  // Generar configuración de la encuesta
  const surveyConfig = {
    id: `nps-survey-${Date.now()}`,
    elements: elements.map((el) => ({
      id: el.id,
      type: el.type,
      label: el.label,
      required: el.required || false,
      position: el.position,
      dimensions: el.dimensions,
      showBorder: el.showBorder,
      showShadow: el.showShadow,
      ...getElementSpecificConfig(el),
    })),
    style: {
      fontFamily: "Arial, sans-serif",
      primaryColor: "#3b82f6",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
    },
    settings: formSettings || {
      submitEndpoint: "",
      submitMethod: "POST",
      webhookHeaders: {},
      successMessage: "¡Gracias por tu feedback!",
      errorMessage: "Error al enviar. Por favor intenta de nuevo.",
    },
  };

  // Script embebible
  const embedScript = `<!-- NPS Widget Script -->
<div id="nps-widget-${surveyConfig.id}"></div>
<script>
(function() {
  const config = ${JSON.stringify(surveyConfig, null, 2)};
  
  function createNPSWidget(config) {
    const container = document.getElementById('nps-widget-' + config.id);
    if (!container) return;
    
    // Crear estilos
    const styles = \`
      .nps-widget {
        max-width: 600px;
        margin: 20px auto;
        padding: 24px;
        background: \${config.style.backgroundColor};
        border-radius: \${config.style.borderRadius};
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        font-family: \${config.style.fontFamily};
      }
      .nps-element {
        margin-bottom: 20px;
      }
      .nps-label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        color: #374151;
      }
      .nps-required {
        color: #ef4444;
      }
      .nps-scale {
        display: flex;
        gap: 8px;
        justify-content: space-between;
        margin: 16px 0;
      }
      .nps-scale-button {
        flex: 1;
        padding: 12px 8px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
        text-align: center;
      }
      .nps-scale-button:hover {
        border-color: \${config.style.primaryColor};
        background: \${config.style.primaryColor}15;
      }
      .nps-scale-button.selected {
        border-color: \${config.style.primaryColor};
        background: \${config.style.primaryColor};
        color: white;
      }
      .nps-input, .nps-textarea, .nps-select {
        width: 100%;
        padding: 12px;
        border: 2px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s;
      }
      .nps-input:focus, .nps-textarea:focus, .nps-select:focus {
        outline: none;
        border-color: \${config.style.primaryColor};
      }
      .nps-submit {
        background: \${config.style.primaryColor};
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .nps-submit:hover {
        opacity: 0.9;
      }
      .nps-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 12px;
        color: #6b7280;
      }
    \`;
    
    // Insertar estilos
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Crear HTML del widget
    let html = '<div class="nps-widget">';
    
    config.elements.forEach(element => {
      html += '<div class="nps-element">';
      
      if (element.type === 'nps') {
        html += \`
          <label class="nps-label">
            \${element.label}
            \${element.required ? '<span class="nps-required">*</span>' : ''}
          </label>
          <div class="nps-labels">
            <span>\${element.minLabel || 'Not likely'}</span>
            <span>\${element.maxLabel || 'Very likely'}</span>
          </div>
          <div class="nps-scale" data-element-id="\${element.id}">
        \`;
        
        for (let i = element.minValue; i <= element.maxValue; i++) {
          if (element.displayType === 'emojis') {
            const emojis = ['😤', '😠', '😞', '🙁', '😐', '😕', '🙂', '😊', '😃', '😍', '🤩'];
            const emojiIndex = Math.round(((i - element.minValue) / (element.maxValue - element.minValue)) * (emojis.length - 1));
            html += \`<button type="button" class="nps-scale-button" data-value="\${i}">\${emojis[emojiIndex]}</button>\`;
          } else {
            html += \`<button type="button" class="nps-scale-button" data-value="\${i}">\${i}</button>\`;
          }
        }
        html += '</div>';
        
      } else if (element.type === 'text-input') {
        html += \`
          <label class="nps-label">
            \${element.label}
            \${element.required ? '<span class="nps-required">*</span>' : ''}
          </label>
          <input type="text" class="nps-input" placeholder="\${element.placeholder || ''}" 
                 data-element-id="\${element.id}" \${element.maxLength ? 'maxlength="' + element.maxLength + '"' : ''}>
        \`;
        
      } else if (element.type === 'textarea') {
        html += \`
          <label class="nps-label">
            \${element.label}
            \${element.required ? '<span class="nps-required">*</span>' : ''}
          </label>
          <textarea class="nps-textarea" placeholder="\${element.placeholder || ''}" 
                    data-element-id="\${element.id}" rows="\${element.rows || 4}"
                    \${element.maxLength ? 'maxlength="' + element.maxLength + '"' : ''}></textarea>
        \`;
        
      } else if (element.type === 'select') {
        html += \`
          <label class="nps-label">
            \${element.label}
            \${element.required ? '<span class="nps-required">*</span>' : ''}
          </label>
          <select class="nps-select" data-element-id="\${element.id}">
            <option value="">\${element.placeholder || 'Choose an option...'}</option>
            \${element.options.map(opt => \`<option value="\${opt}">\${opt}</option>\`).join('')}
          </select>
        \`;
        
      } else if (element.type === 'heading') {
        html += \`<h\${element.level} style="margin: 0 0 16px 0; color: #111827;">\${element.text}</h\${element.level}>\`;
        
      } else if (element.type === 'text') {
        html += \`<p style="margin: 0 0 16px 0; color: #374151;">\${element.text}</p>\`;
      }
      
      html += '</div>';
    });
    
    html += '<button type="submit" class="nps-submit">Submit Survey</button>';
    html += '</div>';
    
    container.innerHTML = html;
    
    // Agregar interactividad
    // NPS Scale clicks
    container.querySelectorAll('.nps-scale-button').forEach(button => {
      button.addEventListener('click', function() {
        // Deseleccionar otros botones en la misma escala
        this.parentElement.querySelectorAll('.nps-scale-button').forEach(b => b.classList.remove('selected'));
        // Seleccionar este botón
        this.classList.add('selected');
      });
    });
    
    // Submit handler
    container.querySelector('.nps-submit').addEventListener('click', async function() {
      const formData = {};
      
      // Recolectar datos de NPS
      container.querySelectorAll('.nps-scale .selected').forEach(button => {
        const elementId = button.parentElement.dataset.elementId;
        formData[elementId] = button.dataset.value;
      });
      
      // Recolectar datos de inputs
      container.querySelectorAll('.nps-input, .nps-textarea, .nps-select').forEach(input => {
        if (input.value) {
          formData[input.dataset.elementId] = input.value;
        }
      });
      
      // Preparar datos para envío
      const submitData = {
        timestamp: new Date().toISOString(),
        formId: config.id,
        responses: formData,
        userAgent: navigator.userAgent,
        pageUrl: window.location.href
      };
      
      // Enviar datos si hay endpoint configurado
      if (config.settings.submitEndpoint) {
        try {
          this.disabled = true;
          this.textContent = 'Enviando...';
          
          const headers = {
            'Content-Type': 'application/json',
            ...config.settings.webhookHeaders
          };
          
          const response = await fetch(config.settings.submitEndpoint, {
            method: config.settings.submitMethod,
            headers: headers,
            body: JSON.stringify(submitData)
          });
          
          if (response.ok) {
            // Mostrar mensaje de éxito
            container.innerHTML = \`
              <div style="text-align: center; padding: 40px; color: #10b981;">
                <h3 style="margin: 0 0 8px 0;">\${config.settings.successMessage}</h3>
                <p style="margin: 0; color: #6b7280;">Tu respuesta ha sido registrada.</p>
              </div>
            \`;
          } else {
            throw new Error('Error en la respuesta del servidor');
          }
        } catch (error) {
          console.error('Error sending survey data:', error);
          // Mostrar mensaje de error
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = 'background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 6px; margin-top: 16px; text-align: center;';
          errorDiv.textContent = config.settings.errorMessage;
          container.appendChild(errorDiv);
          
          this.disabled = false;
          this.textContent = 'Submit Survey';
        }
      } else {
        // Fallback si no hay endpoint configurado
        console.log('Survey Data:', submitData);
        
        if (window.onNPSSubmit) {
          window.onNPSSubmit(submitData);
        } else {
          alert('Survey submitted! Data logged to console.');
        }
      }
    });
  }
  
  // Inicializar widget
  createNPSWidget(config);
})();
</script>`;

  // Script compacto (versión minificada)
  const compactScript = `<div id="nps-${surveyConfig.id}"></div><script>(function(){const c=${JSON.stringify(
    {
      ...surveyConfig,
      elements: surveyConfig.elements.map((el) => ({
        id: el.id,
        type: el.type,
        label: el.label,
        required: el.required,
        ...(el.type === "nps" && {
          minValue: (el as NPSElement).minValue,
          maxValue: (el as NPSElement).maxValue,
          minLabel: (el as NPSElement).minLabel,
          maxLabel: (el as NPSElement).maxLabel,
          displayType: (el as NPSElement).displayType,
        }),
        ...(el.type === "text-input" && {
          placeholder: (el as any).placeholder,
        }),
        ...(el.type === "textarea" && {
          placeholder: (el as any).placeholder,
          rows: (el as any).rows,
        }),
        ...(el.type === "select" && {
          options: (el as any).options,
          placeholder: (el as any).placeholder,
        }),
      })),
    }
  )};const d=document,s=d.createElement('style');s.textContent=\`.nw{max-width:600px;margin:20px auto;padding:24px;background:#fff;border-radius:8px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);font-family:Arial,sans-serif}.ne{margin-bottom:20px}.nl{display:block;font-weight:600;margin-bottom:8px;color:#374151}.nr{color:#ef4444}.ns{display:flex;gap:8px;justify-content:space-between;margin:16px 0}.nb{flex:1;padding:12px 8px;border:2px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;transition:all 0.2s;font-weight:500;text-align:center}.nb:hover{border-color:\${c.style.primaryColor};background:\${c.style.primaryColor}15}.nb.sel{border-color:\${c.style.primaryColor};background:\${c.style.primaryColor};color:#fff}.ni{width:100%;padding:12px;border:2px solid #d1d5db;border-radius:6px;font-size:14px}.ni:focus{outline:none;border-color:\${c.style.primaryColor}}.btn{background:\${c.style.primaryColor};color:#fff;padding:12px 24px;border:none;border-radius:6px;font-weight:600;cursor:pointer}\`;d.head.appendChild(s);let h='<div class="nw">';c.elements.forEach(e=>{h+='<div class="ne">';if(e.type==='nps'){h+=\`<label class="nl">\${e.label}\${e.required?' <span class="nr">*</span>':''}</label><div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;color:#6b7280"><span>\${e.minLabel||'Not likely'}</span><span>\${e.maxLabel||'Very likely'}</span></div><div class="ns" data-id="\${e.id}">\`;for(let i=e.minValue;i<=e.maxValue;i++){h+=\`<button type="button" class="nb" data-v="\${i}">\${i}</button>\`}h+='</div>'}else if(e.type==='text-input'){h+=\`<label class="nl">\${e.label}\${e.required?' <span class="nr">*</span>':''}</label><input type="text" class="ni" placeholder="\${e.placeholder||''}" data-id="\${e.id}">\`}else if(e.type==='textarea'){h+=\`<label class="nl">\${e.label}\${e.required?' <span class="nr">*</span>':''}</label><textarea class="ni" placeholder="\${e.placeholder||''}" data-id="\${e.id}" rows="\${e.rows||4}"></textarea>\`}else if(e.type==='select'){h+=\`<label class="nl">\${e.label}\${e.required?' <span class="nr">*</span>':''}</label><select class="ni" data-id="\${e.id}"><option value="">\${e.placeholder||'Choose an option...'}</option>\${e.options.map(o=>\`<option value="\${o}">\${o}</option>\`).join('')}</select>\`}h+='</div>'});h+='<button type="submit" class="btn">Submit Survey</button></div>';const el=d.getElementById('nps-'+c.id);el.innerHTML=h;el.querySelectorAll('.nb').forEach(b=>b.addEventListener('click',function(){this.parentElement.querySelectorAll('.nb').forEach(x=>x.classList.remove('sel'));this.classList.add('sel')}));el.querySelector('.btn').addEventListener('click',async function(){const fd={};el.querySelectorAll('.ns .sel').forEach(b=>fd[b.parentElement.dataset.id]=b.dataset.v);el.querySelectorAll('.ni').forEach(i=>{if(i.value)fd[i.dataset.id]=i.value});const data={timestamp:new Date().toISOString(),formId:c.id,responses:fd,userAgent:navigator.userAgent,pageUrl:location.href};if(c.settings.submitEndpoint){try{this.disabled=true;this.textContent='Enviando...';const r=await fetch(c.settings.submitEndpoint,{method:c.settings.submitMethod,headers:{'Content-Type':'application/json',...c.settings.webhookHeaders},body:JSON.stringify(data)});if(r.ok){el.innerHTML=\`<div style="text-align:center;padding:40px;color:#10b981"><h3 style="margin:0 0 8px 0">\${c.settings.successMessage}</h3><p style="margin:0;color:#6b7280">Tu respuesta ha sido registrada.</p></div>\`}else throw new Error('Server error')}catch(e){console.error('Error:',e);const err=d.createElement('div');err.style.cssText='background:#fef2f2;color:#dc2626;padding:12px;border-radius:6px;margin-top:16px;text-align:center';err.textContent=c.settings.errorMessage;el.appendChild(err);this.disabled=false;this.textContent='Submit Survey'}}else{console.log('Survey Data:',data);alert('Survey submitted!')}})})();</script>`;

  // HTML estático alternativo
  const htmlCode = `<!-- Static HTML Version -->
<div id="nps-survey-static" style="max-width: 600px; margin: 20px auto; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
  ${elements.map((element) => generateStaticHTML(element)).join("\n  ")}
  <button type="submit" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
    Submit Survey
  </button>
</div>`;

  const handleCopy = async () => {
    const textToCopy =
      selectedTab === "script"
        ? embedScript
        : selectedTab === "compact"
          ? compactScript
          : htmlCode;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const content =
      selectedTab === "script"
        ? embedScript
        : selectedTab === "compact"
          ? compactScript
          : htmlCode;
    const filename =
      selectedTab === "script"
        ? "nps-widget.html"
        : selectedTab === "compact"
          ? "nps-widget-compact.html"
          : "nps-survey.html";

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Export Survey Code
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Configuration Status */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${formSettings?.submitEndpoint ? "bg-green-500" : "bg-yellow-500"}`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {formSettings?.submitEndpoint
                  ? "Endpoint configurado"
                  : "Sin endpoint configurado"}
              </span>
            </div>
            {formSettings?.submitEndpoint ? (
              <p className="text-xs text-gray-600">
                Los datos se enviarán a:{" "}
                <code className="bg-white px-1 rounded">
                  {formSettings.submitEndpoint}
                </code>
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                Los datos se mostrarán en la consola. Configura un endpoint en
                &quot;Configuración&quot; para envío automático.
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSelectedTab("compact")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === "compact"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🚀 Compacto
            </button>
            <button
              onClick={() => setSelectedTab("script")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === "script"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Embed Script
            </button>
            <button
              onClick={() => setSelectedTab("html")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === "html"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Static HTML
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">
              {selectedTab === "compact"
                ? "🚀 Script Ultra-Compacto (Minificado)"
                : selectedTab === "script"
                  ? "JavaScript Embed Code"
                  : "Static HTML Code"}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedTab === "compact"
                ? "Versión súper compacta (~90% menos código). Ideal para incluir en páginas con limitaciones de tamaño."
                : selectedTab === "script"
                  ? "Copy and paste this code into any HTML page to embed your NPS survey widget."
                  : "Static HTML version that you can customize further or integrate into existing forms."}
            </p>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {selectedTab === "compact"
                  ? "nps-widget-compact.html"
                  : selectedTab === "script"
                    ? "nps-widget.html"
                    : "nps-survey.html"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-900 text-gray-300 text-sm font-mono overflow-auto max-h-96">
              <pre>
                {selectedTab === "compact"
                  ? compactScript
                  : selectedTab === "script"
                    ? embedScript
                    : htmlCode}
              </pre>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-blue-900">
                Integration Instructions:
              </h4>
              <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {selectedTab === "compact"
                  ? `Tamaño: ~${Math.round((compactScript.length / 1024) * 10) / 10}KB (${Math.round((1 - compactScript.length / embedScript.length) * 100)}% más pequeño)`
                  : selectedTab === "script"
                    ? `Tamaño: ~${Math.round((embedScript.length / 1024) * 10) / 10}KB`
                    : `Tamaño: ~${Math.round((htmlCode.length / 1024) * 10) / 10}KB`}
              </div>
            </div>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Copy the code above</li>
              <li>
                2. Paste it into your HTML page where you want the survey to
                appear
              </li>
              <li>
                3. (Optional) Add a callback function:{" "}
                <code className="bg-blue-100 px-1 rounded">
                  window.onNPSSubmit = function(data){" "}
                  {"{/* handle survey data */}"}
                </code>
              </li>
              <li>
                4. The survey will automatically render and collect responses
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getElementSpecificConfig(element: FormElement) {
  const config: Record<string, unknown> = {};

  switch (element.type) {
    case "nps":
      const npsEl = element as NPSElement;
      config.minValue = npsEl.minValue;
      config.maxValue = npsEl.maxValue;
      config.minLabel = npsEl.minLabel;
      config.maxLabel = npsEl.maxLabel;
      config.displayType = npsEl.displayType;
      break;
    case "text-input":
      const textEl = element as any;
      config.placeholder = textEl.placeholder;
      config.maxLength = textEl.maxLength;
      break;
    case "textarea":
      const textareaEl = element as any;
      config.placeholder = textareaEl.placeholder;
      config.rows = textareaEl.rows;
      config.maxLength = textareaEl.maxLength;
      break;
    case "select":
      const selectEl = element as any;
      config.options = selectEl.options;
      config.placeholder = selectEl.placeholder;
      break;
    case "heading":
      const headingEl = element as any;
      config.text = headingEl.text;
      config.level = headingEl.level;
      break;
    case "text":
      const textContentEl = element as any;
      config.text = textContentEl.text;
      config.size = textContentEl.size;
      break;
  }

  return config;
}

function generateStaticHTML(element: FormElement): string {
  switch (element.type) {
    case "nps":
      const npsEl = element as any;
      let npsHTML = `<div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
          ${element.label}${element.required ? '<span style="color: #ef4444;">*</span>' : ""}
        </label>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #6b7280;">
          <span>${npsEl.minLabel || "Not likely"}</span>
          <span>${npsEl.maxLabel || "Very likely"}</span>
        </div>
        <div style="display: flex; gap: 8px;">`;

      for (let i = npsEl.minValue; i <= npsEl.maxValue; i++) {
        npsHTML += `<button type="button" style="flex: 1; padding: 12px 8px; border: 2px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-weight: 500; text-align: center;" onclick="this.parentElement.querySelectorAll('button').forEach(b => b.style.background='white'); this.style.background='#3b82f6'; this.style.color='white';">${i}</button>`;
      }

      npsHTML += "</div></div>";
      return npsHTML;

    case "text-input":
      const textEl = element as any;
      return `<div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
          ${element.label}${element.required ? '<span style="color: #ef4444;">*</span>' : ""}
        </label>
        <input type="text" placeholder="${textEl.placeholder || ""}" style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px;" ${textEl.maxLength ? `maxlength="${textEl.maxLength}"` : ""}>
      </div>`;

    case "textarea":
      const textareaEl = element as any;
      return `<div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
          ${element.label}${element.required ? '<span style="color: #ef4444;">*</span>' : ""}
        </label>
        <textarea placeholder="${textareaEl.placeholder || ""}" rows="${textareaEl.rows || 4}" style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical;" ${textareaEl.maxLength ? `maxlength="${textareaEl.maxLength}"` : ""}></textarea>
      </div>`;

    case "select":
      const selectEl = element as any;
      return `<div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
          ${element.label}${element.required ? '<span style="color: #ef4444;">*</span>' : ""}
        </label>
        <select style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px;">
          <option value="">${selectEl.placeholder || "Choose an option..."}</option>
          ${selectEl.options.map((opt: string) => `<option value="${opt}">${opt}</option>`).join("")}
        </select>
      </div>`;

    case "heading":
      const headingEl = element as any;
      return `<h${headingEl.level} style="margin: 0 0 16px 0; color: #111827;">${headingEl.text}</h${headingEl.level}>`;

    case "text":
      const textContentEl = element as any;
      return `<p style="margin: 0 0 16px 0; color: #374151;">${textContentEl.text}</p>`;

    default:
      return "";
  }
}
