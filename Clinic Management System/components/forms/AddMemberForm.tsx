'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, UserPlus, X, IndianRupee } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  dob: string;
  school: string;
  area: string;
  referredBy: string;
  phone: string;
}

interface Toast {
  id: string;
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}

interface MembershipPlan {
  id: number;
  name: string;
  price: number;
  totalSessions: number;
  isActive: boolean;
}

export default function AddMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [membershipFormData, setMembershipFormData] = useState({
    planId: '',
    remainingSessions: ''
  });

  // Fetch patients and membership plans from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPatients(true);
        setLoadingPlans(true);

        // Fetch patients
        const patientsResponse = await fetch('/api/patients');
        if (!patientsResponse.ok) throw new Error('Failed to load patients');
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);

        // Fetch membership plans
        const plansResponse = await fetch('/api/membership-plans');
        if (!plansResponse.ok) throw new Error('Failed to load membership plans');
        const plansData = await plansResponse.json();
        // Filter only active plans
        const activePlans = plansData.filter((plan: MembershipPlan) => plan.isActive);
        setMembershipPlans(activePlans);

      } catch (error) {
        console.error('Error fetching data:', error);
        showToast(
          'Error', 
          error instanceof Error ? error.message : 'Failed to load data', 
          'destructive'
        );
      } finally {
        setLoadingPlans(false);
        setLoadingPatients(false);
      }
    };

    fetchData();
  });

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleMembershipInputChange = (name: string, value: string) => {
    setMembershipFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set remaining sessions when a plan is selected
    if (name === 'planId') {
      const selectedPlan = membershipPlans.find(plan => plan.id.toString() === value);
      if (selectedPlan) {
        setMembershipFormData(prev => ({
          ...prev,
          remainingSessions: selectedPlan.totalSessions.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!selectedPatientId) {
        throw new Error('Please select a patient');
      }
      if (!membershipFormData.planId) {
        throw new Error('Please select a membership plan');
      }

      const selectedPlan = membershipPlans.find(plan => 
        plan.id.toString() === membershipFormData.planId
      );
      
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // 1. First create the membership
      const membershipResponse = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: parseInt(selectedPatientId),
          planId: parseInt(membershipFormData.planId),
          remainingSessions: parseInt(membershipFormData.remainingSessions) || selectedPlan.totalSessions
        }),
      });

      if (!membershipResponse.ok) {
        const errorData = await membershipResponse.json();
        throw new Error(errorData.error || 'Failed to create membership');
      }

      const membershipData = await membershipResponse.json();
      
      if (!membershipData.success) {
        throw new Error('Failed to create membership');
      }

      // 2. Record the revenue transaction for membership purchase
      try {
        const revenueResponse = await fetch('/api/revenue/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'membership',
            amount: selectedPlan.price,
            paymentMethod: paymentMethod,
            paymentDate: paymentDate,
            description: `Membership: ${selectedPlan.name} - ${selectedPlan.totalSessions} sessions`,
            patientId: parseInt(selectedPatientId),
            membershipId: membershipData.member.id
          }),
        });

        if (!revenueResponse.ok) {
          const errorData = await revenueResponse.json();
          console.warn('Failed to record revenue:', errorData);
          showToast(
            'Warning', 
            'Member added successfully but revenue recording failed.',
            'default'
          );
        } else {
          showToast('Success!', `Patient enrolled and ₹${selectedPlan.price} revenue recorded.`);
        }
      } catch (revenueError) {
        console.warn('Revenue recording error:', revenueError);
        showToast(
          'Warning', 
          'Member added but revenue recording failed.',
          'default'
        );
      }

      // Redirect to members list
      setTimeout(() => {
        router.push('/members');
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      showToast(
        'Error', 
        error instanceof Error ? error.message : 'Failed to add member.', 
        'destructive'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlan = membershipPlans.find(plan => plan.id.toString() === membershipFormData.planId);
  const selectedPatient = patients.find(patient => patient.id.toString() === selectedPatientId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md border min-w-80 ${
              toast.variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-background text-foreground border-border'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">{toast.title}</h4>
              <button 
                onClick={() => removeToast(toast.id)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm">{toast.description}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
          <p className="text-muted-foreground">
            Select an existing patient and enroll them in a membership plan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
              <CardDescription>
                Choose an existing patient to enroll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  value={selectedPatientId}
                  onValueChange={setSelectedPatientId}
                  required
                  disabled={isLoading || loadingPatients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name} - {patient.phone} ({patient.age} years)
                      </SelectItem>
                    ))}
                    {patients.length === 0 && !loadingPatients && (
                      <SelectItem value="none" disabled>
                        No patients available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {loadingPatients && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading patients...
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Patient Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedPatient.name}</p>
                    <p><span className="font-medium">Age:</span> {selectedPatient.age}</p>
                    <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
                    <p><span className="font-medium">Phone:</span> {selectedPatient.phone}</p>
                    <p><span className="font-medium">School:</span> {selectedPatient.school || 'N/A'}</p>
                    <p><span className="font-medium">Area:</span> {selectedPatient.area || 'N/A'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Membership & Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Membership & Payment</CardTitle>
              <CardDescription>
                Select a membership plan and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planId">Membership Plan *</Label>
                <Select
                  value={membershipFormData.planId}
                  onValueChange={(value) => handleMembershipInputChange('planId', value)}
                  required
                  disabled={isLoading || loadingPlans}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPlans ? "Loading plans..." : "Select a membership plan"} />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} - {plan.totalSessions} sessions (₹{plan.price})
                      </SelectItem>
                    ))}
                    {membershipPlans.length === 0 && !loadingPlans && (
                      <SelectItem value="none" disabled>
                        No active plans available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {loadingPlans && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading plans...
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="remainingSessions">Remaining Sessions</Label>
                <Input
                  id="remainingSessions"
                  name="remainingSessions"
                  type="number"
                  value={membershipFormData.remainingSessions}
                  onChange={(e) => handleMembershipInputChange('remainingSessions', e.target.value)}
                  disabled={isLoading || !membershipFormData.planId}
                  min="0"
                  max={selectedPlan?.totalSessions}
                />
                <p className="text-xs text-muted-foreground">
                  Defaults to plan total sessions. Adjust if needed.
                </p>
              </div>

              {/* Payment Information */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Payment Details</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    disabled={isLoading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {selectedPlan && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-800 flex items-center">
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {selectedPlan.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      This amount will be recorded in revenue reports
                    </p>
                  </div>
                )}
              </div>

              {selectedPlan && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Plan Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Plan:</span> {selectedPlan.name}</p>
                    <p><span className="font-medium">Total Sessions:</span> {selectedPlan.totalSessions}</p>
                    <p><span className="font-medium">Price:</span> ₹{selectedPlan.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || membershipPlans.length === 0 || patients.length === 0}
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Member...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member & Record Revenue
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}