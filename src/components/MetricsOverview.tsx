import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Coins,
  ArrowUpRight
} from 'lucide-react';
import { PlanItem } from '../types';

interface MetricsOverviewProps {
  plans: PlanItem[];
  onFilterClick?: (filterType: string) => void;
}

// Count-up number animation hook
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ plans, onFilterClick }) => {
  const total = plans.length;
  const completed = plans.filter(p => p.status === 'completed').length;
  const inProgress = plans.filter(p => p.status === 'in_progress').length;
  const underReview = plans.filter(p => p.status === 'under_review').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = plans.filter(p => 
    p.status !== 'completed' && p.plannedEndDate < todayStr
  ).length;

  const avgProgress = total > 0 
    ? Math.round(plans.reduce((acc, curr) => acc + curr.progress, 0) / total) 
    : 0;

  const totalBudgetPlanned = plans.reduce((acc, curr) => acc + (curr.budgetPlanned || 0), 0);
  const totalBudgetActual = plans.reduce((acc, curr) => acc + (curr.budgetActual || 0), 0);
  const budgetRatio = totalBudgetPlanned > 0 ? Math.round((totalBudgetActual / totalBudgetPlanned) * 100) : 0;

  // Animated values
  const animAvg = useCountUp(avgProgress);
  const animCompleted = useCountUp(completed);
  const animActive = useCountUp(inProgress + underReview);
  const animOverdue = useCountUp(overdueCount, 600);
  const animBudget = useCountUp(totalBudgetActual);

  return (
    <div className="mb-6">
      
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-4 animate-fade">
        <div className="flex-1 rule-heavy mt-1.5"></div>
        <h2 className="font-headline text-sm sm:text-base tracking-[0.25em] uppercase text-[var(--ink)]">
          — สถิติประจำวัน —
        </h2>
        <div className="flex-1 rule-heavy mt-1.5"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* 1. Overall Progress */}
        <div 
          className="col-span-2 sm:col-span-1 animate-rise border border-[var(--ink)] bg-paper-card cursor-default hover:shadow-[4px_4px_0_rgba(33,26,18,0.2)] transition-shadow"
          style={{ animationDelay: '0ms' }}
        >
          <div className="rule-heavy px-3 pt-0">
            <div className="flex items-center justify-between -mt-1 py-1.5 text-[10px] font-type uppercase tracking-widest text-[var(--ink-soft)]">
              <span>คืบหน้ารวม</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="px-3 pt-1 pb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl sm:text-4xl font-black text-[var(--ink)] tabular-nums">{animAvg}%</span>
            </div>
            <div className="mt-2 h-2.5 border border-[var(--ink)]/70 bg-[#fffdf2]">
              <div 
                className="h-full bg-[var(--ink)] transition-all duration-1000 ease-out"
                style={{ width: `${animAvg}%` }}
              ></div>
            </div>
            <div className="flex justify-between font-type text-[10px] mt-1.5 text-[var(--ink-soft)]">
              <span>เป้าหมาย 100%</span>
              <span>{completed}/{total} ชิ้น</span>
            </div>
          </div>
        </div>

        {/* 2. Completed */}
        <div 
          onClick={() => onFilterClick && onFilterClick('completed')}
          className="animate-rise border border-[var(--ink)] bg-paper-card cursor-pointer hover:bg-[#fffdf2] hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(51,96,63,0.35)] transition-all duration-200"
          style={{ animationDelay: '80ms' }}
        >
          <div className="rule-heavy px-3 pt-0">
            <div className="flex items-center justify-between -mt-1 py-1.5 text-[10px] font-type uppercase tracking-widest text-[var(--ink-soft)]">
              <span>เสร็จสิ้น</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="px-3 pt-1 pb-3">
            <span className="font-display text-3xl sm:text-4xl font-black text-[var(--green-ink)] tabular-nums">{animCompleted}</span>
            <p className="font-type text-[10px] mt-2 text-[var(--ink-soft)] flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {total > 0 ? Math.round((completed / total) * 100) : 0}% ของทุกแผน — คลิกเพื่อกรอง
            </p>
          </div>
        </div>

        {/* 3. In progress & review */}
        <div 
          onClick={() => onFilterClick && onFilterClick('in_progress')}
          className="animate-rise border border-[var(--ink)] bg-paper-card cursor-pointer hover:bg-[#fffdf2] hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(45,83,112,0.35)] transition-all duration-200"
          style={{ animationDelay: '160ms' }}
        >
          <div className="rule-heavy px-3 pt-0">
            <div className="flex items-center justify-between -mt-1 py-1.5 text-[10px] font-type uppercase tracking-widest text-[var(--ink-soft)]">
              <span>กำลังทำ</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="px-3 pt-1 pb-3">
            <span className="font-display text-3xl sm:text-4xl font-black text-[var(--blue-ink)] tabular-nums">{animActive}</span>
            <p className="font-type text-[10px] mt-2 text-[var(--ink-soft)]">
              ทำอยู่ {inProgress} · รอตรวจ {underReview}
            </p>
          </div>
        </div>

        {/* 4. Overdue */}
        <div 
          onClick={() => onFilterClick && onFilterClick('overdue')}
          className={`animate-rise border bg-paper-card cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(158,43,37,0.35)] transition-all duration-200 ${
            overdueCount > 0 ? 'border-2 border-[var(--red-ink)]' : 'border-[var(--ink)]'
          }`}
          style={{ animationDelay: '240ms' }}
        >
          <div className={`px-3 pt-0 ${overdueCount > 0 ? 'border-t-[3px] border-[var(--red-ink)]' : 'rule-heavy'}`}>
            <div className={`flex items-center justify-between -mt-1 py-1.5 text-[10px] font-type uppercase tracking-widest ${overdueCount > 0 ? 'text-[var(--red-ink)]' : 'text-[var(--ink-soft)]'}`}>
              <span className={overdueCount > 0 ? 'font-bold' : ''}>ล่าช้ากว่ากำหนด</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'animate-pulse-subtle' : ''}`} />
            </div>
          </div>
          <div className="px-3 pt-1 pb-3">
            <span className={`font-display text-3xl sm:text-4xl font-black tabular-nums ${overdueCount > 0 ? 'text-[var(--red-ink)]' : 'text-[var(--ink-soft)]'}`}>
              {animOverdue}
            </span>
            {overdueCount > 0 && (
              <span className="stamp text-[9px] text-[var(--red-ink)] mt-1 block text-center !py-0.5 animate-stamp">เร่งด่วน!</span>
            )}
            <p className={`font-type text-[10px] mt-2 ${overdueCount > 0 ? 'text-[var(--red-ink)]' : 'text-[var(--ink-soft)]'}`}>
              {overdueCount > 0 ? '⚠ ต้องเร่งรัดผลงาน' : '✓ ไม่มีงานตกค้าง'}
            </p>
          </div>
        </div>

        {/* 5. Budget */}
        <div 
          className="col-span-2 sm:col-span-1 animate-rise border border-[var(--ink)] bg-paper-card cursor-default hover:shadow-[4px_4px_0_rgba(33,26,18,0.2)] transition-shadow"
          style={{ animationDelay: '320ms' }}
        >
          <div className="rule-heavy px-3 pt-0">
            <div className="flex items-center justify-between -mt-1 py-1.5 text-[10px] font-type uppercase tracking-widest text-[var(--ink-soft)]">
              <span>งบประมาณใช้จริง</span>
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="px-3 pt-1 pb-3">
            <span className="font-display text-2xl sm:text-3xl font-black text-[var(--ink)] tabular-nums">
              ฿{animBudget.toLocaleString()}
            </span>
            <div className="flex items-center justify-between font-type text-[10px] mt-2 text-[var(--ink-soft)]">
              <span>แผน: ฿{totalBudgetPlanned.toLocaleString()}</span>
              <span className={budgetRatio > 100 ? 'text-[var(--red-ink)] font-bold' : 'text-[var(--green-ink)]'}>
                {budgetRatio}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
