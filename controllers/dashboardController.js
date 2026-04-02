const Dashboard = require('../models/Dashboard');
const Record = require('../models/Record');

exports.getDashboard = async (req, res) => {
  try {
    const user = req.session.user;

    // Get all dashboard data
    const totalIncome = await Dashboard.getTotalIncome();
    const totalExpense = await Dashboard.getTotalExpense();
    const categoryBreakdown = await Dashboard.getCategoryBreakdown();
    const monthlyTrends = await Dashboard.getMonthlyTrends(12);
    const recentTransactions = await Dashboard.getRecentTransactions(10);

    // Calculate net balance
    const netBalance = totalIncome - totalExpense;

    res.render('dashboard', {
      user,
      totalIncome: parseFloat(totalIncome) || 0,
      totalExpense: parseFloat(totalExpense) || 0,
      netBalance: parseFloat(netBalance) || 0,
      categoryBreakdown,
      monthlyTrends,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};