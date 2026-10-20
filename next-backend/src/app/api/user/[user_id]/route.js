//src/app/api/user/[user_id]/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, printExceptionLog } from "@/lib/utils";

/**
 * Specific user id endpoints (protected)
 * GET: get one user by id (authenticated)
 */
export async function GET(request, { params }) {
  try {
    const auth = verifyJWT(request);
    if (!auth) {
      return errorResponse("Unauthorized Request", 401);
    }

    const { user_id } = await params;
    if (!ObjectId.isValid(user_id)) {
      return errorResponse("Invalid user id", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id) }, { projection: { password: 0 } });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ ...user, _id: user._id.toString() }, 200);
  } catch (error) {
    printExceptionLog("user detail", error);
    return errorResponse("Internal Server Error", 500);
  }
}
