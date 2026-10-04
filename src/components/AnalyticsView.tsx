import React from 'react';
import { 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  Wallet,
  Users,
  BarChart3
} from 'lucide-react';
import { PlanItem } from '../types';
import { DEPARTMENTS } from '../data/initialPlans';

interface AnalyticsViewProps {
  plans: PlanItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ plans }) => {
  const total = plans.length;
  const completed = plans.filter(p => p.status === 'completed').length;
  const inProgress = plans.filter(p => p.status === 'in_progress').length;
  const underReview = plans.filter(p => p.status === 'under_review').length;
  const notStarted = plans.filter(p => p.status === 'not_started').length;
  const delayed = plans.filter(p => p.status === 'delayed').length;

  const totalBudgetPlanned = plans.reduce((acc, curr) => acc + (curr.budgetPlanned || 0), 0);
  const totalBudgetActual = plans.reduce((acc, curr) => acc + (curr.budgetActual || 0), 0);
  const budgetSavings = totalBudgetPlanned - totalBudgetActual;

  // Department analysis
  const deptStats = DEPARTMENTS.map(dept => {
    const deptPlans = plans.filter(p => p.department === dept);
    const deptCount = deptPlans.length;
    const deptCompleted = deptPlans.filter(p => p.status === 'completed').length;
    const deptAvgProgress = deptCount > 0 
      ? Math.round(deptPlans.reduce((a, b) => a + b.progress, 0) / deptCount) 
      : 0;
    const deptBudget = deptPlans.reduce((a, b) => a + (b.budgetActual || 0), 0);
    return {
      name: dept,
      count: deptCount,
      completed: deptCompleted,
      avgProgress: deptAvgProgress,
      budget: deptBudget
    };
  }).filter(d => d.count > 0);

  // Status distribution for pie chart
  const statusData = [
    { label: 'เสร็จสมบูรณ์', value: completed, color: '#10b981', bgColor: 'bg-emerald-500' },
    { label: 'กำลังทำ', value: inProgress, color: '#3b82f6', bgColor: 'bg-blue-500' },
    { label: 'รอตรวจรับ', value: underReview, color: '#f59e0b', bgColor: 'bg-amber-500' },
    { label: 'ยังไม่เริ่ม', value: notStarted, color: '#6b7280', bgColor: 'bg-slate-500' },
    { label: 'ล่าช้า', value: delayed, color: '#ef4444', bgColor: 'bg-red-500' }
  ].filter(d => d.value > 0);

  // Category analysis
  const allCategories: string[] = [];
  plans.forEach(p => {
    if (Array.isArray(p.category)) {
      p.category.forEach(c => {
        if (!allCategories.includes(c)) allCategories.push(c);
      });
    } else if (p.category && !allCategories.includes(p.category)) {
      allCategories.push(p.category);
    }
  });

  const categoryStats = allCategories.map(cat => {
    const catPlans = plans.filter(p => Array.isArray(p.category) ? p.category.includes(cat) : p.category === cat);
    const count = catPlans.length;
    const avgProgress = count > 0 ? Math.round(catPlans.reduce((a, b) => a + b.progress, 0) / count) : 0;
    return { category: cat, count, avgProgress };
  });

  return (
    <div className="space-y-6">
      
      {/* Top 3 High Level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* On-Time Delivery Rate */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700">อัตราความสำเร็จตรงเวลา (On-Time Delivery)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {total > 0 ? Math.round((completed / (completed + delayed || 1)) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500">ของงานที่ส่งมอบแล้ว</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            งานเสร็จสิ้นตามเวลาที่กำหนด {completed} จาก {completed + delayed} กิจกรรม
          </p>
        </div>

        {/* Budget Efficiency */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700">ประสิทธิภาพการใช้งบประมาณ (Budget Variance)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${budgetSavings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {budgetSavings >= 0 ? '+' : ''}฿{Math.abs(budgetSavings).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">{budgetSavings >= 0 ? 'ประหยัดได้' : 'เกินงบ'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            ใช้จริง ฿{totalBudgetActual.toLocaleString()} จากกรอบ ฿{totalBudgetPlanned.toLocaleString()}
          </p>
        </div>

        {/* Action Rate */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700">สัดส่วนงานที่มีการขยับ (Active Rate)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-600">
              {total > 0 ? Math.round(((total - notStarted) / total) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500">เริ่มลงมือแล้ว</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            มีเพียง {notStarted} งานที่ยังไม่เริ่มลงมือปฏิบัติการ
          </p>
        </div>

      </div>

      {/* Graph Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Distribution - Bar Chart */}
        <div className="paper-card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[var(--ink)]">
            <h3 className="font-headline text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--red-ink)]" />
              หน้ากราฟิก · กราฟสถานะงาน
            </h3>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="space-y-4">
            {statusData.map((item) => {
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.bgColor}`}></span>
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-700">{item.value} งาน</span>
                    <span className="text-slate-400">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.bgColor} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Progress - Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              ความคืบหน้ารายทีม (Department Progress)
            </h3>
          </div>

          <div className="space-y-4">
            {deptStats.map(dept => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{dept.name}</span>
                  <span className="font-bold text-slate-700">{dept.completed}/{dept.count} งาน</span>
                  <span className="font-semibold text-slate-700">{dept.avgProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${dept.avgProgress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Category Distribution */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              การกระจายหมวดหมู่งาน (Category Distribution)
            </h3>
          </div>

          <div className="space-y-3">
            {categoryStats.map(stat => (
              <div key={stat.category} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span className="text-xs font-semibold text-slate-800">{stat.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-purple-700">{stat.count} งาน</span>
                  <span className="text-xs text-slate-400 ml-1">({total > 0 ? Math.round((stat.count / total) * 100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
