import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { authorize } from "../middlewares/authMiddleware.js";

describe("RBAC middleware integration", () => {
  it("blocks non-admin user for admin route", async () => {
    const app = express();
    app.use(express.json());

    app.get(
      "/admin-only",
      (req, _res, next) => {
        req.user = { role: "VIEWER" };
        next();
      },
      authorize("ADMIN"),
      (_req, res) => res.status(200).json({ ok: true }),
    );

    const response = await request(app).get("/admin-only");

    expect(response.status).toBe(403);
  });

  it("allows admin user for admin route", async () => {
    const app = express();
    app.use(express.json());

    app.get(
      "/admin-only",
      (req, _res, next) => {
        req.user = { role: "ADMIN" };
        next();
      },
      authorize("ADMIN"),
      (_req, res) => res.status(200).json({ ok: true }),
    );

    const response = await request(app).get("/admin-only");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
