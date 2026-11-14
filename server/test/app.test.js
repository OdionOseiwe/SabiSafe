import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("API smoke tests (no database needed)", () => {
  it("reports health", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("sabisafe-api");
  });

  it("publishes public Aurora config without secrets", async () => {
    const response = await request(app).get("/api/config").expect(200);
    expect(response.body.network).toBe("aurora-testnet");
    expect(response.body.networkLabel).toBe("Aurora Testnet");
    expect(response.body.chainId).toBe(1313161555);
    expect(response.body.testnet).toBe(true);
    expect(response.body.safety.largeAmountEth).toBeGreaterThan(0);
    expect(JSON.stringify(response.body)).not.toMatch(/api[_-]?key|secret/i);
  });

  it("reports registry and AI status honestly", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(["configured", "not_deployed"]).toContain(response.body.registry);
    expect(["near_ai", "guide_fallback"]).toContain(response.body.ai);
  });

  it("reports AI mode honestly", async () => {
    const response = await request(app).get("/api/ai/status").expect(200);
    expect(typeof response.body.configured).toBe("boolean");
    expect(response.body.fallback.available).toBe(true);
    expect(response.body.fallback.labelled).toBe(true);
  });

  it("protects authenticated routes", async () => {
    const response = await request(app).get("/api/lessons").expect(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("validates input before touching the database", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ firstName: "A", email: "not-an-email", password: "123" })
      .expect(400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });

  it("returns a clean 404 for unknown API routes", async () => {
    const response = await request(app).get("/api/does-not-exist").expect(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects malformed JSON with a clear error", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);
    expect(response.body.error.code).toBe("INVALID_JSON");
  });

  it("adds a request id header", async () => {
    const response = await request(app).get("/api/health");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });
});
