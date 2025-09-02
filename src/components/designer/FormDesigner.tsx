"use client";

import React, { useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";

import { RightSidebar } from "./RightSidebar";
import { LeftSidebar } from "./LeftSidebar";

// Importar hooks modulares
import { useFormElements } from "@/hooks/useFormElements";
import { useUIState } from "@/hooks/useUIState";
import { useFormConfiguration } from "@/hooks/useFormConfiguration";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

// Importar componentes modulares
import { FormDesignerToolbar } from "./FormDesignerToolbar";
import { FormDesignerContent } from "./FormDesignerContent";
import { FormDesignerModals } from "./FormDesignerModals";

/**
 * Componente principal FormDesigner refactorizado
 * Principio SRP: Solo se encarga de la composición y renderizado
 * Principio DIP: Depende de abstracciones (hooks) no de implementaciones concretas
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
    activeId,
    setActiveId,
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

  const { handleDragStart, handleDragEnd } = useDragAndDrop(
    elements,
    addElement,
    updateElement
  );

  // Event handlers - Principio SRP: funciones con una sola responsabilidad
  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = handleDragStart(event);
      setActiveId(id);
    },
    [handleDragStart, setActiveId]
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleDragEnd(event, activeId, setActiveId);
    },
    [handleDragEnd, activeId, setActiveId]
  );

  const onDeleteSelected = useCallback(() => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
    }
  }, [selectedElement, deleteElement]);

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex h-screen bg-gray-50">
        {!isPreviewMode && <LeftSidebar />}

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

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>

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
    </DndContext>
  );
}
