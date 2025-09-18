// src/layout/SidebarLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarCategory,
} from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconSettings,
  IconCalendar,
  IconVideo,
  IconUpload,
  IconLogout,
  IconBrush,
} from "@tabler/icons-react";

const menuItems = [
  // Dashboard - direct link, no submenu
  {
    type: "link",
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconBrandTabler className="h-5 w-5" />,
  },
  // Canvas - direct link to AI creative workspace
  {
    type: "link",
    label: "Canvas",
    href: "/canvas",
    icon: <IconBrush className="h-5 w-5" />,
  },
  // Videos category with submenu
  {
    type: "category",
    category: "videos",
    icon: <IconVideo className="h-5 w-5" />,
    links: [
      {
        label: "Video Library",
        href: "/videos",
        icon: <IconVideo className="h-4 w-4" />,
      },
      {
        label: "Video Upload",
        href: "/videos/upload",
        icon: <IconUpload className="h-4 w-4" />,
      },
      {
        label: "Video Detail",
        href: "/videos/id",
        icon: <IconVideo className="h-4 w-4" />,
      },
    ],
  },
  // Schedule category with submenu
  {
    type: "category",
    category: "schedule",
    icon: <IconCalendar className="h-5 w-5" />,
    links: [
      {
        label: "Schedule Calendar",
        href: "/schedules",
        icon: <IconCalendar className="h-4 w-4" />,
      },
      {
        label: "Schedule Create",
        href: "/schedules/create",
        icon: <IconCalendar className="h-4 w-4" />,
      },
      {
        label: "Schedule Detail",
        href: "/schedules/id",
        icon: <IconCalendar className="h-4 w-4" />,
      },
    ],
  },
  // Settings category with submenu
  {
    type: "category",
    category: "settings",
    icon: <IconSettings className="h-5 w-5" />,
    links: [
      {
        label: "Account Settings",
        href: "/account",
        icon: <IconSettings className="h-4 w-4" />,
      },
    ],
  },
  // Logout - direct link, no submenu
  {
    type: "link",
    label: "Logout",
    href: "/logout",
    icon: <IconLogout className="h-5 w-5" />,
  },
];

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
  const location = useLocation();

  return (
    <div className="h-screen w-full flex bg-gray-100">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2 relative">
              {menuItems && Array.isArray(menuItems) ? (
                menuItems.map((item, index) => {
                  if (item.type === "link") {
                    // Direct link item (Dashboard, Canvas, Logout)
                    return (
                      <SidebarLink
                        key={`link-${index}`}
                        link={item}
                        currentPath={location.pathname}
                      />
                    );
                  } else if (item.type === "category") {
                    // Category with submenu (Videos, Schedule, Settings)
                    return (
                      <SidebarCategory
                        key={`category-${index}`}
                        category={item.category}
                        icon={item.icon}
                        links={item.links}
                        currentPath={location.pathname}
                      >
                        <div className="flex flex-col gap-1">
                          {Array.isArray(item.links) &&
                            item.links.map((link, linkIdx) => (
                              <SidebarLink
                                key={`${item.category}-${linkIdx}`}
                                link={link}
                                className="ml-2"
                                currentPath={location.pathname}
                              />
                            ))}
                        </div>
                      </SidebarCategory>
                    );
                  }
                  return null;
                })
              ) : (
                <div className="text-sm text-neutral-500 px-2">
                  Loading navigation...
                </div>
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
