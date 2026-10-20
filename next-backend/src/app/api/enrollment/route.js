//src/app/api/enrollment/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, printExceptionLog } from "@/lib/utils";

/**
 * Enrollment endpoints (Student)
 * GET: list the courses the authenticated Student is enrolled in
 */
export async function GET(request) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }
    if (user.role !== "Student") {
      return errorResponse("Only Students have enrollments", 403);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const list = await db
      .collection("enrollments")
      .find({ studentId: user.id })
      .sort({ enrolledAt: -1 })
      .toArray();

    return successResponse(
      list.map((e) => ({
        ...e,
        _id: e._id.toString(),
        enrolledAt: e.enrolledAt?.toISOString?.() ?? e.enrolledAt,
      })),
      200,
    );
  } catch (error) {
    printExceptionLog("enrollment list", error);
    return errorResponse("Internal Server Error", 500);
  }
}
