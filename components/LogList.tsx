import React, { useState, useMemo } from 'react';
import { MedicalDevice, DeviceStatus } from '../types';
import { getDevices, deleteDevice } from '../services/storageService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const LogList: React.FC<{ onEdit: (d: MedicalDevice) => void }> = ({ onEdit }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [devices, setDevices] = useState(getDevices());

  const filtered = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = 
        d.name.toLowerCase().includes(search.toLowerCase()) || 
        d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Semua' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [devices, search, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus log alat ini secara permanen?')) {
      deleteDevice(id);
      setDevices(getDevices());
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('MEDLOG PRO', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('LAPORAN INVENTARIS ALAT KESEHATAN', 14, 30);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 140, 50);
    
    doc.autoTable({
      startY: 55,
      head: [['Nama Perangkat', 'No. Seri', 'Kategori', 'Status Operasional', 'Update Terakhir']],
      body: filtered.map(d => [d.name, d.serialNumber, d.category, d.status, d.lastMaintenanceDate]),
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 5,
        valign: 'middle'
      },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'center' }
      }
    });
    
    doc.save(`MedLog_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 max-w-lg relative group">
          <svg className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
            placeholder="Cari nama alat, SN, atau kategori..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="px-6 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm outline-none font-bold text-sm cursor-pointer hover:border-slate-300 transition-colors appearance-none pr-12 relative"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
          >
            <option value="Semua">Semua Kondisi</option>
            {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={generatePDF}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 group"
          >
            <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            EKSPOR PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Perangkat</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${
                        d.status === DeviceStatus.WORKING ? 'bg-emerald-50 text-emerald-600' : 
                        d.status === DeviceStatus.BROKEN ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg leading-tight">{d.name}</div>
                        <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">SN: {d.serialNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-sm font-black text-slate-600 px-3 py-1 bg-slate-100 rounded-lg">{d.category}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${
                        d.status === DeviceStatus.WORKING ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        d.status === DeviceStatus.BROKEN ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onEdit(d)} 
                        title="Edit Log"
                        className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)} 
                        title="Hapus Log"
                        className="p-3 text-rose-600 bg-rose-50 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                      <div>
                        <p className="font-black text-2xl text-slate-800">Tidak Menemukan Data</p>
                        <p className="text-slate-400 font-medium mt-1">Coba kata kunci lain atau periksa filter status.</p>
                      </div>
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