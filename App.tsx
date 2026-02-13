
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LogForm from './components/LogForm';
import LogList from './components/LogList';
import Login from './components/Login';
import { User, MedicalDevice } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('medlog_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deviceToEdit, setDeviceToEdit] = useState<MedicalDevice | undefined>(undefined);

  const handleLogin = (username: string) => {
    const newUser: User = { id: crypto.randomUUID(), username, role: 'admin' };
    setUser(newUser);
    localStorage.setItem('medlog_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('medlog_user');
  };

  const startEdit = (device: MedicalDevice) => {
    setDeviceToEdit(device);
    setActiveTab('add');
  };

  const clearEdit = () => {
    setDeviceToEdit(undefined);
    setActiveTab('list');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        if (tab !== 'add') setDeviceToEdit(undefined);
        setActiveTab(tab);
      }} 
      onLogout={handleLogout} 
      user={user}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'list' && <LogList onEdit={startEdit} />}
        {activeTab === 'add' && <LogForm deviceToEdit={deviceToEdit} onComplete={clearEdit} />}
      </div>
    </Layout>
  );
};

export default App;
