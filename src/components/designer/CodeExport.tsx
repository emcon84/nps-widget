"use client";

import React, { useState } from "react";
import { FormElement } from "@/types/form-elements";
import { Copy, Check, Download, Code } from "lucide-react";

interface CodeExportProps {
  elements: FormElement[];
  isOpen: boolean;
  onClose: () => void;
  surveyId?: string; // ID del survey guardado
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
  surveyId,
  formSettings,
}: CodeExportProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "simple" | "custom" | "manual"
  >("simple");

  if (!isOpen) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const widgetId = surveyId || `temp-${Date.now()}`;

  // Script embebible simple (recomendado)
  const simpleScript = `<!-- NPS Widget - Paste this anywhere in your HTML -->
<script src="${baseUrl}/widget.js" onload="NPSWidget.create('${widgetId}')"></script>`;

  // Script con opciones personalizadas
  const customScript = `<!-- NPS Widget with Custom Options -->
<script src="${baseUrl}/widget.js"></script>
<script>
  NPSWidget.create('${widgetId}', {
    autoShow: true,           // Mostrar automáticamente
    delay: 3000,             // Esperar 3 segundos antes de mostrar
    trigger: 'time',         // Opciones: 'time', 'scroll', 'exit', 'manual'
    showOnce: true,          // Mostrar solo una vez por usuario
    scrollPercent: 50        // Solo para trigger 'scroll' - % de página
  });
  
  // Para mostrar manualmente en cualquier momento:
  // NPSWidget.show();
</script>`;

  // Script para control manual
  const manualScript = `<!-- NPS Widget - Manual Control -->
<script src="${baseUrl}/widget.js"></script>
<script>
  // Configurar pero NO mostrar automáticamente
  NPSWidget.create('${widgetId}', {
    autoShow: false
  });
  
  // Mostrar cuando quieras (ejemplo: al hacer click en un botón)
  function showNPSSurvey() {
    NPSWidget.show();
  }
</script>

<!-- Ejemplo de botón para activar manualmente -->
<button onclick="showNPSSurvey()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
  Give Feedback
</button>`;

  const getCurrentScript = () => {
    switch (selectedTab) {
      case "simple":
        return simpleScript;
      case "custom":
        return customScript;
      case "manual":
        return manualScript;
      default:
        return simpleScript;
    }
  };

  const handleCopy = async () => {
    const textToCopy = getCurrentScript();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = getCurrentScript();
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nps-widget-${widgetId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Embed Code</h2>
              <p className="text-sm text-gray-600">
                Copia y pega este código en tu sitio web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab("simple")}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === "simple"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Recomendado
          </button>
          <button
            onClick={() => setSelectedTab("custom")}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === "custom"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Opciones Avanzadas
          </button>
          <button
            onClick={() => setSelectedTab("manual")}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === "manual"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Control Manual
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedTab === "simple" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  ✨ Instalación Simple
                </h3>
                <p className="text-blue-800 text-sm">
                  Esta es la forma más fácil de agregar el widget a tu sitio. Se
                  mostrará automáticamente después de 3 segundos.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Características:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Aparece automáticamente como popup modal</li>
                  <li>• Se muestra solo una vez por usuario</li>
                  <li>• Se actualiza automáticamente si cambias el survey</li>
                  <li>• Funciona en cualquier sitio web</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === "custom" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  ⚙️ Opciones Personalizadas
                </h3>
                <p className="text-amber-800 text-sm">
                  Controla cuándo y cómo se muestra el widget con estas opciones
                  avanzadas.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Opciones disponibles:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • <code>trigger</code>: 'time' (temporizador), 'scroll'
                    (scroll), 'exit' (salida), 'manual'
                  </li>
                  <li>
                    • <code>delay</code>: Milisegundos de espera (para trigger
                    'time')
                  </li>
                  <li>
                    • <code>scrollPercent</code>: Porcentaje de scroll (para
                    trigger 'scroll')
                  </li>
                  <li>
                    • <code>showOnce</code>: true/false - Si mostrar solo una
                    vez
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === "manual" && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">
                  🎯 Control Total
                </h3>
                <p className="text-purple-800 text-sm">
                  Decide exactamente cuándo mostrar el widget con control manual
                  completo.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Casos de uso:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Botón "Feedback" en tu navegación</li>
                  <li>• Después de una acción específica del usuario</li>
                  <li>• Al completar una compra o proceso</li>
                  <li>• Control por JavaScript personalizado</li>
                </ul>
              </div>
            </div>
          )}

          {/* Code Block */}
          <div className="relative mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Código para copiar:</h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>

            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{getCurrentScript()}</code>
            </pre>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">📋 Instrucciones:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Copia el código de arriba</li>
              <li>Pégalo en cualquier lugar del HTML de tu sitio web</li>
              <li>¡Listo! El widget aparecerá automáticamente</li>
            </ol>

            {!surveyId && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  ⚠️ <strong>Importante:</strong> Guarda primero tu survey para
                  obtener un ID permanente. Este código temporal solo funcionará
                  en la sesión actual.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
