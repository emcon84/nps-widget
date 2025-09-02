import React from "react";
import { FormElement } from "@/types/form-elements";

/**
 * Componente Toolbar - Principio SRP
 */
interface FormDesignerToolbarProps {
  isPreviewMode: boolean;
  selectedElement: FormElement | null;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onTogglePreview: () => void;
  onToggleSettings: () => void;
  onExportForm: () => void;
}

export function FormDesignerToolbar({
  isPreviewMode,
  selectedElement,
  onDeleteSelected,
  onClearAll,
  onTogglePreview,
  onToggleSettings,
  onExportForm,
}: FormDesignerToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-900">
        {isPreviewMode ? "Survey Preview" : "NPS Survey Designer"}
      </h1>
      <div className="flex gap-2">
        {!isPreviewMode && selectedElement && (
          <button
            onClick={onDeleteSelected}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Delete Selected
          </button>
        )}
        {!isPreviewMode && (
          <button
            onClick={onClearAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear All
          </button>
        )}
        <button
          onClick={onTogglePreview}
          className={`px-4 py-2 text-sm font-medium border border-transparent rounded-md ${
            isPreviewMode
              ? "text-white bg-green-600 hover:bg-green-700"
              : "text-white bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isPreviewMode ? "Exit Preview" : "Preview"}
        </button>
        {!isPreviewMode && (
          <>
            <button
              onClick={onToggleSettings}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
            >
              Configuración
            </button>
            <button
              onClick={onExportForm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Generar Script
            </button>
          </>
        )}
      </div>
    </div>
  );
}
