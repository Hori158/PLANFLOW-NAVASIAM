export type PlanStatus = 'not_started' | 'in_progress' | 'under_review' | 'completed' | 'delayed';
export type PlanPriority = 'urgent' | 'high' | 'medium' | 'low';
export type PlanPhase = 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4';

export interface PlanItem {
  id: string; // เช่น PLN-2025-001
  projectCode: string; // เช่น PRJ-01
  projectName: string; // ชื่อโครงการ
  taskTitle: string; // ชื่องาน/กิจกรรม
  department: string; // แผนกที่รับผิดชอบ
  category: string[]; // หมวดหมู่งาน (สามารถเลือกได้หลายตัว)
  phase: PlanPhase; // เฟสงาน
  plannedStartDate: string; // YYYY-MM-DD
  plannedEndDate: string; // YYYY-MM-DD
  actualStartDate?: string;
  actualEndDate?: string;
  status: PlanStatus;
  priority: PlanPriority;
  progress: number; // 0 - 100
  plannedKpi: string; // เช่น "ติดตั้ง 10 จุด"
  actualKpi?: string; // เช่น "ติดตั้งแล้ว 10/10 จุด"
  assigneeName: string; // ผู้รับผิดชอบ
  assigneeRole?: string;
  assigneeAvatar?: string;
  approverName?: string; // ผู้ตรวจรับงาน
  budgetPlanned: number; // งบประมาณตามแผน (บาท)
  budgetActual: number; // งบประมาณใช้จริง (บาท)
  evidenceUrl?: string; // ลิงก์รูปถ่ายผลงาน หรือเอกสารแนบ
  location?: string; // สถานที่ปฏิบัติงาน / พิกัด
  remarks?: string; // หมายเหตุ
  appSheetRowId: string; // คีย์เชื่อมต่อ AppSheet UniqueID()
  lastUpdated: string; // เวลาอัปเดตล่าสุด
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  completionNotes?: string;
}

export interface SyncConfig {
  sheetUrl: string; // Google Sheets CSV or Apps Script Web App URL
  appSheetAppId: string;
  appSheetAccessKey: string;
  autoSyncInterval: number; // in seconds (0 = manual)
  isLiveMode: boolean;
  lastSyncTime: string | null;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'status_change' | 'checkin' | 'sync';
  taskId: string;
  taskTitle: string;
  user: string;
  details: string;
  syncResult: 'success' | 'failed' | 'simulated';
}

export interface FilterState {
  search: string;
  department: string;
  status: string;
  phase: string;
  priority: string;
  category: string;
  onlyOverdue: boolean;
  onlyDueSoon: boolean;
  onlyReviewPending: boolean;
}

export type ViewMode = 'table' | 'kanban' | 'timeline' | 'analytics' | 'architecture';
