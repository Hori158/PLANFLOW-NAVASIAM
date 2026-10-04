import React from 'react';
import { 
  RefreshCw, 
  History, 
  Zap, 
  ExternalLink,
  Share2,
  LockKeyhole,
  Database
} from 'lucide-react';

interface HeaderProps {
  isSyncing: boolean;
  onManualSync: () => void;
  onSimulateAppSheetUpdate: () => void;
  onOpenSetup: () => void;
  onOpenAuditLogs: () => void;
  onOpenNewPlanModal: () => void;
  onOpenCloudSetup: () => void;
  onOpenCloudAccess: () => void;
  onShareLiveView: () => void;
  canEditPlans: boolean;
  cloudConfigured: boolean;
  lastSyncFormatted: string;
  stats: { total: number; completed: number; overdue: number; inProgress: number };
  headlines: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSyncing,
  onManualSync,
  onSimulateAppSheetUpdate,
  onOpenSetup,
  onOpenAuditLogs,
  onOpenNewPlanModal,
  onOpenCloudSetup,
  onOpenCloudAccess,
  onShareLiveView,
  canEditPlans,
  cloudConfigured,
  lastSyncFormatted,
  stats,
  headlines
}) => {
  const todayThai = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Issue number counted from 1950 — a fun vintage touch
  const issueNo = Math.max(1, Math.floor((Date.now() - new Date(1950, 0, 1).getTime()) / 86400000));

  return (
    <>
      {/* ===== Masthead (big newspaper name) ===== */}
      <div className="bg-[var(--paper-card)] border-b-2 border-[var(--ink)] animate-fade">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          
          {/* Top date line */}
          <div className="flex items-center justify-between font-type text-[10px] sm:text-[11px] py-1.5 border-b border-[var(--ink)]/70 text-[var(--ink-soft)]">
            <span className="tracking-wider">ฉบับเช้า · ราคา 25 สตางค์ · Vol. 1, No. {issueNo}</span>
            <span className="hidden md:block tracking-widest uppercase">P.NVS Daily News — แผนงานฉบับพิเศษ</span>
            <span className="tracking-wider">{todayThai}</span>
          </div>

          {/* Masthead title */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 py-3 sm:py-5">
            <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-[var(--ink)] text-center leading-tight shrink-0">
              <span className="font-headline text-sm">EST.</span>
              <span className="font-headline text-lg">1950</span>
              <span className="font-type text-[8px] text-[var(--ink-soft)]">· BANGKOK ·</span>
            </div>

            <div className="text-center min-w-0">
              <p className="font-type text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[var(--ink-soft)] mb-1 hidden sm:block">
                ★ หนังสือพิมพ์แผนงานรายวัน ★
              </p>
              <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-[var(--ink)]">
                PLANFLOW <span className="text-[var(--red-ink)]">NAVASIAM</span>
              </h1>
              <p className="font-type text-[10px] sm:text-xs tracking-[0.25em] mt-1.5 text-[var(--ink-soft)]">
                P.NVS — รายงานความคืบหน้าของทุกชิ้นงาน · อัปเดตแบบเรียลไทม์จาก Google Sheets & AppSheet
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-[var(--ink)] text-center leading-tight shrink-0">
              <span className="font-headline text-lg">P.NVS</span>
              <span className="font-type text-[8px] text-[var(--ink-soft)]">DAILY EDITION</span>
              <span className="font-type text-[8px] text-[var(--ink-soft)]">· EST. 1950 ·</span>
            </div>
          </div>

          {/* Bottom date line */}
          <div className="flex items-center justify-between font-type text-[10px] sm:text-[11px] py-1.5 border-t border-[var(--ink)]/70 text-[var(--ink-soft)]">
            <span>◈ แผนงานทั้งหมด {stats.total} ชิ้น</span>
            <span>◈ เสร็จสิ้น {stats.completed} · กำลังทำ {stats.inProgress}</span>
            <span className={stats.overdue > 0 ? 'text-[var(--red-ink)] font-bold' : ''}>
              ◈ ล่าช้ากว่ากำหนด {stats.overdue} {stats.overdue > 0 ? '⚠' : '✓'}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Breaking news ticker ===== */}
      <div className="bg-[var(--ink)] text-[#f3ecdb] overflow-hidden">
        <div className="flex items-stretch">
          <span className="bg-[var(--red-ink)] font-headline text-[11px] sm:text-xs px-3 flex items-center shrink-0 tracking-widest uppercase">
            พาดหัว
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="ticker-track font-type text-[11px] sm:text-xs py-1.5">
              <span className="pr-16">{headlines}</span>
              <span className="pr-16">{headlines}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Sticky toolbar with actions (stuck to top while scrolling) ===== */}
      <div className="sticky top-0 z-40 bg-[var(--paper-card)]/95 backdrop-blur border-b-2 border-[var(--ink)] shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto">
          
          {/* Live wire status */}
          <div className="flex items-center gap-2 font-type text-[11px] whitespace-nowrap pr-2 border-r border-[var(--ink)]/40 mr-1">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-[var(--green-ink)] animate-pulse'}`}></span>
            <span>
              {isSyncing ? 'กำลังอัปเดตข้อมูล...' : `อัปเดตล่าสุด ${lastSyncFormatted || '--:--:--'}`} · {cloudConfigured ? 'LIVE' : 'LOCAL'}
            </span>
          </div>

          {/* Simulate AppSheet */}
          <button
            onClick={onSimulateAppSheetUpdate}
            disabled={!canEditPlans}
            title="จำลองเหตุการณ์ทีมงานอัปเดตงานผ่าน AppSheet"
            className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--amber-ink)]" />
            <span className="hidden sm:inline">จำลอง AppSheet</span>
            <span className="sm:hidden">AppSheet</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            title="ดึงข้อมูลล่าสุดจาก Google Sheets"
            className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
            <span className="sm:hidden">Sync</span>
          </button>

          {/* Audit logs */}
          <button
            onClick={onOpenAuditLogs}
            title="ประวัติการเปลี่ยนแปลง (บันทึกข่าว)"
            className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">บันทึก</span>
            <span className="md:hidden">Log</span>
          </button>

          {/* Sheet setup */}
          <button
            onClick={onOpenSetup}
            title="ตั้งค่าการเชื่อมต่อ Google Sheets & AppSheet"
            className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">เชื่อมต่อ Sheets</span>
            <span className="md:hidden">Sheets</span>
          </button>

          <button
            onClick={onOpenCloudSetup}
            title="ตั้งค่าฐานข้อมูลกลางและลิงก์แชร์แบบเรียลไทม์"
            className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">คลาวด์ / แชร์</span>
            <span className="lg:hidden">คลาวด์</span>
          </button>

          <button
            onClick={onShareLiveView}
            title="คัดลอกลิงก์ดูข้อมูลล่าสุดแบบเรียลไทม์ โดยเปิดดูได้อย่างเดียว"
            className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>แชร์ดูสด</span>
          </button>

          {cloudConfigured && (
            <button
              onClick={onOpenCloudAccess}
              title={canEditPlans ? 'บัญชีผู้แก้ไข' : 'เข้าสู่ระบบบัญชีผู้แก้ไข'}
              className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
            >
              <LockKeyhole className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{canEditPlans ? 'บัญชีผู้แก้ไข' : 'เข้าสู่ระบบ'}</span>
              <span className="lg:hidden">{canEditPlans ? 'บัญชี' : 'ล็อกอิน'}</span>
            </button>
          )}

          <div className="flex-1 min-w-4"></div>

          {/* ===== THE "ADD TASK" BUTTON — Place a new story ===== */}
          <button
            onClick={onOpenNewPlanModal}
            disabled={!canEditPlans}
            className="btn-ink btn-red text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 flex items-center gap-2"
          >
            <span className="font-headline text-base leading-none">＋</span>
            <span>เพิ่มงาน (ลงข่าวใหม่)</span>
          </button>

        </div>
      </div>

    </>
  );
};
