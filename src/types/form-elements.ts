export interface BaseFormElement {
  id: string;
  type: ElementType;
  label: string;
  required?: boolean;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  showBorder?: boolean; // Nueva propiedad para controlar los borders
  showShadow?: boolean; // Nueva propiedad para controlar las sombras
}

export interface NPSElement extends BaseFormElement {
  type: "nps";
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
  displayType: "numbers" | "emojis";
}

export interface TextInputElement extends BaseFormElement {
  type: "text-input";
  placeholder?: string;
  maxLength?: number;
}

export interface TextAreaElement extends BaseFormElement {
  type: "textarea";
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export interface SelectElement extends BaseFormElement {
  type: "select";
  options: string[];
  placeholder?: string;
}

export interface ButtonElement extends BaseFormElement {
  type: "button";
  text: string;
  variant: "primary" | "secondary";
  action: "submit" | "reset" | "custom";
}

export interface HeadingElement extends BaseFormElement {
  type: "heading";
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface TextElement extends BaseFormElement {
  type: "text";
  text: string;
  size: "sm" | "md" | "lg";
}

export type ElementType =
  | "nps"
  | "text-input"
  | "textarea"
  | "select"
  | "button"
  | "heading"
  | "text";

export type FormElement =
  | NPSElement
  | TextInputElement
  | TextAreaElement
  | SelectElement
  | ButtonElement
  | HeadingElement
  | TextElement;

export interface ElementTemplate {
  type: ElementType;
  label: string;
  icon: string;
  defaultProps: Partial<FormElement>;
}

export interface FormDesign {
  id: string;
  name: string;
  elements: FormElement[];
  settings: {
    backgroundColor?: string;
    textColor?: string;
    primaryColor?: string;
    fontFamily?: string;
    maxWidth?: string;
    submitEndpoint?: string;
    submitMethod?: "POST" | "PUT" | "PATCH";
    webhookHeaders?: Record<string, string>;
    successMessage?: string;
    errorMessage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
