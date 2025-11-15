import { getDb } from "@db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { userName, email, password } = await req.json();

  try {
    const db = await getDb();

    // Check if email already exists — basic sanity
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name: userName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null,
    };

    const result = await db.collection("users").insertOne(user);

    return new Response(
      JSON.stringify({
        success: true,
        id: result.insertedId,
        user: {
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
