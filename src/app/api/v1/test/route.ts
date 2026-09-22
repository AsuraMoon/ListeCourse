import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔥🔥🔥 TEST ROUTE APPELEE 🔥🔥🔥");

  return NextResponse.json({
    success: true,
    message: "TEST API OK",
  });
}