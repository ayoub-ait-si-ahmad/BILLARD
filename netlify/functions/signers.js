const { getStore } = require("@netlify/blobs");

exports.handler = async () => {
  try {
    const store = getStore("petition");
    const state = await store.get("state", { type: "json" });
    const signers = state ? state.signers : [];

    const now = Math.floor(Date.now() / 1000);
    const result = signers.slice(0, 20).map((s) => ({
      name: s.name,
      city: s.city,
      mins: Math.floor((now - s.signed_at) / 60),
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ signers: result }),
    };
  } catch (err) {
    console.error("signers error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
