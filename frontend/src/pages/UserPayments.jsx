import React from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft,
  LuWallet,
  LuBanknote,
  LuCheck,
  LuCreditCard,
  LuSmartphone,
  LuChevronRight,
  LuClock,
  LuShieldCheck,
} from "react-icons/lu";

const UserPayments = () => {
  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#242020]">
      {/* Navbar */}
      <header className="border-b border-[#990011]/10 bg-[#FCF6F5]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/home"
            className="flex items-center gap-2 text-sm font-medium text-[#716969] transition hover:text-[#990011]"
          >
            <LuArrowLeft size={18} />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight">
              Codiv<span className="text-[#990011]">.</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        {/* Heading */}
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#990011]">
            Account
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Payments
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-[#827777] sm:text-base">
            Manage how you pay for your rides. Simple, transparent, and
            hassle-free.
          </p>
        </section>

        {/* Main payment method */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">Your payment method</h2>
            <span className="text-xs text-[#827777]">Currently active</span>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[#990011] p-6 text-white shadow-xl shadow-[#990011]/10 sm:p-9">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[35px] border-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-28 right-28 h-48 w-48 rounded-full border-[25px] border-white/[0.06]" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <LuBanknote size={25} />
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                  <LuCheck size={14} />
                  Default
                </span>
              </div>

              <div className="mt-8">
                <p className="text-sm font-medium text-white/70">
                  Preferred payment
                </p>

                <h3 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                  Cash
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                  Pay your captain directly once your ride is completed. No
                  additional payment setup required.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-2 border-t border-white/15 pt-5 text-xs font-medium text-white/80">
                <LuShieldCheck size={16} />
                Simple and straightforward payments
              </div>
            </div>
          </div>
        </section>

        {/* Other payment methods */}
        <section className="mt-12">
          <div>
            <h2 className="text-base font-bold">Other ways to pay</h2>
            <p className="mt-1 text-sm text-[#827777]">
              Additional payment options are on their way.
            </p>
          </div>

          <div className="mt-5 divide-y divide-[#990011]/10">
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#990011]">
                  <LuSmartphone size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">UPI</h3>
                  <p className="mt-1 text-xs text-[#9A8F8F]">
                    Google Pay, PhonePe and more
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-xs font-medium text-[#9A8F8F]">
                Coming soon
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#990011]">
                  <LuCreditCard size={21} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Credit / Debit Card</h3>
                  <p className="mt-1 text-xs text-[#9A8F8F]">
                    Visa, Mastercard and more
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-xs font-medium text-[#9A8F8F]">
                Coming soon
              </span>
            </div>
          </div>
        </section>

        {/* Payment note */}
        <section className="mt-10 flex items-start gap-3 rounded-2xl bg-[#F3E9E7] p-4 sm:p-5">
          <LuClock className="mt-0.5 shrink-0 text-[#990011]" size={19} />

          <div>
            <h3 className="text-sm font-semibold">When do I pay?</h3>
            <p className="mt-1 text-xs leading-6 text-[#716969] sm:text-sm">
              For cash rides, you pay your captain directly after reaching your
              destination. Your ride fare is available in your ride details.
            </p>
          </div>
        </section>

        {/* Ride history */}
        <section className="mt-12">
          <Link
            to="/activity"
            className="group flex items-center justify-between gap-4 border-b border-[#990011]/15 py-5 transition"
          >
            <div>
              <h3 className="text-sm font-bold transition group-hover:text-[#990011]">
                Payment history
              </h3>
              <p className="mt-1 text-xs text-[#827777]">
                View your previous rides and their fares
              </p>
            </div>

            <LuChevronRight
              size={20}
              className="text-[#990011] transition group-hover:translate-x-1"
            />
          </Link>
        </section>

        {/* Footer */}
        <footer className="pt-12 text-center text-xs text-[#A19595]">
          © {new Date().getFullYear()} Codiv. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default UserPayments;
