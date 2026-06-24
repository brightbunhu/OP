export const metadata = {
  title: 'FAQ | OP Supermarket',
  description: 'Frequently asked questions about ordering, shipping, account access, and promotions.',
};

const faqItems = [
  {
    question: 'How do I place an order?',
    answer: 'Browse products, add items to your cart, and complete checkout through the product details or cart workflow.',
  },
  {
    question: 'Can I view promotions across categories?',
    answer: 'Yes. Visit the Promotions page to see current offers, bundle deals, and time-limited discounts.',
  },
  {
    question: 'What roles are supported in the platform?',
    answer: 'The platform supports customer access plus role-based workspaces for sales, managers, and administrators.',
  },
  {
    question: 'Is the site optimized for mobile?',
    answer: 'Absolutely. The storefront is built mobile-first with responsive layouts for all screen sizes.',
  },
];

export default function FAQPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">FAQ</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Frequently asked questions</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Answers to common questions about using the supermarket storefront and account workflows.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
