import React from 'react';
import useFetch from '../../hooks/useFetch.js';
import { getUserUsageHistory } from '../../services/userService.js';
import styles from '../../styles/dashboard.module.css';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const UsageHistory = () => {
  const { data, loading, error, refetch } = useFetch(() => getUserUsageHistory({ limit: 365 }));
  const usageHistory = data?.data?.usageHistory || data?.usageHistory || [];
  const summary = data?.data?.usageSummary || data?.usageSummary || { totalDataUsed: 0, averageDailyUsage: 0, peakUsage: 0, averageSpeed: 0 };

  // Aggregate by month for line chart (last 12 months)
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const months = Array.from({ length: 12 }).map((_, i) => new Date(now.getFullYear(), now.getMonth() - (11 - i), 1));
  const labels = months.map(d => `${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  const keys = months.map(d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);

  const totalsByKey = new Map();
  for (const row of usageHistory) {
    const d = new Date(row.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    totalsByKey.set(key, (totalsByKey.get(key) || 0) + (row.dataUsed || 0));
  }
  const series = keys.map(k => totalsByKey.get(k) || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Monthly Usage (GB)',
        data: series,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.15)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading usage...</div>;
  if (error) return <div className="alert alert-error">Error loading usage: {error}</div>;

  return (
    <div className="container">
      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Usage History</h1>
            <p className={styles.dashboardSubtitle}>Your monthly data usage over time</p>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Last 12 Months</h2>
          <div className="h-64">
            <Line data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: true } },
              scales: { y: { beginAtZero: true, title: { display: true, text: 'GB' } } }
            }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`${styles.statCard}`}>
            <h3 className={styles.statValue}>{summary.totalDataUsed?.toFixed?.(1) || 0} GB</h3>
            <p className={styles.statLabel}>Total Data Used</p>
          </div>
          <div className={`${styles.statCard}`}>
            <h3 className={styles.statValue}>{summary.averageDailyUsage?.toFixed?.(1) || 0} GB</h3>
            <p className={styles.statLabel}>Average Daily Usage</p>
          </div>
          <div className={`${styles.statCard}`}>
            <h3 className={styles.statValue}>{summary.averageSpeed?.toFixed?.(1) || 0} Mbps</h3>
            <p className={styles.statLabel}>Average Speed</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Records</h2>
          {usageHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📉</div>
              <h3 className={styles.emptyStateTitle}>No Usage Data</h3>
              <p className={styles.emptyStateDescription}>There are no usage records available.</p>
            </div>
          ) : (
            <div className="tableContainer">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Data Used (GB)</th>
                    <th>Avg Speed (Mbps)</th>
                    <th>Peak Speed (Mbps)</th>
                  </tr>
                </thead>
                <tbody>
                  {usageHistory.slice(0, 30).map(row => (
                    <tr key={row._id}>
                      <td>{new Date(row.date).toLocaleDateString()}</td>
                      <td>{row.dataUsed}</td>
                      <td>{row.averageSpeed}</td>
                      <td>{row.peakSpeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageHistory;


