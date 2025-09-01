import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/surveys - Lista todos los surveys del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const surveys = await db.survey.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/surveys - Crear nuevo survey
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, elements, settings, style } = await req.json();

    if (!title || !elements) {
      return NextResponse.json(
        { error: "Title and elements are required" },
        { status: 400 }
      );
    }

    const survey = await db.survey.create({
      data: {
        title,
        description,
        userId: session.user.id,
        elements,
        settings: settings || {},
        style: style || {},
        isActive: true,
        version: 1,
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    console.error("Error creating survey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
