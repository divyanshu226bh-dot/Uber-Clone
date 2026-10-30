import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft,
  LuHeadphones,
  LuMail,
  LuPhone,
  LuMapPin,
  LuCopy,
  LuCheck,
  LuChevronDown,
  LuCarFront,
  LuWallet,
  LuUserRound,
  LuShieldCheck,
  LuMessageCircle,
  LuArrowUpRight,
} from "react-icons/lu";

const supportDetails = {
  address: "42, Innovation Square, Sitapura, Jaipur, Rajasthan 302022",
  email: "support@ubercodiv.example",
  phone: "18001234567",
};

const faqGroups = [
  {
    category: "Rides & bookings",
    icon: LuCarFront,
    questions: [
      {
        question: "How do I receive ride requests?",
        answer:
          "When you're online and available, nearby ride requests can appear on your captain dashboard. Review the pickup location and ride details before accepting a request.",
      },
      {
        question: "What happens after I accept a ride?",
        answer:
          "Once you accept a ride, the rider's pickup and destination details become available. Navigate to the pickup location, confirm your arrival and follow the ride flow until the trip is completed.",
      },
      {
        question: "Can I cancel an accepted ride?",
        answer:
          "If you cannot complete an accepted ride, use the cancellation option available in your active ride screen. Avoid unnecessary cancellations and contact support if you face a technical issue.",
      },
      {
        question: "What should I do if the rider doesn't arrive?",
        answer:
          "Try contacting the rider using the available contact option. If the rider remains unavailable, follow the cancellation process supported by the app.",
      },
    ],
  },
  {
    category: "Earnings & payments",
    icon: LuWallet,
    questions: [
      {
        question: "Where can I check my earnings?",
        answer:
          "Open the Captain Earnings section to view your all-time earnings, today's earnings and completed ride counts.",
      },
      {
        question: "How are my earnings calculated?",
        answer:
          "Your current earnings summary is calculated from the fares recorded against your completed rides.",
      },
      {
        question: "When do I receive the ride payment?",
        answer:
          "For cash rides, the rider pays you directly after the trip is completed. Follow the payment method displayed in the ride details.",
      },
    ],
  },
  {
    category: "Account & profile",
    icon: LuUserRound,
    questions: [
      {
        question: "How can I update my profile?",
        answer:
          "Visit your Captain Profile page to edit your name and phone number. Your registered email address remains read-only.",
      },
      {
        question: "What if I cannot log in to my account?",
        answer:
          "Check your login credentials and try again. If the issue continues, contact the support team with a description of the problem.",
      },
    ],
  },
  {
    category: "Safety & support",
    icon: LuShieldCheck,
    questions: [
      {
        question: "What should I do if I face an unsafe situation?",
        answer:
          "Prioritize your safety and move to a safe public location if possible. Contact local emergency services if you are in immediate danger, and report the incident to support.",
      },
      {
        question: "How can I report a technical problem?",
        answer:
          "Contact support with your registered account details, a description of the issue and relevant ride information. Never share your password or authentication tokens.",
      },
    ],
  },
];

const CaptainHelp = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(supportDetails.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy support number:", error);
    }
  };

  const toggleQuestion = (id) => {
    setActiveQuestion((previous) => (previous === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#242020]">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-[#990011]/10 bg-[#FCF6F5]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/captain-home"
            className="group inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#716969] transition hover:text-[#990011]"
          >
            <LuArrowLeft
              size={18}
              className="transition group-hover:-translate-x-1"
            />
            Back to dashboard
          </Link>

          <span className="text-xl font-extrabold tracking-tight">
            UBER-Codiv<span className="text-[#990011]">.</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#990011] px-6 py-9 text-white shadow-[0_16px_40px_rgba(153,0,17,0.13)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[40px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-32 right-28 h-64 w-64 rounded-full bg-white/[0.05]" />

          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-white/90">
              <LuHeadphones size={15} />
              CAPTAIN SUPPORT
            </div>

            <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              We're here to help you keep moving.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              Whether it's a ride, your earnings or your account, find the
              information you need to keep moving.
            </p>

            <a
              href="#faqs"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#990011] transition hover:bg-[#F7E9E8]"
            >
              Explore FAQs
              <LuArrowUpRight size={17} />
            </a>
          </div>

          <div className="pointer-events-none absolute bottom-8 right-10 hidden items-center justify-center rounded-3xl border border-white/15 bg-white/10 p-7 text-white/90 md:flex lg:bottom-10 lg:right-16">
            <LuHeadphones size={76} strokeWidth={1.15} />
          </div>
        </section>

        {/* Contact section */}
        <section className="mt-12 sm:mt-16">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#990011]">
                Need assistance?
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Get in touch
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-[#827777]">
              Reach out to the UBER-Codiv support team through any of these channels.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Email */}
            <a
              href={`mailto:${supportDetails.email}`}
              className="group flex min-w-0 items-center gap-4 rounded-2xl border border-[#990011]/10 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#990011]/30 hover:shadow-[0_10px_25px_rgba(153,0,17,0.07)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011]/[0.08] text-[#990011] transition group-hover:bg-[#990011] group-hover:text-white">
                <LuMail size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Email support</p>
                <p className="mt-1 break-all text-xs leading-5 text-[#827777]">
                  {supportDetails.email}
                </p>
              </div>

              <LuArrowUpRight
                size={18}
                className="shrink-0 text-[#990011] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>

            {/* Phone */}
            <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#990011]/10 bg-white p-5 transition hover:border-[#990011]/30">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011]/[0.08] text-[#990011]">
                <LuPhone size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Support number</p>
                <p className="mt-1 break-all text-xs tracking-wide text-[#827777]">
                  {supportDetails.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy support number"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#990011]/[0.07] px-2.5 py-2 text-xs font-bold text-[#990011] transition hover:bg-[#990011]/[0.13]"
              >
                {copied ? <LuCheck size={15} /> : <LuCopy size={15} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Address */}
            <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#990011]/10 bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011]/[0.08] text-[#990011]">
                <LuMapPin size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold">Office address</p>
                <p className="mt-1 text-xs leading-5 text-[#827777]">
                  {supportDetails.address}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faqs" className="mt-14 scroll-mt-24 sm:mt-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#990011]">
              Help center
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#827777] sm:text-base">
              Quick answers to common questions from captains.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
            {faqGroups.map((group, groupIndex) => {
              const Icon = group.icon;

              return (
                <div
                  key={group.category}
                  className="overflow-hidden rounded-2xl border border-[#990011]/10 bg-white"
                >
                  <div className="flex items-center gap-3 border-b border-[#990011]/[0.08] bg-[#F9EFED] px-5 py-4 sm:px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#990011] text-white">
                      <Icon size={19} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#242020]">
                        {group.category}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#827777]">
                        {group.questions.length} common questions
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6">
                    {group.questions.map((item, questionIndex) => {
                      const id = `${groupIndex}-${questionIndex}`;
                      const isOpen = activeQuestion === id;

                      return (
                        <div
                          key={id}
                          className="border-b border-[#990011]/[0.08] last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggleQuestion(id)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:text-[#990011] sm:py-5"
                          >
                            <span className="text-sm font-semibold leading-6">
                              {item.question}
                            </span>

                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                                isOpen
                                  ? "bg-[#990011] text-white"
                                  : "bg-[#F9EFED] text-[#990011]"
                              }`}
                            >
                              <LuChevronDown
                                size={17}
                                className={`transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                          </button>

                          {isOpen && (
                            <div className="pb-5 pr-2 sm:pb-6">
                              <p className="border-l-2 border-[#990011] pl-4 text-sm leading-7 text-[#716969]">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom support CTA */}
        <section className="relative mt-14 overflow-hidden rounded-3xl bg-[#F1E2DF] px-6 py-8 sm:mt-16 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-[#990011]/[0.05]" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#990011] text-white">
                <LuHeadphones size={23} />
              </div>

              <div className="max-w-lg">
                <h3 className="text-lg font-bold sm:text-xl">
                  Still need a hand?
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#716969]">
                  Couldn't find the answer? Send us an email and explain the
                  issue. Our support team is here to assist you.
                </p>
              </div>
            </div>

            <a
              href={`mailto:${supportDetails.email}`}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#990011] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#7D0010] sm:w-auto"
            >
              <LuMessageCircle size={17} />
              Contact support
              <LuArrowUpRight size={16} />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#990011]/10 pt-6 text-center text-xs text-[#A19595]">
          © {new Date().getFullYear()} UBER-Codiv. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default CaptainHelp;
