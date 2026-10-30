
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft,
  LuWallet,
  LuTrendingUp,
  LuCarFront,
  LuCalendarDays,
  LuRefreshCw,
  LuClock,
  LuCircleCheck,
  LuArrowUpRight,
} from "react-icons/lu";
import api from "../services/Api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const CaptainEarnings = () => {
  const [earnings, setEarnings] = useState({
    allTime: 0,
    today: 0,
  });

  const [rides, setRides] = useState({
    completed: 0,
    today: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/captain-earnings");

      setEarnings(response.data.earnings);
      setRides(response.data.rides);
    } catch (err) {
      console.error("Fetch captain earnings error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your earnings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#242020]">
      {/* Navbar */}
      <header className="border-b border-[#990011]/10 bg-[#FCF6F5]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/captain-home"
            className="flex items-center gap-2 text-sm font-medium text-[#716969] transition hover:text-[#990011]"
          >
            <LuArrowLeft size={18} />
            Back
          </Link>

          <span className="text-xl font-extrabold tracking-tight">
            UBER-Codiv<span className="text-[#990011]">.</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        {/* Heading */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#990011]">
              Captain dashboard
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Your earnings
            </h1>

            <p className="mt-3 text-sm text-[#827777] sm:text-base">
              Keep track of what you've earned from your completed rides.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchEarnings}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#990011]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#990011] transition hover:bg-[#990011]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LuRefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </section>

        {/* Error state */}
        {error && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FCE9E9] px-5 py-4 text-sm text-[#990011]">
            <p>{error}</p>
            <button
              onClick={fetchEarnings}
              className="font-bold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Main earnings card */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-[#990011] p-6 text-white shadow-xl shadow-[#990011]/10 sm:p-9">
            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[38px] border-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-32 right-32 h-56 w-56 rounded-full border-[30px] border-white/[0.05]" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-sm font-medium text-white/75">
                <LuWallet size={18} />
                All-time earnings
              </div>

              <div className="mt-5">
                {loading ? (
                  <div className="h-12 w-56 animate-pulse rounded-lg bg-white/20" />
                ) : (
                  <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {formatCurrency(earnings.allTime)}
                  </h2>
                )}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/15 pt-5 text-xs text-white/75">
                <LuCircleCheck size={16} />
                Earnings from completed rides
              </div>
            </div>
          </div>
        </section>

        {/* Today's earnings */}
        <section className="mt-9">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#990011]">
              Daily summary
            </p>
            <h2 className="mt-2 text-xl font-bold">Today's performance</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#827777]">
                  Today's earnings
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#990011]/10 text-[#990011]">
                  <LuTrendingUp size={20} />
                </span>
              </div>

              {loading ? (
                <div className="mt-5 h-8 w-36 animate-pulse rounded bg-[#F3E9E7]" />
              ) : (
                <p className="mt-5 text-2xl font-bold">
                  {formatCurrency(earnings.today)}
                </p>
              )}

              <p className="mt-2 text-xs text-[#9A8F8F]">
                From rides completed today
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#827777]">
                  Today's completed rides
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#990011]/10 text-[#990011]">
                  <LuCarFront size={20} />
                </span>
              </div>

              {loading ? (
                <div className="mt-5 h-8 w-20 animate-pulse rounded bg-[#F3E9E7]" />
              ) : (
                <p className="mt-5 text-2xl font-bold">{rides.today}</p>
              )}

              <p className="mt-2 text-xs text-[#9A8F8F]">
                Completed rides since midnight
              </p>
            </div>
          </div>
        </section>

        {/* All-time completed rides */}
        <section className="mt-5">
          <div className="flex items-center justify-between rounded-2xl bg-[#F3E9E7] p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#990011]">
                <LuCalendarDays size={21} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Total completed rides
                </p>
                <p className="mt-1 text-xs text-[#827777]">
                  Across your entire account
                </p>
              </div>
            </div>

            <p className="text-2xl font-bold">
              {loading ? "—" : rides.completed}
            </p>
          </div>
        </section>

        {/* Information */}
        <section className="mt-9 flex items-start gap-3">
          <LuClock size={18} className="mt-0.5 shrink-0 text-[#990011]" />
          <p className="text-xs leading-6 text-[#827777]">
            Earnings are calculated using the fare recorded for each
            completed ride. Today's summary follows Indian Standard Time
            (IST).
          </p>
        </section>

        {/* Help link */}
        <section className="mt-10">
          <Link
            to="/captain-help"
            className="group flex items-center justify-between border-b border-[#990011]/15 py-5"
          >
            <div>
              <h3 className="text-sm font-bold transition group-hover:text-[#990011]">
                Need help with your earnings?
              </h3>
              <p className="mt-1 text-xs text-[#827777]">
                Contact our captain support team.
              </p>
            </div>

            <LuArrowUpRight
              size={20}
              className="text-[#990011] transition group-hover:translate-x-1"
            />
          </Link>
        </section>

        <footer className="pt-12 text-center text-xs text-[#A19595]">
          © {new Date().getFullYear()} UBER-Codiv. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default CaptainEarnings;
