"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { addDays, format, differenceInDays, isBefore, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"

// ShadCN UI components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Preprocessor to convert input into a Date object
const toDate = (arg: unknown) => {
  if (typeof arg === "string" || arg instanceof Date) {
    const d = new Date(arg)
    if (!isNaN(d.getTime())) return d
  }
  return arg
}

// Using superRefine to combine all date validations
const createLeaveRequestSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    position: z.string().min(1, "Position is required"),
    email: z.string().email("Invalid email").optional(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    leaveType: z.enum(["SICK", "PERSONAL", "VACATION", "OTHER"]),
    reason: z.string().min(1, "Reason is required"),
    dateRange: z.object({
      from: z.preprocess(toDate, z.date()),
      to: z.preprocess(toDate, z.date()),
    }),
  })
  .superRefine((data, ctx) => {
    const today = startOfDay(new Date())
    const from = startOfDay(data.dateRange.from)
    const to = startOfDay(data.dateRange.to)

    // ไม่อนุญาติให้บันทึกวันลาย้อนหลัง
    if (isBefore(from, today)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "ไม่อนุญาติให้บันทึกวันลาย้อนหลัง",
        path: ["dateRange", "from"],
      })
    }

    // เฉพาะกรณีพักร้อน
    if (data.leaveType === "VACATION") {
      // ลาล่วงหน้าอย่างน้อย 3 วัน
      if (differenceInDays(from, today) < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "กรณีพักร้อนลาล่วงหน้าอย่างน้อย 3 วัน",
          path: ["dateRange", "from"],
        })
      }
      // ลาติดต่อกันได้ไม่เกิน 2 วัน (to - from + 1 <= 2)
      if (differenceInDays(to, from) > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "กรณีพักร้อนลาติดต่อกันได้ไม่เกิน 2 วัน",
          path: ["dateRange", "to"],
        })
      }
    }
  })

type CreateLeaveRequestSchema = z.infer<typeof createLeaveRequestSchema>

export default function CreateLeaveRequestForm() {
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")

  const form = useForm<CreateLeaveRequestSchema>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      fullName: "",
      position: "",
      email: "",
      phoneNumber: "",
      leaveType: "SICK",
      reason: "",
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 1),
      },
    },
  })

  // onError callback to display Dialog with validation errors
  function onError(errors: any) {
    // Check errors from nested dateRange object
    if (errors.dateRange?.from) {
      setDialogMessage(errors.dateRange.from.message)
    } else if (errors.dateRange?.to) {
      setDialogMessage(errors.dateRange.to.message)
    } else {
      setDialogMessage("Please fix the errors in the form.")
    }
    setOpenDialog(true)
  }

  // Submit handler: transform dateRange into startDate and endDate for the payload
  async function onSubmit(values: CreateLeaveRequestSchema) {
    try {
      const payload = {
        fullName: values.fullName,
        position: values.position,
        email: values.email,
        phoneNumber: values.phoneNumber,
        leaveType: values.leaveType,
        reason: values.reason,
        startDate: values.dateRange.from,
        endDate: values.dateRange.to,
      }
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error("Failed to create leave request")
      }
      form.reset()
      alert("Leave request created successfully!")
    } catch (error) {
      console.error(error)
      setDialogMessage("Something went wrong while submitting your leave request.")
      setOpenDialog(true)
    }
  }

  return (
    <>
      {/* Dialog to display validation errors */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation Error</DialogTitle>
            <p className="text-red-500">{dialogMessage}</p>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Position */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="123-456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Leave Type */}
          <FormField
            control={form.control}
            name="leaveType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leave Type</FormLabel>
                <FormControl>
                  <select {...field} className="input">
                    <option value="SICK">Sick Leave</option>
                    <option value="PERSONAL">Personal Leave</option>
                    <option value="VACATION">Vacation</option>
                    <option value="OTHER">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Range Picker */}
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Range</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className="w-[300px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} -{" "}
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value?.from || new Date()}
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reason */}
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Leave</FormLabel>
                <FormControl>
                  <Input placeholder="Vacation, Personal, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  )
}
