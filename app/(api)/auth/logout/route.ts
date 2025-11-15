import { serialize } from "cookie";

export async function POST() {
  const cookie = serialize("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  const res = Response.json({ success: true });
  res.headers.set("Set-Cookie", cookie);
  return res;
}