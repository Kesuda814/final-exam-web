// scripts/seed.js
// Seeds 3 Teacher users + 3 Student users. Run: node --env-file=.env.local scripts/seed.js
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "examDB";

const users = [
  { username: "teacher1", email: "teacher1@exam.com", role: "Teacher" },
  { username: "teacher2", email: "teacher2@exam.com", role: "Teacher" },
  { username: "teacher3", email: "teacher3@exam.com", role: "Teacher" },
  { username: "student1", email: "student1@exam.com", role: "Student" },
  { username: "student2", email: "student2@exam.com", role: "Student" },
  { username: "student3", email: "student3@exam.com", role: "Student" },
];

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db(dbName).collection("users");

  for (const u of users) {
    const hashed = await bcrypt.hash("password123", 10);
    await col.updateOne(
      { username: u.username },
      { $set: { ...u, password: hashed } },
      { upsert: true },
    );
    console.log(`Seeded ${u.role}: ${u.username} / password123`);
  }

  console.log("Seed complete. Total users:", await col.countDocuments());
  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
