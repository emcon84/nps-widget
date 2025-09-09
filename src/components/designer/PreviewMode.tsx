"use client";

import React from "react";
import { FormElement } from "@/types/form-elements";
import { ElementRenderer } from "./ElementRenderer";

interface PreviewModeProps {
  elements: FormElement[];
}

export function PreviewMode({ elements }: PreviewModeProps) {
  // Ya no necesitamos ordenar por posición Y, los elementos se muestran en el orden del array
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <div className="space-y-6">
        {elements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay elementos en la encuesta.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Agrega elementos desde el panel lateral para ver el preview.
            </p>
          </div>
        ) : (
          elements.map((element) => (
            <div key={element.id} className="mb-6 flex justify-center">
              <div
                style={{
                  width: element.dimensions?.width || "auto",
                  maxWidth: "100%",
                }}
              >
                <ElementRenderer element={element} isPreview={true} />
              </div>
            </div>
          ))
        )}

        {elements.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
            <button
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
              style={{ width: "200px" }}
            >
              Enviar Encuesta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
