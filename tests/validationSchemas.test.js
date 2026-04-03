import { describe, expect, it } from "vitest";
import {
  createRecordSchema,
  recordQuerySchema,
  registerSchema,
  updateUserRoleSchema,
} from "../lib/validationSchemas.js";

describe("validation schemas", () => {
  it("accepts valid register payload", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "StrongPassword123!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid record create payload", () => {
    const result = createRecordSchema.safeParse({
      amount: "abc",
      type: "OTHER",
      category: "",
    });

    expect(result.success).toBe(false);
  });

  it("parses query pagination fields as numbers", () => {
    const result = recordQuerySchema.safeParse({ page: "2", limit: "20" });

    expect(result.success).toBe(true);
    expect(result.data.page).toBe(2);
    expect(result.data.limit).toBe(20);
  });

  it("rejects invalid role updates", () => {
    const result = updateUserRoleSchema.safeParse({ role: "SUPERADMIN" });

    expect(result.success).toBe(false);
  });
});
