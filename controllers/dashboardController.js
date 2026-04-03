import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

// @desc    Get comprehensive dashboard data
// @access  Private (Admin, Analyst, Viewer)
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Income, Expenses, and Net Balance
    const totalStats = await prisma.record.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { userId },
    });

    const income =
      totalStats.find((s) => s.type === "INCOME")?._sum.amount || 0;
    const expense =
      totalStats.find((s) => s.type === "EXPENSE")?._sum.amount || 0;

    // 2. Category-wise Totals
    const categoryTotals = await prisma.record.groupBy({
      by: ["category", "type"],
      _sum: { amount: true },
      where: { userId },
    });

    // 3. Recent Activity (Last 5 transactions)
    const recentActivity = await prisma.record.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    });

    // 4. Monthly Trends (Last 6 months)
    // Note: Complex grouping by date often requires raw SQL or mid-layer processing
    const allRecords = await prisma.record.findMany({
      where: {
        userId,
        date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
      },
      select: { amount: true, type: true, date: true },
    });

    res.status(200).json({
      summary: {
        totalIncome: income,
        totalExpense: expense,
        netBalance: income - expense,
      },
      categoryBreakdown: categoryTotals,
      recentActivity,
      trends: allRecords, // Frontend can group these by month easily
    });
  } catch (error) {
    logger.error("Dashboard Logic Error", { error: error.message });
    res.status(500).json({ message: "Failed to generate dashboard summary." });
  }
};
