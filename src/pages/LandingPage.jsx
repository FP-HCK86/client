import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StickyScroll } from "../components/ui/sticky-scroll-reveal";
import { WobbleCard } from "../components/ui/wobble-card";
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

const content = [
  {
    title: "Canvas Storyboard",
    description:
      "Planoria helps you transform scattered ideas into a clear visual storyboard. Instead of juggling messy notes or random drafts, you can map out campaigns in a structured, visual flow that makes your content strategy easy to understand and execute.",
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
      <section className="mb-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-center mt-16 mb-8 text-slate-900">
          Our Features
        </h1>
        <div className="w-full py-4">
          <StickyScroll content={content} />
        </div>
      </section>
    </>
  );
}

export function HowItWorks() {
  return (
    <section className="mb-20">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-center mt-16 mb-8 text-slate-900">
        How it Works
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full mt-12">
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
          <GlowButton>Get Planoria</GlowButton>
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
            <a href="#" aria-label="Twitter" className="hover:text-slate-900 cursor-pointer">
              <Twitter size={18} />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-slate-900 cursor-pointer">
              <Facebook size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-slate-900 cursor-pointer">
              <Instagram size={18} />
            </a>
            <a href="#" aria-label="Github" className="hover:text-slate-900 cursor-pointer">
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

function GlowButton({ children }) {
  return (
    <div className="relative">
      <div
        className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 blur opacity-60"
        aria-hidden
      />
      <Button
        size="lg"
        className="relative rounded-full bg-slate-900 text-white hover:bg-black cursor-pointer"
      >
        {children}
      </Button>
    </div>
  );
}

export default function HeroSection() {
  const portraits = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544005316-04ce1f1a1f6c?q=80&w=600&auto=format&fit=crop",
  ];

  const Navbar = () => {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/src/assets/planoria-logo.png"
              alt="Planoria Logo"
              className="h-15 w-auto"
            />
          </div>
          <Button onClick={() => window.location.href = '/login'} className="cursor-pointer">Get Started</Button>
        </div>
      </nav>
    );
  };

  return (
    <>
      <Navbar />
      <section className="relative isolate overflow-hidden h-screen flex items-center pt-16 pb-4 sm:pb-6 lg:pb-8">
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
              Turn Ideas Into Impactful Stories with Planoria
              <span className="align-super">^</span>
            </h1>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 sm:px-6 py-2.5 sm:py-3 text-white text-sm font-semibold shadow hover:bg-black transition-colors cursor-pointer"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Right column: marquees */}
          <div className="h-80 sm:h-96 md:h-100 lg:h-120 xl:h-140 mt-6 sm:mt-8 lg:mt-0">
            {/* Large screens: 2 vertical columns */}
            <div className="hidden lg:grid grid-cols-2 gap-6 lg:gap-8 h-full">
              {/* Left column moves upward */}
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
                  {portraits.map((src, i) => (
                    <div
                      key={i}
                      className={`w-36 h-48 overflow-hidden ${
                        i % 2 === 0 ? "rounded-[20px]" : "rounded-full"
                      }`}
                    >
                      <img
                        src={src}
                        alt="creator portrait"
                        className="h-full w-full object-cover grayscale"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right column moves downward */}
              <div className="overflow-hidden flex-1">
                <motion.div
                  animate={{ y: [0, 300] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex flex-col gap-4"
                >
                  {portraits.map((src, i) => (
                    <div
                      key={i}
                      className={`w-36 h-48 overflow-hidden ${
                        i % 2 === 0 ? "rounded-[20px]" : "rounded-full"
                      }`}
                    >
                      <img
                        src={src}
                        alt="creator portrait"
                        className="h-full w-full object-cover grayscale"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Small and Medium screens: horizontal marquee */}
            <div className="lg:hidden overflow-hidden w-full h-40 sm:h-44 md:h-48">
              <motion.div
                animate={{ x: [0, -500] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex flex-row gap-3 sm:gap-4"
              >
                {portraits.concat(portraits).map((src, i) => (
                  <div
                    key={i}
                    className={`w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 overflow-hidden flex-shrink-0 ${
                      i % 2 === 0
                        ? "rounded-[16px] sm:rounded-[20px]"
                        : "rounded-full"
                    }`}
                  >
                    <img
                      src={src}
                      alt="creator portrait"
                      className="h-full w-full object-cover grayscale"
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
      <FooterSection />
    </>
  );
}
