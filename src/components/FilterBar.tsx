import React from 'react';
import { 
  Search, 
  Table, 
  Columns3, 
  CalendarRange, 
  BarChart3, 
  BookOpen, 
  Download,
  AlertCircle,
  X
} from 'lucide-react';
import { FilterState, ViewMode } from '../types';
import { DEPARTMENTS, CATEGORIES, PHASES } from '../data/initialPlans';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExportCSV: () => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onExportCSV,
  totalFiltered
}) => {
  const hasActiveFilters = Boolean(
    filter.search || 
    filter.department || 
    filter.status || 
    filter.phase || 
    filter.category ||
    filter.onlyOverdue || 
    filter.onlyReviewPending
  );

  const resetFilters = () => {
    onFilterChange({
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
  };

  const viewBtn = (mode: ViewMode, icon: React.ReactNode, label: string, active = false) => (
    <button
      onClick={() => onViewModeChange(mode)}
      className={`flex items-center gap-1.5 px-3 py-1.5 font-type text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
        viewMode === mode
          ? 'bg-[var(--ink)] text-[#f6efdd] border-[var(--ink)] shadow-[2px_2px_0_rgba(158,43,37,0.6)]'
          : active
          ? 'text-[var(--red-ink)] border-[var(--red-ink)] hover:bg-[rgba(158,43,37,0.06)]'
          : 'text-[var(--ink-soft)] border-[var(--ink)]/50 hover:border-[var(--ink)] hover:bg-[rgba(33,26,18,0.05)]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="paper-card p-3 sm:p-4 mb-5 no-print space-y-3">
      
      {/* View modes row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-headline text-xs tracking-[0.2em] uppercase mr-1">สารบัญ:</span>
          {viewBtn('table', <Table className="w-3.5 h-3.5" />, 'ตารางงาน')}
          {viewBtn('kanban', <Columns3 className="w-3.5 h-3.5" />, 'บอร์ดคัมบัง')}
          {viewBtn('timeline', <CalendarRange className="w-3.5 h-3.5" />, 'ไทม์ไลน์')}
          {viewBtn('analytics', <BarChart3 className="w-3.5 h-3.5" />, 'วิเคราะห์ KPI')}
          {viewBtn('architecture', <BookOpen className="w-3.5 h-3.5" />, '📘 คู่มือ & โครงสร้าง', true)}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="font-type text-[11px] text-[var(--ink-soft)]">
            พบ <strong className="text-[var(--ink)]">{totalFiltered}</strong> ข่าว
          </span>
          <button
            onClick={onExportCSV}
            className="btn-ink text-[11px] px-3 py-1.5 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      <div className="rule-double"></div>

      {/* Search & filters row */}
      <div className="flex flex-wrap items-center gap-2">
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาข่าว: ชื่อโครงการ, งาน, ผู้รับผิดชอบ, สถานที่..."
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 font-type text-sm bg-[#fffdf2] border border-[var(--ink)] rounded-none focus:outline-none focus:shadow-[2px_2px_0_rgba(33,26,18,0.7)] placeholder:text-[var(--ink-faint)]"
          />
        </div>

        <select
          value={filter.department}
          onChange={(e) => onFilterChange({ ...filter, department: e.target.value })}
          className="font-type text-xs bg-transparent border border-[var(--ink)] px-2 py-2 focus:outline-none cursor-pointer"
        >
          <option value="">ทุกทีม / แผนก</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={filter.status}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
          className="font-type text-xs bg-transparent border border-[var(--ink)] px-2 py-2 focus:outline-none cursor-pointer"
        >
          <option value="">ทุกสถานะ</option>
          <option value="not_started">ยังไม่เริ่ม</option>
          <option value="in_progress">กำลังทำ</option>
          <option value="under_review">รอตรวจรับ</option>
          <option value="completed">เสร็จสมบูรณ์</option>
          <option value="delayed">มีปัญหา/ล่าช้า</option>
        </select>

        <select
          value={filter.phase}
          onChange={(e) => onFilterChange({ ...filter, phase: e.target.value })}
          className="font-type text-xs bg-transparent border border-[var(--ink)] px-2 py-2 focus:outline-none cursor-pointer"
        >
          <option value="">ทุกเฟส</option>
          {PHASES.map(phase => (
            <option key={phase} value={phase}>{phase}</option>
          ))}
        </select>

        <select
          value={filter.category}
          onChange={(e) => onFilterChange({ ...filter, category: e.target.value })}
          className="font-type text-xs bg-transparent border border-[var(--ink)] px-2 py-2 focus:outline-none cursor-pointer"
        >
          <option value="">ทุกหมวดหมู่</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={() => onFilterChange({ ...filter, onlyOverdue: !filter.onlyOverdue })}
          className={`stamp text-[11px] px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors ${
            filter.onlyOverdue
              ? 'bg-[var(--red-ink)] text-[#fdf8ec]'
              : 'text-[var(--red-ink)] hover:bg-[rgba(158,43,37,0.08)]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>เฉพาะงานล่าช้า</span>
        </button>

        <button
          onClick={() => onFilterChange({ ...filter, onlyReviewPending: !filter.onlyReviewPending })}
          className={`stamp text-[11px] px-2 py-1 cursor-pointer transition-colors ${
            filter.onlyReviewPending
              ? 'bg-[var(--amber-ink)] text-[#fdf8ec]'
              : 'text-[var(--amber-ink)] hover:bg-[rgba(138,101,32,0.08)]'
          }`}
        >
          <span>รอตรวจรับงาน</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="font-type text-[11px] text-[var(--ink-soft)] hover:text-[var(--ink)] underline underline-offset-2 cursor-pointer flex items-center gap-1 px-2 py-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

    </div>
  );
};
