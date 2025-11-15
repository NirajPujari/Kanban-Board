import { getDb } from "@db";
import { ObjectId } from "mongodb";
import { User } from "@types";
import { hashPassword } from "@/app/utils/auth";

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const userId = pathParts[pathParts.length - 1];
  const body = await req.json();
  const db = await getDb();

  const updateFields: Partial<User> = {};

  if (body.name) updateFields.name = body.name.trim();
  if (body.email) updateFields.email = body.email.toLowerCase().trim();

  // Hash only if password is sent
  if (body.password) {
    updateFields.password = await hashPassword(body.password);
  }

  const result = await db
    .collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: updateFields });

  if (result.matchedCount === 0) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  return Response.json({ message: "User updated successfully", password: updateFields.password });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const userId = pathParts[pathParts.length - 1];
  const db = await getDb();

  const result = await db.collection("users").deleteOne({
    _id: new ObjectId(userId),
  });

  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  return Response.json({ message: "User deleted successfully" });
}