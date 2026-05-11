import Image from "next/image";

const USPS = [
  {
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
    title: "Vedfyrt i 90 sekunder",
    body: "Steinovn fra Acunto i Napoli holder 485°C. Det er det som gir den karakteristiske svidde leoparding-flekken under bunnen.",
    caption: "Forno a legna",
  },
  {
    image: "https://images.unsplash.com/photo-1591985666643-1ecc67616216?auto=format&fit=crop&w=900&q=80",
    title: "72 timers heving",
    body: "Lang kald heving av Caputo 00-mel. Resultatet er en luftig, smaksrik bunn som er lett fordøyelig.",
    caption: "L&apos;impasto",
  },
  {
    image: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=900&q=80",
    title: "San Marzano DOP",
    body: "Tomater dyrket i den vulkanske jorda sør for Napoli. Søtere, mindre syrlige, mer balanserte enn alternativene.",
    caption: "I pomodori",
  },
];

export function USPStrip() {
  return (
    <section className="py-24 sm:py-32 bg-[color:var(--color-pane)]">
      <div className="container-wide">
        <div className="max-w-2xl mb-16">
          <p className="eyebrow mb-4">Håndverket</p>
          <h2 className="font-display text-3xl sm:text-5xl leading-tight text-balance">
            Tre ingredienser. <span className="display-italic">Fire tiår</span> med tålmodighet.
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {USPS.map((u) => (
            <article key={u.title} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6">
                <Image
                  src={u.image}
                  alt={u.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-forno)]/40 to-transparent" />
                <span className="absolute bottom-4 left-4 display-italic text-[color:var(--color-pane)] text-lg">
                  {u.caption}
                </span>
              </div>
              <h3 className="font-display text-2xl mb-2">{u.title}</h3>
              <p className="text-sm text-[color:var(--color-stone-700)] leading-relaxed max-w-sm">
                {u.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
