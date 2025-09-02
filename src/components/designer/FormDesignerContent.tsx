import React from "react";
import { FormElement } from "@/types/form-elements";
import { Canvas } from "./Canvas";
import { PreviewMode } from "./PreviewMode";

/**
 * Componente Content Area - Principio SRP
 */
interface FormDesignerContentProps {
  isPreviewMode: boolean;
  elements: FormElement[];
  selectedElement: FormElement | null;
  onSelectElement: (element: FormElement | null) => void;
  onUpdateElement: (element: FormElement) => void;
  onDeleteElement: (elementId: string) => void;
}

export function FormDesignerContent({
  isPreviewMode,
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: FormDesignerContentProps) {
  if (isPreviewMode) {
    return (
      <div className="flex-1 overflow-auto">
        <PreviewMode elements={elements} />
      </div>
    );
  }

  return (
    <Canvas
      elements={elements}
      selectedElement={selectedElement}
      onSelectElement={onSelectElement}
      onUpdateElement={onUpdateElement}
      onDeleteElement={onDeleteElement}
    />
  );
}
