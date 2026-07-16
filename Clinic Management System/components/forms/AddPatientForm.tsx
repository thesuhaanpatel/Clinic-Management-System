"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

export type Patient = {
  id: number;
  name: string;
  age: number;
  gender: string;
  dob: string;
  school: string;
  area: string;
  referredBy: string;
  phone: string;
};

export default function AddPatientForm({ onPatientAdded }: { onPatientAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    dob: "",
    school: "",
    area: "",
    referredBy: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.age || !formData.gender || !formData.dob || 
        !formData.school || !formData.area || !formData.referredBy || !formData.phone) {
      return alert("Please fill all fields");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          age: Number(formData.age) 
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        onPatientAdded?.();
        setFormData({
          name: "",
          age: "",
          gender: "",
          dob: "",
          school: "",
          area: "",
          referredBy: "",
          phone: ""
        });
        setOpen(false);
        alert("Patient added successfully!");
      } else {
        alert(result.error || "Failed to add patient.");
      }
    } catch{
      return(alert("Failed to add patient."));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Patient
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter patient's full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School *</Label>
            <Input
              id="school"
              placeholder="School name"
              value={formData.school}
              onChange={(e) => handleChange("school", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area *</Label>
            <Input
              id="area"
              placeholder="Area/Location"
              value={formData.area}
              onChange={(e) => handleChange("area", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referredBy">Referred By *</Label>
            <Input
              id="referredBy"
              placeholder="Referrer name"
              value={formData.referredBy}
              onChange={(e) => handleChange("referredBy", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Adding Patient..." : "Add Patient"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}