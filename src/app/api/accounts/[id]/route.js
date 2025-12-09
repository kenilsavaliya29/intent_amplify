import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Account, Contact, Opportunity, IntentSignal } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request, { params }) {
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
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    const account = await Account.findById(id).exec();
    if (!account) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [contacts, opportunities, intentSignals] = await Promise.all([
      Contact.find({ accountId: id }).exec(),
      Opportunity.find({ accountId: id }).exec(),
      IntentSignal.find({ accountId: id })
        .sort({ occurredAt: -1 })
        .limit(10)
        .exec(),
    ]);

    return NextResponse.json({
      account,
      contacts,
      opportunities,
      intentSignals,
    });
  } catch (err) {
    console.error("GET /api/accounts/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


