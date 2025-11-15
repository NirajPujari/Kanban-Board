import { hashPassword } from "@/app/utils/auth";
import { getDb } from "@db";

export async function GET() {
  const db = await getDb();
  const users = await db.collection("users").find().toArray();
  return Response.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();

  // Quick gatekeeping so garbage doesn't enter your DB
  if (!body.name || !body.email || !body.password) {
    return new Response(
      JSON.stringify({ error: "name, email, and password are required" }),
      { status: 400 }
    );
  }

  const db = await getDb();

  // Hash password before storing
  const hashedPassword = await hashPassword(body.password);

  const newUser = {
    name: body.name.trim(),
    email: body.email.toLowerCase().trim(),
    password: hashedPassword,
    createdAt: new Date(),
    lastLogin: null,
  };

  const result = await db.collection("users").insertOne(newUser);
  const response = { _id: result.insertedId, ...newUser };

  return Response.json(response);
}
