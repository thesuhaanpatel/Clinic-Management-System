"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import AddPatientForm, { Patient } from "@/components/forms/AddPatientForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditPatientForm from "@/components/forms/EditPatientForm";
import SimpleFooter from "@/components/SimpleFooter";

export default function ReceptionistPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients", { cache: "no-store" });
      if (res.ok) {
        const data: Patient[] = await res.json();
        setPatients(data);
      } else {
        console.error("Failed to load patients");
      }
    } catch (e) {
      console.error("Failed to load patients", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    setIsMounted(true);
  }, []);

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setEditDialogOpen(true);
  };

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Pagination
  const pageCount = Math.ceil(filteredPatients.length / pageSize);
  const rows = useMemo(
    () => filteredPatients.slice(page * pageSize, page * pageSize + pageSize),
    [filteredPatients, page]
  );

  useEffect(() => {
    if (page > 0 && page >= pageCount) setPage(pageCount - 1);
  }, [page, pageCount]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients (Receptionist)</h1>
          <p className="text-gray-600">View, edit, and add patient information</p>
        </div>
        <AddPatientForm onPatientAdded={fetchPatients} />
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Records
              </CardTitle>
              <CardDescription>
                {patients.length} patient{patients.length !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search patients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                suppressHydrationWarning // Prevents hydration warnings
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading patients...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        {searchTerm ? "No patients found matching your search" : "No patients yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((p) => (
                      <TableRow key={p.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell className="capitalize">{p.gender}</TableCell>
                        <TableCell>{p.phone}</TableCell>
                        <TableCell>{p.area}</TableCell>
                        <TableCell>{p.dob}</TableCell>
                        <TableCell>{p.school}</TableCell>
                        <TableCell>{p.referredBy}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(p)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {filteredPatients.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {rows.length === 0 ? 0 : page * pageSize + 1}–
                {Math.min((page + 1) * pageSize, filteredPatients.length)} of{" "}
                {filteredPatients.length} patients
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

      {/* Edit Patient Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <EditPatientForm
              patient={editingPatient}
              onPatientUpdated={() => {
                fetchPatients();
                setEditDialogOpen(false);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <SimpleFooter/>
    </div>
  );
}