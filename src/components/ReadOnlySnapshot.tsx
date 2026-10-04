import React, { useEffect, useState } from 'react';
import { Eye, ListChecks, Radio, RefreshCw } from 'lucide-react';
import type { PlanItem } from '../types';
import { createSupabaseClient, fetchSharedPlans } from '../utils/supabase';

interface ReadOnlySnapshotProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const STATUS_LABELS: Record<PlanItem['status'], string> = {
  not_started: 'ยังไม่เริ่ม',
  in_progress: 'กำลังดำเนินการ',
  under_review: 'รอตรวจรับ',
  completed: 'เสร็จสมบูรณ์',
  delayed: 'ล่าช้า'
};

export const ReadOnlySnapshot: React.FC<ReadOnlySnapshotProps> = ({ supabaseUrl, supabaseAnonKey }) => {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    if (!client) {
      setErrorMessage('ลิงก์นี้มีการตั้งค่าฐานข้อมูลไม่ถูกต้อง');
      setIsLoading(false);
      return;
    }

    let active = true;
    const loadPlans = async () => {
      try {
        const currentPlans = await fetchSharedPlans(client);
        if (active) {
          setPlans(currentPlans);
          setLastUpdated(new Date());
          setErrorMessage('');
        }
      } catch (error) {
        console.error('Unable to load shared plan data', error);
        if (active) setErrorMessage('โหลดข้อมูลกลางไม่สำเร็จ กรุณาลองรีเฟรช หรือตรวจสอบการตั้งค่าฐานข้อมูล');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadPlans();
    const channel = client
      .channel('public-shared-plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_items' }, () => {
        void loadPlans();
      })
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Supabase realtime subscription status: ${status}`);
        }
      });

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [supabaseUrl, supabaseAnonKey]);

  const averageProgress = plans.length
    ? Math.round(plans.reduce((total, plan) => total + plan.progress, 0) / plans.length)
    : 0;
  const completed = plans.filter(plan => plan.status === 'completed').length;
  const active = plans.filter(plan => plan.status === 'in_progress' || plan.status === 'under_review').length;
  const overdue = plans.filter(plan =>
    plan.status !== 'completed' && plan.plannedEndDate < new Date().toISOString().slice(0, 10)
  ).length;

  return (
    <main className="min-h-screen max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
      <header className="paper-card p-5 sm:p-7 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ink)]/30 pb-4">
          <div>
            <p className="font-type text-xs tracking-[0.2em] text-[var(--ink-soft)]">PLANFLOW NAVASIAM · P.NVS</p>
            <h1 className="font-headline text-2xl sm:text-4xl mt-1">รายงานแผนงาน</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="stamp text-[var(--blue-ink)] text-xs flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> ดูอย่างเดียว
            </span>
            <span className="font-type text-[11px] text-[var(--green-ink)] flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVE
            </span>
          </div>
        </div>
        <p className="font-type text-xs text-[var(--ink-soft)] mt-3 flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3" />
          {lastUpdated ? `รับข้อมูลล่าสุด ${lastUpdated.toLocaleTimeString('th-TH')}` : 'กำลังเชื่อมต่อข้อมูลส่วนกลาง'}
          {' · '}หน้านี้ดูได้อย่างเดียว
        </p>
      </header>

      {errorMessage ? (
        <section role="alert" className="paper-card p-5 border-red-700 text-red-800 font-type text-sm">
          {errorMessage}
        </section>
      ) : isLoading ? (
        <section className="paper-card p-8 text-center font-type text-sm">กำลังโหลดข้อมูลแผนงานส่วนกลาง...</section>
      ) : (
        <>
          <section aria-label="สรุปความคืบหน้า" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <article className="paper-card p-4">
              <p className="font-type text-xs text-[var(--ink-soft)]">คืบหน้ารวม</p>
              <p className="font-display text-3xl font-black mt-1">{averageProgress}%</p>
              <div className="h-2 border border-[var(--ink)]/40 mt-2">
                <div className="h-full bg-[var(--ink)]" style={{ width: `${averageProgress}%` }} />
              </div>
            </article>
            <article className="paper-card p-4">
              <p className="font-type text-xs text-[var(--ink-soft)]">แผนงานทั้งหมด</p>
              <p className="font-display text-3xl font-black mt-1">{plans.length}</p>
            </article>
            <article className="paper-card p-4">
              <p className="font-type text-xs text-[var(--ink-soft)]">เสร็จสิ้น · กำลังทำ</p>
              <p className="font-display text-3xl font-black mt-1">{completed} · {active}</p>
            </article>
            <article className="paper-card p-4">
              <p className="font-type text-xs text-[var(--ink-soft)]">ล่าช้ากว่ากำหนด</p>
              <p className="font-display text-3xl font-black mt-1">{overdue}</p>
            </article>
          </section>

          <section aria-label="รายการแผนงาน" className="space-y-3">
            <h2 className="font-headline text-sm tracking-wider flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> รายการแผนงาน
            </h2>
            {plans.length === 0 ? (
              <p className="paper-card p-6 text-center font-type text-sm">ยังไม่มีแผนงานในฐานข้อมูลส่วนกลาง</p>
            ) : plans.map(plan => (
              <article key={plan.id} className="paper-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-type text-[11px] text-[var(--ink-soft)]">{plan.id} · {plan.projectName}</p>
                    <h3 className="font-bold text-base sm:text-lg mt-1">{plan.taskTitle}</h3>
                    <p className="font-type text-xs text-[var(--ink-soft)] mt-1">{plan.department} · {plan.assigneeName}</p>
                  </div>
                  <span className="stamp text-xs">{STATUS_LABELS[plan.status]}</span>
                </div>
                <div className="flex items-center justify-between font-type text-xs mt-4 mb-1">
                  <span>ความคืบหน้า</span><strong>{plan.progress}%</strong>
                </div>
                <div className="h-2 border border-[var(--ink)]/40">
                  <div className="h-full bg-[var(--green-ink)]" style={{ width: `${plan.progress}%` }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-type text-xs text-[var(--ink-soft)] mt-3">
                  <p>กำหนดส่ง: {plan.plannedEndDate || 'ไม่ระบุ'}</p>
                  <p>เป้าหมาย: {plan.plannedKpi || 'ไม่ระบุ'}</p>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
};
