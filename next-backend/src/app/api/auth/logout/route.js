//src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";
import corsHeaders from "@/lib/cors";

/**
 * Logout: clear the auth cookie
 */
export async function POST() {
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200, headers: corsHeaders },
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

