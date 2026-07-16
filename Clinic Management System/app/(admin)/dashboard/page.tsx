// app/(admin)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Stethoscope } from "lucide-react";
import SimpleFooter from "@/components/SimpleFooter";

type Stats = {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalDoctors: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalDoctors: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [patientsRes, appointmentsRes, revenueRes, doctorsRes] = await Promise.all([
        fetch("/api/patients?count=true", { cache: "no-store" }),
        fetch("/api/appointments?count=true", { cache: "no-store" }),
        fetch("/api/revenue?total=true", { cache: "no-store" }),
        fetch("/api/doctors?count=true", { cache: "no-store" }),
      ]);
      
      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const revenueData = await revenueRes.json();
      const doctorsData = await doctorsRes.json();
      
      setStats({
        totalPatients: patientsData.count || 0,
        totalAppointments: appointmentsData.count || 0,
        totalRevenue: revenueData.total || 0,
        totalDoctors: doctorsData.count || 0,
      });
    } catch (e) {
      console.error("Failed to load stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of hospital operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-gray-500">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-gray-500">Total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
            <p className="text-xs text-gray-500">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDoctors}</div>
            <p className="text-xs text-gray-500">Active doctors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest appointments and registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Recent activity feed will be implemented here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Income by category</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Revenue charts will be implemented here</p>
          </CardContent>
        </Card>
      </div>
      <SimpleFooter/>
    </div>
  );
}