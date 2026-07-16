"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Calendar, DollarSign, Building, Stethoscope, PieChart, Hospital, TrendingUp } from "lucide-react";
import SimpleFooter from "@/components/SimpleFooter";

// Define interfaces to match database schema
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  employment: string;
}

interface RevenueData {
  numAppointments: number;
  normalSessions: number;
  membershipSessions: number;
  totalRevenue: number;
  docShare: number;
  hospitalShare: number;
}

interface HospitalRevenueData {
  totalAppointments: number;
  totalRevenue: number;
  totalDoctorShare: number;
  totalHospitalShare: number;
  topPerformingDoctor: string;
  appointmentGrowth: number;
}

export default function RevenuePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [hospitalRevenueData, setHospitalRevenueData] = useState<HospitalRevenueData | null>(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("/api/doctors", { cache: "no-store" });
        
        if (!res.ok) throw new Error(`Doctors API failed: ${res.status} ${res.statusText}`);
        
        const doctorsData = await res.json();
        if (!Array.isArray(doctorsData)) throw new Error("Doctors data is not an array");
        
        setDoctors(doctorsData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to load doctors: ${errorMessage}`);
        console.error("Fetch error:", err);
      }
    }

    async function fetchHospitalRevenue() {
      try {
        setHospitalLoading(true);
        const res = await fetch("/api/revenue/hospital", { cache: "no-store" });
        
        if (!res.ok) throw new Error(`Hospital revenue API failed: ${res.status} ${res.statusText}`);
        
        const hospitalData = await res.json();
        setHospitalRevenueData(hospitalData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to load hospital revenue data: ${errorMessage}`);
        console.error("Fetch error:", err);
      } finally {
        setHospitalLoading(false);
      }
    }

    fetchDoctors();
    fetchHospitalRevenue();
  }, []);

  useEffect(() => {
    async function fetchRevenueData() {
      if (!selectedDoctor) return;
      
      try {
        const res = await fetch(`/api/revenue?doctorId=${selectedDoctor}`, { cache: "no-store" });
        
        if (!res.ok) throw new Error(`Revenue API failed: ${res.status} ${res.statusText}`);
        
        const revenueData = await res.json();
        setRevenueData(revenueData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to load revenue data: ${errorMessage}`);
        console.error("Fetch error:", err);
      }
    }
    
    fetchRevenueData();
  }, [selectedDoctor]);

  const handleSelect = (value: string) => {
    setSelectedDoctor(parseInt(value));
  };

  // Calculate percentages for visual representation
  const normalSessionPercentage = revenueData && revenueData.numAppointments > 0 ? 
    (revenueData.normalSessions / revenueData.numAppointments * 100).toFixed(1) : "0";
  const membershipSessionPercentage = revenueData && revenueData.numAppointments > 0 ? 
    (revenueData.membershipSessions / revenueData.numAppointments * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
          <p className="text-gray-600 mt-1">View hospital-wide and doctor-specific revenue analytics</p>
        </div>
        <div className="w-full md:w-64">
          <Select onValueChange={handleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-xs text-gray-500">{d.specialty}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hospital Revenue Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md border-blue-100">
          <CardHeader className="bg-blue-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hospital className="h-5 w-5 text-blue-600" />
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {hospitalLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
              </div>
            ) : hospitalRevenueData ? (
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-700">{hospitalRevenueData.totalAppointments}</span>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{hospitalRevenueData.appointmentGrowth}%
                </div>
              </div>
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-green-100">
          <CardHeader className="bg-green-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {hospitalLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin h-6 w-6 text-green-600" />
              </div>
            ) : hospitalRevenueData ? (
              <span className="text-2xl font-bold text-green-700">₹{hospitalRevenueData.totalRevenue.toLocaleString()}</span>
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-purple-100">
          <CardHeader className="bg-purple-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Doctor Share
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {hospitalLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
              </div>
            ) : hospitalRevenueData ? (
              <span className="text-2xl font-bold text-purple-700">₹{hospitalRevenueData.totalDoctorShare.toLocaleString()}</span>
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-amber-100">
          <CardHeader className="bg-amber-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-600" />
              Hospital Share
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {hospitalLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin h-6 w-6 text-amber-600" />
              </div>
            ) : hospitalRevenueData ? (
              <span className="text-2xl font-bold text-amber-700">₹{hospitalRevenueData.totalHospitalShare.toLocaleString()}</span>
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </CardContent>
        </Card>
      </div>

      {hospitalRevenueData && hospitalRevenueData.topPerformingDoctor && (
        <Card className="shadow-md border-teal-100">
          <CardHeader className="bg-teal-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Top Performing Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-teal-700">{hospitalRevenueData.topPerformingDoctor}</span>
              <div className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                Highest Revenue
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDoctor && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Doctor Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Doctor Information Card */}
            <Card className="shadow-md border-blue-100">
              <CardHeader className="bg-blue-50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {doctors.find(d => d.id === selectedDoctor) && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{doctors.find(d => d.id === selectedDoctor)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty:</span>
                      <span className="font-medium">{doctors.find(d => d.id === selectedDoctor)?.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employment:</span>
                      <span className="font-medium capitalize">{doctors.find(d => d.id === selectedDoctor)?.employment}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointments Overview Card */}
            <Card className="shadow-md border-purple-100">
              <CardHeader className="bg-purple-50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Appointments Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {revenueData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Appointments</span>
                      <span className="text-2xl font-bold text-purple-700">{revenueData.numAppointments}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Normal Sessions</span>
                        <span className="font-medium">{revenueData.normalSessions} ({normalSessionPercentage}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Membership Sessions</span>
                        <span className="font-medium">{revenueData.membershipSessions} ({membershipSessionPercentage}%)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Overview Card */}
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-green-50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {revenueData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-700">₹{revenueData.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctor Share (40%)</span>
                        <span className="font-medium text-green-600">₹{revenueData.docShare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hospital Share (60%)</span>
                        <span className="font-medium text-blue-600">₹{revenueData.hospitalShare.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin h-6 w-6 text-green-600" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Distribution Card */}
            <Card className="shadow-md border-orange-100 md:col-span-2 lg:col-span-1">
              <CardHeader className="bg-orange-50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-orange-600" />
                  Session Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {revenueData && revenueData.numAppointments > 0 ? (
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-purple-600 h-4 rounded-full" 
                        style={{ width: `${normalSessionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Normal Sessions: {revenueData.normalSessions}</span>
                      <span className="text-sm text-gray-600">{normalSessionPercentage}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-6">
                      <div 
                        className="bg-blue-600 h-4 rounded-full" 
                        style={{ width: `${membershipSessionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Membership Sessions: {revenueData.membershipSessions}</span>
                      <span className="text-sm text-gray-600">{membershipSessionPercentage}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No appointment data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Share Card */}
            <Card className="shadow-md border-indigo-100 md:col-span-2">
              <CardHeader className="bg-indigo-50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {revenueData && revenueData.totalRevenue > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm">Doctor Share</span>
                      </div>
                      <span className="font-medium">40% (₹{revenueData.docShare.toFixed(2)})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `40%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Hospital Share</span>
                      </div>
                      <span className="font-medium">60% (₹{revenueData.hospitalShare.toFixed(2)})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-500 h-4 rounded-full" 
                        style={{ width: `60%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Summary Card */}
            <Card className="shadow-md border-teal-100">
              <CardHeader className="bg-teal-50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {revenueData ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Revenue per Session</span>
                      <span className="font-medium">
                        ₹{(revenueData.totalRevenue / revenueData.numAppointments).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membership Penetration</span>
                      <span className="font-medium">
                        {membershipSessionPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Efficiency</span>
                      <span className="font-medium">
                        {revenueData.numAppointments > 10 ? "High" : 
                         revenueData.numAppointments > 5 ? "Medium" : "Low"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin h-6 w-6 text-teal-600" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!selectedDoctor && (
        <Card className="shadow-md border-dashed mt-8">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg text-center">Select a Doctor</CardTitle>
            <CardDescription className="text-center">
              Choose a doctor from the dropdown to view their detailed revenue analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <div className="text-center text-gray-400">
              <User className="h-12 w-12 mx-auto mb-2" />
              <p>No doctor selected</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p className="font-medium">Error Loading Data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      <SimpleFooter/>
    </div>
  );
}