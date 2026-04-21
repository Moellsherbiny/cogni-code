"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Plus, Loader2 } from "lucide-react";
import { createMeetingAction } from "@/actions/meetings";
import { toast } from "sonner";


export function CreateMeetingDialog({ courses, onCreated }: { courses: any[], onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await createMeetingAction({
        title: formData.get("title") as string,
        courseId: formData.get("courseId") as string,
        scheduledAt: formData.get("scheduledAt") as string,
      });
      toast.success("Meeting scheduled!");
      setOpen(false);
      onCreated(); // Refresh dashboard data
    } catch (error) {
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary">
          <Video className="h-4 w-4" /> Start Live Class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Live Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Meeting Title</Label>
            <Input name="title" placeholder="e.g. Logic 101 Discussion" required />
          </div>
          <div className="space-y-2">
            <Label>Link to Course</Label>
            <Select name="courseId" required>
              <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Scheduled Time</Label>
            <Input name="scheduledAt" type="datetime-local" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
            Create Meeting
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}