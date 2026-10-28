/**
 * Regenerates the committed Strava API schema.
 *
 * The output (src/generated/strava-schema.d.ts) is COMMITTED, so neither the build nor
 * a fresh clone needs network access, a JVM, or a code generator. Run this manually when
 * Strava changes its API and commit both artefacts:
 *
 *   pnpm generate:api
 *
 * This replaces the previous `openapi-generator-cli` step (a Java toolchain that
 * produced 12,141 lines of runtime client code for the two endpoints this app calls).
 */
import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import swagger2openapi from "swagger2openapi";

const root = fileURLToPath(new URL("..", import.meta.url));
const SOURCE = "https://developers.strava.com/swagger/swagger.json";
const CONVERTED = `${root}src/generated/strava.openapi.json`;
const SCHEMA = `${root}src/generated/strava-schema.d.ts`;
const SPORT_TYPES = `${root}src/generated/strava-sport-types.ts`;

async function main() {
  const swagger = await (await fetch(SOURCE)).json();

  if (swagger.swagger !== "2.0") {
    throw new Error(`Expected a Swagger 2.0 document, got ${swagger.swagger}`);
  }

  // openapi-typescript only consumes OpenAPI 3.x; Strava still publishes Swagger 2.0.
  const { openapi } = await swagger2openapi.convertObj(swagger, {
    patch: true,
    warnOnly: true,
  });

  await writeFile(CONVERTED, `${JSON.stringify(openapi, null, 2)}\n`);

  // Emit types only — there is no runtime to tree-shake.
  // Types only. Date-times stay as ISO strings, which is what the client maps from.
  const ast = await openapiTS(openapi);

  const header = `// GENERATED FILE — do not edit.\n// Source: ${SOURCE}\n// Regenerate with: pnpm generate:api\n\n`;
  await writeFile(SCHEMA, header + astToString(ast));

  // The only Strava "enum" this app needs at runtime. Emitted here so it can never
  // drift from the schema (it previously lived in a stale hand-committed client).
  const sports = openapi.components?.schemas?.SportType?.enum;
  if (!Array.isArray(sports) || sports.length === 0) {
    throw new Error("SportType enum missing from the converted schema");
  }
  const members = sports.map((sport) => `  ${sport}: ${JSON.stringify(sport)},`).join("\n");
  await writeFile(
    SPORT_TYPES,
    `${header}export const SportType = {\n${members}\n} as const;\n\nexport type SportType = (typeof SportType)[keyof typeof SportType];\n`,
  );

  for (const file of [SCHEMA, SPORT_TYPES]) {
    console.log(`wrote ${file} (${(await readFile(file)).length} bytes)`);
  }
  console.log(`wrote ${CONVERTED}`);
  console.log(`SportType members: ${sports.length}`);
}

await main();
