import Link from "next/link";
import { Logo } from "@/components/Logo";
import { fetchMenu } from "@/lib/lettbestilt";
import { formatOpeningHoursTable } from "@/lib/opening-hours";

export async function Footer() {
  let hours: ReturnType<typeof formatOpeningHoursTable> = [];
  try {
    const data = await fetchMenu({ cache: "no-store" });
    hours = formatOpeningHoursTable(data.restaurant.openingHours);
  } catch {
    // Fail open
  }

  return (
    <footer className="mt-28 border-t border-border bg-[color:var(--color-forno)] text-[color:var(--color-pane)]">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo variant="light" />
          <p className="mt-6 text-sm text-stone-300/80 max-w-xs leading-relaxed">
            Vedfyrt napolitansk pizza siden 1987. Tre avdelinger i Vestfold —
            Tønsberg, Nøtterøy og Sandefjord.
          </p>
          <p className="mt-4 display-italic text-stone-300/60 text-base">
            &ldquo;La pizza è semplice.&rdquo;
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-olivolio)] mb-4 font-medium">
            Sider
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/meny" className="hover:text-[color:var(--color-olivolio)] transition-colors">Meny</Link></li>
            <li><Link href="/bestill" className="hover:text-[color:var(--color-olivolio)] transition-colors">Bestill</Link></li>
            <li><Link href="/om-oss" className="hover:text-[color:var(--color-olivolio)] transition-colors">Om oss</Link></li>
            <li><Link href="/lokasjoner" className="hover:text-[color:var(--color-olivolio)] transition-colors">Lokasjoner</Link></li>
            <li><Link href="/kontakt" className="hover:text-[color:var(--color-olivolio)] transition-colors">Kontakt</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-olivolio)] mb-4 font-medium">
            Tre avdelinger
          </h4>
          <ul className="space-y-3 text-sm text-stone-300/80">
            <li>
              <div className="font-medium text-[color:var(--color-pane)]">Tønsberg</div>
              <div>Nedre Langgate 22</div>
            </li>
            <li>
              <div className="font-medium text-[color:var(--color-pane)]">Nøtterøy</div>
              <div>Teie torg 5</div>
            </li>
            <li>
              <div className="font-medium text-[color:var(--color-pane)]">Sandefjord</div>
              <div>Jernbanealléen 14</div>
            </li>
            <li className="pt-2">
              <a href="tel:+4733000000" className="hover:text-[color:var(--color-olivolio)]">
                33 00 00 00
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-olivolio)] mb-4 font-medium">
            Åpningstider
          </h4>
          <ul className="space-y-1.5 text-sm text-stone-300/80">
            {hours.length > 0 ? (
              hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span className="tabular-nums">{h.label}</span>
                </li>
              ))
            ) : (
              <li>Hver dag 10–22</li>
            )}
            <li className="text-xs text-stone-300/60 pt-3">
              Nettbestillingen stenger kl. 21.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-700/40">
        <div className="container-wide flex flex-col sm:flex-row justify-between items-center gap-2 py-6 text-xs text-stone-300/70">
          <p>© {new Date().getFullYear()} Napoli Pizzeria AS</p>
          <p>
            Drevet av{" "}
            <a href="https://lettbestilt.no" className="hover:text-[color:var(--color-olivolio)]" target="_blank" rel="noreferrer">
              LettBestilt
            </a>
            {" · "}
            Utviklet av{" "}
            <a href="https://taceit.no" className="hover:text-[color:var(--color-olivolio)]" target="_blank" rel="noreferrer">
              Tace IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
