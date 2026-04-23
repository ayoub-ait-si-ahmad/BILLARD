import { getStore } from "@netlify/blobs";

const BASE_COUNT = 24736;
const SITE_ID = "91f24b1a-b28c-4106-8605-bf377711565d";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { name, city, email, price } = body;
  if (!name || !city) {
    return { statusCode: 400, body: JSON.stringify({ error: "name and city are required" }) };
  }

  try {
    const store = getStore({
      name: "petition",
      siteID: SITE_ID,
      token: process.env.NETLIFY_FUNCTIONS_TOKEN,
    });

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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: state.count }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
