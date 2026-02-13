
import React, { useState } from 'react';
import { MedicalDevice, DeviceStatus } from '../types';
import { CATEGORIES } from '../constants';
import { saveDevice } from '../services/storageService';
import { generateDescription } from '../services/geminiService';

interface LogFormProps {
  deviceToEdit?: MedicalDevice;
  onComplete: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ deviceToEdit, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicalDevice>>({
    name: '',
    serialNumber: '',
    category: CATEGORIES[0],
    description: '',
    status: DeviceStatus.WORKING,
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
    media: [],
    ...deviceToEdit
  });

  const handleAiDescription = async () => {
    if (!formData.name) return alert('Masukkan nama alat terlebih dahulu.');
    setAiLoading(true);
    const result = await generateDescription(formData.name, formData.category || '');
    setFormData(prev => ({ ...prev, description: result }));
    setAiLoading(false);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setFormData(prev => ({
          ...prev,
          media: [...(prev.media || []), { type, url: event.target?.result as string }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: MedicalDevice = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name || '',
      serialNumber: formData.serialNumber || '',
      category: formData.category || '',
      description: formData.description || '',
      status: (formData.status as DeviceStatus) || DeviceStatus.WORKING,
      lastMaintenanceDate: formData.lastMaintenanceDate || '',
      media: formData.media || [],
      createdAt: formData.createdAt || new Date().toISOString()
    };
    saveDevice(payload);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{deviceToEdit ? 'Perbarui Log' : 'Registrasi Alat Baru'}</h2>
          <p className="text-sm text-slate-500 font-medium">Lengkapi detail pemeliharaan perangkat medis.</p>
        </div>
        <button onClick={onComplete} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Nama Perangkat</label>
            <input 
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Contoh: USG Mindray DC-30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Nomor Seri (SN)</label>
            <input 
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono font-bold"
              value={formData.serialNumber}
              onChange={e => setFormData({...formData, serialNumber: e.target.value})}
              placeholder="SN-XXXXX-XXXX"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Kategori</label>
            <select 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-semibold appearance-none cursor-pointer"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Status Saat Ini</label>
            <select 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-semibold appearance-none cursor-pointer"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as DeviceStatus})}
            >
              {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Deskripsi Teknis</label>
            <button 
              type="button"
              onClick={handleAiDescription}
              disabled={aiLoading}
              className="text-[10px] font-black uppercase flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              {aiLoading ? 'Memproses AI...' : 'Tulis dengan AI'}
            </button>
          </div>
          <textarea 
            rows={4}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-700 leading-relaxed"
            placeholder="Tuliskan riwayat pemeliharaan, penggantian part, atau kendala..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Lampiran Media (Foto/Video)</label>
          <div className="flex flex-wrap gap-4">
            {formData.media?.map((m, idx) => (
              <div key={idx} className="relative w-28 h-28 group">
                {m.type === 'image' ? (
                  <img src={m.url} className="w-full h-full object-cover rounded-2xl border-2 border-slate-100" />
                ) : (
                  <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
                  </div>
                )}
                <button 
                  type="button"
                  onClick={() => setFormData(p => ({...p, media: p.media?.filter((_, i) => i !== idx)}))}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
            <label className="w-28 h-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-all bg-slate-50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span className="text-[10px] font-black uppercase mt-1">Lampirkan</span>
              <input type="file" multiple className="hidden" onChange={handleMediaUpload} accept="image/*,video/*" />
            </label>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4">
          <button type="button" onClick={onComplete} className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all">Batal</button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : (deviceToEdit ? 'Simpan Perubahan' : 'Daftarkan Alat')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;
