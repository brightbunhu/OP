'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Search, Bell, User, Menu, X } from 'lucide-react';
import { useCart } from '@/components/site/cart-provider';
import { logoutAction } from '@/app/actions/auth.actions';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/promotions', label: 'Promotions' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

export function Navbar({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useCart();

  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Main brand bar — Deep Blue */}
      <div className="bg-[#2563EB]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {/* Cart icon badge */}
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/25">
              <ShoppingCart className="h-6 w-6 text-white" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#22C55E] ring-2 ring-[#2563EB]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold tracking-tight text-[#22C55E]">OP</span>
                <span className="text-lg font-bold tracking-tight text-white">SUPERMARKET</span>
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/70 leading-none mt-0.5">
                On Point. Every Time.
              </p>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for products, categories, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-0 bg-white/95 pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-white/50 placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* Right actions (Desktop) */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E] text-[10px] font-bold text-white shadow-lg animate-in zoom-in duration-300">
                  {totalQuantity}
                </span>
              )}
            </Link>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white">
              <Bell className="h-5 w-5" />
            </button>
            {session ? (
              <>
                <Button asChild variant="ghost" className="h-10 px-3 text-white/80 hover:bg-white/10 hover:text-white">
                  <Link href="/account" className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm">Account</span>
                  </Link>
                </Button>
                <Button onClick={() => void logoutAction()} className="h-9 px-4 ml-1 bg-white/15 text-white text-sm hover:bg-white/25 border-0 backdrop-blur-sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="h-10 px-3 text-white/80 hover:bg-white/10 hover:text-white">
                  <Link href="/login" className="text-sm">Login</Link>
                </Button>
                <Button asChild className="h-9 px-5 ml-1 bg-[#22C55E] text-white text-sm hover:bg-[#16A34A] border-0 shadow-lg shadow-green-500/25">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E] text-[10px] font-bold text-white">
                  {totalQuantity}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Toggle site navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:text-white hover:bg-white/10"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation links bar — White */}
      <div className="hidden md:block border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center gap-0.5 px-4 py-0 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:text-[#2563EB] hover:bg-blue-50/50 group"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#2563EB] rounded-full transition-all duration-300 group-hover:w-3/4" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="border-b border-slate-200 bg-white px-4 pb-5 md:hidden animate-in slide-in-from-top-2 duration-200">
          {/* Mobile search */}
          <div className="relative mt-3 mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#2563EB]">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 px-1 pt-3 border-t border-slate-100">
            <Button asChild variant="ghost" className="w-full justify-start text-slate-700">
              <Link href="/cart" className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({totalQuantity})
              </Link>
            </Button>
            {session ? (
              <>
                <Button asChild variant="ghost" className="w-full justify-start text-slate-700">
                  <Link href="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                </Button>
                <Button onClick={() => void logoutAction()} className="w-full bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="w-full text-slate-700">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
