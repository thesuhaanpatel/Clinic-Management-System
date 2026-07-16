// components/forms/NewAppointmentForm.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z
    .date()
    .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
      message: "Date and time are required",
    }),
  billNo: z.string().optional(),
  seenBy: z.string().optional(),
  paymentCash: z.coerce.number().min(0).default(0),
  paymentOnline: z.coerce.number().min(0).default(0),
  paymentPackage: z.coerce.number().min(0).default(0),
  balance: z.coerce.number().min(0).default(0),
  remark: z.string().optional(),
  contactNo: z.string().optional(),
  useMemberSession: z.boolean().default(false),
  membershipId: z.string().optional(),
});

interface Patient {
  id: number;
  name: string;
  phone: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

interface Member {
  id: number;
  patientId: number;
  planId: number;
  planName: string;
  planTotalSessions: number;
  remainingSessions: number;
}

interface NewAppointmentFormProps {
  patients: Patient[];
  onAppointmentAdded: () => void;
}

export default function NewAppointmentForm({
  patients,
  onAppointmentAdded,
}: NewAppointmentFormProps) {
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [toasts, setToasts] = useState<
    { id: string; title: string; description: string; variant: "default" | "destructive" }[]
  >([]);

  type FormSchemaType = z.infer<typeof formSchema>;
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      date: undefined,
      billNo: "",
      seenBy: "",
      paymentCash: 0,
      paymentOnline: 0,
      paymentPackage: 0,
      balance: 0,
      remark: "",
      contactNo: "",
      useMemberSession: false,
      membershipId: "",
    },
  });

  const selectedPatientId = form.watch("patientId");
  const useMemberSession = form.watch("useMemberSession");
  const selectedMembershipId = form.watch("membershipId");

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const doctorsData = await response.json();
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        showToast("Error", "Failed to load doctors.", "destructive");
      }
    };
    fetchDoctors();
  }, []);

  // Memoize fetchMembers function with useCallback
  const fetchMembers = useCallback(async (patientId: string) => {
    try {
      setLoadingMembers(true);
      setError(null);
      const response = await fetch(`/api/members?patientId=${patientId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch membership details");
      const membersData = await response.json();
      setMembers(Array.isArray(membersData) ? membersData : []);
      if (membersData.length > 0) {
        form.setValue("membershipId", membersData[0].id.toString());
      } else {
        form.setValue("membershipId", "");
        form.setValue("useMemberSession", false);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setError(error instanceof Error ? error.message : "Failed to load membership details");
      showToast("Error", "Failed to load membership details.", "destructive");
    } finally {
      setLoadingMembers(false);
    }
  }, [form]);

  // Fetch members when patientId changes
  useEffect(() => {
    if (!selectedPatientId) {
      setMembers([]);
      setLoadingMembers(false);
      form.setValue("membershipId", "");
      form.setValue("useMemberSession", false);
      return;
    }
    fetchMembers(selectedPatientId);
  }, [selectedPatientId, fetchMembers, form]);

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      form.setValue("date", newDate);
    } else if (date) {
      form.setValue("date", date);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      form.setValue("date", newDate);
    }
  };

  const onSubmit = async (values: FormSchemaType) => {
    setLoading(true);
    try {
      const appointmentData = {
        patientId: parseInt(values.patientId),
        doctorId: parseInt(values.doctorId),
        date: values.date.toISOString(),
        billNo: values.billNo || undefined,
        seenBy: values.seenBy || undefined,
        paymentCash: useMemberSession ? 0 : values.paymentCash,
        paymentOnline: useMemberSession ? 0 : values.paymentOnline,
        paymentPackage: useMemberSession ? 0 : values.paymentPackage,
        balance: values.balance,
        remark: values.remark || undefined,
        contactNo: values.contactNo || undefined,
        useMemberSession: values.useMemberSession && values.membershipId && members.some(m => m.id.toString() === values.membershipId && m.remainingSessions > 0),
        memberId: values.useMemberSession && values.membershipId ? parseInt(values.membershipId) : undefined,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        form.reset();
        setOpen(false);
        setSelectedDate(undefined);
        setSelectedTime("");
        showToast("Success", "Appointment created successfully!");
        await fetchMembers(selectedPatientId); // Refresh membership data
        onAppointmentAdded();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      showToast(
        "Error",
        error instanceof Error ? error.message : "Failed to create appointment",
        "destructive"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>Create a new appointment for a patient.</DialogDescription>
        </DialogHeader>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-md shadow-md border min-w-80 ${
                toast.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground border-destructive"
                  : "bg-background text-foreground border-border"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{toast.title}</h4>
              </div>
              <p className="text-sm">{toast.description}</p>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name} ({patient.phone})
                        </SelectItem>
                      ))}
                      {patients.length === 0 && (
                        <SelectItem value="none" disabled>
                          No patients available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {loadingMembers && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading membership details...
              </div>
            )}

            {selectedPatientId && !loadingMembers && members.length > 0 && (
              <FormField
                control={form.control}
                name="membershipId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Plan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a membership plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.planName} ({member.remainingSessions}/{member.planTotalSessions} sessions remaining)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedPatientId && !loadingMembers && members.length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">No active membership for this patient.</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {selectedPatientId && !loadingMembers && members.length > 0 && (
              <FormField
                control={form.control}
                name="useMemberSession"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Use Membership Session</FormLabel>
                      <FormDescription>
                        Use one session from the selected membership (
                        {members.find(m => m.id.toString() === selectedMembershipId)?.remainingSessions ?? 0} remaining)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading || !selectedMembershipId || (members.find(m => m.id.toString() === selectedMembershipId)?.remainingSessions ?? 0) === 0}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={doctors.length === 0 ? "Loading doctors..." : "Select a doctor"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} {doctor.specialty && `(${doctor.specialty})`}
                        </SelectItem>
                      ))}
                      {doctors.length === 0 && (
                        <SelectItem value="none" disabled>
                          No doctors available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date and Time *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP HH:mm")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => handleTimeChange(e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-10 ">
              <FormField
                control={form.control}
                name="paymentCash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cash Payment (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        disabled={useMemberSession || loading}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentOnline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Online Payment (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        disabled={useMemberSession || loading}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      disabled={loading}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Appointment"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}