//src/app/api/course/route.js

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
 * Course endpoints
 * GET:  Teacher -> own courses | Student -> all except Cancel (+ ?search= filter)
 * POST: Teacher only -> create course
 */
export async function GET(request) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const courses = db.collection("courses");

    if (user.role === "Teacher") {
      const list = await courses
        .find({ teacherId: user.id })
        .sort({ createdAt: -1 })
        .toArray();
      return successResponse(list.map(serializeCourse), 200);
    }

    // Student: all courses except Cancel, filter by course name or teacher name
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    const query = { status: { $ne: "Cancel" } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { teacherUsername: { $regex: search, $options: "i" } },
      ];
    }

    const list = await courses.find(query).sort({ createdAt: -1 }).toArray();
    return successResponse(list.map(serializeCourse), 200);
  } catch (error) {
    printExceptionLog("course list", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(request) {
  try {
    const user = verifyJWT(request);
    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }
    if (user.role !== "Teacher") {
      return errorResponse("Only Teachers can create courses", 403);
    }

    const body = await request.json();
    const { name, durationDays, topics, price, maxStudent, status } = body;

    if (!name || durationDays == null || price == null || maxStudent == null) {
      return errorResponse(
        "name, durationDays, price and maxStudent are required",
        400,
      );
    }
    if (durationDays <= 0 || maxStudent <= 0 || price < 0) {
      return errorResponse(
        "durationDays and maxStudent must be positive, price non-negative",
        400,
      );
    }
    const courseStatus = status || "Open";
    if (!COURSE_STATUSES.includes(courseStatus)) {
      return errorResponse("Status must be Open, Close or Cancel", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const result = await db.collection("courses").insertOne({
      name,
      durationDays: Number(durationDays),
      topics: Array.isArray(topics) ? topics : [],
      price: Number(price),
      maxStudent: Number(maxStudent),
      status: courseStatus,
      teacherId: user.id,
      teacherUsername: user.username,
      createdAt: new Date(),
    });

    const course = await db
      .collection("courses")
      .findOne({ _id: result.insertedId });
    return successResponse(serializeCourse(course), 201);
  } catch (error) {
    printExceptionLog("course create", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function OPTIONS() {
  const { NextResponse } = await import("next/server");
  const { default: corsHeaders } = await import("@/lib/cors");
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
