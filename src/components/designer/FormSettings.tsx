"use client";

import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface FormSettingsProps {
  isOpen: boolean;
  settings: {
    submitEndpoint: string;
    submitMethod: "POST" | "PUT" | "PATCH";
    webhookHeaders: Record<string, string>;
    successMessage: string;
    errorMessage: string;
  };
  onClose: () => void;
  onSave: (settings: any) => void;
}

export function FormSettings({
  isOpen,
  settings,
  onClose,
  onSave,
}: FormSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const addHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setLocalSettings((prev) => ({
        ...prev,
        webhookHeaders: {
          ...prev.webhookHeaders,
          [newHeaderKey]: newHeaderValue,
        },
      }));
      setNewHeaderKey("");
      setNewHeaderValue("");
    }
  };

  const removeHeader = (key: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      webhookHeaders: Object.fromEntries(
        Object.entries(prev.webhookHeaders).filter(([k]) => k !== key)
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración del Formulario
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Endpoint Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configuración del Endpoint
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Endpoint *
                </label>
                <input
                  type="url"
                  value={localSettings.submitEndpoint}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      submitEndpoint: e.target.value,
                    }))
                  }
                  placeholder="https://tu-api.com/webhook/nps"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-sm text-gray-500 mt-1">
                  La URL donde se enviarán los datos del formulario NPS
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método HTTP
                </label>
                <select
                  value={localSettings.submitMethod}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      submitMethod: e.target.value as "POST" | "PUT" | "PATCH",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
            </div>
          </div>

          {/* Headers Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Headers Personalizados
            </h3>

            {/* Existing Headers */}
            {Object.entries(localSettings.webhookHeaders).length > 0 && (
              <div className="space-y-2 mb-4">
                {Object.entries(localSettings.webhookHeaders).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">
                          {key}:
                        </span>{" "}
                        {value}
                      </div>
                      <button
                        onClick={() => removeHeader(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Add New Header */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                  placeholder="Nombre del header (ej: Authorization)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <input
                  type="text"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  placeholder="Valor del header (ej: Bearer token123)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button
                  onClick={addHeader}
                  disabled={!newHeaderKey || !newHeaderValue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Agrega headers personalizados como Authorization, API-Key, etc.
              </p>
            </div>
          </div>

          {/* Messages Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mensajes de Respuesta
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de Éxito
                </label>
                <input
                  type="text"
                  value={localSettings.successMessage}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      successMessage: e.target.value,
                    }))
                  }
                  placeholder="¡Gracias por tu feedback!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de Error
                </label>
                <input
                  type="text"
                  value={localSettings.errorMessage}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      errorMessage: e.target.value,
                    }))
                  }
                  placeholder="Error al enviar. Por favor intenta de nuevo."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Data Format Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Formato de Datos
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 mb-2">
                Los datos se enviarán en este formato JSON:
              </p>
              <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto text-gray-900">
                {`{
  "timestamp": "2025-09-01T12:00:00Z",
  "formId": "nps-widget-123",
  "responses": {
    "nps_score": 8,
    "feedback": "Excelente servicio",
    "email": "usuario@email.com"
  },
  "userAgent": "Mozilla/5.0...",
  "pageUrl": "https://sitio-web.com/page"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!localSettings.submitEndpoint}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
