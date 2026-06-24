import Link from 'next/link';

const links = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/promotions', label: 'Promotions' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">OP Supermarket</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Modern, responsive grocery storefronts with role-aware team access and performant commerce flows.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} OP Supermarket. Built for modern commerce.</p>
    </footer>
  );
}
