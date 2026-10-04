import React from 'react';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  User, 
  CheckSquare 
} from 'lucide-react';
import { PlanItem, PlanStatus } from '../types';

interface KanbanViewProps {
  plans: PlanItem[];
  onStatusChange: (id: string, newStatus: PlanStatus) => void;
  onCheckIn: (plan: PlanItem) => void;
  onEdit: (plan: PlanItem) => void;
  onViewPhoto: (url: string, title: string) => void;
}

const COLUMNS: { key: PlanStatus; title: string; color: string; badgeBg: string }[] = [
  { key: 'not_started', title: 'ยังไม่เริ่ม (Not Started)', color: 'border-slate-300 text-slate-700', badgeBg: 'bg-slate-200 text-slate-700' },
  { key: 'in_progress', title: 'กำลังดำเนินการ (In Progress)', color: 'border-blue-400 text-blue-800', badgeBg: 'bg-blue-100 text-blue-700' },
  { key: 'under_review', title: 'รอตรวจรับงาน (Under Review)', color: 'border-amber-400 text-amber-800', badgeBg: 'bg-amber-100 text-amber-700' },
  { key: 'completed', title: 'เสร็จสมบูรณ์ (Completed)', color: 'border-emerald-400 text-emerald-800', badgeBg: 'bg-emerald-100 text-emerald-700' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  plans,
  onStatusChange,
  onCheckIn,
  onEdit,
  onViewPhoto
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const getNextStatus = (current: PlanStatus): PlanStatus | null => {
    if (current === 'not_started') return 'in_progress';
    if (current === 'in_progress') return 'under_review';
    if (current === 'under_review') return 'completed';
    return null;
  };

  const getPrevStatus = (current: PlanStatus): PlanStatus | null => {
    if (current === 'completed') return 'under_review';
    if (current === 'under_review') return 'in_progress';
    if (current === 'in_progress') return 'not_started';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map(col => {
        // Delayed tasks also appear under in_progress or review if applicable
        const colPlans = plans.filter(p => {
          if (col.key === 'in_progress') {
            return p.status === 'in_progress' || p.status === 'delayed';
          }
          return p.status === col.key;
        });

        return (
          <div 
            key={col.key} 
            className="bg-slate-50/80 rounded-xl border border-slate-200 p-3 flex flex-col max-h-[800px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b-4 border-double border-[var(--ink)]">
              <div className="flex items-center gap-2">
                <h3 className="font-type font-bold text-xs sm:text-sm uppercase tracking-wider text-[var(--ink)]">
                  {col.title.split('(')[0]}
                </h3>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                {colPlans.length}
              </span>
            </div>

            {/* Card List */}
            <div className="space-y-3 overflow-y-auto pr-1">
              {colPlans.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white/50">
                  ไม่มีแผนงานในสถานะนี้
                </div>
              ) : (
                colPlans.map(plan => {
                  const isOverdue = plan.status !== 'completed' && plan.plannedEndDate < todayStr;
                  const prevStatus = getPrevStatus(plan.status);
                  const nextStatus = getNextStatus(plan.status);

                  return (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-xl p-3.5 border transition-all shadow-xs hover:shadow-md relative ${
                        isOverdue 
                          ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10' 
                          : plan.status === 'completed'
                          ? 'border-emerald-200'
                          : 'border-slate-200/90'
                      }`}
                    >
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-mono text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {plan.id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {plan.department}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 
                        onClick={() => onEdit(plan)}
                        className="font-semibold text-xs sm:text-sm text-slate-800 hover:text-blue-600 cursor-pointer line-clamp-2 mb-1.5"
                      >
                        {plan.taskTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                        📁 {plan.projectName}
                      </p>

                      {/* Photo preview if any */}
                      {plan.evidenceUrl && (
                        <div 
                          onClick={() => onViewPhoto(plan.evidenceUrl!, plan.taskTitle)}
                          className="relative rounded-lg overflow-hidden h-24 mb-2.5 cursor-pointer group"
                        >
                          <img 
                            src={plan.evidenceUrl} 
                            alt={plan.taskTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                              🔍 ดูภาพหลักฐาน
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Overdue alert badge */}
                      {isOverdue && (
                        <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 p-1 rounded border border-red-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>เกินกำหนดส่ง {plan.plannedEndDate}</span>
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="mb-2.5">
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>ความคืบหน้า</span>
                          <span className="font-bold text-slate-700">{plan.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              plan.progress === 100 
                                ? 'bg-emerald-500' 
                                : plan.progress >= 50 
                                ? 'bg-blue-600' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Assignee & Dates */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          {plan.assigneeAvatar ? (
                            <img 
                              src={plan.assigneeAvatar} 
                              alt={plan.assigneeName} 
                              className="w-5 h-5 rounded-full object-cover" 
                            />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="truncate max-w-[80px]">{plan.assigneeName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{plan.plannedEndDate.slice(5)}</span>
                        </div>
                      </div>

                      {/* Card Action footer (Move columns & Check-in) */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {prevStatus && (
                            <button
                              onClick={() => onStatusChange(plan.id, prevStatus)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="ย้อนสถานะ"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={() => onStatusChange(plan.id, nextStatus)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="เลื่อนสถานะถัดไป"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => onCheckIn(plan)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer ml-auto"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>{plan.status === 'completed' ? 'ดูผลตรวจ' : 'ตรวจรับงาน'}</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
