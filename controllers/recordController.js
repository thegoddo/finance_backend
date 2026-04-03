import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

//@desc Create a financial record
// @access Private(Admin, Analyst)
export const createRecord = async (req, res) => {
  const { amount, type, category, date, notes } = req.body;
  try {
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
// @access Private (Admin, Analyst, Viewer)
export const getRecords = async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, page, limit } =
      req.query;

    const pageNumber = page ? Number.parseInt(page, 10) : 1;
    const limitNumber = limit ? Number.parseInt(limit, 10) : 10;

    if (Number.isNaN(pageNumber) || pageNumber < 1) {
      return res
        .status(400)
        .json({ message: "page must be a positive integer." });
    }

    if (Number.isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return res
        .status(400)
        .json({ message: "limit must be an integer between 1 and 100." });
    }

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
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    // Verify ownership before updating
    const existingRecord = await prisma.record.findUnique({ where: { id } });
    if (
      !existingRecord ||
      existingRecord.deletedAt ||
      existingRecord.userId !== req.user.id
    ) {
      return res
        .status(404)
        .json({ message: "Record not found or unauthorized" });
    }

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
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
    const { id } = req.params;

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
