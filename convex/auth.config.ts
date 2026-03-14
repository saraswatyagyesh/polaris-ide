export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://heroic-kite-16.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};
