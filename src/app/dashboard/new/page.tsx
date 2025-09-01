"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormDesignerWithSave } from "@/components/designer/FormDesignerWithSave";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSurveyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const handleSaveRequest = (data: any) => {
    // Store the form data and show name dialog
    setFormData(data);
    setShowNameDialog(true);
  };

  const handleFinalSave = async () => {
    if (!title.trim()) {
      alert("Please enter a survey title");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          elements: formData?.elements || [],
          settings: formData?.settings || {
            submitEndpoint: "",
            submitMethod: "POST",
            webhookHeaders: {},
            successMessage: "¡Gracias por tu feedback!",
            errorMessage: "Error al enviar. Por favor intenta de nuevo.",
          },
          style: formData?.style || {
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            primaryColor: "#3b82f6",
            borderRadius: 8,
            fontFamily: "Inter",
          },
          isActive: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create survey");
      }

      const survey = await response.json();
      router.push(`/dashboard/edit/${survey.id}`);
    } catch (error) {
      console.error("Error creating survey:", error);
      alert("Error creating survey. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sm:py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
              <div className="hidden sm:block h-6 border-l border-gray-300" />
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                  Create New Survey
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Design your NPS survey using the visual editor
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Draft
              </span>
            </div>
          </div>
        </div>

        {/* Form Designer */}
        <div className="flex-1 min-h-0">
          <FormDesignerWithSave
            onSave={handleSaveRequest}
            saveButtonText="Save Survey"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Name Dialog Modal */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md overflow-y-auto h-full w-full z-50 transition-all duration-300 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 w-full max-w-md sm:w-96 transform transition-all duration-300 scale-100">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Save Survey
              </h3>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Survey Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                    placeholder="Enter survey title..."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none text-sm sm:text-base"
                    rows={3}
                    placeholder="Enter survey description..."
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
                <button
                  onClick={() => setShowNameDialog(false)}
                  className="px-4 sm:px-6 py-2.5 bg-gray-100/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200 font-medium hover:scale-105 order-2 sm:order-1"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalSave}
                  disabled={isLoading || !title.trim()}
                  className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium hover:scale-105 shadow-lg hover:shadow-xl order-1 sm:order-2"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Survey"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
