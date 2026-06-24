export type Category = {
  slug: string;
  name: string;
  description: string;
  imageAlt: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  featured: boolean;
  imageAlt: string;
};

export type Promotion = {
  title: string;
  description: string;
  discountLabel: string;
  validUntil: string;
};

export const categories: Category[] = [
  {
    slug: 'fresh-produce',
    name: 'Fresh Produce',
    description: 'Seasonal fruits and vegetables harvested for peak flavor and freshness.',
    imageAlt: 'Fresh produce assortment',
  },
  {
    slug: 'bakery',
    name: 'Bakery',
    description: 'Artisan breads, pastries, and baked goods made for daily enjoyment.',
    imageAlt: 'Bakery selection',
  },
  {
    slug: 'pantry',
    name: 'Pantry Essentials',
    description: 'Everyday grocery staples to stock your pantry with convenience and quality.',
    imageAlt: 'Pantry staples',
  },
  {
    slug: 'wellness',
    name: 'Wellness',
    description: 'Healthy, clean-label options for body and lifestyle support.',
    imageAlt: 'Wellness products',
  },
];

export const products: Product[] = [
  {
    slug: 'organic-avocados',
    name: 'Organic Avocados',
    category: 'Fresh Produce',
    shortDescription: 'Creamy avocados perfect for toast, salads, and smoothies.',
    description: 'Ripe, organic avocados sourced from sustainable farms. Ideal for daily meals and healthy snacking.',
    price: 2.49,
    compareAtPrice: 3.49,
    featured: true,
    imageAlt: 'Organic avocado on a cutting board',
  },
  {
    slug: 'artisan-sourdough',
    name: 'Artisan Sourdough',
    category: 'Bakery',
    shortDescription: 'Handcrafted sourdough loaf with a crisp crust and soft interior.',
    description: 'Baked fresh every morning using traditional fermentation and premium flour.',
    price: 5.95,
    featured: true,
    imageAlt: 'Artisan sourdough bread',
  },
  {
    slug: 'maple-granola',
    name: 'Maple Granola',
    category: 'Pantry Essentials',
    shortDescription: 'Crunchy granola with maple, oats, and toasted nuts.',
    description: 'Perfect for breakfast bowls, yogurt toppings, or healthy snacks on the go.',
    price: 8.75,
    featured: true,
    imageAlt: 'Maple granola in bowl',
  },
  {
    slug: 'cold-pressed-juice',
    name: 'Cold-Pressed Juice',
    category: 'Wellness',
    shortDescription: 'Bright citrus juice pressed from ripe fruits for maximum nutrients.',
    description: 'A refreshing wellness boost with no added sugar, cold pressed for freshness.',
    price: 4.95,
    featured: false,
    imageAlt: 'Cold pressed juice bottles',
  },
  {
    slug: 'farmhouse-eggs',
    name: 'Farmhouse Eggs',
    category: 'Fresh Produce',
    shortDescription: 'Free-range eggs with rich yolks and dependable quality.',
    description: 'Perfect for baking, breakfast, and healthy cooking with farm fresh flavor.',
    price: 3.99,
    featured: false,
    imageAlt: 'Farmhouse eggs carton',
  },
];

export const promotions: Promotion[] = [
  {
    title: 'Weekend Fresh Sale',
    description: 'Save on premium produce and curated grocery bundles through Sunday night.',
    discountLabel: 'Up to 25% off',
    validUntil: 'Ends Sunday',
  },
  {
    title: 'Bakery Bundle Deal',
    description: 'Mix and match bakery favorites and get an extra pastry for free.',
    discountLabel: 'Buy 2, get 1',
    validUntil: 'Limited time offer',
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
