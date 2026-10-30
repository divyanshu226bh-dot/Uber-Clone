
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowDown,
  LuArrowLeft,
  LuArrowUpRight,
  LuCalendarDays,
  LuCarFront,
  LuCheck,
  LuClock3,
  LuCreditCard,
  LuMapPin,
  LuNavigation,
  LuRefreshCw,
  LuWallet,
} from "react-icons/lu";

import api from "../services/Api";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFare = (fare) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(fare || 0);
};

const statusStyles = {
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Accepted",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  arrived: {
    label: "Driver arrived",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
};

const UserActivity = () => {
  const [rides, setRides] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchRides = async (pageNumber, append = false) => {
    try {
      setError("");

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        `/auth/ride-history?page=${pageNumber}`
      );

      const { rides: newRides, pagination } = response.data;

      setRides((previousRides) =>
        append ? [...previousRides, ...newRides] : newRides
      );

      setPage(pagination.currentPage);
      setHasMore(pagination.hasMore);
    } catch (err) {
      console.error("Ride history error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your ride history. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRides(1);
  }, []);

  const handleViewMore = () => {
    if (!loadingMore && hasMore) {
      fetchRides(page + 1, true);
    }
  };

  const handleRetry = () => {
    if (rides.length === 0) {
      fetchRides(1);
    } else {
      fetchRides(page + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#171313]">

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#eadedd] bg-[#FCF6F5]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">

          <Link to="/home" className="flex shrink-0 items-center gap-3">
            <span className="text-3xl font-black tracking-[-2px]">
              Uber<span className="text-[#990011]">.</span>
            </span>

            <span className="hidden border-l border-gray-300 pl-3 text-xs font-extrabold tracking-wider text-gray-500 sm:block">
              RIDER
            </span>
          </Link>

          <div className="flex items-center gap-4 text-sm font-bold sm:gap-7">
            <Link
              to="/home"
              className="hidden transition hover:text-[#990011] sm:block"
            >
              Book a ride
            </Link>

            <Link
              to="/home"
              className="hidden transition hover:text-[#990011] md:block"
            >
              Ride options
            </Link>

            <Link
              to="/activity"
              className="border-b-2 border-[#990011] pb-1 text-[#990011]"
            >
              Activity
            </Link>
          </div>

          <Link
            to="/profile"
            aria-label="Your profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:border-[#990011] hover:text-[#990011]"
          >
            <LuNavigation size={19} />
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 sm:py-14">

        {/* Heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="mb-2 text-xs font-extrabold tracking-[2px] text-[#990011]">
              YOUR JOURNEY
            </p>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Activity<span className="text-[#990011]">.</span>
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-gray-500 sm:text-base">
              Every ride tells a story. View your previous trips and keep
              track of your journeys.
            </p>
          </div>

          <Link
            to="/home"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#eadedd] bg-white px-4 py-3 text-sm font-bold transition hover:border-[#990011] hover:text-[#990011]"
          >
            <LuArrowLeft size={17} />
            Book a ride
          </Link>
        </div>

        {/* Ride history */}
        <section className="overflow-hidden rounded-3xl border border-[#eadedd] bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b border-[#eee7e6] px-5 py-5 sm:flex-row sm:items-center sm:px-7">

            <div>
              <h2 className="text-xl font-extrabold">
                Your rides
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your recent ride history
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <LuCarFront size={18} className="text-[#990011]" />
              {rides.length} {rides.length === 1 ? "ride" : "rides"} loaded
            </div>
          </div>

          {/* Initial loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center px-5 py-20">
              <LuRefreshCw
                size={30}
                className="animate-spin text-[#990011]"
              />

              <p className="mt-4 text-sm font-semibold text-gray-500">
                Loading your journeys...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center px-5 py-16 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#990011]">
                <LuRefreshCw size={25} />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Something went wrong
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {error}
              </p>

              <button
                onClick={handleRetry}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#990011] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#7d0010]"
              >
                <LuRefreshCw size={16} />
                Try again
              </button>
            </div>
          )}

          {/* Empty history */}
          {!loading && !error && rides.length === 0 && (
            <div className="flex flex-col items-center px-5 py-20 text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FCF6F5] text-[#990011]">
                <LuCarFront size={38} />
              </div>

              <h3 className="mt-6 text-xl font-extrabold">
                No rides yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Looks like you haven't booked a ride yet. Your journey
                starts with your first trip!
              </p>

              <Link
                to="/home"
                className="mt-6 rounded-xl bg-[#990011] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#7d0010]"
              >
                Book your first ride
              </Link>
            </div>
          )}

          {/* Ride cards */}
          {!loading && rides.length > 0 && (
            <div className="divide-y divide-[#f0e9e8]">

              {rides.map((ride) => {
                const status =
                  statusStyles[ride.status] || statusStyles.pending;

                return (
                  <article
                    key={ride._id}
                    className="px-5 py-6 transition hover:bg-[#fffdfd] sm:px-7"
                  >

                    {/* Card top */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                      <div className="flex flex-wrap items-center gap-3">

                        <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <LuCalendarDays
                            size={17}
                            className="text-[#990011]"
                          />
                          {formatDate(ride.createdAt)}
                        </span>

                        <span className="flex items-center gap-2 text-sm text-gray-500">
                          <LuClock3 size={16} />
                          {formatTime(ride.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Route and fare */}
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

                      {/* Route */}
                      <div className="flex min-w-0 flex-1 gap-4">

                        <div className="flex shrink-0 flex-col items-center pt-1">
                          <span className="h-3 w-3 rounded-full border-[3px] border-[#990011] bg-white" />

                          <span className="my-1 h-10 border-l-2 border-dashed border-gray-300" />

                          <span className="h-3 w-3 rounded-sm bg-black" />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-5">

                          <div className="min-w-0">
                            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                              Pickup
                            </p>

                            <p className="break-words text-sm font-bold leading-5 text-gray-800">
                              {ride.pickup}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                              Destination
                            </p>

                            <p className="break-words text-sm font-bold leading-5 text-gray-800">
                              {ride.destination}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Fare and payment */}
                      <div className="flex shrink-0 items-center justify-between gap-5 rounded-2xl bg-[#FCF6F5] px-5 py-4 sm:min-w-[190px] sm:flex-col sm:items-end sm:justify-center">

                        <div className="sm:text-right">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                            Total fare
                          </p>

                          <p className="mt-1 text-2xl font-black tracking-tight">
                            {formatFare(ride.fare)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 sm:justify-end">
                          {ride.paymentMethod === "online" ? (
                            <LuCreditCard size={15} />
                          ) : (
                            <LuWallet size={15} />
                          )}

                          {ride.paymentMethod === "online"
                            ? "Online"
                            : "Cash"}
                        </div>
                      </div>
                    </div>

                    {/* Optional trip information */}
                    {(ride.distance || ride.duration) && (
                      <div className="mt-5 flex flex-wrap gap-5 border-t border-[#f0e9e8] pt-4">

                        {ride.distance && (
                          <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <LuNavigation size={15} className="text-[#990011]" />
                            {ride.distance} km
                          </span>
                        )}

                        {ride.duration && (
                          <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <LuClock3 size={15} className="text-[#990011]" />
                            {ride.duration} min
                          </span>
                        )}
                      </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}

          {/* View more */}
          {!loading && rides.length > 0 && hasMore && (
            <div className="border-t border-[#eee7e6] px-5 py-6 text-center">

              {error && (
                <p className="mb-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                onClick={handleViewMore}
                disabled={loadingMore}
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl border border-[#eadedd] bg-white px-6 py-3 text-sm font-extrabold transition hover:border-[#990011] hover:bg-[#FCF6F5] hover:text-[#990011] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <LuRefreshCw size={17} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    View More
                    <LuArrowDown size={17} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* All rides loaded */}
          {!loading && !error && rides.length > 0 && !hasMore && (
            <div className="border-t border-[#eee7e6] px-5 py-6 text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400">
                <LuCheck size={17} className="text-green-600" />
                You've reached the end of your ride history.
              </p>
            </div>
          )}

        </section>

        {/* Bottom note */}
        <p className="mt-7 text-center text-xs leading-5 text-gray-400">
          Thank you for riding with Uber.
          <br />
          Your journeys, all in one place.
        </p>

      </main>
    </div>
  );
};

export default UserActivity;
