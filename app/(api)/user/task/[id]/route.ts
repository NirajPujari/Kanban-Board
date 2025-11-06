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

  // Step 1: Check if user exists
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Step 2: Fetch tasks belonging to user
  const tasks = await db.collection("tasks").find({ userId: id }).toArray();

  if (!tasks.length) {
    return Response.json(
      { message: "User exists, but no tasks found", tasks: [] },
      { status: 200 }
    );
  }

  return Response.json({ tasks });
}

export async function POST(req: Request) {
  const body = await req.json();
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const userId = pathParts[pathParts.length - 1];
  const { header, desc, level, person, type } = body;

  // simple guardrails — minimum dignity for your database
  if (!userId || !header || !type) {
    return new Response(
      JSON.stringify({
        error: "Fields userId, header, and type are required",
      }),
      { status: 400 }
    );
  }

  // enforce valid task status
  const allowedTypes = ["To Do", "In Progress", "Done"];
  if (!allowedTypes.includes(type)) {
    return new Response(
      JSON.stringify({
        error: `type must be one of: ${allowedTypes.join(", ")}`,
      }),
      { status: 400 }
    );
  }

  const db = await getDb();

  const newTask = {
    userId,
    header: header.trim(),
    desc: desc?.trim() || "",
    level: Number(level) || 0,
    person: person?.trim() || "",
    type,
    createdAt: new Date(),
  };

  const result = await db.collection("tasks").insertOne(newTask);

  return Response.json({
    insertedId: result.insertedId,
    task: newTask,
  });
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const taskId = pathParts[pathParts.length - 1];
  const body = await req.json();
  const { userId, header, desc, level, person, type, createdAt } = body;

  if (!ObjectId.isValid(taskId) || !userId) {
    return Response.json(
      { error: "Invalid taskId or userid" },
      { status: 400 }
    );
  }

  const allowedTypes = ["To Do", "In Progress", "Done"];
  if (type && !allowedTypes.includes(type)) {
    return Response.json(
      { error: `type must be one of: ${allowedTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const db = await getDb();

  // verify the user exists
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // build update object only from provided values
  const update = {
    _id: new ObjectId(taskId),
    userId,
    ...(header && { header: header.trim() }),
    ...(desc && { desc: desc.trim() }),
    ...(level !== undefined && { level: Number(level) || 0 }),
    ...(person && { person: person.trim() }),
    ...(type && { type }),
    createdAt,
  };

  if (!Object.keys(update).length) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const result = await db
    .collection("tasks")
    .updateOne({ _id: new ObjectId(taskId), userId: userId }, { $set: update });

  if (result.matchedCount === 0) {
    return Response.json(
      { error: "Task not found for this user" },
      { status: 404 }
    );
  }

  return Response.json({
    message: "Task updated",
    update,
  });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const taskId = pathParts[pathParts.length - 1];

  if (!ObjectId.isValid(taskId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const db = await getDb();

  // verify task exists and belongs to user
  const task = await db.collection("tasks").findOne({
    _id: new ObjectId(taskId),
  });

  if (!task) {
    return Response.json(
      { error: "Task not found or doesn't belong to this user" },
      { status: 404 }
    );
  }

  await db.collection("tasks").deleteOne({ _id: new ObjectId(taskId) });

  return Response.json({ message: "Task deleted" });
}
