const { getStore } = require("@netlify/blobs");

const BASE_COUNT = 24736;

exports.handler = async () => {
  try {
    const store = getStore("petition");
    const state = await store.get("state", { type: "json" });
    const count = state ? state.count : BASE_COUNT;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ count }),
    };
  } catch (err) {
    console.error("count error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
