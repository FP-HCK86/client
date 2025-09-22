// HoverButton.jsx
import React from "react";

export default function HoverButton({ href = "/features", children }) {
  return (
    <div className="relative inline-block group">
      {/* Layer atas – gradasi ungu pastel -> hijau pastel -> oren pastel */}
      <div className="absolute inset-0 rounded border border-black transition-transform duration-150 z-[2] bg-[#dff7e6]" />
      {/* Layer bawah – oren pastel bergeser saat hover */}
      <div className="absolute inset-0 rounded bg-[#ffd9b3] border border-black transition-transform duration-150 group-hover:translate-x-2 group-hover:translate-y-2 z-[1]" />
      {/* Tombol/link – bergerak berlawanan arah saat hover */}
      <a
        href={href}
        className="relative inline-flex items-center justify-center border border-black rounded
                   bg-[#e9d5ff] text-slate-900 no-underline transition-all duration-150 z-[3]
                   group-hover:-translate-x-2 group-hover:-translate-y-2
                   w-full lg:w-auto h-10 px-6 text-lg lg:h-12 lg:px-6 lg:text-lg"
      >
        {children}
      </a>
    </div>
  );
}
