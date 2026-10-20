import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyJWT(req) {
  try {
    // 1. Try to get token from cookies
    let token = req.cookies.get("token")?.value;

    // 2. If no cookie, try to get it from the Authorization header
    // (This bypasses Vercel's cross-domain cookie blocking)
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return null;
    }

    // 3. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log("JWT Verify Error:", err.message);
    return null;
  }
}