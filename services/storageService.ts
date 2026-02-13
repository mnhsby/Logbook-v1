import { MedicalDevice, DeviceStatus } from '../types';

const STORAGE_KEY = 'medlog_devices_db';

export const getDevices = (): MedicalDevice[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDevice = (device: MedicalDevice): void => {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === device.id);
  if (index >= 0) {
    devices[index] = { ...device };
  } else {
    devices.push(device);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
};

export const deleteDevice = (id: string): void => {
  const devices = getDevices().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
};

export const getStats = () => {
  const devices = getDevices();
  const now = new Date().getTime();
  
  return {
    totalDevices: devices.length,
    workingCount: devices.filter(d => d.status === DeviceStatus.WORKING).length,
    repairCount: devices.filter(d => d.status === DeviceStatus.UNDER_REPAIR || d.status === DeviceStatus.BROKEN).length,
    maintenanceDue: devices.filter(d => {
       if (!d.lastMaintenanceDate) return true;
       const lastDate = new Date(d.lastMaintenanceDate).getTime();
       const diffDays = (now - lastDate) / (1000 * 3600 * 24);
       return diffDays > 180; // Alert if over 6 months
    }).length,
    recentLogs: devices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  };
};