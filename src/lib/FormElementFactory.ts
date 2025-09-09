import { FormElement, ElementType } from "@/types/form-elements";

/**
 * Factory para crear elementos simplificado
 * Principio OCP: Abierto para extensión, cerrado para modificación
 * Principio SRP: Una sola responsabilidad - creación de elementos
 */
export class FormElementFactory {
  private static createBaseElement(type: string) {
    return {
      id: `${type}-${Date.now()}`,
      label: `${type} element`,
      position: { x: 0, y: 0 }, // Ya no necesario pero mantenido por compatibilidad
      dimensions: { width: 400, height: 120 },
      showBorder: true,
      showShadow: false,
    };
  }

  static createElement(
    type: ElementType,
    existingElements: FormElement[]
  ): FormElement | null {
    const baseProps = this.createBaseElement(type);

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
          dimensions: { width: 500, height: 120 },
        };
      case "text-input":
        return {
          ...baseProps,
          type: "text-input",
          label: "Text Input",
          placeholder: "Enter text...",
          dimensions: { width: 400, height: 60 },
        };
      case "textarea":
        return {
          ...baseProps,
          type: "textarea",
          label: "Text Area",
          placeholder: "Enter your feedback...",
          rows: 4,
          dimensions: { width: 400, height: 150 },
        };
      case "select":
        return {
          ...baseProps,
          type: "select",
          label: "Select Option",
          options: ["Option 1", "Option 2", "Option 3"],
          placeholder: "Choose an option...",
          dimensions: { width: 400, height: 60 },
        };
      case "button":
        return {
          ...baseProps,
          type: "button",
          label: "Button",
          text: "Submit",
          variant: "primary",
          action: "submit",
          dimensions: { width: 200, height: 50 },
        };
      case "heading":
        return {
          ...baseProps,
          type: "heading",
          label: "Heading",
          text: "Survey Title",
          level: 2,
          dimensions: { width: 400, height: 80 },
        };
      case "text":
        return {
          ...baseProps,
          type: "text",
          label: "Text",
          text: "Add your text here",
          size: "md",
          dimensions: { width: 400, height: 60 },
        };
      default:
        return null;
    }
  }
}
