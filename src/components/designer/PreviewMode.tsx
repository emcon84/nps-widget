"use client";

import React from "react";
import { FormElement } from "@/types/form-elements";
import { ElementRenderer } from "./ElementRenderer";

interface PreviewModeProps {
  elements: FormElement[];
}

export function PreviewMode({ elements }: PreviewModeProps) {
  // Ordenar elementos por posición vertical para mostrarlos en orden lógico
  const sortedElements = [...elements].sort(
    (a, b) => a.position.y - b.position.y
  );

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white">
      <div className="space-y-6">
        {sortedElements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay elementos en la encuesta.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Agrega elementos desde el panel lateral para ver el preview.
            </p>
          </div>
        ) : (
          sortedElements.map((element) => (
            <div key={element.id} className="mb-6">
              <ElementRenderer element={element} isPreview={true} />
            </div>
          ))
        )}

        {sortedElements.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium">
              Enviar Encuesta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
