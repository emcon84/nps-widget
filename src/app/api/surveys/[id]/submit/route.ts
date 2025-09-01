import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const body = await request.json();

    // Validar que la encuesta existe y está activa
    const survey = await db.survey.findUnique({
      where: {
        id: surveyId,
        isActive: true,
      },
    });

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found or inactive" },
        { status: 404 }
      );
    }

    // Obtener información adicional de la request
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Guardar la respuesta en la base de datos
    const response = await db.response.create({
      data: {
        surveyId: surveyId,
        data: body.responses || {},
        userAgent: userAgent,
        pageUrl: referer,
        ipAddress: ip,
      },
    });

    // Configurar headers CORS
    const apiResponse = NextResponse.json({
      success: true,
      message: "Response saved successfully",
      responseId: response.id,
    });

    apiResponse.headers.set("Access-Control-Allow-Origin", "*");
    apiResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    apiResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return apiResponse;
  } catch (error) {
    console.error("Error saving survey response:", error);
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    );
  }
}

// Para manejar requests OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
