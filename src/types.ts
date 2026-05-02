export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'user';
  department: string;
  photoURL?: string | null;
  createdAt: any;
}

export interface InvestmentRecord {
  id: string;
  serialNo: string;
  fullName: string;
  accountNo: string;
  accountType: string;
  productType: string;
  systemType: 'ORACLE' | 'MIZAN';
  date: string;
  status: 'Active' | 'In-active';
  uploadedBy: string;
  uploaderId: string;
  createdAt: any;
  updatedAt: any;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  documentId?: string; // Kept for log consistency if needed
  documentTitle?: string;
  timestamp: any;
  details: string;
}
