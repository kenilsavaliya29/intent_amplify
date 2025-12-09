import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Opportunity } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();

    const { error } = await requireAuth(request);
    if (error) return error;

    let id = params?.id;
    
    // Fallback: extract from URL if params not available
    if (!id) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      id = pathParts[pathParts.length - 1];
    }

    if (!id) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    const { stage } = body || {};

    if (!stage) {
      return NextResponse.json(
        { error: "Stage field is required" },
        { status: 400 }
      );
    }

    const opportunity = await Opportunity.findById(id).exec();
    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    opportunity.stage = stage;
    await opportunity.save();

    return NextResponse.json(opportunity);
  } catch (err) {
    console.error("PATCH /api/opportunities/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


