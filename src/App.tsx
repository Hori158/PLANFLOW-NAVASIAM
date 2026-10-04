import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  X, 
  Zap, 
  HelpCircle
} from 'lucide-react';
import { 
  PlanItem, 
  FilterState, 
  ViewMode, 
  SyncConfig, 
  AuditLogItem, 
  PlanStatus 
} from './types';
import type { User } from '@supabase/supabase-js';
import { INITIAL_PLANS } from './data/initialPlans';
import { exportPlansToCSV, parseCSVToPlans } from './utils/sheetSync';
import { createSupabaseClient, fetchSharedPlans } from './utils/supabase';

// Components
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { FilterBar } from './components/FilterBar';
import { TableView } from './components/TableView';
import { KanbanView } from './components/KanbanView';
import { TimelineView } from './components/TimelineView';
import { AnalyticsView } from './components/AnalyticsView';
import { GuideTab } from './components/GuideTab';
import { CheckInModal } from './components/CheckInModal';
import { PlanFormModal } from './components/PlanFormModal';
import { SheetSetupModal } from './components/SheetSetupModal';
import { AuditLogModal } from './components/AuditLogModal';
import { PhotoViewModal } from './components/PhotoViewModal';
import { CloudAccessModal } from './components/CloudAccessModal';
import { ReadOnlySnapshot } from './components/ReadOnlySnapshot';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';

const LOCAL_STORAGE_KEY = 'plantrack_plans_v1';
const SYNC_CONFIG_KEY = 'plantrack_sync_config_v1';
const AUDIT_LOGS_KEY = 'plantrack_audit_logs_v1';

function loadLocalPlans(): PlanItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as PlanItem[];
  } catch (error) {
    console.error('Could not load plans from local storage', error);
  }
  return INITIAL_PLANS;
}

export function App() {
  // 1. Data States
  const [plans, setPlans] = useState<PlanItem[]>(loadLocalPlans);
  const [localPlansForMigration, setLocalPlansForMigration] = useState<PlanItem[]>(loadLocalPlans);

  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => {
    try {
      const saved = localStorage.getItem(SYNC_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      sheetUrl: 'https://script.google.com/macros/s/AKfycbz_SAMPLE_APP_SCRIPT_URL/exec',
      appSheetAppId: 'appsheet-action-tracker-2025',
      appSheetAccessKey: '',
      autoSyncInterval: 30,
      isLiveMode: false,
      lastSyncTime: new Date().toISOString(),
      supabaseUrl: '',
      supabaseAnonKey: ''
    };
  });

  const [logs, setLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'LOG-001',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        action: 'sync',
        taskId: 'NVS-2025-001',
        taskTitle: 'Create high-poly character models for main characters',
        user: 'AppSheet Mobile (John Smith)',
        details: 'ซิงค์ข้อมูลจาก AppSheet เข้า Google Sheet สำเร็จ',
        syncResult: 'success'
      },
      {
        id: 'LOG-002',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        action: 'checkin',
        taskId: 'NVS-2025-004',
        taskTitle: 'Design and model 50 unique environment assets',
        user: 'Web Dashboard (Sarah Johnson)',
        details: 'ตรวจรับงานเสร็จสมบูรณ์ ความคืบหน้า 100%',
        syncResult: 'success'
      }
    ];
  });

  // 2. View & Filter States
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    department: '',
    status: '',
    phase: '',
    priority: '',
    category: '',
    onlyOverdue: false,
    onlyDueSoon: false,
    onlyReviewPending: false
  });

  // 3. UI Status & Toast Notification
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [isCloudAccessOpen, setIsCloudAccessOpen] = useState(false);
  const supabaseClient = useMemo(
    () => syncConfig.supabaseUrl && syncConfig.supabaseAnonKey
      ? createSupabaseClient(syncConfig.supabaseUrl, syncConfig.supabaseAnonKey)
      : null,
    [syncConfig.supabaseUrl, syncConfig.supabaseAnonKey]
  );
  const hasCloudConfig = Boolean(syncConfig.supabaseUrl && syncConfig.supabaseAnonKey);
  const canEditPlans = !hasCloudConfig || Boolean(cloudUser);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'warning' } | null>({
    title: '📰 ยินดีต้อนรับสู่ PLANFLOW NAVASIAM (P.NVS)',
    desc: 'หนังสือพิมพ์แผนงานรายวัน — อ่านพาดหัว ตรวจสถานะทุกชิ้นงาน และกดปุ่ม "เพิ่มงาน" เพื่อลงข่าวใหม่',
    type: 'info'
  });

  // 4. Modal States
  const [checkInPlan, setCheckInPlan] = useState<PlanItem | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Auto-hide toast after 4.5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Persist plans & config
  useEffect(() => {
    try {
      if (!supabaseClient) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error(e);
    }
  }, [plans, supabaseClient]);

  useEffect(() => {
    try {
      localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(syncConfig));
    } catch (e) {
      console.error(e);
    }
  }, [syncConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  useEffect(() => {
    if (!supabaseClient) {
      setCloudUser(null);
      return;
    }

    let active = true;
    void supabaseClient.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Could not read Supabase session', error);
      if (active) setCloudUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient) return;

    let active = true;
    const loadPlans = async () => {
      try {
        const remotePlans = await fetchSharedPlans(supabaseClient);
        if (active) {
          setPlans(remotePlans);
          setSyncConfig(prev => ({ ...prev, lastSyncTime: new Date().toISOString() }));
        }
      } catch (error) {
        console.error('Could not load plans from Supabase', error);
        if (active) setToastMessage({
          title: 'เชื่อมต่อฐานข้อมูลกลางไม่สำเร็จ',
          desc: error instanceof Error ? error.message : 'ตรวจสอบ Supabase URL, key และการตั้งค่าตาราง',
          type: 'warning'
        });
      }
    };

    void loadPlans();
    const channel = supabaseClient
      .channel('planflow-owner-plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_items' }, () => void loadPlans())
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Supabase realtime subscription status: ${status}`);
        }
      });

    return () => {
      active = false;
      void supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient]);

  const savePlanToCloud = useCallback(async (plan: PlanItem) => {
    if (!supabaseClient) return;
    if (!cloudUser) throw new Error('เข้าสู่ระบบบัญชีผู้แก้ไขก่อนบันทึกข้อมูลส่วนกลาง');

    const { error } = await supabaseClient
      .from('plan_items')
      .upsert({ id: plan.id, data: plan, updated_at: new Date().toISOString() });
    if (error) throw error;
  }, [cloudUser, supabaseClient]);

  const deletePlanFromCloud = useCallback(async (id: string) => {
    if (!supabaseClient) return;
    if (!cloudUser) throw new Error('เข้าสู่ระบบบัญชีผู้แก้ไขก่อนลบข้อมูลส่วนกลาง');

    const { error } = await supabaseClient.from('plan_items').delete().eq('id', id);
    if (error) throw error;
  }, [cloudUser, supabaseClient]);

  // Add Log Helper
  const addAuditLog = useCallback((logData: Omit<AuditLogItem, 'id' | 'timestamp'>) => {
    const newLog: AuditLogItem = {
      ...logData,
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, []);

  // Filtered Plans Logic
  const filteredPlans = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return plans.filter(p => {
      // Text search
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase();
        const matches = 
          p.id.toLowerCase().includes(query) ||
          p.projectCode.toLowerCase().includes(query) ||
          p.projectName.toLowerCase().includes(query) ||
          p.taskTitle.toLowerCase().includes(query) ||
          p.assigneeName.toLowerCase().includes(query) ||
          (p.location && p.location.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Department
      if (filter.department && p.department !== filter.department) {
        return false;
      }

      // Status
      if (filter.status && p.status !== filter.status) {
        return false;
      }

       // Phase
      if (filter.phase && p.phase !== filter.phase) {
        return false;
      }
      
      // Category
      if (filter.category && (!p.category || !p.category.includes(filter.category))) {
        return false;
      }

      // Overdue quick filter
      if (filter.onlyOverdue) {
        if (p.status === 'completed' || p.plannedEndDate >= todayStr) {
          return false;
        }
      }

      // Under review quick filter
      if (filter.onlyReviewPending) {
        if (p.status !== 'under_review') {
          return false;
        }
      }

      return true;
    });
  }, [plans, filter]);

  // Newspaper stats & headlines (for masthead + ticker)
  const stats = useMemo(() => {
    const t = new Date().toISOString().slice(0, 10);
    return {
      total: plans.length,
      completed: plans.filter(p => p.status === 'completed').length,
      overdue: plans.filter(p => p.status !== 'completed' && p.plannedEndDate < t).length,
      inProgress: plans.filter(p => p.status === 'in_progress' || p.status === 'under_review').length
    };
  }, [plans]);

  const headlines = useMemo(() => {
    const t = new Date().toISOString().slice(0, 10);
    const parts: string[] = [];
    plans.forEach(p => {
      if (p.status !== 'completed' && p.plannedEndDate < t) {
        parts.push(`⚠ ${p.id} ล่าช้ากว่ากำหนด: ${p.taskTitle}`);
      } else if (p.status === 'in_progress') {
        parts.push(`${p.id}: ${p.taskTitle} — คืบหน้า ${p.progress}%`);
      } else if (p.status === 'under_review') {
        parts.push(`${p.id}: รอผู้ตรวจรับ — ${p.taskTitle}`);
      } else if (p.status === 'completed') {
        parts.push(`${p.id}: เสร็จสมบูรณ์ — ${p.actualKpi || p.taskTitle}`);
      } else {
        parts.push(`${p.id}: ยังไม่เริ่ม — ${p.taskTitle} (เริ่ม ${p.plannedStartDate})`);
      }
    });
    return parts.length > 0 ? parts.join('   •••   ') : 'ยังไม่มีข่าวในระบบ — กดปุ่ม "เพิ่มงาน" เพื่อลงข่าวแรก';
  }, [plans]);

  // Handle Manual Sync
  const handleManualSync = async () => {
    setIsSyncing(true);

    if (supabaseClient) {
      try {
        const remotePlans = await fetchSharedPlans(supabaseClient);
        setPlans(remotePlans);
        setSyncConfig(prev => ({ ...prev, lastSyncTime: new Date().toISOString() }));
        setToastMessage({
          title: 'รับข้อมูลจากฐานข้อมูลกลางแล้ว',
          desc: `ข้อมูล ${remotePlans.length} รายการเป็นข้อมูลล่าสุด`,
          type: 'success'
        });
      } catch (error) {
        console.error('Manual Supabase refresh failed', error);
        setToastMessage({
          title: 'โหลดข้อมูลส่วนกลางไม่สำเร็จ',
          desc: error instanceof Error ? error.message : 'โปรดตรวจสอบการตั้งค่า Supabase',
          type: 'warning'
        });
      }
    } else if (syncConfig.isLiveMode && syncConfig.sheetUrl) {
      try {
        const resp = await fetch(syncConfig.sheetUrl, { method: 'GET', cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (json && json.data && Array.isArray(json.data)) {
          setPlans(json.data);
          setToastMessage({
            title: 'ดึงข้อมูล Google Sheets สำเร็จ!',
            desc: `อัปเดตข้อมูล ${json.data.length} รายการจากคลาวด์เรียบร้อย`,
            type: 'success'
          });
        }
      } catch (error) {
        console.error('Google Sheets refresh failed', error);
        setToastMessage({
          title: 'ดึงข้อมูล Google Sheets ไม่สำเร็จ',
          desc: error instanceof Error ? error.message : 'ตรวจสอบ URL และสิทธิ์การเข้าถึง',
          type: 'warning'
        });
      }
    } else {
      // Simulation delay
      await new Promise(r => setTimeout(r, 600));
      setToastMessage({
        title: 'ข้อมูลอยู่ในเครื่องนี้เท่านั้น',
        desc: 'ตั้งค่า Supabase เพื่อแชร์ข้อมูลเดียวกันแบบเรียลไทม์ระหว่างผู้ใช้',
        type: 'info'
      });
    }

    if (!supabaseClient) setSyncConfig(prev => ({ ...prev, lastSyncTime: new Date().toISOString() }));
    setIsSyncing(false);
  };

  // Simulate an incoming update from AppSheet mobile user
  const handleSimulateAppSheetUpdate = async () => {
    if (!canEditPlans) {
      setToastMessage({ title: 'ดูได้อย่างเดียว', desc: 'เข้าสู่ระบบบัญชีผู้แก้ไขก่อน', type: 'info' });
      return;
    }
    // Pick an active plan to update
    const activePlans = plans.filter(p => p.status !== 'completed');
    if (activePlans.length === 0) {
      setToastMessage({
        title: 'ทุกแผนงานเสร็จสมบูรณ์แล้ว',
        desc: 'ลองสร้างแผนงานใหม่ หรือปรับสถานะเพื่อทดสอบการจำลองอีกครั้ง',
        type: 'info'
      });
      return;
    }

    const targetPlan = activePlans[Math.floor(Math.random() * activePlans.length)];
    const newProgress = Math.min(100, (targetPlan.progress || 0) + 20);
    const newStatus: PlanStatus = newProgress === 100 ? 'under_review' : 'in_progress';

    const updatedPlan: PlanItem = {
      ...targetPlan,
      progress: newProgress,
      status: newStatus,
      actualStartDate: targetPlan.actualStartDate || new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString(),
      syncStatus: 'synced',
      actualKpi: `ความคืบหน้าล่าสุด ${newProgress}% บันทึกจาก AppSheet Mobile`,
      evidenceUrl: targetPlan.evidenceUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    };

    try {
      await savePlanToCloud(updatedPlan);
      setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    } catch (error) {
      console.error('Could not save simulated update', error);
      setToastMessage({ title: 'บันทึกข้อมูลไม่สำเร็จ', desc: error instanceof Error ? error.message : 'ลองใหม่อีกครั้ง', type: 'warning' });
      return;
    }

    addAuditLog({
      action: 'checkin',
      taskId: targetPlan.id,
      taskTitle: targetPlan.taskTitle,
      user: `${targetPlan.assigneeName} (AppSheet Mobile)`,
      details: `อัปเดตความคืบหน้าเป็น ${newProgress}% (${newStatus === 'under_review' ? 'ส่งตรวจรับงาน' : 'กำลังดำเนินการ'})`,
      syncResult: 'success'
    });

    setToastMessage({
      title: `⚡ Webhook จาก AppSheet: ${targetPlan.assigneeName}`,
      desc: `อัปเดตงาน "${targetPlan.taskTitle}" ความคืบหน้าเป็น ${newProgress}% แล้ว`,
      type: 'warning'
    });
  };

  // Status Change Inline
  const handleStatusChange = async (id: string, newStatus: PlanStatus) => {
    if (!canEditPlans) {
      setToastMessage({ title: 'ดูได้อย่างเดียว', desc: 'เข้าสู่ระบบบัญชีผู้แก้ไขก่อน', type: 'info' });
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const plan = plans.find(item => item.id === id);
    if (!plan) return;
    const updated: PlanItem = {
      ...plan,
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : (newStatus === 'not_started' ? 0 : plan.progress),
      actualEndDate: newStatus === 'completed' ? (plan.actualEndDate || todayStr) : plan.actualEndDate,
      lastUpdated: new Date().toISOString(),
      syncStatus: 'synced'
    };
    try {
      await savePlanToCloud(updated);
      setPlans(prev => prev.map(item => item.id === id ? updated : item));
      addAuditLog({
        action: 'status_change',
        taskId: plan.id,
        taskTitle: plan.taskTitle,
        user: cloudUser?.email || 'ผู้บริหารระบบ (Web Dashboard)',
        details: `เปลี่ยนสถานะเป็น ${newStatus}`,
        syncResult: 'success'
      });
    } catch (error) {
      console.error('Could not save status change', error);
      setToastMessage({ title: 'บันทึกสถานะไม่สำเร็จ', desc: error instanceof Error ? error.message : 'ลองใหม่อีกครั้ง', type: 'warning' });
      return;
    }

    setToastMessage({
      title: 'อัปเดตสถานะสำเร็จ',
      desc: `บันทึกสถานะงาน ${id} ลงฐานข้อมูลกลางแล้ว`,
      type: 'success'
    });
  };

  // Progress Change Inline
  const handleProgressChange = async (id: string, newProgress: number) => {
    if (!canEditPlans) {
      setToastMessage({ title: 'ดูได้อย่างเดียว', desc: 'เข้าสู่ระบบบัญชีผู้แก้ไขก่อน', type: 'info' });
      return;
    }
    const plan = plans.find(item => item.id === id);
    if (!plan) return;
    const updated: PlanItem = {
      ...plan,
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : (newProgress === 0 ? 'not_started' : 'in_progress'),
      lastUpdated: new Date().toISOString(),
      syncStatus: 'synced'
    };
    try {
      await savePlanToCloud(updated);
      setPlans(prev => prev.map(item => item.id === id ? updated : item));
    } catch (error) {
      console.error('Could not save progress change', error);
      setToastMessage({ title: 'บันทึกความคืบหน้าไม่สำเร็จ', desc: error instanceof Error ? error.message : 'ลองใหม่อีกครั้ง', type: 'warning' });
    }
  };

  // Save Check-in
  const handleSaveCheckIn = async (updatedPlan: PlanItem) => {
    if (!canEditPlans) {
      setToastMessage({ title: 'ดูได้อย่างเดียว', desc: 'เข้าสู่ระบบบัญชีผู้แก้ไขก่อน', type: 'info' });
      return;
    }
    try {
      await savePlanToCloud(updatedPlan);
    } catch (error) {
      console.error('Could not save check-in', error);
      setToastMessage({ title: 'บันทึกการตรวจรับไม่สำเร็จ', desc: error instanceof Error ? error.message : 'ลองใหม่อีกครั้ง', type: 'warning' });
      return;
    }
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    setCheckInPlan(null);

    addAuditLog({
      action: 'checkin',
      taskId: updatedPlan.id,
      taskTitle: updatedPlan.taskTitle,
      user: updatedPlan.approverName || 'ผู้ตรวจรับงาน',
      details: `ตรวจรับงานแล้ว ผลงาน: "${updatedPlan.actualKpi || 'เสร็จสมบูรณ์'}" (ความคืบหน้า 100%)`,
      syncResult: 'success'
    });

    setToastMessage({
      title: '🎉 บันทึกการตรวจรับงานเรียบร้อย!',
      desc: `บันทึกผลงาน "${updatedPlan.taskTitle}" ลงฐานข้อมูลกลางแล้ว`,
      type: 'success'
    });
  };

  // Save or Create Plan from Form Modal
  const handleSavePlanForm = async (planData: PlanItem) => {
    if (!canEditPlans) {
      setToastMessage({ title: 'ดูได้อย่างเดียว', desc: 'เข้าสู่ระบบบัญชีผู้แก้ไขก่อน', type: 'info' });
      return;
    }
    try {
      await savePlanToCloud(planData);
    } catch (error) {
      console.error('Could not save plan', error);
      setToastMessage({ title: 'บันทึกแผนงานไม่สำเร็จ', desc: error instanceof Error ? error.message : 'ลองใหม่อีกครั้ง', type: 'warning' });
      return;
    }

    const isExisting = plans.some(p => p.id === planData.id);
    if (isExisting) {
      setPlans(prev => prev.map(p => p.id === planData.id ? planData : p));
      addAuditLog({
        action: 'update',
        taskId: planData.id,
        taskTitle: planData.taskTitle,
        user: 'ผู้ดูแลระบบ',
        details: 'แก้ไขข้อมูลรายละเอียดแผนงาน',
        syncResult: 'success'
      });
      setToastMessage({
        title: 'แก้ไขแผนงานสำเร็จ',
        desc: `อัปเดตงาน ${planData.id} เรียบร้อย`,
        type: 'success'
      });
    } else {
      setPlans(prev => [planData, ...prev]);
      addAuditLog({
        action: 'create',
        taskId: planData.id,
        taskTitle: planData.taskTitle,
        user: 'ผู้ดูแลระบบ',
        details: 'สร้างแผนงานใหม่ในระบบ',
        syncResult: 'success'
      });
      setToastMessage({
        title: 'สร้างแผนงานใหม่สำเร็จ!',
        desc: `เพิ่ม ${planData.id} ลงฐานข้อมูลกลางแล้ว`,
        type: 'success'
      });
    }
    setEditingPlan(null);
    setIsNewPlanModalOpen(false);
  };

  // Delete Plan
  const handleDeletePlan = async (id: string) => {
    if (!canEditPlans) {
      setToastMessage({ title: 'ดูได้อย่างเดียว', desc: 'เข้าสู่ระบบบัญชีผู้แก้ไขก่อน', type: 'info' });
      return;
    }
    if (window.confirm(`ยืนยันการลบแผนงานรหัส ${id} ใช่หรือไม่?`)) {
      const plan = plans.find(p => p.id === id);
      try {
        await deletePlanFromCloud(id);
      } catch (error) {
        console.error('Could not delete plan', error);
        setToastMessage({ title: 'ลบแผนงานไม่สำเร็จ', desc: error instanceof Error ? error.message : 'ลองใหม่อีกครั้ง', type: 'warning' });
        return;
      }
      setPlans(prev => prev.filter(p => p.id !== id));
      if (plan) {
        addAuditLog({
          action: 'update',
          taskId: id,
          taskTitle: plan.taskTitle,
          user: 'ผู้ดูแลระบบ',
          details: 'ลบแผนงานออกจากระบบ',
          syncResult: 'success'
        });
      }
      setToastMessage({
        title: 'ลบรายการสำเร็จ',
        desc: `ลบแผนงาน ${id} เรียบร้อย`,
        type: 'info'
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    exportPlansToCSV(filteredPlans);
    setToastMessage({
      title: 'ส่งออกไฟล์ CSV สำเร็จ',
      desc: `ดาวน์โหลดข้อมูล ${filteredPlans.length} รายการเป็นไฟล์ Excel CSV เรียบร้อย`,
      type: 'success'
    });
  };

  // Import CSV
  const handleImportCSV = (file: File) => {
    if (!canEditPlans) {
      setToastMessage({ title: 'ดูได้อย่างเดียว', desc: 'เข้าสู่ระบบบัญชีผู้แก้ไขก่อนนำเข้าข้อมูล', type: 'info' });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (text) {
        const imported = parseCSVToPlans(text);
        if (imported.length > 0) {
          try {
            if (supabaseClient) {
              if (!cloudUser) throw new Error('เข้าสู่ระบบก่อนนำเข้าข้อมูลส่วนกลาง');
              const { error } = await supabaseClient.from('plan_items').upsert(
                imported.map(plan => ({ id: plan.id, data: plan, updated_at: new Date().toISOString() }))
              );
              if (error) throw error;
            }
          } catch (error) {
            console.error('Could not import plans to shared database', error);
            setToastMessage({ title: 'นำเข้าข้อมูลไม่สำเร็จ', desc: error instanceof Error ? error.message : 'ตรวจสอบการเชื่อมต่อ', type: 'warning' });
            return;
          }
          setPlans(imported);
          setToastMessage({
            title: 'นำเข้าข้อมูล CSV สำเร็จ!',
            desc: `โหลดข้อมูล ${imported.length} แผนงานเข้าสู่ระบบเรียบร้อย`,
            type: 'success'
          });
        } else {
          setToastMessage({
            title: 'ไม่สามารถนำเข้าข้อมูลได้',
            desc: 'รูปแบบไฟล์ CSV ไม่ตรงกับโครงสร้างที่กำหนด',
            type: 'warning'
          });
        }
      }
    };
    reader.readAsText(file);
  };

  // Format last sync time
  const lastSyncFormatted = useMemo(() => {
    if (!syncConfig.lastSyncTime) return '';
    try {
      const d = new Date(syncConfig.lastSyncTime);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  }, [syncConfig.lastSyncTime]);

  const shareLiveView = async () => {
    if (!syncConfig.supabaseUrl || !syncConfig.supabaseAnonKey) {
      setIsSupabaseSetupOpen(true);
      return;
    }

    const shareUrl = new URL(window.location.href);
    shareUrl.search = '';
    shareUrl.searchParams.set('view', 'readonly');
    shareUrl.searchParams.set('sbUrl', syncConfig.supabaseUrl);
    shareUrl.searchParams.set('sbKey', syncConfig.supabaseAnonKey);
    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      setToastMessage({
        title: 'คัดลอกลิงก์ดูสดแล้ว',
        desc: 'ผู้รับลิงก์ดูได้อย่างเดียว และจะเห็นข้อมูลส่วนกลางที่อัปเดตแบบเรียลไทม์',
        type: 'success'
      });
    } catch (error) {
      console.error('Could not copy live share URL', error);
      setToastMessage({
        title: 'คัดลอกลิงก์ไม่สำเร็จ',
        desc: 'เบราว์เซอร์ไม่อนุญาตให้คัดลอก กรุณาเปิดการตั้งค่าคลาวด์เพื่อสร้างลิงก์ใหม่',
        type: 'warning'
      });
    }
  };

  const seedPlansToCloud = async () => {
    if (!supabaseClient || !cloudUser) throw new Error('เข้าสู่ระบบบัญชีผู้แก้ไขก่อนนำเข้าข้อมูล');
    const plansToSeed = localPlansForMigration.length ? localPlansForMigration : plans;
    if (plansToSeed.length === 0) throw new Error('ไม่มีข้อมูลในเครื่องให้นำเข้า');
    const { data: existing, error: readError } = await supabaseClient
      .from('plan_items')
      .select('id')
      .limit(1);
    if (readError) throw readError;
    if (existing && existing.length > 0) {
      throw new Error('ฐานข้อมูลส่วนกลางมีข้อมูลแล้ว เพื่อป้องกันข้อมูลเดิมถูกเขียนทับ จึงยกเลิกการนำเข้า');
    }
    const { error } = await supabaseClient.from('plan_items').insert(
      plansToSeed.map(plan => ({ id: plan.id, data: plan, updated_at: new Date().toISOString() }))
    );
    if (error) throw error;
    setLocalPlansForMigration([]);
  };

  const query = new URLSearchParams(window.location.search);
  const isSharedReadOnly = query.get('view') === 'readonly';
  if (isSharedReadOnly) {
    return (
      <ReadOnlySnapshot
        supabaseUrl={query.get('sbUrl') || ''}
        supabaseAnonKey={query.get('sbKey') || ''}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* 1. Newspaper Masthead + Toolbar */}
      <Header
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        onSimulateAppSheetUpdate={handleSimulateAppSheetUpdate}
        onOpenSetup={() => setIsSetupModalOpen(true)}
        onOpenCloudSetup={() => setIsSupabaseSetupOpen(true)}
        onOpenCloudAccess={() => setIsCloudAccessOpen(true)}
        onShareLiveView={() => void shareLiveView()}
        canEditPlans={canEditPlans}
        cloudConfigured={Boolean(supabaseClient)}
        onOpenAuditLogs={() => setIsAuditLogOpen(true)}
        onOpenNewPlanModal={() => {
          setEditingPlan(null);
          setIsNewPlanModalOpen(true);
        }}
        lastSyncFormatted={lastSyncFormatted}
        stats={stats}
        headlines={headlines}
      />

      {/* 2. Floating Toast — "Breaking News" flash */}
      {toastMessage && (
        <div key={toastMessage.title + toastMessage.desc} className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md bg-[var(--paper-card)] shadow-[4px_4px_0_rgba(33,26,18,0.5)] border-2 border-[var(--ink)] p-3.5 flex items-start gap-3 animate-pop no-print">
          <div className={`w-8 h-8 border-2 flex items-center justify-center shrink-0 ${
            toastMessage.type === 'success' ? 'border-[var(--green-ink)] text-[var(--green-ink)]' :
            toastMessage.type === 'warning' ? 'border-[var(--red-ink)] text-[var(--red-ink)]' :
            'border-[var(--blue-ink)] text-[var(--blue-ink)]'
          }`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
             toastMessage.type === 'warning' ? <Zap className="w-4 h-4" /> :
             <Bell className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="stamp text-[8px] text-[var(--red-ink)] !rotate-[-3deg] shrink-0">ข่าวล่าสุด</span>
            </div>
            <h4 className="font-bold text-xs text-[var(--ink)] leading-snug">{toastMessage.title}</h4>
            <p className="font-type text-[11px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[var(--ink-faint)] hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* KPI Overview Metrics */}
        <MetricsOverview 
          plans={plans} 
          onFilterClick={(type) => {
            if (type === 'completed') setFilter(prev => ({ ...prev, status: 'completed', onlyOverdue: false, phase: '', category: '' }));
            if (type === 'in_progress') setFilter(prev => ({ ...prev, status: 'in_progress', onlyOverdue: false, phase: '', category: '' }));
            if (type === 'overdue') setFilter(prev => ({ ...prev, onlyOverdue: true, status: '', phase: '', category: '' }));
          }}
        />

        {/* Filter & View Switcher Bar */}
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExportCSV={handleExportCSV}
          totalFiltered={filteredPlans.length}
        />

        {/* Dynamic View Body — animated on view switch */}
        <div key={viewMode} className="animate-rise" inert={supabaseClient && !canEditPlans ? true : undefined}>
        {viewMode === 'table' && (
          <TableView
            plans={filteredPlans}
            onStatusChange={handleStatusChange}
            onProgressChange={handleProgressChange}
            onCheckIn={(p) => setCheckInPlan(p)}
            onEdit={(p) => {
              setEditingPlan(p);
              setIsNewPlanModalOpen(true);
            }}
            onDelete={handleDeletePlan}
            onViewPhoto={(url, title) => setPreviewPhoto({ url, title })}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            plans={filteredPlans}
            onStatusChange={handleStatusChange}
            onCheckIn={(p) => setCheckInPlan(p)}
            onEdit={(p) => {
              setEditingPlan(p);
              setIsNewPlanModalOpen(true);
            }}
            onViewPhoto={(url, title) => setPreviewPhoto({ url, title })}
          />
        )}

        {viewMode === 'timeline' && (
          <TimelineView
            plans={filteredPlans}
            onCheckIn={(p) => setCheckInPlan(p)}
            onEdit={(p) => {
              setEditingPlan(p);
              setIsNewPlanModalOpen(true);
            }}
          />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsView plans={plans} />
        )}

        {viewMode === 'architecture' && (
          <GuideTab />
        )}
        </div>

      </main>

      {/* 4. Footer colophon */}
      <footer className="bg-[var(--paper-card)] rule-h-double mt-12 py-4 px-4 sm:px-8 text-xs text-[var(--ink-soft)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-type text-[11px]">
            © 2568 <strong className="text-[var(--ink)]">PLANFLOW NAVASIAM (P.NVS)</strong> — หนังสือพิมพ์แผนงานรายวัน · ตีพิมพ์จาก Google Sheets & AppSheet · ราคา 25 สตางค์
          </p>
          <div className="flex items-center gap-4 font-type text-[11px]">
            <button
              onClick={() => setViewMode('architecture')}
              className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>คู่มือและโครงสร้างระบบ</span>
            </button>
            <span className="text-[var(--ink-faint)]">•</span>
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline underline-offset-2 cursor-pointer"
            >
              ตั้งค่า Google Sheet
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      {checkInPlan && (
        <CheckInModal
          plan={checkInPlan}
          isOpen={Boolean(checkInPlan)}
          onClose={() => setCheckInPlan(null)}
          onSave={handleSaveCheckIn}
        />
      )}

      {isNewPlanModalOpen && (
        <PlanFormModal
          isOpen={isNewPlanModalOpen}
          initialData={editingPlan}
          onClose={() => {
            setIsNewPlanModalOpen(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlanForm}
        />
      )}

      {isSetupModalOpen && (
        <SheetSetupModal
          isOpen={isSetupModalOpen}
          config={syncConfig}
          onClose={() => setIsSetupModalOpen(false)}
          onSaveConfig={(newConfig) => {
            setSyncConfig(newConfig);
            setToastMessage({
              title: 'บันทึกการตั้งค่าเรียบร้อย',
              desc: `โหมด: ${newConfig.isLiveMode ? 'Live GAS Web App' : 'Real-time Simulation'}`,
              type: 'info'
            });
          }}
          onImportCSV={handleImportCSV}
        />
      )}

      {isSupabaseSetupOpen && (
        <SupabaseSetupModal
          config={syncConfig}
          client={supabaseClient}
          user={cloudUser}
          plans={localPlansForMigration.length ? localPlansForMigration : plans}
          onClose={() => setIsSupabaseSetupOpen(false)}
          onSave={newConfig => {
            if (!supabaseClient) setLocalPlansForMigration(plans);
            setSyncConfig(newConfig);
          }}
          onSignIn={() => setIsCloudAccessOpen(true)}
          onSeedPlans={seedPlansToCloud}
        />
      )}

      {isCloudAccessOpen && supabaseClient && (
        <CloudAccessModal
          client={supabaseClient}
          user={cloudUser}
          onClose={() => setIsCloudAccessOpen(false)}
          onSignedOut={() => setCloudUser(null)}
        />
      )}

      {isAuditLogOpen && (
        <AuditLogModal
          isOpen={isAuditLogOpen}
          logs={logs}
          onClose={() => setIsAuditLogOpen(false)}
          onClearLogs={() => setLogs([])}
        />
      )}

      {previewPhoto && (
        <PhotoViewModal
          url={previewPhoto.url}
          title={previewPhoto.title}
          onClose={() => setPreviewPhoto(null)}
        />
      )}

    </div>
  );
}

export default App;
