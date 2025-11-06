import { BoardData } from "@/app/types";
import { getDb } from "@db";
import { ObjectId } from "mongodb";

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const taskId = pathParts[pathParts.length - 1];
  const body = await req.json();
  const db = await getDb();

  const allowedTypes = ["To Do", "In Progress", "Done"];

  const updateFields: Partial<BoardData> = {};

  if (body.header) updateFields.header = body.header.trim();
  if (body.desc) updateFields.desc = body.desc.trim();
  if (typeof body.level === "number") updateFields.level = body.level;
  if (body.person) updateFields.person = body.person.trim();

  if (body.type) {
    if (!allowedTypes.includes(body.type)) {
      return new Response(
        JSON.stringify({
          error: `type must be one of: ${allowedTypes.join(", ")}`,
        }),
        { status: 400 }
      );
    }
    updateFields.type = body.type;
  }

  const result = await db
    .collection("tasks")
    .updateOne({ _id: new ObjectId(taskId) }, { $set: updateFields });

  if (result.matchedCount === 0) {
    return new Response(JSON.stringify({ error: "Task not found" }), {
      status: 404,
    });
  }

  return Response.json({ message: "Task updated successfully" });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const taskId = pathParts[pathParts.length - 1];
  const db = await getDb();

  const result = await db
    .collection("tasks")
    .deleteOne({ _id: new ObjectId(taskId) });

  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ error: "Task not found" }), {
      status: 404,
    });
  }

  return Response.json({ message: "Task deleted successfully" });
}
