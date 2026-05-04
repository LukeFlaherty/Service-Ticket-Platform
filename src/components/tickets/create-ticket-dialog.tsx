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

export function CreateTicketDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const reset = () => {
    setTitle(""); setDescription(""); setPriority("medium");
    setCustomerName(""); setCustomerEmail(""); setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createTicket({ title, description, priority, customerName, customerEmail });
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
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more detail…"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Customer name</Label>
              <Input
                id="cust-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-email">Customer email</Label>
              <Input
                id="cust-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="jane@co.com"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title}>
              {loading ? "Creating…" : "Create ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
