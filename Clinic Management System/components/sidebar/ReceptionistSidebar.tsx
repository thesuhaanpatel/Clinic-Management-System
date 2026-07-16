"use client";

import Link from "next/link";
import { 
  UserPlus, 
  CalendarPlus, 
  Users,
  Shield
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function ReceptionistSidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const navItems = [
    { href: "/add-patient", label: "Add Patient", icon: UserPlus },
    { href: "/new-appointment", label: "New Appointment", icon: CalendarPlus },
    { href: "/add-member", label: "Add Member", icon: Users },
  ];

  if (!isMounted) {
    return (
      <aside className="w-64 bg-white h-full shadow-lg flex flex-col border-r">
        <div className="p-4">
          <h2 className="font-bold text-lg mb-6 px-2 text-gray-800 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Receptionist Panel
          </h2>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white h-full shadow-lg flex flex-col border-r">
      <div className="p-4">
        <h2 className="font-bold text-lg mb-6 px-2 text-gray-800 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Receptionist Panel
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
export default ReceptionistSidebar;