import prisma from "../lib/prisma.js";

// Create Record (Admin & Analyst only)
export const createRecord = async (req, res) => {
  const { amount, type, category, notes } = req.body;
  try {
    const record = await prisma.record.create({
      data: { amount, type, category, notes, userId: req.user.id },
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Dashboard Summary API
export const getDashboardSummary = async (req, res) => {
  try {
    const aggregations = await prisma.record.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { userId: req.user.id },
    });

    const summary = {
      totalIncome:
        aggregations.find((a) => a.type === "INCOME")?._sum.amount || 0,
      totalExpense:
        aggregations.find((a) => a.type === "EXPENSE")?._sum.amount || 0,
    };

    summary.netBalance = summary.totalIncome - summary.totalExpense;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
