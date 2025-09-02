"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: "info" | "success" | "error" | "warning";
  showCloseButton?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = "info",
  showCloseButton = true,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}: ModalProps) {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: (
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          bgColor: "bg-green-100",
        };
      case "error":
        return {
          icon: (
            <svg
              className="w-6 h-6 text-red-600"
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
          ),
          bgColor: "bg-red-100",
        };
      case "warning":
        return {
          icon: (
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ),
          bgColor: "bg-yellow-100",
        };
      default:
        return {
          icon: (
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          bgColor: "bg-blue-100",
        };
    }
  };

  const { icon, bgColor } = getIconAndColor();

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 scale-100 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div
              className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${bgColor} sm:mx-0 sm:h-10 sm:w-10`}
            >
              {icon}
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              {title && (
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {title}
                </h3>
              )}
              <div className="mt-2">
                <div className="text-sm text-gray-500">{children}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions con fondo translúcido */}
        <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-white/20">
          {onConfirm ? (
            <>
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 hover:scale-105 sm:ml-3 sm:w-auto"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-xl bg-white/80 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50/80 transition-all duration-200 hover:scale-105 sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                {cancelText}
              </button>
            </>
          ) : (
            showCloseButton && (
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 hover:scale-105 sm:w-auto"
                onClick={onClose}
              >
                {confirmText}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Hook para usar modales de forma más fácil
export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<ModalProps>>({});

  const showModal = (modalConfig: Partial<ModalProps>) => {
    setConfig(modalConfig);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
    setConfig({});
  };

  const ModalComponent = () => (
    <Modal {...config} isOpen={isOpen} onClose={hideModal}>
      {config.children || ""}
    </Modal>
  );

  return {
    showModal,
    hideModal,
    isOpen,
    ModalComponent,
  };
}
