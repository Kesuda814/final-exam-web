//src/app/api/auth/me/route.js

import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, printExceptionLog } from "@/lib/utils";

/**
 * Return the authenticated user from the JWT cookie
 */
export async function GET(request) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }
    return successResponse({ user }, 200);
  } catch (error) {
    printExceptionLog("auth me", error);
    return errorResponse("Internal Server Error", 500);
  }
}
