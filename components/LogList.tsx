
import React, { useState, useMemo } from 'react';
import { MedicalDevice, DeviceStatus } from '../types';
import { getDevices, deleteDevice } from '../services/storageService';
import { CATEGORIES } from '../constants';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface LogListProps {
  onEdit: (device: MedicalDevice) => void;
}

const LogList: React.FC<LogListProps> = ({ onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [localDevices, setLocalDevices] = useState(getDevices());

  const filteredDevices = useMemo(() => {
    return localDevices.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [localDevices, searchTerm, statusFilter, categoryFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this device log?')) {
      deleteDevice(id);
      setLocalDevices(getDevices());
    }
  };

  const exportToPdf = () => {
    const doc = new jsPDF() as any;
    doc.text('Medical Device Maintenance Inventory Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    const tableData = filteredDevices.map(d => [
      d.name,
      d.serialNumber,
      d.category,
      d.status,
      d.lastMaintenanceDate
    ]);

    doc.autoTable({
      head: [['Device Name', 'Serial No', 'Category', 'Status', 'Last Maintenance']],
      body: tableData,
      startY: 30,
    });

    doc.save(`MedLog_Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case DeviceStatus.WORKING: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case DeviceStatus.UNDER_REPAIR: return 'bg-amber-50 text-amber-600 border-amber-100';
      case DeviceStatus.BROKEN: return 'bg-rose-50 text-rose-600 border-rose-100';
      case DeviceStatus.MAINTENANCE: return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 max-w-md relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search by name or serial..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={exportToPdf}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Device Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Maintained</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map(device => (
                <tr key={device.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{device.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{device.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{device.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(device.status)}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{device.lastMaintenanceDate}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(device)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Log"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(device.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Log"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <p className="font-medium">No devices found matching your filters.</p>
                      <p className="text-xs">Try adjusting your search terms or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogList;
