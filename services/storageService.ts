
import { MedicalDevice } from '../types';

const STORAGE_KEY = 'medlog_devices';

export const getDevices = (): MedicalDevice[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDevice = (device: MedicalDevice): void => {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === device.id);
  if (index >= 0) {
    devices[index] = device;
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
  return {
    totalDevices: devices.length,
    workingCount: devices.filter(d => d.status === 'Working').length,
    repairCount: devices.filter(d => d.status === 'Under Repair' || d.status === 'Broken').length,
    maintenanceDue: devices.filter(d => {
       const lastDate = new Date(d.lastMaintenanceDate);
       const today = new Date();
       const diff = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
       return diff > 180; // 6 months threshold
    }).length
  };
};
