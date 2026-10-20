//src/app/api/course/[course_id]/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { errorResponse, successResponse, printExceptionLog } from "@/lib/utils";

const COURSE_STATUSES = ["Open", "Close", "Cancel"];

function serializeCourse(course) {
  return {
    ...course,
    _id: course._id.toString(),
    createdAt: course.createdAt?.toISOString?.() ?? course.createdAt,
  };
}

/**
 * Specific course id API endpoints
 * GET:    course details (Teacher: own only, includes enrolled students;
 *         Student: visible unless Cancel, includes seats left)
 * PUT:    update own course (Teacher owner only)
 * DELETE: delete own course only when no Student has enrolled
 */
export async function GET(request, { params }) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }

    const { course_id } = await params;
    if (!ObjectId.isValid(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const course = await db
      .collection("courses")
      .findOne({ _id: new ObjectId(course_id) });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    if (user.role === "Teacher" && course.teacherId !== user.id) {
      return errorResponse("You can only view your own courses", 403);
    }
    if (user.role === "Student" && course.status === "Cancel") {
      return errorResponse("Course not found", 404);
    }

    const enrolled = await db
      .collection("enrollments")
      .find({ courseId: course_id })
      .toArray();

    const enrolledStudents =
      user.role === "Teacher"
        ? enrolled.map((e) => ({
            studentId: e.studentId,
            username: e.studentUsername,
            email: e.studentEmail,
            enrolledAt: e.enrolledAt?.toISOString?.() ?? e.enrolledAt,
          }))
        : undefined;

    return successResponse(
      {
        ...serializeCourse(course),
        enrolledCount: enrolled.length,
        seatsLeft: course.maxStudent - enrolled.length,
        enrolledStudents,
      },
      200,
    );
  } catch (error) {
    printExceptionLog("course detail", error);
    return errorResponse("Internal Server Error", 500);
  }
}
export async function PUT(request, { params }) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }
    if (user.role !== "Teacher") {
      return errorResponse("Only Teachers can update courses", 403);
    }

    const { course_id } = await params;
    if (!ObjectId.isValid(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const courses = db.collection("courses");

    const course = await courses.findOne({ _id: new ObjectId(course_id) });
    if (!course) {
      return errorResponse("Course not found", 404);
    }
    if (course.teacherId !== user.id) {
      return errorResponse("You can only update your own courses", 403);
    }

    const body = await request.json();
    const update = {};

    if (body.name !== undefined) update.name = body.name;
    if (body.durationDays !== undefined) {
      if (body.durationDays <= 0) {
        return errorResponse("durationDays must be positive", 400);
      }
      update.durationDays = Number(body.durationDays);
    }
    if (body.topics !== undefined) {
      if (!Array.isArray(body.topics)) {
        return errorResponse("topics must be an array", 400);
      }
      update.topics = body.topics;
    }
    if (body.price !== undefined) {
      if (body.price < 0) {
        return errorResponse("price must be non-negative", 400);
      }
      update.price = Number(body.price);
    }
    if (body.maxStudent !== undefined) {
      if (body.maxStudent <= 0) {
        return errorResponse("maxStudent must be positive", 400);
      }
      update.maxStudent = Number(body.maxStudent);
    }
    if (body.status !== undefined) {
      if (!COURSE_STATUSES.includes(body.status)) {
        return errorResponse("Status must be Open, Close or Cancel", 400);
      }
      update.status = body.status;
    }

    if (Object.keys(update).length === 0) {
      return errorResponse("No valid fields to update", 400);
    }

    const updated = await courses.findOneAndUpdate(
      { _id: new ObjectId(course_id) },
      { $set: update },
      { returnDocument: "after" },
    );

    return successResponse(serializeCourse(updated), 200);
  } catch (error) {
    printExceptionLog("course update", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }
    if (user.role !== "Teacher") {
      return errorResponse("Only Teachers can delete courses", 403);
    }

    const { course_id } = await params;
    if (!ObjectId.isValid(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const courses = db.collection("courses");

    const course = await courses.findOne({ _id: new ObjectId(course_id) });
    if (!course) {
      return errorResponse("Course not found", 404);
    }
    if (course.teacherId !== user.id) {
      return errorResponse("You can only delete your own courses", 403);
    }

    const enrolledCount = await db
      .collection("enrollments")
      .countDocuments({ courseId: course_id });

    if (enrolledCount > 0) {
      return errorResponse(
        "Cannot delete a course that has enrolled students",
        409,
      );
    }

    await courses.deleteOne({ _id: new ObjectId(course_id) });
    return successResponse({ message: "Course deleted" }, 200);
  } catch (error) {
    printExceptionLog("course delete", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function OPTIONS() {
  const { NextResponse } = await import("next/server");
  const { default: corsHeaders } = await import("@/lib/cors");
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
