"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  async function loadAccounts(search) {
    setLoading(true);
    setError("");
    try {
      const params = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/accounts${params}`, {
        method: "GET",
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load accounts");
      } else {
        setAccounts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts("");
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadAccounts(query);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      
    }
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-semibold text-zinc-900 ">
              Accounts
            </h1>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer bg-gray-300 py-2 px-3 rounded-md  "
            >
              Dashboard
            </button>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-sm py-2 px-3 bg-red-500 rounded-md font-bold cursor-pointer hover:bg-red-600 text-white"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-6">
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search by name or domain"
            className="flex-1 text-black rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 cursor-pointer"
          >
            Search
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-600 mb-3" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-zinc-600">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-zinc-600">No accounts found.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">
                    Domain
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">
                    Industry
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">
                    Intent Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account._id}
                    className="border-t border-zinc-100 hover:bg-zinc-50"
                  >
                    <td className="px-4 py-2">
                      <Link
                        href={`/accounts/${account._id}`}
                        className="text-zinc-900 hover:underline"
                      >
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {account.domain}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {account.industry || "-"}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {account.intentScore ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Confirm Logout
            </h2>
            <p className="text-sm text-zinc-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-md hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


