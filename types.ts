
export enum DeviceStatus {
  WORKING = 'Normal',
  UNDER_REPAIR = 'Perbaikan',
  BROKEN = 'Rusak',
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
