"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NewAppointmentForm from "@/components/forms/NewAppointmentForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Search, DollarSign, CreditCard, Package } from "lucide-react";
import SimpleFooter from "@/components/SimpleFooter";

// Define types explicitly to avoid TypeScript errors
interface Patient {
  id: number;
  name: string;
  phone: string;
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  billNo?: string;
  seenBy?: string;
  paymentCash: number;
  paymentOnline: number;
  paymentPackage: number;
  balance: number;
  remark?: string;
  contactNo?: string;
}

interface Member {
  id: number;
  patientId: number;
  patientName: string;
  planName: string;
  planTotalSessions: number;
  remainingSessions: number;
}

export default function NewAppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const pageSize = 10;

  // Fetch data from APIs concurrently
  const fetchData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const [patientsRes, appointmentsRes, membersRes] = await Promise.all([
        fetch("/api/patients", { cache: "no-store" }),
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/members", { cache: "no-store" }),
      ]);

      if (!patientsRes.ok) throw new Error("Failed to fetch patients");
      if (!appointmentsRes.ok) throw new Error("Failed to fetch appointments");

      const patientsData: Patient[] = await patientsRes.json();
      const appointmentsData: Appointment[] = await appointmentsRes.json();
      const membersData: Member[] = membersRes.ok ? await membersRes.json() : [];

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setMembers(membersData);
    } catch (e) {
      console.error("Failed to load data", e);
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);


  // Filter appointments with case-insensitive search
  const filteredAppointments = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return appointments.filter(
      (appointment) =>
        appointment.patientName.toLowerCase().includes(lowerSearchTerm) ||
        (appointment.billNo?.toLowerCase().includes(lowerSearchTerm) ?? false) ||
        (appointment.contactNo?.toLowerCase().includes(lowerSearchTerm) ?? false)
    );
  }, [appointments, searchTerm]);

  // Pagination logic
  const pageCount = Math.ceil(filteredAppointments.length / pageSize);
  const rows = useMemo(
    () => filteredAppointments.slice(page * pageSize, (page + 1) * pageSize),
    [filteredAppointments, page]
  );

  // Reset page if it exceeds pageCount
  useEffect(() => {
    if (pageCount > 0 && page >= pageCount) {
      setPage(pageCount - 1);
    }
  }, [pageCount, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Schedule and manage appointments</p>
        </div>
        <NewAppointmentForm patients={patients} onAppointmentAdded={fetchData} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Appointments
              </CardTitle>
              <CardDescription>
                {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search appointments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Sr. No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Seen By</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="text-center">Membership</TableHead>
                  <TableHead className="text-center">Balance</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead>Contact No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No appointments found matching your search" : "No appointments yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((appointment, index) => {
                    const member = members.find((m) => m.patientId === appointment.patientId);
                    return (
                      <TableRow key={appointment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{page * pageSize + index + 1}</TableCell>
                        <TableCell>
                          {new Date(appointment.date).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{appointment.patientName}</TableCell>
                        <TableCell>{appointment.billNo ?? "-"}</TableCell>
                        <TableCell>{appointment.seenBy ?? "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {appointment.paymentCash > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span>Cash: ₹{appointment.paymentCash}</span>
                              </div>
                            )}
                            {appointment.paymentOnline > 0 && (
                              <div className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3 text-blue-600" />
                                <span>Online: ₹{appointment.paymentOnline}</span>
                              </div>
                            )}
                            {appointment.paymentPackage > 0 && (
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3 text-purple-600" />
                                <span>Package: ₹{appointment.paymentPackage}</span>
                              </div>
                            )}
                            {appointment.paymentCash === 0 &&
                              appointment.paymentOnline === 0 &&
                              appointment.paymentPackage === 0 && (
                                <span className="text-gray-400">No payment</span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member ? (
                            <div className="text-xs text-purple-600 text-center">
                              {member.planName}: {member.remainingSessions}/{member.planTotalSessions} sessions
                            </div>
                          ) : (
                            <span className="text-gray-400 text-center">No package</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              appointment.balance > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"
                            }
                          >
                            ₹{appointment.balance}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={appointment.remark ?? undefined}>
                          {appointment.remark ?? "-"}
                        </TableCell>
                        <TableCell>{appointment.contactNo ?? "-"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
          {filteredAppointments.length > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {page * pageSize + 1}–
                {Math.min((page + 1) * pageSize, filteredAppointments.length)} of{" "}
                {filteredAppointments.length} appointments
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={page + 1 >= pageCount}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <SimpleFooter/>
    </div>
  );
}