
import React, { useState, useEffect } from 'react';
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

  const [aiLoading, setAiLoading] = useState(false);

  const handleAiGenerate = async () => {
    if (!formData.name) return;
    setAiLoading(true);
    const desc = await generateDescription(formData.name, formData.category || '');
    setFormData(prev => ({ ...prev, description: desc }));
    setAiLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: { type: 'image' | 'video'; url: string }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const filePromise = new Promise<{ type: 'image' | 'video'; url: string }>((resolve) => {
        reader.onload = (event) => {
          resolve({
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: event.target?.result as string
          });
        };
      });
      
      reader.readAsDataURL(file);
      newMedia.push(await filePromise);
    }

    setFormData(prev => ({ ...prev, media: [...(prev.media || []), ...newMedia] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const device: MedicalDevice = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name || '',
      serialNumber: formData.serialNumber || '',
      category: formData.category || '',
      description: formData.description || '',
      status: formData.status as DeviceStatus,
      lastMaintenanceDate: formData.lastMaintenanceDate || '',
      media: formData.media || [],
      createdAt: formData.createdAt || new Date().toISOString()
    };

    saveDevice(device);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
          {deviceToEdit ? 'Edit Maintenance Log' : 'New Device Entry'}
        </h2>
        <button onClick={onComplete} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Device Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Philips Ventilator V60"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Serial Number</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.serialNumber}
              onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="SN-XXXX-XXXX"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as DeviceStatus })}
            >
              {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Last Maintenance Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.lastMaintenanceDate}
              onChange={e => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-slate-700">Detailed Description</label>
            <button 
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading || !formData.name}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              {aiLoading ? 'Generating...' : 'AI Assist'}
            </button>
          </div>
          <textarea 
            rows={4}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Describe condition, parts replaced, or issues found..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">Media Attachments (Photos/Videos)</label>
          <div className="flex flex-wrap gap-4">
            {formData.media?.map((m, idx) => (
              <div key={idx} className="relative w-24 h-24 group">
                {m.type === 'image' ? (
                  <img src={m.url} className="w-full h-full object-cover rounded-lg border border-slate-200" alt="Device" />
                ) : (
                  <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
                  </div>
                )}
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, media: prev.media?.filter((_, i) => i !== idx) }))}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span className="text-[10px] mt-1 font-bold">UPLOAD</span>
              <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <button 
            type="button"
            onClick={onComplete}
            className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : (deviceToEdit ? 'Update Entry' : 'Create Entry')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;
