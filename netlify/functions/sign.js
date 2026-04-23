const { getStore } = require("@netlify/blobs");

const BASE_COUNT = 24736;

exports.handler = async (event) => {
  // Handle CORS preflight
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
    const store = getStore("petition");

    // Read current state
    const state = (await store.get("state", { type: "json" })) || {
      count: BASE_COUNT,
      signers: [],
    };

    // Add new signer
    const newSigner = {
      name: String(name).trim().slice(0, 120),
      city: String(city).trim().slice(0, 80),
      email: String(email || "").trim().slice(0, 200) || null,
      price: String(price || "").trim().slice(0, 60) || null,
      signed_at: Math.floor(Date.now() / 1000),
    };

    state.signers.unshift(newSigner);
    if (state.signers.length > 200) state.signers = state.signers.slice(0, 200);
    state.count += 1;

    // Save updated state
    await store.set("state", JSON.stringify(state));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ count: state.count }),
    };
  } catch (err) {
    console.error("sign error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
