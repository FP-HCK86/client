import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import HoverButton from "@/components/ui/HoverButton";
import { StickyScroll } from "../components/ui/sticky-scroll-reveal";
import { WobbleCard } from "../components/ui/wobble-card";
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";
import creativeDesign from "../assets/creative-design.svg";
import education from "../assets/education.svg";
import empowerment from "../assets/empowerment.svg";
import gitaris from "../assets/gitaris.svg";
import llifestyle1 from "../assets/llifestyle-1.svg";
import singing from "../assets/singing.svg";
import travel from "../assets/travel.svg";
import workEmployee from "../assets/work-employee.svg";
import photograpy from "../assets/photograpy.svg";
import selfie from "../assets/selfie.svg";
import { Check, Sparkles, Star, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

const content = [
  {
    title: "Canvas Storyboard",
    description:
      "Planoria helps you transform scattered ideas into a clear visual storyboard. Instead of juggling messy notes or random drafts, you can map out campaigns in a structured, visual flow that makes your content strategy easy to understand and execute.",
    descriptionNode: (
      <p className="text-balance leading-relaxed">
        Planoria helps you transform scattered ideas into a clear{" "}
        <mark className="bg-[#e9d5ff] text-black px-1 rounded">
          visual storyboard
        </mark>
        . Instead of juggling messy notes or random drafts, you can map out
        campaigns in a structured, visual flow that makes your content strategy
        easy to understand and execute.
      </p>
    ),
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <img
          src="/src/assets/storyboard.png"
          width={200}
          height={200}
          className="h-full w-full object-contain"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "AI Assistance",
    description:
      "No more second-guessing captions or hashtags. With built-in AI support, Planoria can generate engaging captions, optimize hashtags for reach, suggest hooks that capture attention, and even review your videos to provide actionable insights.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <img
          src="/src/assets/ai.png"
          width={200}
          height={200}
          className="h-full w-full object-contain"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Scheduling",
    description:
      "Say goodbye to chaotic calendars. With Planoria’s scheduling feature, you can neatly organize your content pipeline, set clear publishing dates, and keep your workflow predictable and stress-free.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <img
          src="/src/assets/scheduling.png"
          width={200}
          height={150}
          className="h-full w-full object-contain"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Autopost",
    description:
      "Once your content is ready, Planoria ensures it reaches the right platforms at the right time — automatically. No manual uploads, no last-minute rush. Just consistent posting across channels without extra effort.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <img
          src="/src/assets/autopost.png"
          width={200}
          height={200}
          className="h-full w-full object-contain"
          alt="linear board demo"
        />
      </div>
    ),
  },
];

export function Features() {
  return (
    <>
      <section className="mb-20 bg-planoria pt-1">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-center mt-16 mb-8 text-slate-900">
          Our Features
        </h1>
        <div className="w-full">
          <StickyScroll content={content} />
        </div>
      </section>
    </>
  );
}

export function HowItWorks() {
  return (
    <section className="mb-20 py-10 bg-planoria">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-center mt-16 mb-8 text-slate-900">
        How it Works
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full mt-12 mb-20">
        <WobbleCard
          containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
          className=""
        >
          <div className="max-w-xs">
            <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              1. From Ideas to Storyboards
            </h2>
            <p className="mt-4 text-left  text-base/6 text-neutral-200">
              Start with scattered thoughts, raw notes, or audience personas.
              Planoria helps you capture them all and instantly shape them into
              clear, visual storyboards that map the flow of your campaign.
            </p>
          </div>
          <img
            src="/src/assets/storyboard.jpg"
            width={350}
            height={350}
            alt="linear demo image"
            className="absolute -right-4 md:-right-8 lg:-right-12 xl:-right-16 grayscale filter -bottom-10 object-contain rounded-2xl"
          />
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 min-h-[300px]">
          <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            2. Optimize with AI
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
            Before you publish, AI reviews your content — suggesting captions,
            hashtags, and hooks, and even giving feedback on videos. It makes
            sure every piece of content is polished and ready to perform.
          </p>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
          <div className="max-w-sm">
            <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              3. Schedule & Autopost
            </h2>
            <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
              Once everything is set, organize your content on a smart calendar
              and let autoposting deliver it across platforms consistently — so
              you never miss the perfect moment.
            </p>
          </div>
          <img
            src="/src/assets/schedule.jpg"
            width={300}
            height={300}
            alt="linear demo image"
            className="absolute -right-4 md:-right-8 lg:-right-12 xl:-right-16 -bottom-10 grayscale filter object-contain rounded-2xl"
          />
        </WobbleCard>
      </div>
    </section>
  );
}

// Helper: currency formatting
const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

const TIERS = [
  {
    id: "free",
    name: "Free",
    icon: Sparkles,
    tagline: "Mulai tanpa biaya",
    monthly: 0,
    yearly: 0,
    highlight: false,
    cta: "Coba Gratis",
    features: [
      "Akses dasar",
      "Kuota 3 proyek",
      "Update mingguan via email",
      "Dukungan komunitas",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Star,
    tagline: "Fitur lebih untuk tim kecil",
    monthly: 12,
    yearly: 108, // 25% off (12*12=144 -> 108)
    highlight: true,
    badge: "Paling Populer",
    cta: "Pilih Premium",
    features: [
      "Semua di Free",
      "Tanpa batas proyek",
      "Integrasi & otomasi",
      "Analytics dasar",
      "Email support 24/5",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    tagline: "Skala profesional & bisnis",
    monthly: 29,
    yearly: 264, // 24% off (29*12=348 -> 264)
    highlight: false,
    cta: "Naik ke Pro",
    features: [
      "Semua di Premium",
      "SLA & prioritas dukungan",
      "Advanced analytics",
      "SSO / SAML",
      "Akses beta & peta jalan",
    ],
  },
];

function PricingTiers() {
  const [annual, setAnnual] = useState(true);

  const tiers = useMemo(
    () =>
      TIERS.map((t) => ({
        ...t,
        price: annual ? t.yearly : t.monthly,
        suffix: annual ? "/thn" : "/bln",
      })),
    [annual]
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white py-14 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900"
          >
            Paket Harga Sederhana
          </motion.h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Pilih tier sesuai kebutuhanmu — bisa mulai gratis dan upgrade kapan
            saja.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2">
            <span
              className={`text-sm ${
                annual ? "text-slate-500" : "text-slate-900 font-medium"
              }`}
            >
              Bulanan
            </span>
            <Switch
              aria-label="Toggle penagihan tahunan"
              checked={annual}
              onCheckedChange={setAnnual}
            />
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  annual ? "text-slate-900 font-medium" : "text-slate-500"
                }`}
              >
                Tahunan
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Hemat hingga 25%
              </span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
            >
              <Card
                className={`relative h-full border-slate-200 ${
                  tier.highlight ? "ring-2 ring-amber-400" : ""
                } rounded-2xl shadow-sm`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-xs px-3 py-1 shadow">
                      <Star className="w-3.5 h-3.5" /> {tier.badge}
                    </span>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <tier.icon className="w-5 h-5 text-slate-500" />
                      <CardTitle className="text-xl font-semibold">
                        {tier.name}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{tier.tagline}</p>

                  {/* Price */}
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {tier.price === 0 ? "Gratis" : formatPrice(tier.price)}
                    </span>
                    {tier.price !== 0 && (
                      <span className="text-sm text-slate-500 mb-2">
                        {tier.suffix}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col h-full">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5" />
                        <span className="text-sm text-slate-700">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Button
                      className={`w-full rounded-xl ${
                        tier.highlight ? "bg-amber-500 hover:bg-amber-600" : ""
                      }`}
                    >
                      {tier.cta}
                    </Button>
                    <p className="mt-3 text-xs text-slate-500 text-center">
                      Tidak perlu kartu kredit
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tiny FAQ / footnote */}
        <div className="max-w-3xl mx-auto text-center mt-12 text-sm text-slate-500">
          Harga dalam USD untuk contoh. Sesuaikan label, mata uang, dan fitur
          sesuai produkmu.
        </div>
      </div>
    </div>
  );
}

export function FooterSection() {
  return (
    <footer className="w-full bg-white text-slate-900">
      {/* CTA block */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl leading-tight font-serif font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Your ideas are ready. Are you?
          <br className="hidden sm:block" /> Join the creators who plan smarter
          with Planoria.
        </h2>

        <div className="mt-6 flex justify-center">
          <HoverButton href="/register">Get Planoria</HoverButton>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* Main footer row */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/src/assets/planoria-logo.png"
              alt="Planoria Logo"
              className="h-15 w-auto"
            />
          </div>

          {/* Social */}
          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-slate-900 cursor-pointer"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-slate-900 cursor-pointer"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-slate-900 cursor-pointer"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              aria-label="Github"
              className="hover:text-slate-900 cursor-pointer"
            >
              <Github size={18} />
            </a>
          </div>
        </div>

        <Separator className="my-6 bg-slate-200" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Planoria, All rights reserved</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-900 cursor-pointer">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-900 cursor-pointer">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// GlowButton removed — replaced by HoverButton

export default function HeroSection() {
  const portraits = [
    creativeDesign,
    education,
    empowerment,
    gitaris,
    llifestyle1,
    singing,
    travel,
    workEmployee,
    photograpy,
    selfie,
  ];

  // Fisher-Yates shuffle helper
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Precompute randomized sets once per mount
  const leftPortraits = useMemo(() => shuffleArray(portraits).slice(0, 5), []);
  // Ensure rightPortraits are different from leftPortraits: shuffle and exclude left picks
  const rightPortraits = useMemo(() => {
    const remaining = portraits.filter((p) => !leftPortraits.includes(p));
    const shuffled = shuffleArray(remaining);
    // If not enough remaining items, fall back to shuffled full set (ensures 5 items)
    const source =
      shuffled.length >= 5
        ? shuffled
        : shuffleArray(portraits)
            .filter((p) => !leftPortraits.includes(p))
            .concat(shuffleArray(portraits));
    return source.slice(0, 5);
  }, [leftPortraits]);
  const horizontalBase = useMemo(() => shuffleArray(portraits).slice(0, 5), []);
  const horizontalPortraits = useMemo(
    () => horizontalBase.concat(horizontalBase),
    [horizontalBase]
  );

  const Navbar = () => {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/src/assets/planoria-logo.png"
              alt="Planoria Logo"
              className="h-10 w-auto"
            />
          </div>
          <HoverButton href="/login">Get Started</HoverButton>
        </div>
      </nav>
    );
  };

  return (
    <>
      <Navbar />
      <section className="relative isolate overflow-hidden h-screen flex items-center pt-16 pb-4 sm:pb-6 lg:pb-8 bg-planoria">
        {/* background gradient */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 60%, rgba(172,255,147,0.55) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,1) 100%)",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center lg:items-center">
          {/* Left column */}
          <div className="flex flex-col justify-center lg:justify-start space-y-4 sm:space-y-6 lg:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-[0.95] text-slate-900">
              <PointerHighlight>
                Turn Ideas Into Impactful Stories with Planoria
                <span className="align-super">^</span>
              </PointerHighlight>
            </h1>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <HoverButton href="/login">Get Started</HoverButton>
            </div>
          </div>

          {/* Right column: marquees */}
          <div className="h-80 sm:h-96 md:h-100 lg:h-120 xl:h-140 mt-6 sm:mt-8 lg:mt-0">
            {/* Large screens: 2 vertical columns */}
            <div className="hidden lg:grid grid-cols-2 gap-6 lg:gap-8 h-full">
              {/* Left column moves upward */}
              <div className="overflow-hidden flex-1">
                <motion.div
                  animate={{ y: [0, -600] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex flex-col gap-4"
                >
                  {leftPortraits.concat(leftPortraits).map((src, i) => (
                    <div
                      key={i}
                      className={`w-48 h-64 overflow-hidden flex items-center justify-center`}
                    >
                      <img
                        src={src}
                        alt="creator portrait"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right column moves downward */}
              <div className="overflow-hidden flex-1">
                <motion.div
                  animate={{ y: [0, -300] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex flex-col gap-4"
                >
                  {rightPortraits.concat(rightPortraits).map((src, i) => (
                    <div
                      key={i}
                      className={`w-48 h-64 overflow-hidden flex items-center justify-center`}
                    >
                      <img
                        src={src}
                        alt="creator portrait"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Small and Medium screens: horizontal marquee */}
            <div className="lg:hidden overflow-hidden w-full h-[30rem] sm:h-[34rem] md:h-[38rem]">
              <motion.div
                animate={{ x: [0, -500] }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex flex-row gap-6 sm:gap-8"
              >
                {horizontalPortraits.map((src, i) => (
                  <div
                    key={i}
                    className={`w-80 h-[34rem] sm:w-[22rem] sm:h-[38rem] md:w-[26rem] md:h-[42rem] overflow-hidden flex-shrink-0 flex items-center justify-center`}
                  >
                    <img
                      src={src}
                      alt="creator portrait"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <Features />
      <HowItWorks />
      <PricingTiers />
      <FooterSection />
    </>
  );
}
