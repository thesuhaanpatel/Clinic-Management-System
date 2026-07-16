"use client";

import Link from "next/link";
import {  
  Users, 
  Stethoscope, 
  CreditCard, 
  BarChart3,
  Shield
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const navItems = [
    // { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/membership-plans", label: "Membership Plans", icon: CreditCard },
    { href: "/revenue", label: "Revenue", icon: BarChart3 },
  ];

  if (!isMounted) {
    return (
      <aside className="w-64 bg-white h-full shadow-lg border-r flex flex-col">
        <div className="p-4">
          <h2 className="font-bold text-lg mb-6 px-2 text-gray-800 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Admin Panel
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white h-full shadow-lg border-r flex flex-col">
      <div className="p-4">
        <h2 className="font-bold text-lg mb-6 px-2 text-gray-800 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Admin Panel
        </h2>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 transition-colors",
                  isActive 
                    ? "bg-blue-100 text-blue-700 font-medium" 
                    : "hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
