
import React, { useState } from 'react';

const Login: React.FC<{ onLogin: (name: string) => void }> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && pass) onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-600/40 mb-6">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.288a2 2 0 01-1.645 0l-.628-.288a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547V18a2 2 0 002 2h11a2 2 0 002-2v-2.572zM12 11V3.5l-2.5 1.5L7 3.5V11M12 11l2.5-1.5 2.5 1.5M12 11v8"></path></svg>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">MedLog <span className="text-blue-500">Pro</span></h1>
          <p className="text-slate-400 mt-3 font-medium uppercase tracking-[0.2em] text-[10px]">Medical Asset Management</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ID Personel</label>
              <input 
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 outline-none text-white font-bold transition-all"
                placeholder="Username"
                value={user}
                onChange={e => setUser(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sandi Akses</label>
              <input 
                required
                type="password"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 outline-none text-white font-bold transition-all"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
              />
            </div>
            <button className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 shadow-2xl shadow-blue-600/30 transition-all active:scale-95">
              AUTENTIKASI SEKARANG
            </button>
          </form>
        </div>
        <p className="text-center mt-10 text-slate-500 text-xs font-bold">
          © 2024 Clinical Engineering Dept.
        </p>
      </div>
    </div>
  );
};

export default Login;
