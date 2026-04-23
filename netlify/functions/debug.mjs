import { getStore } from "@netlify/blobs";

export const handler = async () => {
  const info = {
    hasContext: !!process.env.NETLIFY_BLOBS_CONTEXT,
    siteId: process.env.SITE_ID || process.env.NETLIFY_SITE_ID || "not set",
    netlifyEnvVars: Object.keys(process.env).filter(k => k.startsWith("NETLIFY")),
  };

  try {
    const store = getStore("petition");
    info.getStoreOk = true;
    try {
      const state = await store.get("state", { type: "json" });
      info.storeGetOk = true;
      info.stateExists = !!state;
    } catch (e) {
      info.storeGetError = e.message;
    }
  } catch (e) {
    info.getStoreError = e.message;
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info, null, 2),
  };
};
