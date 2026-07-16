// components/RevenueManagement.tsx
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define interfaces (adjust as needed based on your actual data models)
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  employment: string;
}

interface Appointment {
  id: number;
  doctorId: number;
  membershipPlanId: number | null; // Assuming appointments link to membership plans if applicable
}

interface MembershipPlan {
  id: number;
  name: string;
  price: number;
  totalSessions: number;
  perSessionCost: number;
  isActive: boolean;
}

export function RevenueManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch doctors
        const resDocs = await fetch("/api/doctors", { cache: "no-store" });
        const docs: Doctor[] = await resDocs.json();
        setDoctors(docs);

        // Fetch appointments (assuming /api/appointments exists and returns all appointments)
        // You need to implement /api/appointments if not already present
        const resApps = await fetch("/api/appointments", { cache: "no-store" });
        const apps: Appointment[] = await resApps.json();
        setAppointments(apps);

        // Fetch membership plans for perSessionCost lookup
        const resPlans = await fetch("/api/membership-plans", { cache: "no-store" });
        const mPlans: MembershipPlan[] = await resPlans.json();
        setPlans(mPlans);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelect = (value: string) => {
    setSelectedDoctor(parseInt(value));
  };

  let numAppointments = 0;
  let normalSessions = 0;
  let membershipSessions = 0;
  let totalRevenue = 0;

  if (selectedDoctor) {
    const docAppointments = appointments.filter(
      (a) => a.doctorId === selectedDoctor
    );
    numAppointments = docAppointments.length;

    docAppointments.forEach((a) => {
      if (!a.membershipPlanId) {
        normalSessions++;
        totalRevenue += 950;
      } else {
        membershipSessions++;
        const plan = plans.find((p) => p.id === a.membershipPlanId);
        if (plan) {
          totalRevenue += plan.perSessionCost;
        }
      }
    });
  }

  const docShare = totalRevenue * 0.4;
  const hospitalShare = totalRevenue * 0.6;

  if (loading) {
    return <div className="p-4">Loading data...</div>;
  }

  return (
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold mb-2">Revenue Management</h2>
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Doctor" />
        </SelectTrigger>
        <SelectContent>
          {doctors.map((d) => (
            <SelectItem key={d.id} value={d.id.toString()}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedDoctor && (
        <div className="mt-4 space-y-2">
          <p className="text-sm">Total Appointments: {numAppointments}</p>
          <p className="text-sm">Normal Sessions: {normalSessions}</p>
          <p className="text-sm">Membership Sessions: {membershipSessions}</p>
          <p className="text-sm">Total Revenue: ₹{totalRevenue.toFixed(2)}</p>
          <p className="text-sm">Doctor Share (40%): ₹{docShare.toFixed(2)}</p>
          <p className="text-sm">
            Hospital Share (60%): ₹{hospitalShare.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}