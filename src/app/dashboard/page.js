"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/dashboard");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error || "Failed to load dashboard data");
        } else {
          setData(json);
        }
      } catch (e) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-zinc-900 ">Dashboard</h1>
          <button
            onClick={() => router.push("/accounts")}
            className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer px-4 py-2 bg-gray-200 rounded-md"
          >
            Accounts
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-6">
        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {loading || !data ? (
          <p className="text-sm text-zinc-600">Loading dashboard...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Total Accounts
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {data.totalAccounts}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Total Opportunities
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {data.totalOpportunities}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Closed Won Amount
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                ${data.totalClosedWonAmount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Total Intent Signals
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {data.totalIntentSignals}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


