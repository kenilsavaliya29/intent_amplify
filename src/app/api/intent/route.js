import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Account, IntentSignal } from "@/lib/models";

export async function POST(request) {
  try {
    await connectToDatabase();

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    const { accountDomain, signalType, score, metadata, occurredAt } = body || {};

    if (!accountDomain || !signalType || score === undefined || !occurredAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let account = await Account.findOne({ domain: accountDomain }).exec();

    if (!account) {
      account = await Account.create({
        name: accountDomain,
        domain: accountDomain,
        industry: null,
      });
    }

    await IntentSignal.create({
      accountId: account._id,
      signalType,
      score,
      metadata: metadata || {},
      occurredAt: new Date(occurredAt),
    });

    const aggregate = await IntentSignal.aggregate([
      { $match: { accountId: account._id } },
      { $group: { _id: "$accountId", total: { $sum: "$score" } } },
    ]);

    const totalScore = aggregate[0]?.total || 0;
    account.intentScore = totalScore;
    await account.save();

    return NextResponse.json({
      ok: true,
      intentSaved: true,
      accountId: account._id.toString(),
      accountDomain: account.domain,
      intentScore: totalScore,
      message: `Intent signal saved. Total intentScore for ${account.domain}: ${totalScore}`,
    });
  } catch (err) {
    console.error("POST /api/intent error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


