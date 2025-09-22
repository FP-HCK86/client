"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  const mobileSidebarProps = {
    className: props.className,
    children: props.children as React.ReactNode,
  };

  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...mobileSidebarProps} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "fixed top-0 inset-x-0 h-16 px-4 py-4 md:hidden flex flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full border-b border-neutral-200 dark:border-neutral-700 z-[500]"
        )}
        {...props}
      >
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            Acet Labs
          </span>
        </div>
        <button
          className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <IconMenu2 className="h-6 w-6 text-neutral-800 dark:text-neutral-200" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-6 z-[1000] flex flex-col",
                className
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    Acet Labs
                  </span>
                </div>
                <button
                  className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => setOpen(!open)}
                  aria-label="Close menu"
                >
                  <IconX className="h-6 w-6 text-neutral-800 dark:text-neutral-200" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  currentPath,
  ...props
}: {
  link: Links;
  className?: string;
  currentPath?: string;
}) => {
  const { open, animate } = useSidebar();
  const isActive = currentPath === link.href;

  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center gap-2 group/sidebar py-2 px-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:cursor-pointer transition-colors",
        open ? "justify-start" : "justify-center",
        isActive && "bg-neutral-200 dark:bg-neutral-700",
        className
      )}
      {...props}
    >
      <div
        className={cn("flex-shrink-0", isActive && "[&>svg]:stroke-[2.5px]")}
      >
        {link.icon}
      </div>

      <motion.span
        animate={{
          width: animate ? (open ? "auto" : "0px") : "auto",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 overflow-hidden whitespace-nowrap",
          !open && "hidden",
          isActive && "font-bold"
        )}
      >
        {link.label}
      </motion.span>
    </a>
  );
};

export const SidebarCategory = ({
  category,
  icon,
  children,
  className,
  links = [],
  currentPath,
  ...props
}: {
  category: string;
  icon: React.JSX.Element | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  links?: Links[];
  currentPath?: string;
}) => {
  const { open } = useSidebar();
  const [expanded, setExpanded] = useState(false);

  // Check if any of the category's links is active
  const isActive = links.some((link) => currentPath === link.href);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="flex flex-col relative">
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 group/sidebar py-2 px-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:cursor-pointer transition-colors",
          open ? "justify-start" : "justify-center",
          isActive && "bg-neutral-200 dark:bg-neutral-700",
          className
        )}
        {...props}
      >
        <div
          className={cn("flex-shrink-0", isActive && "[&>svg]:stroke-[2.5px]")}
        >
          {icon}
        </div>

        <motion.span
          animate={{
            width: open ? "auto" : "0px",
            opacity: open ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(
            "text-neutral-700 dark:text-neutral-200 text-sm font-medium capitalize overflow-hidden whitespace-nowrap",
            !open && "hidden",
            isActive && "font-bold"
          )}
        >
          {category}
        </motion.span>
      </button>

      {/* Show submenu only when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "overflow-hidden",
              open
                ? "ml-2"
                : "absolute left-16 top-0 bg-white dark:bg-neutral-800 shadow-lg rounded-md p-2 z-50 min-w-[200px] border"
            )}
          >
            {!open && (
              <div
                className={cn(
                  "text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-2",
                  isActive && "font-bold"
                )}
              >
                {category}
              </div>
            )}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
