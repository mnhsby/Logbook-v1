
export enum DeviceStatus {
  WORKING = 'Working',
  UNDER_REPAIR = 'Under Repair',
  BROKEN = 'Broken',
  MAINTENANCE = 'Maintenance'
}

export interface MedicalDevice {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  description: string;
  status: DeviceStatus;
  lastMaintenanceDate: string;
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface DashboardStats {
  totalDevices: number;
  workingCount: number;
  repairCount: number;
  maintenanceDue: number;
}
