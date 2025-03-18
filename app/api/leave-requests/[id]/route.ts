// app/api/leave-requests/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET: Fetch a single leave request
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(leaveRequest, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

// PATCH: Update a leave request
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const data = await request.json();
    const updatedLeaveRequest = await prisma.leaveRequest.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(updatedLeaveRequest, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

// DELETE: Delete a leave request
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    await prisma.leaveRequest.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
