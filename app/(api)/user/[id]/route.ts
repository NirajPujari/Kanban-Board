import { getDb } from "@db";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(user);
}
