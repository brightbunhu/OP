'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { categories, formatCurrency, promotions } from '@/lib/site';
import { MotionSection, MotionDiv, MotionArticle } from '@/components/site/motion-wrapper';
import { useCart } from '@/components/site/cart-provider';
import {
  ShoppingBag,
  Leaf,
  Lightbulb,
  Users,
  Sprout,
  Apple,
  Egg,
  UtensilsCrossed,
  Coffee,
  Fish,
  Baby,
  Home,
  Heart,
  ArrowRight,
  Star,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';

type ProductCard = {
  id: string;
  slug: string;
  name: string;
  category: { name: string } | null;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  imageUrl: string | null;
  taxRate: string;
  isFeatured: boolean;
};

const brandValues = [
  {
    icon: ShoppingBag,
    label: 'Quality Products',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Leaf,
    label: 'Fresh Everyday',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Lightbulb,
    label: 'Smart Solutions',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    label: 'Community Focused',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Sprout,
    label: 'Sustainable Future',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

const featuredCategories = [
  { icon: Apple, label: 'Fruit & Vegetables', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
  { icon: Egg, label: 'Dairy & Eggs', color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' },
  { icon: UtensilsCrossed, label: 'Pantry', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  { icon: Coffee, label: 'Beverages', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { icon: Fish, label: 'Meat & Seafood', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
  { icon: Baby, label: 'Baby Care', color: 'bg-pink-50 text-pink-600 hover:bg-pink-100' },
  { icon: Home, label: 'Household', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { icon: Heart, label: 'Personal Care', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
];

export default function HomePage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightedPromotion = promotions[0];

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch('/api/products?featured=true');
        const data = await response.json();
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (product: ProductCard) => {
    await addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      taxRate: product.taxRate,
    }, 1);
  };

  return (
    <div className="bg-[#F8FAFC]">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#15803D]">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-yellow-300/5 blur-2xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Leaf className="h-4 w-4" />
              AI-Powered. Fresh. Trusted.
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Smarter Shopping.
              <br />
              <span className="text-white/90">Fresher Living.</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/80 sm:text-xl max-w-2xl mx-auto">
              Discover premium products, smart recommendations, and fresh everyday essentials — all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild className="h-14 px-10 text-base bg-white text-[#16A34A] hover:bg-white/90 shadow-xl shadow-black/10 font-bold border-0">
                <Link href="/products" className="flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="h-14 px-10 text-base bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 font-semibold">
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </MotionDiv>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 30C1440 30 1200 0 720 0C240 0 0 30 0 30L0 60Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ==================== BRAND VALUES ==================== */}
      <MotionSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto max-w-7xl px-4 -mt-2 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {brandValues.map((value) => (
            <div
              key={value.label}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${value.color}`}>
                <value.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center">{value.label}</span>
            </div>
          ))}
        </div>
      </MotionSection>

      {/* ==================== FEATURED CATEGORIES ==================== */}
      <MotionSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">Shop by category</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Featured Categories</h2>
          </div>
          <Link href="/categories" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.label}
              href="/categories"
              className={`flex flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-slate-100 bg-white ${cat.color.split(' ').slice(0, 1).join(' ')} group`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${cat.color.split(' ').slice(0, 2).join(' ')} transition-transform duration-300 group-hover:scale-110`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </MotionSection>

      {/* ==================== CURRENT PROMOTIONS ==================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] p-8 sm:p-12 text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-white/5 translate-y-1/2" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                <TrendingUp className="h-3.5 w-3.5" />
                {highlightedPromotion.discountLabel}
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">{highlightedPromotion.title}</h2>
              <p className="text-white/80 max-w-lg text-sm leading-6">{highlightedPromotion.description}</p>
            </div>
            <Button asChild className="h-12 px-8 bg-white text-[#2563EB] hover:bg-white/90 font-bold border-0 shadow-lg shrink-0">
              <Link href="/promotions" className="flex items-center gap-2">
                Explore Deals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22C55E]">Featured products</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Browse our most popular items</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="h-52 bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-6 bg-slate-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="h-6 bg-slate-100 rounded animate-pulse w-20" />
                    <div className="h-9 bg-slate-100 rounded animate-pulse w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">No featured products available</div>
          ) : (
            products.map((product, i) => (
              <MotionArticle
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Product image */}
                <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-4xl transition-transform duration-500 group-hover:scale-110">
                      {product.category?.name === 'Fresh Produce' && '🥑'}
                      {product.category?.name === 'Bakery' && '🍞'}
                      {product.category?.name === 'Pantry Essentials' && '🥣'}
                      {product.category?.name === 'Wellness' && '🧃'}
                      {!product.category?.name && '📦'}
                    </div>
                  )}
                  {/* Sale badge */}
                  {product.compareAtPrice && (
                    <div className="absolute top-3 right-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                      Sale
                    </div>
                  )}
                  {/* Fresh badge */}
                  <div className="absolute top-3 left-3 rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-[10px] font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Fresh
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">{product.category?.name ?? 'Uncategorized'}</p>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">{product.name}</h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-500 line-clamp-2">{product.shortDescription || 'No description available.'}</p>
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-50">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-900">{formatCurrency(Number(product.price))}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-slate-400 line-through">{formatCurrency(Number(product.compareAtPrice))}</span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="h-9 px-4 text-xs bg-[#22C55E] text-white hover:bg-[#16A34A] border-0 shadow-sm font-bold"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </MotionArticle>
            ))
          )}
        </div>

        {/* Mobile "View All" link */}
        <div className="mt-8 text-center sm:hidden">
          <Button asChild className="h-12 px-8 bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0">
            <Link href="/products" className="flex items-center gap-2">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ==================== QUICK LINKS FOOTER SECTION ==================== */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/faq" className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#2563EB]/20">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-2">Support</p>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">Frequently Asked Questions</h3>
            <p className="mt-2 text-sm text-slate-500">Find answers to common questions about orders, delivery, and more.</p>
          </Link>
          <Link href="/about" className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#2563EB]/20">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-2">Our story</p>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">About Our Mission</h3>
            <p className="mt-2 text-sm text-slate-500">Learn how we're transforming the grocery experience with technology.</p>
          </Link>
          <Link href="/contact" className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#2563EB]/20">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-2">Get in touch</p>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">Contact Customer Support</h3>
            <p className="mt-2 text-sm text-slate-500">Our team is here to help with any questions or concerns.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
