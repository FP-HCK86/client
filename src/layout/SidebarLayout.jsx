// src/layout/SidebarLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconSettings,
  IconCalendar,
  IconVideo,
  IconUpload,
  IconLogout,
} from "@tabler/icons-react";

const links = {
  general: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconBrandTabler className="h-5 w-5" />,
    },
  ],
  videos: [
    {
      label: "Video Library", 
      href: "/videos",
      icon: <IconVideo className="h-5 w-5" />,
    },
    {
      label: "Video Upload",
      href: "/videos/upload",
      icon: <IconUpload className="h-5 w-5" />,
    },
    {
      label: "Video Detail",
      href: "/videos/id",
      icon: <IconVideo className="h-5 w-5" />,
    },
  ],
  schedule: [
    {
      label: "Schedule Calendar",
      href: "/schedules",
      icon: <IconCalendar className="h-5 w-5" />,
    },
    {
      label: "Schedule Create",
      href: "/schedules/create",
      icon: <IconCalendar className="h-5 w-5" />,
    },
    {
      label: "Schedule Detail",
      href: "/schedules/id",
      icon: <IconCalendar className="h-5 w-5" />,
    },
  ],
  settings: [
    {
      label: "Account Settings",
      href: "/account",
      icon: <IconSettings className="h-5 w-5" />,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <IconLogout className="h-5 w-5" />,
    },
  ],
};

function Logo() {
  return (
    <a href="#" className="flex items-center space-x-2 py-1 text-sm">
      <div className="h-5 w-6 bg-black rounded" />
      <span className="font-medium">Acet Labs</span>
    </a>
  );
}

function LogoIcon() {
  return (
    <a href="#" className="flex items-center space-x-2 py-1 text-sm">
      <div className="h-5 w-6 bg-black rounded" />
    </a>
  );
}

export default function SidebarLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen w-full flex bg-gray-100">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-3">
              {links && typeof links === 'object' && Object.keys(links).length > 0 ? (
                Object.entries(links).map(([category, categoryLinks]) => (
                  <div key={category} className="flex flex-col">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2">
                      {category}
                    </h3>
                    {Array.isArray(categoryLinks) && categoryLinks.map((link, idx) => (
                      <SidebarLink key={`${category}-${idx}`} link={link} />
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-sm text-neutral-500 px-2">Loading navigation...</div>
              )}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Add top padding for the fixed mobile header */}
      <main className="flex-1 overflow-auto p-2 md:p-4 pt-16 md:pt-8 bg-white">
        {/* Halaman anak akan dirender di sini */}
        <Outlet />
      </main>
    </div>
  );
}
