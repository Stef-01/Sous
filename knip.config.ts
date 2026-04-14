const config = {
  ignore: [
    "grants/**",
    "scripts/**",
    ".agents/**",
    "skills/**",
    // Feature-gated: Clerk auth avatar (re-enable for production)
    "src/components/shared/user-avatar.tsx",
  ],
  ignoreDependencies: [
    "postcss",
    "@testing-library/react",
    "@vitest/coverage-v8",
  ],
  entry: [
    "src/app/**/page.tsx",
    "src/app/**/layout.tsx",
    "src/app/**/route.ts",
  ],
};

export default config;
