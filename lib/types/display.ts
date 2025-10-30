export interface TVDisplay {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  lastSeen: Date | null;
  ipAddress: string | null;
  status: DisplayStatus;
  config: any;
  assignedContentId: string | null;
  masjidId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  content?: string;
  lastContentUpdate?: Date | string | null;
  
  // MizanTV specific fields
  platform?: string | null;
  model?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  buildNumber?: string | null;
  installationId?: string | null;
  networkStatus?: string | null;
  registeredAt?: string | Date | null;
}

export interface Content {
  id: string;
  title: string;
  type: string;
  url: string | null;
  data: any;
  startDate: string | Date | null;
  endDate: string | Date | null;
  zones: string[] | string; // Allow both array and string for flexibility
  active: boolean;
  masjidId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  description?: string;
  config?: any;
  name?: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  active: boolean;
  config: {
    layout: string;
    refreshInterval: number;
    customSettings?: Record<string, any>;
  };
}

export interface TVDisplayForm {
  name: string;
  location: string;
  content: string;
  notes: string;
  autoPower: boolean;
}

export interface TVDisplayUpdate {
  name: string;
  location: string;
  status: string;
  config?: {
    notes: string;
    autoPower: boolean;
  };
}

export type DisplayStatus = 'online' | 'offline' | 'restarting' | 'stopped' | 'error' | string;
export type ContentType = 'prayer' | 'announcement' | 'daily_verse' | 'daily_hadith' | 'daily_dua' | 'eid_countdown' | 'ramadan_countdown' | 'taraweeh_timings' | 'google_calendar' | 'donation' | 'image' | 'video' | 'countdown' | 'website' | 'custom' | 'content' | string;
export type Platform = 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux' | string;
