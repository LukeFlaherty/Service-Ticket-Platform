"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/server/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const SERVICE_TYPES = [
  "Plumbing",
  "Electrical",
  "HVAC / Heating & Cooling",
  "Roofing",
  "Appliance Repair",
  "Pest Control",
  "Landscaping / Lawn Care",
  "Painting",
  "Flooring",
  "Carpentry / Handyman",
  "Cleaning / Maid Service",
  "Window & Door",
  "Pool & Spa",
  "Garage Door",
  "Gutters",
  "Other",
];

const PROPERTY_TYPES = [
  "Single Family Home",
  "Townhouse / Condo",
  "Apartment",
  "Mobile Home",
  "Commercial / Business",
  "Rental Property",
];

const TIME_WINDOWS = [
  "Morning (8am – 12pm)",
  "Afternoon (12pm – 5pm)",
  "Evening (5pm – 8pm)",
  "Flexible / Any Time",
];

const URGENCY_TO_PRIORITY = {
  "Emergency (2–4 hrs)": "urgent",
  "Same Day": "high",
  "Next Available": "medium",
  "Scheduled / No Rush": "low",
} as const;

type UrgencyKey = keyof typeof URGENCY_TO_PRIORITY;

const defaultState = () => ({
  // Customer
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  // Location
  serviceAddress: "",
  city: "",
  state: "",
  zip: "",
  propertyType: "",
  accessInstructions: "",
  // Service
  serviceType: "",
  problemSummary: "",
  problemDetail: "",
  // Scheduling
  urgency: "" as UrgencyKey | "",
  preferredDate: "",
  preferredWindow: "",
});

type FormState = ReturnType<typeof defaultState>;

export function CreateTicketDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(defaultState());

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const reset = () => {
    setForm(defaultState());
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceType) { setError("Please select a service type."); return; }
    if (!form.urgency) { setError("Please select urgency."); return; }
    setError("");
    setLoading(true);

    const title = `${form.serviceType} – ${form.problemSummary || "Service Request"}`;
    const priority = URGENCY_TO_PRIORITY[form.urgency as UrgencyKey] ?? "medium";
    const fullAddress = [form.serviceAddress, form.city, form.state, form.zip]
      .filter(Boolean)
      .join(", ");

    try {
      await createTicket({
        title,
        description: form.problemDetail || undefined,
        priority,
        customerName: form.customerName || undefined,
        customerEmail: form.customerEmail || undefined,
        customerPhone: form.customerPhone || undefined,
        dueAt: form.preferredDate || undefined,
        customFields: {
          serviceType: form.serviceType,
          serviceAddress: fullAddress || undefined,
          propertyType: form.propertyType || undefined,
          accessInstructions: form.accessInstructions || undefined,
          urgency: form.urgency || undefined,
          preferredWindow: form.preferredWindow || undefined,
        },
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Service Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">

          {/* ── Customer info ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Customer</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Full name *</Label>
                <Input id="customerName" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Jane Smith" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">Phone *</Label>
                <Input id="customerPhone" type="tel" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="(555) 000-0000" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} placeholder="jane@example.com" />
            </div>
          </section>

          {/* ── Service location ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Service Location</h3>
            <div className="space-y-1.5">
              <Label htmlFor="serviceAddress">Street address *</Label>
              <Input id="serviceAddress" value={form.serviceAddress} onChange={(e) => set("serviceAddress", e.target.value)} placeholder="123 Main St" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Austin" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="TX" maxLength={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="78701" maxLength={10} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Property type</Label>
                <Select value={form.propertyType} onValueChange={(v) => set("propertyType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="access">Access instructions</Label>
                <Input id="access" value={form.accessInstructions} onChange={(e) => set("accessInstructions", e.target.value)} placeholder="Gate code, key lockbox, dogs…" />
              </div>
            </div>
          </section>

          {/* ── Service details ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Service Details</h3>
            <div className="space-y-1.5">
              <Label>Service type *</Label>
              <Select value={form.serviceType} onValueChange={(v) => set("serviceType", v)}>
                <SelectTrigger><SelectValue placeholder="What kind of work?" /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="problemSummary">Problem summary *</Label>
              <Input id="problemSummary" value={form.problemSummary} onChange={(e) => set("problemSummary", e.target.value)} placeholder="e.g. Kitchen sink won't drain" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="problemDetail">Additional details</Label>
              <Textarea id="problemDetail" value={form.problemDetail} onChange={(e) => set("problemDetail", e.target.value)} placeholder="How long has it been happening? What have you already tried? Any relevant context…" rows={3} />
            </div>
          </section>

          {/* ── Scheduling ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Scheduling</h3>
            <div className="space-y-1.5">
              <Label>Urgency *</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(URGENCY_TO_PRIORITY) as UrgencyKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("urgency", key)}
                    className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                      form.urgency === key
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="preferredDate">Preferred date</Label>
                <Input id="preferredDate" type="date" value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred time</Label>
                <Select value={form.preferredWindow} onValueChange={(v) => set("preferredWindow", v)}>
                  <SelectTrigger><SelectValue placeholder="Any time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_WINDOWS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
