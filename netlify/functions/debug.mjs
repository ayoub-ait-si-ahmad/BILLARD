import { getStore } from "@netlify/blobs";

const SITE_ID = "91f24b1a-b28c-4106-8605-bf377711565d";

export const handler = async () => {
  const info = {
    hasContext: !!process.env.NETLIFY_BLOBS_CONTEXT,
    hasFunctionsToken: !!process.env.NETLIFY_FUNCTIONS_TOKEN,
    hasAuthToken: !!process.env.NETLIFY_AUTH_TOKEN,
  };

  // Test with NETLIFY_FUNCTIONS_TOKEN
  try {
    const store = getStore({
      name: "petition",
      siteID: SITE_ID,
      token: process.env.NETLIFY_FUNCTIONS_TOKEN,
    });
    await store.get("state", { type: "json" });
    info.functionsTokenWorks = true;
  } catch (e) {
    info.functionsTokenError = e.message;
  }

  // Test with NETLIFY_AUTH_TOKEN (personal access token)
  if (process.env.NETLIFY_AUTH_TOKEN) {
    try {
      const store = getStore({
        name: "petition",
        siteID: SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
      });
      await store.get("state", { type: "json" });
      info.authTokenWorks = true;
    } catch (e) {
      info.authTokenError = e.message;
    }
  } else {
    info.authTokenError = "NETLIFY_AUTH_TOKEN env var not set";
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info, null, 2),
  };
};
