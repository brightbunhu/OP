import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata = {
  title: 'Contact | OP Supermarket',
  description: 'Contact OP Supermarket for support, partnership inquiries, and product questions.',
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Contact</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Get in touch</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Have questions about the storefront, roles, promotions, or product listings? Send us a message and we’ll reply as soon as possible.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_0.5fr]">
          <form className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" type="text" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Write your message here"
              />
            </div>
            <Button type="submit">Send message</Button>
          </form>

          <aside className="rounded-3xl border border-border bg-muted p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Support</p>
            <div className="mt-6 space-y-4 text-sm leading-7 text-foreground">
              <p>
                Email: <a href="mailto:support@opsupermarket.com" className="font-semibold text-primary hover:underline">support@opsupermarket.com</a>
              </p>
              <p>Phone: <span className="font-semibold">+1 (800) 555-0123</span></p>
              <p>Open hours: Mon–Fri, 9am–6pm</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
