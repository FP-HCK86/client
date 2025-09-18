import React from "react";
import { Button } from "@/components/ui/button";
import { IconBrandInstagram, IconBrandFacebook, IconBrandTiktok } from "@tabler/icons-react";

export default function LoginPageVisual() {
  const hero = "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1600&auto=format&fit=crop"; // hardcoded hero URL

  return (
    <div className="h-screen bg-white">
      <div className="mx-auto flex h-screen max-w-6xl items-center justify-center px-8 py-14">
        {/* Main Content */}
        <div className="flex w-full max-w-4xl items-center gap-38">
          {/* LEFT: Hero image */}
          <div className="flex-1">
            <div className="relative overflow-hidden rounded-[28px] border bg-black/5 shadow-2xl">
              <img
                src={hero}
                alt="Hero"
                className="h-[600px] w-[450px] object-cover"
              />
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-center">Welcome Back <span className="inline"></span></h1>
              <p className="mt-2 text-slate-600">Today is a new day. It’s your day. You shape it. Sign in to start managing your projects.</p>
            </div>

            {/* OAuth Buttons - larger icons, brand gradients */}
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="secondary"
                className="h-14 w-32 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-yellow-500"
                aria-label="Sign in with Instagram"
              >
                <IconBrandInstagram className="text-white" size={40} />
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="h-14 w-32 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1877F2] to-[#166FE5] text-white hover:from-[#166FE5] hover:to-[#155fcf]"
                aria-label="Sign in with Facebook"
              >
                <IconBrandFacebook className="text-white" size={40} />
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="h-14 w-32 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#25F4EE] via-[#EE2D8B] to-[#0F0F0F] text-white hover:opacity-95"
                aria-label="Sign in with TikTok"
              >
                <IconBrandTiktok className="text-white" size={40} />
              </Button>
            </div>

            <div className="mt-10 text-center text-[10px] text-slate-400">© 2025 ALL RIGHTS RESERVED</div>
          </div>
        </div>
      </div>
    </div>
  );
}
