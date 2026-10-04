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
import { INITIAL_PLANS } from './data/initialPlans';
import { exportPlansToCSV, parseCSVToPlans } from './utils/sheetSync';

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

const LOCAL_STORAGE_KEY = 'plantrack_plans_v1';
const SYNC_CONFIG_KEY = 'plantrack_sync_config_v1';
const AUDIT_LOGS_KEY = 'plantrack_audit_logs_v1';

export function App() {
  // 1. Data States
  const [plans, setPlans] = useState<PlanItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLANS;
  });

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
      lastSyncTime: new Date().toISOString()
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error(e);
    }
  }, [plans]);

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

    if (syncConfig.isLiveMode && syncConfig.sheetUrl) {
      try {
        const resp = await fetch(syncConfig.sheetUrl, { method: 'GET' });
        const json = await resp.json();
        if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
          setPlans(json.data);
          setToastMessage({
            title: 'ดึงข้อมูล Google Sheets สำเร็จ!',
            desc: `อัปเดตข้อมูล ${json.data.length} รายการจากคลาวด์เรียบร้อย`,
            type: 'success'
          });
        }
      } catch (err) {
        setToastMessage({
          title: 'จำลองการซิงค์ข้อมูล (Simulated)',
          desc: 'ตรวจสอบการเชื่อมต่อ Google Sheets แล้ว ข้อมูลในระบบเป็นปัจจุบัน',
          type: 'info'
        });
      }
    } else {
      // Simulation delay
      await new Promise(r => setTimeout(r, 600));
      setToastMessage({
        title: 'ซิงค์ข้อมูลเรียลไทม์เรียบร้อย',
        desc: 'ตรวจสอบข้อมูลกับ Google Sheets ล่าสุด ข้อมูลทุกแผนงานตรงกัน',
        type: 'success'
      });
    }

    setSyncConfig(prev => ({ ...prev, lastSyncTime: new Date().toISOString() }));
    setIsSyncing(false);
  };

  // Simulate an incoming update from AppSheet mobile user
  const handleSimulateAppSheetUpdate = () => {
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

    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));

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
  const handleStatusChange = (id: string, newStatus: PlanStatus) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setPlans(prev => prev.map(p => {
      if (p.id === id) {
        const updated: PlanItem = {
          ...p,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : (newStatus === 'not_started' ? 0 : p.progress),
          actualEndDate: newStatus === 'completed' ? (p.actualEndDate || todayStr) : p.actualEndDate,
          lastUpdated: new Date().toISOString(),
          syncStatus: 'synced'
        };

        addAuditLog({
          action: 'status_change',
          taskId: p.id,
          taskTitle: p.taskTitle,
          user: 'ผู้บริหารระบบ (Web Dashboard)',
          details: `เปลี่ยนสถานะเป็น ${newStatus}`,
          syncResult: 'success'
        });

        return updated;
      }
      return p;
    }));

    setToastMessage({
      title: 'อัปเดตสถานะสำเร็จ',
      desc: `บันทึกสถานะงาน ${id} และส่งข้อมูลกลับ Google Sheets ทันที`,
      type: 'success'
    });
  };

  // Progress Change Inline
  const handleProgressChange = (id: string, newProgress: number) => {
    setPlans(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus: PlanStatus = newProgress === 100 ? 'completed' : (newProgress === 0 ? 'not_started' : 'in_progress');
        return {
          ...p,
          progress: newProgress,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          syncStatus: 'synced'
        };
      }
      return p;
    }));
  };

  // Save Check-in
  const handleSaveCheckIn = (updatedPlan: PlanItem) => {
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
      desc: `งาน "${updatedPlan.taskTitle}" ได้รับการบันทึกผลงานลง Google Sheet เรียบร้อยแล้ว`,
      type: 'success'
    });
  };

  // Save or Create Plan from Form Modal
  const handleSavePlanForm = (planData: PlanItem) => {
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
        desc: `เพิ่ม ${planData.id} เข้าสู่ Google Sheet เรียบร้อย`,
        type: 'success'
      });
    }
    setEditingPlan(null);
    setIsNewPlanModalOpen(false);
  };

  // Delete Plan
  const handleDeletePlan = (id: string) => {
    if (window.confirm(`ยืนยันการลบแผนงานรหัส ${id} ใช่หรือไม่?`)) {
      const plan = plans.find(p => p.id === id);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const imported = parseCSVToPlans(text);
        if (imported.length > 0) {
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

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* 1. Newspaper Masthead + Toolbar */}
      <Header
        syncConfig={syncConfig}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        onSimulateAppSheetUpdate={handleSimulateAppSheetUpdate}
        onOpenSetup={() => setIsSetupModalOpen(true)}
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
        <div key={viewMode} className="animate-rise">
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
