import { getStore } from "@netlify/blobs";

export default async () => {
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

    return Response.json({ signers: result });
  } catch (err) {
    console.error("signers error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: "/api/signers" };
