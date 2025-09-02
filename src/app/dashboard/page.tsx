"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Settings,
  BarChart3,
  LogOut,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useModal } from "@/components/ui/Modal";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    responses: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showModal, ModalComponent } = useModal();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchSurveys();
    }
  }, [status, router]);

  const fetchSurveys = async () => {
    try {
      const response = await fetch("/api/surveys");
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      } else {
        console.error("Failed to fetch surveys");
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/duplicate`, {
        method: "POST",
      });
      if (response.ok) {
        fetchSurveys(); // Refresh the list
      } else {
        showModal({
          type: "error",
          title: "Error",
          children: "Failed to duplicate survey. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error duplicating survey:", error);
      showModal({
        type: "error",
        title: "Error",
        children:
          "Error duplicating survey. Please check your connection and try again.",
      });
    }
  };

  const handleDelete = async (surveyId: string) => {
    showModal({
      type: "warning",
      title: "Confirm Delete",
      children:
        "Are you sure you want to delete this survey? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/surveys/${surveyId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            fetchSurveys(); // Refresh the list
            showModal({
              type: "success",
              title: "Success",
              children: "Survey deleted successfully.",
            });
          } else {
            showModal({
              type: "error",
              title: "Error",
              children: "Failed to delete survey. Please try again.",
            });
          }
        } catch (error) {
          console.error("Error deleting survey:", error);
          showModal({
            type: "error",
            title: "Error",
            children:
              "Error deleting survey. Please check your connection and try again.",
          });
        }
      },
      confirmText: "Delete",
      cancelText: "Cancel",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                NPS Widget Designer
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Welcome back,{" "}
                <span className="font-medium text-gray-900">
                  {session.user?.name}
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-4 text-sm text-gray-500 w-full sm:w-auto">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>{surveys.filter((s) => s.isActive).length} Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <span>{surveys.filter((s) => !s.isActive).length} Draft</span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow w-full sm:w-auto justify-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg bg-blue-100">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Surveys
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {surveys.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Active Surveys
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {surveys.filter((s) => s.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg bg-purple-100">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Responses
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {surveys.reduce(
                      (acc, survey) => acc + survey._count.responses,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/new"
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 sm:p-6 shadow-sm border border-blue-500/20 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center text-white">
                <div className="p-2 sm:p-3 rounded-lg bg-white/20">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-blue-100">
                    Quick Action
                  </p>
                  <p className="text-base sm:text-lg font-bold">
                    Create Survey
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Link
              href="/dashboard/new"
              className="group block p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-white/50 hover:border-blue-200 hover:scale-105"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Create New Survey
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Design a new NPS survey from scratch
                  </p>
                </div>
              </div>
            </Link>

            <div className="group block p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-white/50 hover:border-green-200 cursor-pointer hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    View your survey performance
                  </p>
                </div>
              </div>
            </div>

            <div className="group block p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-white/50 hover:border-purple-200 cursor-pointer hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage your account settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Surveys */}
          <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-xl border border-white/50">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Your Surveys
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and edit your NPS surveys
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {surveys.length} total
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {isLoading ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    Loading surveys...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please wait while we fetch your surveys
                  </p>
                </div>
              ) : surveys.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No surveys yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-sm mx-auto px-4">
                    Get started by creating your first NPS survey. It's quick
                    and easy!
                  </p>
                  <Link
                    href="/dashboard/new"
                    className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent shadow-sm text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Create Your First Survey
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {surveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="group bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-200"
                    >
                      {/* Survey Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {survey.title}
                          </h3>
                          {survey.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                              {survey.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center ml-3">
                          {survey.isActive ? (
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                              <span className="hidden sm:inline">Active</span>
                              <span className="sm:hidden">●</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></div>
                              <span className="hidden sm:inline">Draft</span>
                              <span className="sm:hidden">○</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Survey Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4 sm:mb-6 p-3 bg-gray-50/80 rounded-lg">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="font-medium">
                            {survey._count.responses}
                          </span>
                          <span className="ml-1 hidden sm:inline">
                            responses
                          </span>
                          <span className="ml-1 sm:hidden">resp.</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            v{survey.version}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                        <Link
                          href={`/dashboard/edit/${survey.id}`}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-blue-200 text-xs sm:text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                          Edit
                        </Link>

                        <Link
                          href={`/dashboard/results/${survey.id}`}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-purple-200 text-xs sm:text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all duration-200 hover:scale-105"
                        >
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                          Results
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleDuplicate(survey.id)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                        >
                          <Copy className="w-4 h-4 mr-1.5" />
                          Duplicate
                        </button>

                        <button
                          onClick={() => handleDelete(survey.id)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-200 hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Delete
                        </button>
                      </div>

                      {/* Created Date */}
                      <div className="mt-4 pt-4 border-t border-gray-200/60">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Created{" "}
                            {new Date(survey.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span>
                            Updated{" "}
                            {new Date(survey.updatedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Component */}
      <ModalComponent />
    </div>
  );
}
