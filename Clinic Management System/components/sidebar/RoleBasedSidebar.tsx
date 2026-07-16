"use client";

import { useEffect, useState } from "react";
import ReceptionistSidebar from "@/components/sidebar/ReceptionistSidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Shield, Loader2 } from "lucide-react";

export default function RoleBasedSidebar() {
  const [role, setRole] = useState<"receptionist" | "admin">("receptionist");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedRole = localStorage.getItem("role");
    if (savedRole === "admin") {
      setRole("admin");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      localStorage.setItem("role", role);
    }
  }, [role, isLoading, isMounted]);

  const handleOtpSubmit = () => {
    setIsVerifying(true);
    // Simulate API call
    setTimeout(() => {
      if (otp === "050485") {
        setRole("admin");
        setOtp("");
        setIsDialogOpen(false);
      } else {
        alert("Invalid OTP. Please try again.");
        setOtp("");
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleExitAdmin = () => {
    setRole("receptionist");
  };

  if (!isMounted) {
    return (
      <div className="w-64 h-screen border-r flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-64 h-screen border-r flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-screen border-r bg-white flex flex-col">
      {role === "receptionist" ? (
        <>
          <ReceptionistSidebar />
          <div className="p-4 border-t mt-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Lock className="h-4 w-4 mr-2" />
                  Admin Access
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Admin Access
                  </DialogTitle>
                  <DialogDescription>
                    Enter the 6-digit OTP to access admin features.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-3">
                    <Label htmlFor="otp" className="text-base font-medium text-foreground">
                      Verification Code
                    </Label>
                    <div className="flex justify-center">
                      <InputOTP 
                        maxLength={6} 
                        value={otp}
                        onChange={(value: string) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                      >
                        <div className="flex items-center gap-2">
                          <InputOTPSlot 
                            index={0} 
                            className="w-12 h-12 text-lg border-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-ring" 
                          />
                          <InputOTPSlot 
                            index={1} 
                            className="w-12 h-12 text-lg border-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-ring" 
                          />
                          <InputOTPSlot 
                            index={2} 
                            className="w-12 h-12 text-lg border-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-ring" 
                          />
                          <div className="w-2 h-0.5 bg-border mx-1 rounded-full" aria-hidden="true" />
                          <InputOTPSlot 
                            index={3} 
                            className="w-12 h-12 text-lg border-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-ring" 
                          />
                          <InputOTPSlot 
                            index={4} 
                            className="w-12 h-12 text-lg border-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-ring" 
                          />
                          <InputOTPSlot 
                            index={5} 
                            className="w-12 h-12 text-lg border-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-ring" 
                          />
                        </div>
                      </InputOTP>
                    </div>
                  </div>
                  <Button 
                    onClick={handleOtpSubmit} 
                    disabled={otp.length !== 6 || isVerifying}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enter Admin Mode'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <AdminSidebar />
          <div className="p-4 border-t mt-auto">
            <Button
              onClick={handleExitAdmin}
              className="w-full bg-red-600 hover:bg-red-700"
              variant="destructive"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Exit Admin Mode
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}