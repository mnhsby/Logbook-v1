
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LogForm from './components/LogForm';
import LogList from './components/LogList';
import Login from './components/Login';
import { User, MedicalDevice } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medlog_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [tab, setTab] = useState('dashboard');
  const [editTarget, setEditTarget] = useState<MedicalDevice | undefined>();

  const handleLogin = (name: string) => {
    const u: User = { id: Date.now().toString(), username: name, role: 'admin' };
    setUser(u);
    localStorage.setItem('medlog_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('medlog_session');
  };

  const triggerEdit = (d: MedicalDevice) => {
    setEditTarget(d);
    setTab('add');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Layout activeTab={tab} setActiveTab={(t) => { setEditTarget(undefined); setTab(t); }} user={user} onLogout={handleLogout}>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'list' && <LogList onEdit={triggerEdit} />}
      {tab === 'add' && <LogForm deviceToEdit={editTarget} onComplete={() => setTab('list')} />}
    </Layout>
  );
};

export default App;
