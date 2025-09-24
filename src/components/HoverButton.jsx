// HoverButton.jsx
import React from "react";

export default function HoverButton({
  href,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  fullWidth = false,
  children,
  ...rest
}) {
  // choose element: anchor when href provided, otherwise button
  const isAnchor = typeof href === "string" && href.length > 0;
  const Component = isAnchor ? "a" : "button";

  // build props for element and allow forwarding arbitrary props (aria-*, data-*, etc.)
  const elementProps = isAnchor
    ? { href: disabled ? undefined : href, ...rest }
    : { type, onClick, ...rest };

  // disabled behavior for non-anchor: pass disabled attribute
  if (!isAnchor && disabled) elementProps.disabled = true;

  const wantsFull = fullWidth || /(^|\s)w-full(\s|$)/.test(className);

  return (
    <div
      className={`relative group ${
        wantsFull ? "block w-full" : "inline-block"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Layer atas – hijau pastel (tokenized). We use a scale so the top layer
          remains slightly inset relative to the main button; controlled via
          --hb-top-scale (fallback 0.98) so it's dynamic with width. */}
      <div
        className="absolute inset-0 rounded border border-black transition-transform duration-150 z-[2] origin-center"
        style={{
          backgroundColor: "var(--hover-btn-green)",
          transform: "scale(var(--hb-top-scale, 0.98))",
        }}
      />
      {/* Layer bawah – oren pastel bergeser saat hover (tokenized) */}
      <div
        className="absolute inset-0 rounded border border-black transition-transform duration-150 group-hover:translate-x-2 group-hover:translate-y-2 z-[1]"
        style={{ backgroundColor: "var(--hover-btn-orange)" }}
      />

      <Component
        {...elementProps}
        className={`relative inline-flex items-center justify-center border border-black rounded text-slate-900 no-underline transition-all duration-150 z-[3] group-hover:-translate-x-2 group-hover:-translate-y-2 ${
          wantsFull ? "w-full" : "w-full lg:w-auto"
        } h-10 px-6 text-lg lg:h-12 lg:px-6 lg:text-lg ${className}`}
        style={{ backgroundColor: "var(--hover-btn-purple)" }}
        aria-disabled={disabled}
        onClick={isAnchor && disabled ? (e) => e.preventDefault() : onClick}
      >
        {/* content wrapper keeps children centered even when the button grows */}
        <span className="flex items-center justify-center w-full">{children}</span>
      </Component>
    </div>
  );
}
