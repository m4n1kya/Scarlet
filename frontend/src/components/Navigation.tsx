"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, BarChart2, Database, Info, Flame } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const navItems = [
  { name: "Detection", href: "/", icon: Camera },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "History", href: "/history", icon: Database },
  { name: "About", href: "/about", icon: Info },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-700 bg-dark-900/80 backdrop-blur">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-scarlet-700/20 rounded-md text-scarlet-700">
            <Flame size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider text-white leading-tight">SCARLET</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="relative px-2 py-1.5">
                {isActive && (
                  <motion.div
                    layoutId="top-nav-bg"
                    className="absolute inset-0 bg-scarlet-700/10 rounded-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={clsx(
                    "relative flex items-center gap-1.5 transition-colors z-10 text-xs font-medium",
                    isActive ? "text-scarlet-500" : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  <Icon size={14} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium bg-dark-800 px-2 py-1 rounded-full border border-dark-600">
          <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
          API Connected
        </div>
      </div>
    </header>
  );
}
