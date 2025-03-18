"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LeaveRequest = {
  id: number;
  fullName: string;
  position: string;
  email?: string | null;
  phoneNumber: string;
  leaveType: string; // SICK | PERSONAL | VACATION | OTHER
  reason: string;
  startDate: string; // ISO string from DB
  endDate: string; // ISO string from DB
  totalDays: number;
  attachment?: string | null;
  approvalStatus: "APPROVED" | "NOT_APPROVED";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch("/api/leave-requests", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setLeaveRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const filteredRequests = leaveRequests.filter((req) => {
    const matchesName = req.fullName
      .toLowerCase()
      .includes(searchName.toLowerCase());
    let matchesDate = true;
    if (searchDate) {
      const dateOnly = searchDate; // YYYY-MM-DD
      const start = req.startDate.slice(0, 10);
      const end = req.endDate.slice(0, 10);
      matchesDate = dateOnly >= start && dateOnly <= end;
    }
    return matchesName && matchesDate;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortOrder === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    try {
      const res = await fetch(`/api/leave-requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setLeaveRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id: number) => {
    const request = leaveRequests.find((req) => req.id === id);
    if (!request) return;
    if (request.approvalStatus !== "NOT_APPROVED") {
      alert("This request is not in a NOT_APPROVED status, cannot update.");
      return;
    }
    if (!window.confirm("Approve this leave request?")) return;
    try {
      const res = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: "APPROVED" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setLeaveRequests((prev) =>
        prev.map((req) => (req.id === id ? updated : req)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Leave Requests</h1>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-60"
        />
        <Input
          type="date"
          placeholder="Search by Date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="w-60"
        />
        <Select
          value={sortOrder}
          onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Sort: Newest First</SelectItem>
            <SelectItem value="asc">Sort: Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <table className="w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border border-gray-300">Full Name</th>
            <th className="p-2 border border-gray-300">Leave Type</th>
            <th className="p-2 border border-gray-300">Date Range</th>
            <th className="p-2 border border-gray-300">Created At</th>
            <th className="p-2 border border-gray-300">Approval Status</th>
            <th className="p-2 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRequests.map((req) => (
            <tr key={req.id}>
              <td className="p-2 border border-gray-300">{req.fullName}</td>
              <td className="p-2 border border-gray-300">{req.leaveType}</td>
              <td className="p-2 border border-gray-300">
                {req.startDate.slice(0, 10)} - {req.endDate.slice(0, 10)}
              </td>
              <td className="p-2 border border-gray-300">
                {new Date(req.createdAt).toLocaleString()}
              </td>
              <td className="p-2 border border-gray-300">
                {req.approvalStatus}
              </td>
              <td className="p-2 border border-gray-300 space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(req.id)}
                >
                  Delete
                </Button>
                {req.approvalStatus === "NOT_APPROVED" && (
                  <Button onClick={() => handleApprove(req.id)}>Approve</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
