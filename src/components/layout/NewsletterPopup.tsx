"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  subscribeToNewsletter,
  type NewsletterPopupConfig,
  type NewsletterSignupResponse,
} from "@/lib/lettbestilt";

const STORAGE_PREFIX = "lb_newsletter_seen_";

function storageKey(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function isSeen(key: string, cookieDays: number): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < cookieDays * 86_400_000;
  } catch {
    return true;
  }
}

function markSeen(key: string) {
  try {
    localStorage.setItem(storageKey(key), String(Date.now()));
  } catch {
    // ignore
  }
}

function formatSuccess(template: string, code: string, discount: number) {
  return template
    .replaceAll("{{code}}", code)
    .replaceAll("{{discount}}", String(discount));
}

export function NewsletterPopup({
  restaurantKey,
  config,
}: {
  restaurantKey: string;
  config: NewsletterPopupConfig;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NewsletterSignupResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isSeen(restaurantKey, config.cookieDays)) return;
    const timer = setTimeout(() => setOpen(true), config.showAfterMs);
    return () => clearTimeout(timer);
  }, [restaurantKey, config.cookieDays, config.showAfterMs]);

  function close() {
    setOpen(false);
    markSeen(restaurantKey);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await subscribeToNewsletter({
        email: email.trim(),
        name: name.trim() || undefined,
      });
      setResult(data);
      markSeen(restaurantKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt. Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onClick={close}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Lukk"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {result ? (
          <div className="space-y-5 text-center">
            <h2 className="font-serif text-2xl text-foreground">Takk!</h2>
            <p className="text-sm text-muted-foreground">
              {formatSuccess(
                result.successMessage,
                result.couponCode,
                result.discountValue,
              )}
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="rounded-md bg-muted px-4 py-2 font-mono text-base font-semibold tracking-wider text-foreground">
                {result.couponCode}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {copied ? "Kopiert!" : "Kopier"}
              </button>
            </div>
            <button
              type="button"
              onClick={close}
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              Lukk
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h2
              id="newsletter-popup-title"
              className="font-serif text-2xl text-foreground"
            >
              {config.headline}
            </h2>
            <p className="text-sm text-muted-foreground">{config.body}</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-postadresse"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
            {config.requireName && (
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fullt navn"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            )}
            {error && (
              <p className="rounded-md border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Ved å melde deg på godtar du å motta markedsføring på e-post. Du kan
              melde deg av når som helst.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Sender…" : config.ctaLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
