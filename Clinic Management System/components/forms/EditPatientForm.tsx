"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Patient } from "./AddPatientForm";

export default function EditPatientForm({ 
  patient, 
  onPatientUpdated, 
  onCancel 
}: { 
  patient: Patient;
  onPatientUpdated: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age.toString(),
    gender: patient.gender,
    dob: patient.dob,
    school: patient.school,
    area: patient.area,
    referredBy: patient.referredBy,
    phone: patient.phone
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: patient.id,
          ...formData, 
          age: Number(formData.age) 
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        onPatientUpdated();
        alert("Patient updated successfully!");
      } else {
        alert(result.error || "Failed to update patient.");
      }
    } catch {
      return(alert("Failed to add patient."));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
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

      <div className="flex gap-2">
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Updating Patient..." : "Update Patient"}
        </Button>
        <Button 
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}