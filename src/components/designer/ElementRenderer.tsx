"use client";

import React from "react";
import {
  FormElement,
  NPSElement,
  TextInputElement,
  TextAreaElement,
  SelectElement,
  ButtonElement,
  HeadingElement,
  TextElement,
} from "@/types/form-elements";

interface ElementRendererProps {
  element: FormElement;
  isPreview?: boolean;
  onUpdate?: (element: FormElement) => void;
}

export function ElementRenderer({
  element,
  isPreview = true,
}: ElementRendererProps) {
  const renderElement = () => {
    switch (element.type) {
      case "nps":
        return (
          <NPSRenderer element={element as NPSElement} isPreview={isPreview} />
        );
      case "text-input":
        return (
          <TextInputRenderer
            element={element as TextInputElement}
            isPreview={isPreview}
          />
        );
      case "textarea":
        return (
          <TextAreaRenderer
            element={element as TextAreaElement}
            isPreview={isPreview}
          />
        );
      case "select":
        return (
          <SelectRenderer
            element={element as SelectElement}
            isPreview={isPreview}
          />
        );
      case "button":
        return (
          <ButtonRenderer
            element={element as ButtonElement}
            isPreview={isPreview}
          />
        );
      case "heading":
        return (
          <HeadingRenderer
            element={element as HeadingElement}
            isPreview={isPreview}
          />
        );
      case "text":
        return (
          <TextRenderer
            element={element as TextElement}
            isPreview={isPreview}
          />
        );
      default:
        return (
          <div className="p-2 bg-gray-100 border border-gray-300 rounded">
            Unknown element
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {renderElement()}
      {!isPreview && (
        <div className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-1 rounded">
          {element.label}
        </div>
      )}
    </div>
  );
}

function NPSRenderer({
  element,
  isPreview,
}: {
  element: NPSElement;
  isPreview: boolean;
}) {
  const numbers = Array.from(
    { length: element.maxValue - element.minValue + 1 },
    (_, i) => element.minValue + i
  );

  // Emojis para el NPS (de muy negativo a muy positivo)
  const emojis = [
    "😤",
    "😠",
    "😞",
    "🙁",
    "😐",
    "😕",
    "🙂",
    "😊",
    "😃",
    "😍",
    "🤩",
  ];

  const getDisplayValue = (num: number) => {
    if (element.displayType === "emojis") {
      // Mapear el número a un emoji basado en la escala
      const emojiIndex = Math.round(
        ((num - element.minValue) / (element.maxValue - element.minValue)) *
          (emojis.length - 1)
      );
      return emojis[Math.max(0, Math.min(emojiIndex, emojis.length - 1))];
    }
    return num.toString();
  };

  return (
    <div
      className={`w-full h-full p-4 bg-white rounded-lg flex flex-col ${
        element.showBorder !== false ? "border border-gray-300" : ""
      } ${element.showShadow === true ? "shadow-sm" : ""}`}
    >
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {element.label}
          {element.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">{element.minLabel}</span>
          <span className="text-xs text-gray-600">{element.maxLabel}</span>
        </div>
        <div className="flex gap-2 justify-between">
          {numbers.map((num) => (
            <button
              key={num}
              disabled={!isPreview} // Habilitar en preview, deshabilitar en designer
              className={`border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center ${
                element.displayType === "emojis"
                  ? "w-12 h-12 text-lg"
                  : "w-10 h-10 text-sm font-semibold text-gray-700"
              }`}
              title={`${num}`}
            >
              {getDisplayValue(num)}
            </button>
          ))}
        </div>
        {element.displayType === "emojis" && (
          <div className="flex gap-2 justify-between mt-1">
            {numbers.map((num) => (
              <span
                key={`num-${num}`}
                className="text-xs text-gray-700 font-medium text-center w-12"
              >
                {num}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TextInputRenderer({
  element,
  isPreview,
}: {
  element: TextInputElement;
  isPreview: boolean;
}) {
  return (
    <div
      className={`w-full h-full p-4 bg-white rounded-lg flex flex-col ${
        element.showBorder !== false ? "border border-gray-300" : ""
      }`}
    >
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {element.label}
        {element.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        disabled={!isPreview} // Corregir lógica: habilitar en preview
        placeholder={element.placeholder}
        maxLength={element.maxLength}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
      />
    </div>
  );
}

function TextAreaRenderer({
  element,
  isPreview,
}: {
  element: TextAreaElement;
  isPreview: boolean;
}) {
  return (
    <div
      className={`w-full h-full p-4 bg-white rounded-lg flex flex-col ${
        element.showBorder !== false ? "border border-gray-300" : ""
      }`}
    >
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {element.label}
        {element.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        disabled={!isPreview} // Corregir lógica: habilitar en preview
        placeholder={element.placeholder}
        maxLength={element.maxLength}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
      />
    </div>
  );
}

function SelectRenderer({
  element,
  isPreview,
}: {
  element: SelectElement;
  isPreview: boolean;
}) {
  return (
    <div
      className={`w-full h-full p-4 bg-white rounded-lg flex flex-col ${
        element.showBorder !== false ? "border border-gray-300" : ""
      }`}
    >
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {element.label}
        {element.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        disabled={!isPreview} // Corregir lógica: habilitar en preview
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
      >
        <option value="">{element.placeholder}</option>
        {element.options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ButtonRenderer({
  element,
  isPreview,
}: {
  element: ButtonElement;
  isPreview: boolean;
}) {
  const baseClasses =
    "w-full h-full rounded-lg font-medium transition-colors flex items-center justify-center";
  const variantClasses =
    element.variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300";

  return (
    <div className="w-full h-full p-2">
      <button
        disabled={!isPreview} // Habilitar en preview, deshabilitar en designer
        className={`${baseClasses} ${variantClasses} ${!isPreview ? "cursor-default" : "cursor-pointer"}`}
      >
        {element.text}
      </button>
    </div>
  );
}

function HeadingRenderer({
  element,
}: {
  element: HeadingElement;
  isPreview: boolean;
}) {
  const sizeClasses = {
    1: "text-4xl font-bold",
    2: "text-3xl font-bold",
    3: "text-2xl font-bold",
    4: "text-xl font-semibold",
    5: "text-lg font-semibold",
    6: "text-base font-semibold",
  };

  const renderHeading = () => {
    const className = `${sizeClasses[element.level]} text-gray-900`;
    switch (element.level) {
      case 1:
        return <h1 className={className}>{element.text}</h1>;
      case 2:
        return <h2 className={className}>{element.text}</h2>;
      case 3:
        return <h3 className={className}>{element.text}</h3>;
      case 4:
        return <h4 className={className}>{element.text}</h4>;
      case 5:
        return <h5 className={className}>{element.text}</h5>;
      case 6:
        return <h6 className={className}>{element.text}</h6>;
      default:
        return <h2 className={className}>{element.text}</h2>;
    }
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-2 ${
        element.showBorder !== false
          ? "border border-gray-300 rounded-lg bg-white"
          : ""
      }`}
    >
      {renderHeading()}
    </div>
  );
}

function TextRenderer({
  element,
}: {
  element: TextElement;
  isPreview: boolean;
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-2 ${
        element.showBorder !== false
          ? "border border-gray-300 rounded-lg bg-white"
          : ""
      }`}
    >
      <p className={`${sizeClasses[element.size]} text-gray-700 text-center`}>
        {element.text}
      </p>
    </div>
  );
}
