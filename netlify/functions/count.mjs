import { getStore } from "@netlify/blobs";

const BASE_COUNT = 24736;
const SITE_ID = "91f24b1a-b28c-4106-8605-bf377711565d";

export const handler = async () => {
  try {
    const store = getStore({
      name: "petition",
      siteID: SITE_ID,
      token: process.env.NETLIFY_FUNCTIONS_TOKEN,
    });
    const state = await store.get("state", { type: "json" });
    const count = state ? state.count : BASE_COUNT;
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
