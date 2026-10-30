
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft,
  LuChevronDown,
  LuChevronUp,
  LuCopy,
  LuCheck,
  LuMail,
  LuMapPin,
  LuPhone,
  LuMessageCircle,
  LuShieldCheck,
  LuCreditCard,
  LuCarFront,
  LuCircleHelp,
  LuHeadphones,
} from "react-icons/lu";

const supportDetails = {
  address: "42, Innovation Square, Sitapura, Jaipur, Rajasthan 302022",
  email: "support@ubercodiv.example",
  phone: "18001234567",
};

const faqs = [
  {
    category: "Rides",
    icon: LuCarFront,
    questions: [
      {
        question: "How can I book a ride?",
        answer:
          "Go to the home screen, enter your pickup location and destination, select your preferred ride option, and confirm your booking. You can track your ride once a captain accepts it.",
      },
      {
        question: "What happens if my captain doesn't arrive?",
        answer:
          "You can contact your captain using the call option available in your active ride. If the captain is unavailable or significantly delayed, you can cancel the ride and book another one.",
      },
      {
        question: "How can I cancel my ride?",
        answer:
          "Open your active ride details and select the cancel ride option. Follow the confirmation steps to complete the cancellation.",
      },
    ],
  },
  {
    category: "Payments",
    icon: LuCreditCard,
    questions: [
      {
        question: "Which payment methods are supported?",
        answer:
          "You can select from the payment methods displayed during booking. The available options depend on the payment functionality enabled in the app.",
      },
      {
        question: "Where can I see my previous ride payments?",
        answer:
          "Visit the Activity section from your account to review your previous rides, including their fare and payment information.",
      },
    ],
  },
  {
    category: "Account",
    icon: LuShieldCheck,
    questions: [
      {
        question: "How can I update my profile information?",
        answer:
          "Open your Profile page and select Edit Profile. You can update your name and phone number, then save your changes.",
      },
      {
        question: "What should I do if I cannot log in?",
        answer:
          "Check that your login credentials are correct and try again. If the problem continues, contact our support team using the details on this page.",
      },
    ],
  },
  {
    category: "Safety",
    icon: LuShieldCheck,
    questions: [
      {
        question: "What should I do if I feel unsafe during a ride?",
        answer:
          "If you feel unsafe, prioritize reaching a safe public place. Contact local emergency services if you are in immediate danger. You can also contact our support team to report the incident.",
      },
      {
        question: "How can I report a problem with a captain?",
        answer:
          "Contact our support team with your ride details and a description of the issue. Our team can review the report.",
      },
    ],
  },
];

const UserHelp = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(supportDetails.phone);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
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
      <header className="sticky top-0 z-30 border-b border-[#990011]/10 bg-[#FCF6F5]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/home"
            className="flex items-center gap-2 text-sm font-semibold text-[#990011] transition hover:opacity-75"
          >
            <LuArrowLeft size={19} />
            Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#990011] text-white">
              <LuHeadphones size={19} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              UBER-Codiv<span className="text-[#990011]">.</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#990011] px-6 py-10 text-white shadow-lg shadow-[#990011]/10 sm:px-10 sm:py-14">
          <div className="relative z-10 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-white/90">
              <LuMessageCircle size={14} />
              WE'RE HERE TO HELP
            </span>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              How can we help you today?
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Have a question or facing an issue with your ride? Find answers
              below or reach out to our support team.
            </p>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/[0.07] sm:-right-4 sm:h-80 sm:w-80" />
          <div className="pointer-events-none absolute -bottom-32 right-32 h-64 w-64 rounded-full border-[30px] border-white/[0.06]" />
        </section>

        {/* Contact heading */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#990011]">
              Get in touch
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Contact our support team
            </h2>
            <p className="mt-2 text-sm text-[#716969]">
              Choose a convenient way to reach us.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Email */}
            <a
              href={`mailto:${supportDetails.email}`}
              className="group rounded-2xl border border-[#990011]/10 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#990011]/30 hover:shadow-lg hover:shadow-[#990011]/5 sm:p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#990011]/10 text-[#990011]">
                <LuMail size={21} />
              </div>

              <h3 className="mt-5 font-bold">Email us</h3>
              <p className="mt-2 break-all text-sm text-[#990011]">
                {supportDetails.email}
              </p>
              <p className="mt-3 text-xs text-[#8B8181]">
                Send us your questions anytime.
              </p>
            </a>

            {/* Phone */}
            <div className="rounded-2xl border border-[#990011]/10 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#990011]/30 hover:shadow-lg hover:shadow-[#990011]/5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#990011]/10 text-[#990011]">
                <LuPhone size={21} />
              </div>

              <h3 className="mt-5 font-bold">Call us</h3>
              <p className="mt-2 text-sm font-semibold tracking-wide">
                {supportDetails.phone}
              </p>

              <button
                onClick={handleCopy}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#990011] transition hover:opacity-70"
              >
                {copied ? <LuCheck size={15} /> : <LuCopy size={15} />}
                {copied ? "Copied!" : "Copy number"}
              </button>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-[#990011]/10 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#990011]/30 hover:shadow-lg hover:shadow-[#990011]/5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#990011]/10 text-[#990011]">
                <LuMapPin size={21} />
              </div>

              <h3 className="mt-5 font-bold">Our office</h3>
              <p className="mt-2 text-sm leading-6 text-[#716969]">
                {supportDetails.address}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#990011]">
              Frequently asked questions
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Find your answers
            </h2>
            <p className="mt-2 text-sm text-[#716969]">
              Quick answers to some common questions about UBER-Codiv.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
            {/* FAQ categories */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-[#990011]/10 bg-white p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#8B8181]">
                  Browse topics
                </p>

                <div className="space-y-4">
                  {faqs.map((group) => {
                    const Icon = group.icon;

                    return (
                      <div
                        key={group.category}
                        className="flex items-center gap-3 text-sm font-medium text-[#514949]"
                      >
                        <Icon size={17} className="text-[#990011]" />
                        {group.category}
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Questions */}
            <div className="space-y-6">
              {faqs.map((group, groupIndex) => {
                const Icon = group.icon;

                return (
                  <div
                    key={group.category}
                    className="overflow-hidden rounded-2xl border border-[#990011]/10 bg-white"
                  >
                    <div className="flex items-center gap-3 border-b border-[#990011]/10 px-5 py-4 sm:px-6">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#990011]/10 text-[#990011]">
                        <Icon size={18} />
                      </div>
                      <h3 className="font-bold">{group.category}</h3>
                    </div>

                    <div className="divide-y divide-[#990011]/10">
                      {group.questions.map((item, questionIndex) => {
                        const id = `${groupIndex}-${questionIndex}`;
                        const isOpen = activeQuestion === id;

                        return (
                          <div key={id}>
                            <button
                              type="button"
                              onClick={() => toggleQuestion(id)}
                              aria-expanded={isOpen}
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#FCF6F5] sm:px-6"
                            >
                              <span className="text-sm font-semibold leading-6 sm:text-base">
                                {item.question}
                              </span>

                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#990011]/10 text-[#990011]">
                                {isOpen ? (
                                  <LuChevronUp size={18} />
                                ) : (
                                  <LuChevronDown size={18} />
                                )}
                              </span>
                            </button>

                            {isOpen && (
                              <div className="px-5 pb-5 sm:px-6">
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
          </div>
        </section>

        {/* Bottom support banner */}
        <section className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#990011]/10 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#990011]/10 text-[#990011]">
              <LuCircleHelp size={23} />
            </div>

            <div>
              <h3 className="text-lg font-bold">Still need assistance?</h3>
              <p className="mt-1 text-sm leading-6 text-[#716969]">
                Can't find what you're looking for? Our support team is here
                to help.
              </p>
            </div>
          </div>

          <a
            href={`mailto:${supportDetails.email}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#990011] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7D0010] sm:w-auto"
          >
            <LuMail size={17} />
            Contact support
          </a>
        </section>

        {/* Footer */}
        <footer className="pb-4 pt-10 text-center text-xs text-[#8B8181]">
          © {new Date().getFullYear()} UBER-Codiv. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default UserHelp;
