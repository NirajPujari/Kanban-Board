import { getDb } from "@db";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const db = await getDb();
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  await db.collection("users").updateOne(
    { _id: new ObjectId(user._id) },
    { $set: { lastLogin: new Date() } }
  );

  return Response.json({
    message: "Login successful",
    id: user._id,
  });
}
