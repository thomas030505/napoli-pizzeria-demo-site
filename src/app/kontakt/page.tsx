import type { Metadata } from "next";
import { Mail, Phone, Building2 } from "lucide-react";
import Link from "next/link";
import { fetchMenu } from "@/lib/lettbestilt";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Kontakt — Napoli Pizzeria",
  description:
    "Kontakt Napoli Pizzeria — telefon, e-post og adresser til alle tre avdelinger i Vestfold.",
  alternates: { canonical: "/kontakt" },
};

export default async function ContactPage() {
  const data = await fetchMenu({ revalidate: 600 });
  const phone = data.restaurant.phone ?? "+47 33 00 00 00";
  const email = data.restaurant.email ?? "post@napolipizzeria.no";

  return (
    <>
      <section className="bg-[color:var(--color-pane)] border-b border-border py-16 sm:py-24">
        <div className="container-wide max-w-4xl">
          <p className="eyebrow mb-4">Contattaci</p>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight text-balance">
            Si <span className="display-italic">ciao</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
            Catering, bordreservasjon, samarbeid eller spørsmål om allergener — vi
            svarer som regel innen en arbeidsdag.
          </p>
        </div>
      </section>

      <section className="bg-[color:var(--color-paper)] py-20 sm:py-28">
        <div className="container-wide grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl sm:text-3xl mb-8">Kontaktinfo</h2>

            <ul className="space-y-7">
              <li className="flex items-start gap-4">
                <Phone className="h-5 w-5 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Telefon
                  </div>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-display text-xl hover:text-[color:var(--color-pomodoro)]">
                    {phone}
                  </a>
                  <div className="text-xs text-muted-foreground mt-1">Hver dag 10–22</div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Mail className="h-5 w-5 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    E-post
                  </div>
                  <a href={`mailto:${email}`} className="font-display text-xl hover:text-[color:var(--color-pomodoro)]">
                    {email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Building2 className="h-5 w-5 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Adresser
                  </div>
                  <ul className="space-y-3">
                    {data.restaurant.locations.map((loc) => (
                      <li key={loc.id}>
                        <div className="font-medium">{loc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {loc.address}, {loc.postalCode} {loc.city}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/lokasjoner"
                    className="mt-3 inline-block text-sm text-[color:var(--color-pomodoro)] hover:underline"
                  >
                    Se kart →
                  </Link>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-card border border-border rounded-sm p-8 sm:p-10">
              <h2 className="font-display text-2xl sm:text-3xl mb-2">Send oss en melding</h2>
              <p className="text-sm text-muted-foreground mb-7">
                Skjemaet åpner din e-postklient.
              </p>
              <form
                action={`mailto:${email}`}
                method="post"
                encType="text/plain"
                className="space-y-5"
              >
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Navn
                  </label>
                  <input
                    id="name"
                    name="navn"
                    required
                    className="w-full bg-[color:var(--color-pane)] border border-border rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-pomodoro)]/40"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    E-post
                  </label>
                  <input
                    id="email"
                    name="epost"
                    type="email"
                    required
                    className="w-full bg-[color:var(--color-pane)] border border-border rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-pomodoro)]/40"
                  />
                </div>
                <div>
                  <label htmlFor="msg" className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Melding
                  </label>
                  <textarea
                    id="msg"
                    name="melding"
                    rows={6}
                    required
                    className="w-full bg-[color:var(--color-pane)] border border-border rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-pomodoro)]/40 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-pomodoro)] hover:bg-[color:var(--color-pomodoro-dark)] text-[color:var(--color-pane)] px-8 py-3.5 text-sm font-medium transition-colors"
                >
                  Send melding
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
