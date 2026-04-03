import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import {
  createRecordSchema,
  recordQuerySchema,
  updateRecordSchema,
  uuidParamSchema,
} from "../lib/validationSchemas.js";
import { getValidationMessage } from "../lib/validation.js";

//@desc Create a financial record
// @access Private(Admin, Analyst)
export const createRecord = async (req, res) => {
  try {
    const parsedBody = createRecordSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedBody.error),
      });
    }

    const { amount, type, category, date, notes } = parsedBody.data;

    const record = await prisma.record.create({
      data: {
        amount,
        type,
        category,
        date: date ? new Date(date) : new Date(),
        notes,
        userId: req.user.id,
      },
    });
    logger.info(`Record created: ${record.id} by user ${req.user.id}`);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Get all records with filtering
// @access Private (Admin, Analyst)
export const getRecords = async (req, res) => {
  try {
    const parsedQuery = recordQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedQuery.error),
      });
    }

    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page: parsedPage,
      limit: parsedLimit,
    } = parsedQuery.data;

    const pageNumber = parsedPage ?? 1;
    const limitNumber = parsedLimit ?? 10;

    const filters = {
      userId: req.user.id, // Users only see their own data
      deletedAt: null,
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { category: { contains: search } },
              { notes: { contains: search } },
            ],
          }
        : {}),
    };

    const skip = (pageNumber - 1) * limitNumber;

    const total = await prisma.record.count({ where: filters });

    const records = await prisma.record.findMany({
      where: filters,
      orderBy: { date: "desc" },
      skip,
      take: limitNumber,
    });

    res.status(200).json({
      data: records,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber) || 1,
      },
    });
  } catch (error) {
    logger.error("Get Records Error", { error: error.message });
    res.status(500).json({ message: "Error fetching records." });
  }
};

// @desc    Update a record
// @access  Private (Admin, Analyst)
export const updateRecord = async (req, res) => {
  try {
    const parsedParams = uuidParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedParams.error),
      });
    }

    const parsedBody = updateRecordSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedBody.error),
      });
    }

    const { id } = parsedParams.data;
    const { amount, type, category, date, notes } = parsedBody.data;

    const existingRecord = await prisma.record.findUnique({ where: { id } });
    const isOwner = existingRecord?.userId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!existingRecord || existingRecord.deletedAt || (!isOwner && !isAdmin)) {
      return res
        .status(404)
        .json({ message: "Record not found or unauthorized" });
    }

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        amount,
        type,
        category,
        date: date ? new Date(date) : undefined,
        notes,
      },
    });

    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: "Error updating record." });
  }
};

// @desc    Delete a record
// @access  Private (Admin)
export const deleteRecord = async (req, res) => {
  try {
    const parsedParams = uuidParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedParams.error),
      });
    }

    const { id } = parsedParams.data;

    const existingRecord = await prisma.record.findUnique({ where: { id } });

    if (!existingRecord || existingRecord.deletedAt) {
      return res.status(404).json({ message: "Record not found." });
    }

    await prisma.record.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Record soft-deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting record." });
  }
};

// @desc    Restore a soft-deleted record
// @access  Private (Admin)
export const restoreRecord = async (req, res) => {
  try {
    const parsedParams = uuidParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedParams.error),
      });
    }

    const { id } = parsedParams.data;

    const existingRecord = await prisma.record.findUnique({ where: { id } });

    if (!existingRecord) {
      return res.status(404).json({ message: "Record not found." });
    }

    if (!existingRecord.deletedAt) {
      return res.status(400).json({ message: "Record is not deleted." });
    }

    await prisma.record.update({
      where: { id },
      data: { deletedAt: null },
    });

    res.status(200).json({ message: "Record restored successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error restoring record." });
  }
};
