// app/api/leave-requests/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all leave requests
export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany()
    return NextResponse.json(leaveRequests, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// POST: Create a new leave request
export async function POST(request: Request) {
    try {
      const data = await request.json()
      const newLeaveRequest = await prisma.leaveRequest.create({
        data,
      })
      return NextResponse.json(newLeaveRequest, { status: 201 })
    } catch (error) {
      console.error("API Error:", error)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
  }