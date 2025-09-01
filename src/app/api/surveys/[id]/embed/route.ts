import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;

    // Buscar la encuesta en la base de datos
    const survey = await db.survey.findUnique({
      where: {
        id: surveyId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        elements: true,
        settings: true,
        style: true,
        version: true,
        updatedAt: true,
      },
    });

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found or inactive" },
        { status: 404 }
      );
    }

    // Configurar headers CORS para permitir embebido en otros sitios
    const response = NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        elements: survey.elements,
        settings: survey.settings,
        style: survey.style,
        version: survey.version,
        lastUpdated: survey.updatedAt.toISOString(),
      },
    });

    // Headers CORS
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set(
      "ETag",
      `"${survey.version}-${survey.updatedAt.getTime()}"`
    );
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("Error fetching survey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
