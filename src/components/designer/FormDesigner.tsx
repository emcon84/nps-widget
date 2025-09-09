"use client";

import React, { useCallback } from "react";

import { RightSidebar } from "./RightSidebar";
import { LeftSidebar } from "./LeftSidebar";

// Importar hooks modulares
import { useFormElements } from "@/hooks/useFormElements";
import { useUIState } from "@/hooks/useUIState";
import { useFormConfiguration } from "@/hooks/useFormConfiguration";

// Importar componentes modulares
import { FormDesignerToolbar } from "./FormDesignerToolbar";
import { FormDesignerContent } from "./FormDesignerContent";
import { FormDesignerModals } from "./FormDesignerModals";

// Importar factory
import { FormElementFactory } from "@/lib/FormElementFactory";
import { ElementType } from "@/types/form-elements";

/**
 * Componente principal FormDesigner simplificado
 * Principio SRP: Solo se encarga de la composición y renderizado
 */
export function FormDesigner() {
  // Separación de responsabilidades usando custom hooks modulares
  const {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    clearAllElements,
    selectElement,
  } = useFormElements();

  const {
    isPreviewMode,
    showCodeExport,
    showFormSettings,
    togglePreviewMode,
    openCodeExport,
    closeCodeExport,
    toggleFormSettings,
    closeFormSettings,
  } = useUIState();

  const { formSettings, updateFormSettings } = useFormConfiguration();

  // Función simplificada para agregar elementos
  const handleAddElement = useCallback(
    (type: string) => {
      const elementType = type as ElementType;
      const newElement = FormElementFactory.createElement(
        elementType,
        elements
      );
      if (newElement) {
        addElement(newElement);
      }
    },
    [elements, addElement]
  );

  const onDeleteSelected = useCallback(() => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
    }
  }, [selectedElement, deleteElement]);

  return (
    <div className="flex h-screen bg-gray-50">
      {!isPreviewMode && <LeftSidebar onAddElement={handleAddElement} />}

      <div className="flex-1 flex flex-col">
        {/* Toolbar Component - Principio SRP */}
        <FormDesignerToolbar
          isPreviewMode={isPreviewMode}
          selectedElement={selectedElement}
          onDeleteSelected={onDeleteSelected}
          onClearAll={clearAllElements}
          onTogglePreview={togglePreviewMode}
          onToggleSettings={toggleFormSettings}
          onExportForm={openCodeExport}
        />

        {/* Content Area - Principio OCP */}
        <FormDesignerContent
          isPreviewMode={isPreviewMode}
          elements={elements}
          selectedElement={selectedElement}
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
        />
      </div>

      {!isPreviewMode && (
        <RightSidebar
          selectedElement={selectedElement}
          onUpdateElement={updateElement}
        />
      )}

      {/* Modals - Principio SRP */}
      <FormDesignerModals
        showCodeExport={showCodeExport}
        showFormSettings={showFormSettings}
        elements={elements}
        formSettings={formSettings}
        onCloseCodeExport={closeCodeExport}
        onCloseFormSettings={closeFormSettings}
        onSaveSettings={updateFormSettings}
      />
    </div>
  );
}
