import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, printExceptionLog } from "@/lib/utils";

/**
 * User API endpoints (protected)
 * GET: list users (authenticated)
 */
export async function GET(request) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    return successResponse(
      users.map((u) => ({ ...u, _id: u._id.toString() })),
      200
    );
  } catch (error) {
    printExceptionLog("user list", error);
    return errorResponse("Internal Server Error", 500);
  }
}