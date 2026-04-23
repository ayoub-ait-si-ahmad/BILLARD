import { getStore } from "@netlify/blobs";

const BASE_COUNT = 24736;

export default async () => {
  try {
    const store = getStore("petition");
    const state = await store.get("state", { type: "json" });
    const count = state ? state.count : BASE_COUNT;
    return Response.json({ count });
  } catch (err) {
    console.error("count error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: "/api/count" };
