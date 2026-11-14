import { defineConfig } from "vitest/config";

// Keep tests hermetic: never touch a real database or a real JWT secret even
// when server/.env is present for local development.
export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "",
      JWT_SECRET: "sabisafe-test-secret-not-used-outside-tests",
      NEAR_AI_API_KEY: "",
      AURORA_REGISTRY_ADDRESS: "",
    },
    include: ["test/**/*.test.js"],
  },
});
