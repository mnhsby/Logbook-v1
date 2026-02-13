
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getDevices, getStats } from '../services/storageService';
import { DeviceStatus } from '../types';

const Dashboard: React.FC = () => {
  const devices = getDevices();
  const stats = getStats();

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach(d => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [devices]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [devices]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Analytics Overview</h2>
        <p className="text-slate-500">Real-time status of clinical engineering inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Inventory" value={stats.totalDevices} color="blue" />
        <StatCard title="Active & Working" value={stats.workingCount} color="emerald" />
        <StatCard title="Under Maintenance" value={stats.repairCount} color="amber" />
        <StatCard title="Maintenance Alerts" value={stats.maintenanceDue} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Device Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Category Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <div className={`px-2 py-0.5 rounded text-xs font-semibold ${colorClasses[color]}`}>
          Items
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
