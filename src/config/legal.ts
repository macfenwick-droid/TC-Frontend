/**
 * Privacy Policy and Terms are hosted on Termly (same documents the current site opens).
 * `/privacy` and `/terms` redirect here (next.config.ts) so old links and emails keep working.
 */
export const legalUrls = {
  privacy: "https://app.termly.io/policy-viewer/policy.html?policyUUID=0e12c82c-a1a3-49d6-a603-4e0a5ca4841a",
  terms: "https://app.termly.io/policy-viewer/policy.html?policyUUID=43c2dddf-2d54-4419-b935-999233d711d3",
} as const;
