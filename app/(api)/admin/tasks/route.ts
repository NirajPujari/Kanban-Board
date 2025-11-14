import { getDb } from "@db";

export async function GET() {
  const db = await getDb();
  const tasks = await db.collection("tasks").find().toArray();
  return Response.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();

  const { userId, header, desc, level, person, type } = body;

  // simple guardrails — minimum dignity for your database
  if ( !userId || !header || !type) {
    return new Response(
      JSON.stringify({ error: "Fields userId, header, and type are required" }),
      { status: 400 }
    );
  }

  // enforce valid task status
  const allowedTypes = ["To Do", "In Progress", "Done"];
  if (!allowedTypes.includes(type)) {
    return new Response(
      JSON.stringify({ error: `type must be one of: ${allowedTypes.join(", ")}` }),
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
    createdAt: new Date()
  };

  const result = await db.collection("tasks").insertOne(newTask);

  return Response.json({
    insertedId: result.insertedId,
    task: newTask
  });
}