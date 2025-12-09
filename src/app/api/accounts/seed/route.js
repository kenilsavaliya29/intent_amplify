import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Account } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

const SEED_ACCOUNTS = [
  { name: "Acme Corp", domain: "acme.com", industry: "Manufacturing" },
  { name: "Globex Inc", domain: "globex.com", industry: "SaaS" },
  { name: "Initech", domain: "initech.io", industry: "Technology" },
  { name: "Umbrella Health", domain: "umbrellahealth.org", industry: "Healthcare" },
];

export async function POST(request) {
  try {
    await connectToDatabase();

    const { error } = await requireAuth(request);
    if (error) return error;

    const created = [];
    const skipped = [];

    for (const acc of SEED_ACCOUNTS) {
      const existing = await Account.findOne({ domain: acc.domain }).exec();
      if (existing) {
        skipped.push(acc.domain);
        continue;
      }
      const doc = await Account.create(acc);
      created.push(doc);
    }

    return NextResponse.json({
      created: created.map((acc) => ({
        id: acc._id.toString(),
        name: acc.name,
        domain: acc.domain,
        industry: acc.industry || null,
      })),
      skipped,
    });
  } catch (err) {
    console.error("POST /api/accounts/seed error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
