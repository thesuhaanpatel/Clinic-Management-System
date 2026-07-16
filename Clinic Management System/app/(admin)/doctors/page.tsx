// app/(admin)/doctors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import SimpleFooter from "@/components/SimpleFooter";

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  employment: string;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    phone: "",
    employment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctors", { cache: "no-store" });
      const data: Doctor[] = await res.json();
      setDoctors(data);
    } catch (e) {
      console.error("Failed to load doctors", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    
    const res = await fetch(`/api/doctors?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchDoctors();
    else alert("Failed to delete doctor");
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name) {
      alert("Doctor name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDoctor),
      });

      if (res.ok) {
        setIsAddDialogOpen(false);
        setNewDoctor({ name: "", specialty: "", phone: "", employment: "" });
        fetchDoctors(); // Refresh the list
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add doctor");
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert("Failed to add doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600">Manage doctor profiles</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Doctor Records</CardTitle>
              <CardDescription>
                {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} total
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search doctors..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading doctors...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Employment Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No doctors found matching your search' : 'No doctors yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.specialty || "-"}</TableCell>
                        <TableCell>{doctor.phone || "-"}</TableCell>
                        <TableCell className="capitalize">{doctor.employment || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doctor.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Doctor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new doctor to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                className="col-span-3"
                placeholder="Dr. Bhavya Gour Chandrakar"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialty" className="text-right">
                Specialty
              </Label>
              <Input
                id="specialty"
                value={newDoctor.specialty}
                onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                className="col-span-3"
                placeholder="Speech Therapist"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newDoctor.phone}
                onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                className="col-span-3"
                placeholder="1234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employment" className="text-right">
                Employment
              </Label>
              <Select
                value={newDoctor.employment}
                onValueChange={(value) => setNewDoctor({...newDoctor, employment: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue-sharing">Revenue-Sharing</SelectItem>
                  <SelectItem value="salaried">Salaried</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddDoctor}
              disabled={isSubmitting || !newDoctor.name}
            >
              {isSubmitting ? "Adding..." : "Add Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SimpleFooter/>
    </div>
  );
}