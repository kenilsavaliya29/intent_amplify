import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Opportunity, Account } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { error } = await requireAuth(request);
    if (error) return error;

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }
    const { accountId, name, stage, amount } = body || {};

    if (!accountId || !name || !stage || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const account = await Account.findById(accountId).exec();
    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const opportunity = await Opportunity.create({
      accountId,
      name,
      stage,
      amount,
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (err) {
    console.error("POST /api/opportunities error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


