"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";

import { RightSidebar } from "./RightSidebar";
import { Canvas } from "./Canvas";
import { FormElement, ElementType } from "@/types/form-elements";
import { LeftSidebar } from "./LeftSidebar";
import { PreviewMode } from "./PreviewMode";
import { CodeExport } from "./CodeExport";
import { FormSettings } from "./FormSettings";

export function FormDesigner() {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [formSettings, setFormSettings] = useState({
    submitEndpoint: "",
    submitMethod: "POST" as "POST" | "PUT" | "PATCH",
    webhookHeaders: {},
    successMessage: "¡Gracias por tu feedback!",
    errorMessage: "Error al enviar. Por favor intenta de nuevo.",
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Si se está arrastrando desde el sidebar izquierdo al canvas
    if (over.id === "canvas" && typeof active.id === "string") {
      const elementType = active.id;
      const newElement = createNewElement(elementType as ElementType);

      if (newElement) {
        setElements((prev) => [...prev, newElement]);
      }
    }

    // Si se está moviendo un elemento dentro del canvas
    if (
      over.id === "canvas" &&
      typeof active.id === "string" &&
      active.id.startsWith("element-")
    ) {
      const elementId = active.id.replace("element-", "");
      const element = elements.find((el) => el.id === elementId);

      if (element && event.delta) {
        setElements((prev) =>
          prev.map((el) =>
            el.id === elementId
              ? {
                  ...el,
                  position: {
                    x: el.position.x + event.delta.x,
                    y: el.position.y + event.delta.y,
                  },
                }
              : el
          )
        );
      }
    }
  };

  const createNewElement = (type: string): FormElement | null => {
    const id = `${type}-${Date.now()}`;
    // Calcular posición basada en elementos existentes para evitar encimado
    const baseY = 100 + elements.length * 150; // Separar elementos verticalmente
    const baseX = 100 + (elements.length % 3) * 150; // Alternar horizontalmente cada 3 elementos

    const baseProps = {
      id,
      label: `${type} element`,
      position: { x: baseX, y: baseY },
      dimensions: { width: 400, height: 120 }, // Ancho mayor por defecto
      showBorder: true, // Border por defecto
      showShadow: false, // Sin sombra por defecto
    };

    switch (type) {
      case "nps":
        return {
          ...baseProps,
          type: "nps",
          label: "NPS Question",
          minValue: 0,
          maxValue: 10,
          minLabel: "Not likely",
          maxLabel: "Very likely",
          displayType: "numbers",
          dimensions: { width: 500, height: 120 }, // Ancho mayor para NPS
        };
      case "text-input":
        return {
          ...baseProps,
          type: "text-input",
          label: "Text Input",
          placeholder: "Enter text...",
        };
      case "textarea":
        return {
          ...baseProps,
          type: "textarea",
          label: "Text Area",
          placeholder: "Enter your feedback...",
          rows: 4,
          dimensions: { width: 400, height: 150 }, // TextArea más alto
        };
      case "select":
        return {
          ...baseProps,
          type: "select",
          label: "Select Option",
          options: ["Option 1", "Option 2", "Option 3"],
          placeholder: "Choose an option...",
        };
      case "button":
        return {
          ...baseProps,
          type: "button",
          label: "Button",
          text: "Submit",
          variant: "primary",
          action: "submit",
          dimensions: { width: 200, height: 50 }, // Botones más pequeños
        };
      case "heading":
        return {
          ...baseProps,
          type: "heading",
          label: "Heading",
          text: "Survey Title",
          level: 2,
          dimensions: { width: 400, height: 80 }, // Headings un poco más bajos
        };
      case "text":
        return {
          ...baseProps,
          type: "text",
          label: "Text",
          text: "Add your text here",
          size: "md",
          dimensions: { width: 400, height: 60 }, // Texto más bajo
        };
      default:
        return null;
    }
  };

  const handleSelectElement = (element: FormElement | null) => {
    setSelectedElement(element);
  };

  const updateElement = (updatedElement: FormElement) => {
    setElements((prev) =>
      prev.map((el) => (el.id === updatedElement.id ? updatedElement : el))
    );
    setSelectedElement(updatedElement);
  };

  const deleteElement = (elementId: string) => {
    setElements((prev) => {
      const newElements = prev.filter((el) => el.id !== elementId);
      return newElements;
    });
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const exportForm = () => {
    setShowCodeExport(true);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-50">
        {!isPreviewMode && (
          <>
            {/* Left Sidebar - Element Library */}
            <LeftSidebar />
          </>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {isPreviewMode ? "Survey Preview" : "NPS Survey Designer"}
            </h1>
            <div className="flex gap-2">
              {!isPreviewMode && selectedElement && (
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete Selected
                </button>
              )}
              {!isPreviewMode && (
                <button
                  onClick={() => setElements([])}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 text-sm font-medium border border-transparent rounded-md ${
                  isPreviewMode
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : "text-white bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {isPreviewMode ? "Exit Preview" : "Preview"}
              </button>
              {!isPreviewMode && (
                <button
                  onClick={() => setShowFormSettings(!showFormSettings)}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                >
                  Configuración
                </button>
              )}
              {!isPreviewMode && (
                <button
                  onClick={exportForm}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Generar Script
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          {isPreviewMode ? (
            <div className="flex-1 overflow-auto">
              <PreviewMode elements={elements} />
            </div>
          ) : (
            <Canvas
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={handleSelectElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
            />
          )}
        </div>

        {!isPreviewMode && (
          <>
            {/* Right Sidebar - Properties Panel */}
            <RightSidebar
              selectedElement={selectedElement}
              onUpdateElement={updateElement}
            />
          </>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>

        {/* Code Export Modal */}
        {showCodeExport && (
          <CodeExport
            isOpen={showCodeExport}
            elements={elements}
            formSettings={formSettings}
            onClose={() => setShowCodeExport(false)}
          />
        )}

        {/* Form Settings Modal */}
        {showFormSettings && (
          <FormSettings
            isOpen={showFormSettings}
            formSettings={formSettings}
            onClose={() => setShowFormSettings(false)}
            onSave={setFormSettings}
          />
        )}
      </div>
    </DndContext>
  );
}
