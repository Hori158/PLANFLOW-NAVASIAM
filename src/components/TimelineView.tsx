import React from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  User, 
  CheckSquare
} from 'lucide-react';
import { PlanItem } from '../types';

interface TimelineViewProps {
  plans: PlanItem[];
  onCheckIn: (plan: PlanItem) => void;
  onEdit: (plan: PlanItem) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ plans, onCheckIn, onEdit }) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Sort plans by plannedStartDate
  const sortedPlans = [...plans].sort((a, b) => a.plannedStartDate.localeCompare(b.plannedStartDate));

  // Get all unique dates
  const allDates: Set<string> = new Set();
  sortedPlans.forEach(p => {
    allDates.add(p.plannedStartDate);
    allDates.add(p.plannedEndDate);
    if (p.actualStartDate) allDates.add(p.actualStartDate);
    if (p.actualEndDate) allDates.add(p.actualEndDate);
  });

  // Group plans by phase
  const plansByPhase: Record<string, PlanItem[]> = {};
  sortedPlans.forEach(p => {
    if (!plansByPhase[p.phase]) {
      plansByPhase[p.phase] = [];
    }
    plansByPhase[p.phase].push(p);
  });

  // Get all phases sorted
  const sortedPhases = Object.keys(plansByPhase).sort();

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[var(--ink)]">
        <div>
          <h3 className="font-headline text-sm sm:text-lg text-[var(--ink)]">
            ฉบับพิเศษ · แผนงานตามเฟส (Phase Timeline)
          </h3>
          <p className="font-type text-[11px] text-[var(--ink-soft)] mt-0.5">
            ดูการจัดเรียงงานตามเฟสและกำหนดเวลา เพื่อวางแผนและติดตามความคืบหน้า
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
            <span className="text-slate-600">กำหนดตามแผน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-600">ทำเสร็จจริง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
            <span className="text-slate-600">ล่าช้า</span>
          </div>
        </div>
      </div>

      {/* Phase-based Timeline */}
      <div className="space-y-6">
        {sortedPhases.map(phase => {
          const phasePlans = plansByPhase[phase];
          
          // Sort by start date within phase
          const sortedPhasePlans = [...phasePlans].sort((a, b) => 
            a.plannedStartDate.localeCompare(b.plannedStartDate)
          );

          return (
            <div key={phase} className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 sm:p-5">
              {/* Phase Header */}
              <div className="mb-4 pb-3 border-b border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-indigo-600"></span>
                  {phase}
                  <span className="text-xs text-slate-400 font-normal">({phasePlans.length} แผนงาน)</span>
                </h4>
              </div>

              {/* Timeline bars for this phase */}
              <div className="space-y-4">
                {sortedPhasePlans.map(plan => {
                  const isOverdue = plan.status !== 'completed' && plan.plannedEndDate < todayStr;
                  const isCompleted = plan.status === 'completed';
                  const progressWidth = `${plan.progress}%`;



                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isOverdue 
                          ? 'border-red-300 bg-red-50/20' 
                          : isCompleted 
                          ? 'border-emerald-200 bg-emerald-50/10' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Timeline bar header */}
                      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {plan.id}
                            </span>
                            <span className="font-medium text-slate-800 text-sm truncate">
                              {plan.taskTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {plan.plannedStartDate} → {plan.plannedEndDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {plan.assigneeName}
                            </span>
                            <span className="flex items-center gap-1">
                              {Array.isArray(plan.category) ? plan.category.join(', ') : plan.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onCheckIn(plan)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isCompleted ? 'ดูผล' : 'ตรวจงาน'}</span>
                          </button>
                          <button
                            onClick={() => onEdit(plan)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <span className="text-xs">แก้ไข</span>
                          </button>
                        </div>
                      </div>

                      {/* Progress bar with timeline */}
                      <div className="px-3 sm:px-4 pb-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>ความคืบหน้า</span>
                          <span className="font-bold text-slate-700">{plan.progress}%</span>
                        </div>
                        
                        {/* Main progress bar */}
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              plan.progress === 100 
                                ? 'bg-emerald-500' 
                                : plan.progress >= 50 
                                ? 'bg-blue-600' 
                                : isOverdue 
                                ? 'bg-red-500' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: progressWidth }}
                          />
                        </div>

                        {/* Timeline indicators */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>เริ่ม: {plan.plannedStartDate.slice(5)}</span>
                          {plan.actualEndDate ? (
                            <span className="text-emerald-600 font-medium">เสร็จ: {plan.actualEndDate.slice(5)}</span>
                          ) : (
                            <span>สิ้นสุด: {plan.plannedEndDate.slice(5)}</span>
                          )}
                          {isOverdue && !plan.actualEndDate && (
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              ล่าช้า {Math.ceil((new Date().getTime() - new Date(plan.plannedEndDate).getTime()) / (1000 * 60 * 60 * 24))} วัน
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* Summary */}
      {sortedPlans.length > 0 && (
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>แสดงไทม์ไลน์แผนงานทั้งหมด {sortedPlans.length} รายการ จัดเรียงตามเฟสและกำหนดเวลา</p>
        </div>
      )}

    </div>
  );
};
