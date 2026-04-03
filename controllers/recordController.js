import prisma from "../lib/prisma.js";

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
    const { type, category, startDate, endDate } = req.query;

    const filters = {
      userId: req.user.id, // Users only see their own data
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
    };

    const records = await prisma.record.findMany({
      where: filters,
      orderBy: { date: "desc" },
    });

    res.status(200).json(records);
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
    if (!existingRecord || existingRecord.userId !== req.user.id) {
      return res.status(404).json({ message: "Record not found or unauthorized" });
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