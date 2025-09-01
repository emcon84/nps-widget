"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { Settings, Eye, Copy, Plus } from "lucide-react";

import { RightSidebar } from "./RightSidebar";
import { Canvas } from "./Canvas";
import { FormElement, ElementType } from "@/types/form-elements";
import { LeftSidebar } from "./LeftSidebar";
import { PreviewMode } from "./PreviewMode";
import { CodeExport } from "./CodeExport";
import { FormSettings } from "./FormSettings";

interface FormDesignerWithSaveProps {
  onSave?: (data: {
    elements: FormElement[];
    settings: any;
    style: any;
  }) => void;
  onChange?: (data: {
    elements: FormElement[];
    settings: any;
    style: any;
  }) => void;
  saveButtonText?: string;
  isLoading?: boolean;
  initialElements?: FormElement[];
  initialSettings?: any;
  initialStyle?: any;
}

export function FormDesignerWithSave({
  onSave,
  onChange,
  saveButtonText = "Save",
  isLoading = false,
  initialElements = [],
  initialSettings = {
    submitEndpoint: "",
    submitMethod: "POST" as "POST" | "PUT" | "PATCH",
    webhookHeaders: {},
    successMessage: "¡Gracias por tu feedback!",
    errorMessage: "Error al enviar. Por favor intenta de nuevo.",
  },
  initialStyle = {
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    primaryColor: "#3b82f6",
    borderRadius: 8,
    fontFamily: "Inter",
  },
}: FormDesignerWithSaveProps) {
  const [elements, setElements] = useState<FormElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [formSettings, setFormSettings] = useState(initialSettings);
  const [formStyle, setFormStyle] = useState(initialStyle);
  const [showMobileElementsPanel, setShowMobileElementsPanel] = useState(false);
  const [showMobilePropertiesPanel, setShowMobilePropertiesPanel] =
    useState(false);
  const isFirstRender = useRef(true);

  // Call onChange whenever elements, settings, or style change
  useEffect(() => {
    // Skip first render to avoid calling onChange with initial values
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (onChange) {
      const currentData = {
        elements,
        settings: formSettings,
        style: formStyle,
      };
      onChange(currentData);
    }
  }, [elements, formSettings, formStyle]); // Removed onChange from dependencies

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
    const baseY = 100 + elements.length * 150;
    const baseX = 100 + (elements.length % 3) * 150;

    const baseProps = {
      id,
      label: `${type} element`,
      position: { x: baseX, y: baseY },
      dimensions: { width: 400, height: 120 },
      showBorder: true,
      showShadow: false,
    };

    switch (type) {
      case "nps":
        return {
          type: "nps",
          ...baseProps,
          label: "¿Qué tan probable es que recomiendes nuestro producto?",
          minValue: 0,
          maxValue: 10,
          minLabel: "Nada probable",
          maxLabel: "Muy probable",
          displayType: "numbers" as const,
          required: true,
        };
      case "text-input":
        return {
          type: "text-input",
          ...baseProps,
          label: "Campo de texto",
          placeholder: "Ingresa texto...",
          required: false,
        };
      case "textarea":
        return {
          type: "textarea",
          ...baseProps,
          label: "Comentarios adicionales",
          placeholder: "Escribe tus comentarios...",
          required: false,
          rows: 4,
        };
      case "select":
        return {
          type: "select",
          ...baseProps,
          label: "Selecciona una opción",
          options: ["Opción 1", "Opción 2", "Opción 3"],
          required: false,
          placeholder: "Selecciona...",
        };
      case "text":
        return {
          type: "text",
          ...baseProps,
          label: "Texto",
          text: "Texto de ejemplo",
          size: "md" as const,
        };
      case "heading":
        return {
          type: "heading",
          ...baseProps,
          label: "Encabezado",
          text: "Título de ejemplo",
          level: 2 as const,
        };
      default:
        return null;
    }
  };

  // Función para agregar elementos directamente (para mobile)
  const addElementDirectly = (elementType: string) => {
    const newElement = createNewElement(elementType as ElementType);
    if (newElement) {
      setElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement); // Seleccionar automáticamente el nuevo elemento
      setShowMobileElementsPanel(false); // Cerrar el panel móvil
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        elements,
        settings: formSettings,
        style: formStyle,
      });
    }
  };

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Modern Preview Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Preview Mode
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Live Preview
                </span>
              </div>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md border border-gray-300/50"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Exit Preview
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <PreviewMode elements={elements} />
        </div>
      </div>
    );
  }

  if (showCodeExport) {
    return (
      <CodeExport
        elements={elements}
        isOpen={true}
        onClose={() => setShowCodeExport(false)}
        formSettings={formSettings}
      />
    );
  }

  if (showFormSettings) {
    return (
      <FormSettings
        isOpen={true}
        formSettings={formSettings}
        onClose={() => setShowFormSettings(false)}
        onSave={(settings) => {
          setFormSettings(settings);
          setShowFormSettings(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Left Sidebar - Hidden on mobile, expandable */}
        <div className="lg:block hidden h-full">
          <LeftSidebar />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Toolbar */}
          <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Form Designer
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {elements.length} element{elements.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFormSettings(true)}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1 inline" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1 inline" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => setShowCodeExport(true)}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1 inline" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : saveButtonText}
                </button>
              )}
            </div>
          </div>

          {/* Canvas */}
          {/* Canvas Area */}
          <div className="flex-1 min-h-0 relative">
            <Canvas
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={(element: FormElement) => {
                setElements((prev) =>
                  prev.map((el) => (el.id === element.id ? element : el))
                );
                // Also update the selected element to reflect changes
                if (selectedElement && selectedElement.id === element.id) {
                  setSelectedElement(element);
                }
              }}
              onDeleteElement={(elementId: string) => {
                setElements((prev) => prev.filter((el) => el.id !== elementId));
                // Clear selection if deleted element was selected
                if (selectedElement && selectedElement.id === elementId) {
                  setSelectedElement(null);
                }
              }}
            />

            {/* Mobile Control Buttons */}
            <div className="lg:hidden fixed bottom-4 right-4 z-10">
              <div className="flex flex-col space-y-3 items-end">
                {/* Elements Panel Button */}
                <button
                  className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowMobileElementsPanel(true)}
                  title="Add Elements"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Properties Panel Button - Only show if element is selected */}
                {selectedElement && (
                  <button
                    className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                    onClick={() => setShowMobilePropertiesPanel(true)}
                    title="Element Properties"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block h-full">
          <RightSidebar
            selectedElement={selectedElement}
            onUpdateElement={(updatedElement: FormElement) => {
              setElements((prev) =>
                prev.map((el) =>
                  el.id === updatedElement.id ? updatedElement : el
                )
              );
              // Also update the selected element to reflect changes in the sidebar
              if (selectedElement && selectedElement.id === updatedElement.id) {
                setSelectedElement(updatedElement);
              }
            }}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="p-2 bg-blue-100 rounded">Dragging</div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Mobile Elements Panel */}
      {showMobileElementsPanel && (
        <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Elements
                </h3>
                <button
                  onClick={() => setShowMobileElementsPanel(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
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
            </div>
            <div className="p-4 overflow-y-auto">
              <LeftSidebar onAddElement={addElementDirectly} isMobile={true} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Properties Panel */}
      {showMobilePropertiesPanel && selectedElement && (
        <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Properties
                </h3>
                <button
                  onClick={() => setShowMobilePropertiesPanel(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
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
            </div>
            <div className="p-4 overflow-y-auto">
              <RightSidebar
                selectedElement={selectedElement}
                onUpdateElement={(updatedElement: FormElement) => {
                  setElements((prev) =>
                    prev.map((el) =>
                      el.id === updatedElement.id ? updatedElement : el
                    )
                  );
                  // Also update the selected element to reflect changes in the sidebar
                  if (
                    selectedElement &&
                    selectedElement.id === updatedElement.id
                  ) {
                    setSelectedElement(updatedElement);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
