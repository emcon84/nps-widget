"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  elements: any;
  settings: any;
  style: any;
  isActive: boolean;
}

export default function WidgetPage() {
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (response.ok) {
        const surveyData = await response.json();
        setSurvey(surveyData);
      }
    } catch (error) {
      console.error("Error fetching survey:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedRating === null) return;

    try {
      // TODO: Implement response submission API
      console.log("Submitting:", { rating: selectedRating, feedback });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey || !survey.isActive) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Survey not available
          </h2>
          <p className="text-gray-500">
            This survey is not currently active or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-green-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Gracias por tu feedback!
          </h2>
          <p className="text-gray-500">
            Tu opinión es muy importante para nosotros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-gray-600">{survey.description}</p>
          )}
        </div>

        {/* NPS Question */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            ¿Qué tan probable es que recomiendes nuestro producto o servicio?
          </h2>

          <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
            <span>Nada probable</span>
            <span>Muy probable</span>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedRating(num)}
                className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                  selectedRating === num
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Feedback */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Tienes algún comentario adicional? (Opcional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Comparte tus comentarios aquí..."
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedRating === null}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
