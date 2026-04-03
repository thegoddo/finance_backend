import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserByAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export const createRecordSchema = z.object({
  amount: z.coerce.number().finite(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  date: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateRecordSchema = z
  .object({
    amount: z.coerce.number().finite().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z.string().min(1).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const recordQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});
