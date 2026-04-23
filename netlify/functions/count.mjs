import { getStore } from "@netlify/blobs";

const BASE_COUNT = 24736;

export const handler = async () => {
  try {
    const store = getStore("petition");
    const state = await store.get("state", { type: "json" });
    const count = state ? state.count : BASE_COUNT;
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    };
  } catch (err) {
    console.error("count error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
