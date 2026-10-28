import { defineConfig, globalIgnores } from "eslint/config";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * The previous config declared only `globalIgnores` and extended nothing, so `pnpm lint`
 * ran ESLint with no rules while still installing `eslint-config-next` and its 86
 * packages. This activates the config that was already being paid for.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "strava-external-api/**",
    ".tooling/**",
    // Generated from the committed Strava schema — not hand-edited.
    "src/generated/**",
  ]),
]);

export default eslintConfig;
