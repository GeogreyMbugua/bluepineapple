const faqItems = [
  {
    question: "How do I reserve a seat?",
    answer: "Message us on WhatsApp with your preferred boarding point and date, and we'll confirm your reservation.",
  },
  {
    question: "Can I board at any stop?",
    answer: "Yes — the coastal service stops at nine boarding points between Mtwapa Beach and Fort Jesus.",
  },
  {
    question: "Is the fare fixed?",
    answer:
      "Fares scale with distance — from Ksh 500 for a single stop up to Ksh 3,000 for the full route — and are payable on board.",
  },
  {
    question: "Are discounts available?",
    answer:
      "Yes — couples, groups of 4 or more, and children aged 5–15 all qualify for reduced fares, and under 5s ride free.",
  },
];

export function Faq() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
          FAQ
        </p>
        <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          Trusted answers before you go.
        </h2>

        <div className="mt-8 grid gap-8 sm:mt-10 sm:grid-cols-2 sm:gap-10">
          {faqItems.map((item) => (
            <div key={item.question}>
              <p className="text-base font-semibold text-slate-950">{item.question}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
