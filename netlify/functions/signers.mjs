import { getStore } from "@netlify/blobs";

const SITE_ID = "91f24b1a-b28c-4106-8605-bf377711565d";

export const handler = async () => {
  try {
    const store = getStore({
      name: "petition",
      siteID: SITE_ID,
      token: process.env.NETLIFY_FUNCTIONS_TOKEN,
    });
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signers: result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
