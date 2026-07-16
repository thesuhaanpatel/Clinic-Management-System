// app/(admin)/membership-plans/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Loader2, CreditCard, FolderOpen } from "lucide-react";
import SimpleFooter from "@/components/SimpleFooter";

type MembershipPlan = {
  id: number;
  name: string;
  price: number;
  totalSessions: number;
  perSessionCost: number;
  isActive: boolean;
};

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    totalSessions: "",
    perSessionCost: "",
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/membership-plans", { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        console.error("API response is not an array:", data);
        setPlans([]);
      }
    } catch (e) {
      console.error("Failed to load membership plans", e);
      alert("Failed to load membership plans. Please check if the API endpoint is available.");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      totalSessions: plan.totalSessions.toString(),
      perSessionCost: plan.perSessionCost.toString(),
      isActive: plan.isActive
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      price: "",
      totalSessions: "",
      perSessionCost: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingPlan 
        ? `/api/membership-plans?id=${editingPlan.id}`
        : "/api/membership-plans";
      
      const method = editingPlan ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          totalSessions: parseInt(formData.totalSessions),
          perSessionCost: parseFloat(formData.perSessionCost),
          isActive: formData.isActive
        }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        fetchPlans();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save plan");
      }
    } catch (e) {
      console.error("Failed to save plan", e);
      alert("Failed to save plan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  // Safely filter plans - ensure plans is always treated as an array
  const filteredPlans = Array.isArray(plans) 
    ? plans.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Membership Plans</h1>
          <p className="text-gray-600 mt-1">Create and manage membership plans for your organization</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Plan
        </Button>
      </div>

      <Card className="overflow-hidden border shadow-sm rounded-lg">
        <CardHeader className="bg-gray-50 px-6 py-5 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">All Membership Plans</CardTitle>
              <CardDescription className="mt-1">
                {Array.isArray(plans) ? plans.length : 0} plan{plans.length !== 1 ? 's' : ''} total
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search plans..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading plans...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700 py-4 pl-6">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Price</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Sessions</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Per Session Cost</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <FolderOpen className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-lg font-medium text-gray-500 mb-1">
                            {searchTerm ? 'No matching plans found' : 'No plans created yet'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first plan'}
                          </p>
                          {!searchTerm && (
                            <Button 
                              variant="outline" 
                              className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={handleCreate}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create Plan
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlans.map((plan) => (
                      <TableRow key={plan.id} className="hover:bg-gray-50/70 border-b transition-colors">
                        <TableCell className="font-medium pl-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <span>{plan.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-semibold text-gray-900">₹{plan.price}</span>
                          <span className="text-gray-500 text-sm ml-1">/month</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center">
                            <span className="font-medium">{plan.totalSessions}</span>
                            <span className="text-gray-500 text-sm ml-1">sessions</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-semibold text-gray-900">₹{plan.perSessionCost}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            plan.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {plan.isActive ? (
                              <>
                                <div className="h-1.5 w-1.5 bg-green-600 rounded-full mr-1.5"></div>
                                Active
                              </>
                            ) : (
                              <>
                                <div className="h-1.5 w-1.5 bg-gray-500 rounded-full mr-1.5"></div>
                                Inactive
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex justify-end">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-9 gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-100"
                              onClick={() => handleEdit(plan)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingPlan 
                ? 'Update the membership plan details below.' 
                : 'Add a new membership plan to your system.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Plan Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Basic Package"
                  className="py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-gray-700 font-medium">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    className="py-2"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="totalSessions" className="text-gray-700 font-medium">Total Sessions</Label>
                  <Input
                    id="totalSessions"
                    name="totalSessions"
                    type="number"
                    min="1"
                    value={formData.totalSessions}
                    onChange={handleInputChange}
                    required
                    placeholder="10"
                    className="py-2"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="perSessionCost" className="text-gray-700 font-medium">Per Session Cost (₹)</Label>
                <Input
                  id="perSessionCost"
                  name="perSessionCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.perSessionCost}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                  className="py-2"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive" className="text-gray-700 font-medium cursor-pointer">Active Plan</Label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={formLoading}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <SimpleFooter/>
    </div>
  );
}