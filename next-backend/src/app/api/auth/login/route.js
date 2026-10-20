import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, successResponse, printExceptionLog } from "@/lib/utils";
import corsHeaders from "@/lib/cors";
import { NextResponse } from "next/server";

/**
 * Login: verify credentials, sign JWT, set HttpOnly cookie
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return errorResponse("Username and password are required", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const users = db.collection("users");

    const user = await users.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return errorResponse("Invalid username or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse("Invalid username or password", 401);
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        token: token, // <--- ADDED: Sends token to frontend
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    printExceptionLog("login", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}