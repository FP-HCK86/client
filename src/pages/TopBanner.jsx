import { useEffect, useMemo, useState } from "react";
import { X, Megaphone, ExternalLink } from "lucide-react";

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

const VARIANT_STYLES = {
  info: {
    wrap: "bg-sky-50 border-sky-200 text-sky-900",
    pill: "bg-sky-100 text-sky-800",
  },
  success: {
    wrap: "bg-emerald-50 border-emerald-200 text-emerald-900",
    pill: "bg-emerald-100 text-emerald-800",
  },
  warning: {
    wrap: "bg-amber-50 border-amber-200 text-amber-900",
    pill: "bg-amber-100 text-amber-900",
  },
  promo: {
    wrap: "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 text-indigo-900",
    pill: "bg-white/70 text-indigo-700",
  },
};

function useBannerStorage(key, ttlDays) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const { hiddenAt, ttl } = JSON.parse(raw);
      const expired = Date.now() - hiddenAt > ttl;
      if (!expired) setHidden(true);
      else localStorage.removeItem(key);
    } catch {}
  }, [key]);
  const hide = () => {
    setHidden(true);
    localStorage.setItem(
      key,
      JSON.stringify({
        hiddenAt: Date.now(),
        ttl: ttlDays * 24 * 60 * 60 * 1000,
      })
    );
  };
  return { hidden, hide };
}

export function TopBanner({
  id,
  variant = "info",
  message,
  cta,
  sticky = false,
  fixed = false,
  icon,
  ttlDays = 7,
}) {
  const storageKey = useMemo(() => `top_banner:${id}`, [id]);
  const { hidden, hide } = useBannerStorage(storageKey, ttlDays);

  if (hidden) return null;
  const v = VARIANT_STYLES[variant];
  const position = fixed
    ? "fixed top-0 left-0 right-0 z-50"
    : sticky
    ? "sticky top-0 z-50"
    : "";

  return (
    <div
      className={classNames(position, "w-full border-b") + " " + v.wrap}
      role="region"
      aria-label="Site announcement"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div className="flex items-center gap-3 py-2.5 text-sm">
          <span
            className={classNames(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              v.pill
            )}
          >
            {icon ?? <Megaphone className="h-3.5 w-3.5" aria-hidden />}
            Update
          </span>

          <div className="flex-1 leading-5">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>

          {cta && (
            <a
              href={cta.href}
              target={cta.external ? "_blank" : undefined}
              rel={cta.external ? "noreferrer noopener" : undefined}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow hover:opacity-90"
            >
              {cta.label}
              {cta.external && (
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              )}
            </a>
          )}

          <button
            onClick={hide}
            aria-label="Dismiss announcement"
            className="ml-1 inline-flex rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
