import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Account, Opportunity, IntentSignal } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { error } = await requireAuth(request);
    if (error) return error;

    const [totalAccounts, totalOpportunities, closedWonAgg, totalIntentSignals] =
      await Promise.all([
        Account.countDocuments().exec(),
        Opportunity.countDocuments().exec(),
        Opportunity.aggregate([
          { $match: { stage: "CLOSED_WON" } },
          { $group: { _id: null, sum: { $sum: "$amount" } } },
        ]),
        IntentSignal.countDocuments().exec(),
      ]);

    const totalClosedWonAmount = closedWonAgg[0]?.sum || 0;

    return NextResponse.json({
      totalAccounts,
      totalOpportunities,
      totalClosedWonAmount,
      totalIntentSignals,
    });
  } catch (err) {
    console.error("GET /api/dashboard error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


