import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { getDevices, getStats } from '../services/storageService';

const Dashboard: React.FC = () => {
  const devices = getDevices();
  const stats = getStats();

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [devices]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [devices]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Dashboard Manajemen</h2>
          <p className="text-slate-500 font-medium">Ringkasan status aset medis secara menyeluruh.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600">Sistem Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Aset" value={stats.totalDevices} color="blue" subtitle="Terdaftar di database" />
        <StatCard title="Kondisi Normal" value={stats.workingCount} color="emerald" subtitle="Siap digunakan" />
        <StatCard title="Masalah/Rusak" value={stats.repairCount} color="rose" subtitle="Butuh tindakan" />
        <StatCard title="Pengecekan Rutin" value={stats.maintenanceDue} color="amber" subtitle="Jadwal pemeliharaan" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
             <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
             Distribusi Status Perangkat
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={45}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
            Komposisi Berdasarkan Kategori
          </h3>
          <div className="h-80 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%"
                  innerRadius={90}
                  outerRadius={125}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">{devices.length}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Unit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-emerald-600 rounded-full"></div>
          Aktivitas Terbaru
        </h3>
        <div className="space-y-4">
          {stats.recentLogs.map((device, idx) => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-blue-600 text-xs">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{device.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{device.category} • {device.serialNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-500">{new Date(device.createdAt).toLocaleDateString('id-ID')}</p>
                <p className={`text-[10px] font-black uppercase ${device.status === 'Normal' ? 'text-emerald-500' : 'text-rose-500'}`}>{device.status}</p>
              </div>
            </div>
          ))}
          {stats.recentLogs.length === 0 && <p className="text-center py-10 text-slate-400 font-medium">Belum ada aktivitas tercatat.</p>}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, subtitle }: { title: string, value: number, color: string, subtitle: string }) => {
  const styles: any = {
    blue: "bg-blue-600 shadow-blue-600/20",
    emerald: "bg-emerald-600 shadow-emerald-600/20",
    rose: "bg-rose-600 shadow-rose-600/20",
    amber: "bg-amber-500 shadow-amber-500/20",
  };
  
  const bgStyles: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${bgStyles[color]}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {color === 'blue' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>}
            {color === 'emerald' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
            {color === 'rose' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>}
            {color === 'amber' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
          </svg>
        </div>
        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${bgStyles[color]}`}>
          {title === 'Total Aset' ? 'Aset' : 'Unit'}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h4>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{subtitle}</p>
    </div>
  );
};

export default Dashboard;