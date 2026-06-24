import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/site/footer';
import { Navbar } from '@/components/site/navbar';
import { CartProvider } from '@/components/site/cart-provider';
import PwaProvider from '@/components/site/pwa-provider';
import AiAssistant from '@/components/site/ai-assistant';
import { auth } from '@/auth';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-figtree',
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'OP Supermarket',
  description: 'Modern supermarket platform with role-based commerce and customer storefront.',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'OP Supermarket',
    description: 'Modern supermarket platform with role-based commerce and customer storefront.',
    type: 'website',
    url: baseUrl,
  },
  icons: {
    icon: '/icons/icon.svg',
    shortcut: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  manifest: '/manifest.webmanifest',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" className={figtree.variable}>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <CartProvider session={session}>
          <PwaProvider>
            <Navbar session={session} />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <AiAssistant />
          </PwaProvider>
        </CartProvider>
      </body>
    </html>
  );
}

