//src/app/api/course/[course_id]/enroll/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, printExceptionLog } from "@/lib/utils";

/**
 * Enroll a Student in a course. Business rules enforced server-side:
 * - Student role only
 * - Course status must be Open
 * - Seats must still be available (maxStudent)
 * - A Student cannot enroll in the same course more than once
 */
export async function POST(request, { params }) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }
    if (user.role !== "Student") {
      return errorResponse("Only Students can enroll in courses", 403);
    }

    const { course_id } = await params;
    if (!ObjectId.isValid(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const courses = db.collection("courses");
    const enrollments = db.collection("enrollments");

    const course = await courses.findOne({ _id: new ObjectId(course_id) });
    if (!course) {
      return errorResponse("Course not found", 404);
    }
    if (course.status === "Cancel") {
      return errorResponse("Course is cancelled", 400);
    }
    if (course.status !== "Open") {
      return errorResponse("Course is not open for enrollment", 400);
    }

    const existing = await enrollments.findOne({
      courseId: course_id,
      studentId: user.id,
    });
    if (existing) {
      return errorResponse("You are already enrolled in this course", 409);
    }

    const enrolledCount = await enrollments.countDocuments({
      courseId: course_id,
    });
    if (enrolledCount >= course.maxStudent) {
      return errorResponse("Course is full", 409);
    }

    await enrollments.insertOne({
      courseId: course_id,
      courseName: course.name,
      studentId: user.id,
      studentUsername: user.username,
      studentEmail: user.email,
      enrolledAt: new Date(),
    });

    return successResponse({ message: "Enrolled successfully" }, 201);
  } catch (error) {
    printExceptionLog("enroll", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function OPTIONS() {
  const { NextResponse } = await import("next/server");
  const { default: corsHeaders } = await import("@/lib/cors");
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
