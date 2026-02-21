"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/fitness", label: "Fitness", icon: "❤" },
  { href: "/runs", label: "Runs", icon: "◎" },
  { href: "/map", label: "Map", icon: "⊕" },
  { href: "/records", label: "PRs", icon: "★" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="neu-raised mx-3 mb-3 rounded-2xl px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all",
                  isActive
                    ? "neu-inset text-indigo-600"
                    : "text-neu-text-muted active:scale-95"
                )}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
