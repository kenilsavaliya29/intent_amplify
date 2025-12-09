"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const STAGES = ["NEW", "PROPOSAL", "CLOSED_WON", "CLOSED_LOST"];

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountData, setAccountData] = useState(null);

  const [oppName, setOppName] = useState("");
  const [oppStage, setOppStage] = useState("NEW");
  const [oppAmount, setOppAmount] = useState("");
  const [opportunityError, setOpportunityError] = useState("");

  async function fetchAccount() {
    if (!accountId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/accounts/${accountId}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 404) {
        setError("Account not found");
        setAccountData(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load account");
      } else {
        setAccountData(data);
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  async function handleCreateOpportunity(e) {
    e.preventDefault();
    setOpportunityError("");
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          name: oppName,
          stage: oppStage,
          amount: Number(oppAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOpportunityError(data?.error || "Failed to create opportunity");
      } else {
        setOppName("");
        setOppStage("NEW");
        setOppAmount("");
        fetchAccount();
      }
    } catch (e) {
      setOpportunityError("Network error");
    }
  }

  async function handleStageChange(oppId, newStage) {
    try {
      const res = await fetch(`/api/opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) {
        // optional: read error body
        return;
      }
      fetchAccount();
    } catch {
      // ignore for now
    }
  }


  const account = accountData?.account;
  const contacts = accountData?.contacts || [];
  const opportunities = accountData?.opportunities || [];
  const intentSignals = accountData?.intentSignals || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/accounts")}
            className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer hover:underline"
          >
            ← Back to accounts
          </button>
          <span className="text-sm text-zinc-500">Account Detail</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-6 space-y-8">
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {loading && <p className="text-sm text-zinc-600">Loading...</p>}
        {!loading && account && (
          <>
            <section>
              <h1 className="text-xl font-semibold text-zinc-900 mb-1">
                {account.name}
              </h1>
              <p className="text-sm text-zinc-600">
                {account.domain} •{" "}
                {account.industry || "Industry not specified"}
              </p>
              <p className="mt-2 text-sm text-zinc-700">
                Intent Score:{" "}
                <span className="font-medium">
                  {account.intentScore ?? 0}
                </span>
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Contacts
                </h2>
                <div className="rounded-lg border border-zinc-200 bg-white">
                  {contacts.length === 0 ? (
                    <p className="p-3 text-sm text-zinc-600">
                      No contacts yet.
                    </p>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            Email
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            Title
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c) => (
                          <tr
                            key={c._id}
                            className="border-t border-zinc-100"
                          >
                            <td className="px-3 py-2">{c.name}</td>
                            <td className="px-3 py-2 text-zinc-700">
                              {c.email}
                            </td>
                            <td className="px-3 py-2 text-zinc-700">
                              {c.title}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Opportunities
                  </h2>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white">
                  {opportunities.length === 0 ? (
                    <p className="p-3 text-sm text-zinc-600">
                      No opportunities yet.
                    </p>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            Stage
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {opportunities.map((o) => (
                          <tr
                            key={o._id}
                            className="border-t border-zinc-100"
                          >
                            <td className="px-3 py-2 text-black">{o.name}</td>
                            <td className="px-3 py-2 text-black">
                              <select
                                value={o.stage}
                                onChange={(e) =>
                                  handleStageChange(o._id, e.target.value)
                                }
                                className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                              >
                                {STAGES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2 text-zinc-700">
                              ${o.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <form
                  onSubmit={handleCreateOpportunity}
                  className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <h3 className="text-sm font-medium text-zinc-900">
                    New Opportunity
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
                      value={oppName}
                      onChange={(e) => setOppName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Stage
                      </label>
                      <select
                        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
                        value={oppStage}
                        onChange={(e) => setOppStage(e.target.value)}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
                        value={oppAmount}
                        onChange={(e) => setOppAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {opportunityError && (
                    <p className="text-xs text-red-600">{opportunityError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-md bg-zinc-900 text-white py-2 text-sm font-medium hover:bg-zinc-800"
                  >
                    Create Opportunity
                  </button>
                </form>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-zinc-900 mb-3">
                Recent Intent Signals
              </h2>
              <div className="rounded-lg border border-zinc-200 bg-white">
                {intentSignals.length === 0 ? (
                  <p className="p-3 text-sm text-zinc-600">
                    No recent intent signals.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100 text-sm">
                    {intentSignals.map((s) => (
                      <li key={s._id} className="px-3 py-2 flex justify-between">
                        <div>
                          <p className="font-medium text-zinc-900">
                            {s.signalType}{" "}
                            <span className="text-xs text-zinc-500">
                              (score {s.score})
                            </span>
                          </p>
                          {s.metadata && (
                            <p className="text-xs text-zinc-600">
                              {JSON.stringify(s.metadata)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500">
                          {s.occurredAt
                            ? new Date(s.occurredAt).toLocaleString()
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}


