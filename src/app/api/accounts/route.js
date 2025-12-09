import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Account } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { error } = await requireAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const industry = searchParams.get("industry") || "";

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { domain: { $regex: q, $options: "i" } },
      ];
    }
    if (industry) {
      // exact industry match, case-insensitive
      filter.industry = { $regex: `^${industry}$`, $options: "i" };
    }

    const accounts = await Account.find(filter)
      .select("name domain industry intentScore")
      .exec();

    return NextResponse.json(accounts);
  } catch (err) {
    console.error("GET /api/accounts error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { name, domain, industry } = body || {};

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await Account.findOne({ domain }).exec();
    if (existing) {
      return NextResponse.json(
        { error: "Account with this domain already exists" },
        { status: 409 }
      );
    }

    const account = await Account.create({
      name,
      domain,
      industry: industry || null,
    });

    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error("POST /api/accounts error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


