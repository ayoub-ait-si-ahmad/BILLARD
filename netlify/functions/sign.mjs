import { getStore } from "@netlify/blobs";

const BASE_COUNT = 24736;

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, city, email, price } = body || {};
  if (!name || !city) {
    return Response.json({ error: "name and city are required" }, { status: 400 });
  }

  try {
    const store = getStore("petition");
    const state = (await store.get("state", { type: "json" })) || {
      count: BASE_COUNT,
      signers: [],
    };

    state.signers.unshift({
      name: String(name).trim().slice(0, 120),
      city: String(city).trim().slice(0, 80),
      email: String(email || "").trim().slice(0, 200) || null,
      price: String(price || "").trim().slice(0, 60) || null,
      signed_at: Math.floor(Date.now() / 1000),
    });
    if (state.signers.length > 200) state.signers = state.signers.slice(0, 200);
    state.count += 1;

    await store.set("state", JSON.stringify(state));

    return Response.json({ count: state.count });
  } catch (err) {
    console.error("sign error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: "/api/sign" };
