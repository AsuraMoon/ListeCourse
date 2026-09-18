import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function parseBodySafe(req: Request) {
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("application/json")) return req.json();
  if (ct.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    return { username: form.get("username")?.toString() || "", password: form.get("password")?.toString() || "" };
  }
  const raw = await req.text();
  try { return JSON.parse(raw || "{}"); } catch { return Object.fromEntries(new URLSearchParams(raw || "")); }
}

export async function POST(req: Request) {
  try {
    console.log("LOGIN: raw body peek:", await req.clone().text());
    const { username, password } = await parseBodySafe(req);

    if (!username || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single();
    if (error || !user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const res = NextResponse.json({ success: true, userId: user.id });
    res.cookies.set("session", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    console.log("LOGIN: cookie set for user.id =", user.id);
    return res;
  } catch (err) {
    console.error("LOGIN: unexpected error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
