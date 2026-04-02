const Dashboard = require('../models/Dashboard');
const Analytics = require('../models/Analytics');

// Render the main Analytics UI
exports.showAnalytics = async (req, res) => {
  try {
    const user = req.session.user;
    res.render('analytics', { user });
  } catch (error) {
    console.error('Analytics page error:', error);
    res.status(500).json({ error: 'Failed to load analytics page' });
  }
};

// GET /analytics/advanced-stats
exports.getAdvancedStats = async (req, res) => {
  try {
    const momStats = await Analytics.getMoMStats();
    const anomalies = await Analytics.getAnomalies();
    
    // Process MoM percentage change
    const stats = {
      incomeMoM: 0,
      expenseMoM: 0,
      anomalies: anomalies
    };

    momStats.forEach(stat => {
      const prev = parseFloat(stat.previous_month) || 0;
      const curr = parseFloat(stat.current_month) || 0;
      const change = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
      
      if (stat.type === 'income') stats.incomeMoM = change.toFixed(1);
      if (stat.type === 'expense') stats.expenseMoM = change.toFixed(1);
    });

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Advanced stats error:', error);
    res.status(500).json({ error: 'Failed to fetch advanced stats' });
  }
};

// GET /analytics/export
exports.exportCSV = async (req, res) => {
  try {
    const records = await Analytics.getRawRecords();
    
    // Simple CSV construction
    let csvContent = 'ID,Date,Type,Category,Amount,Created By,Description\n';
    
    records.forEach(r => {
      const row = [
        r.id,
        new Date(r.date).toISOString().split('T')[0],
        r.type,
        r.category,
        r.amount,
        `"${r.created_by}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=financial_report.csv');
    res.status(200).send(csvContent);
    
  } catch (error) {
    console.error('CSV Export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

// GET /analytics/summary
exports.getSummary = async (req, res) => {
  try {
    const totalIncome = await Dashboard.getTotalIncome();
    const totalExpense = await Dashboard.getTotalExpense();
    
    res.json({
      success: true,
      totalIncome: parseFloat(totalIncome),
      totalExpense: parseFloat(totalExpense)
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary data' });
  }
};

// GET /analytics/category
exports.getCategoryTotals = async (req, res) => {
  try {
    const categoryBreakdown = await Dashboard.getCategoryBreakdown();
    
    res.json({
      success: true,
      categories: categoryBreakdown
    });
  } catch (error) {
    console.error('Get category totals error:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
};

// GET /analytics/trends
exports.getTrends = async (req, res) => {
  try {
    const monthlyTrends = await Dashboard.getMonthlyTrends(12); // Last 12 months default
    
    res.json({
      success: true,
      trends: monthlyTrends
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends data' });
  }
};
