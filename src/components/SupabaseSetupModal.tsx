import React, { useState } from 'react';
import { CheckCircle2, Copy, Database, X } from 'lucide-react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { PlanItem, SyncConfig } from '../types';

interface SupabaseSetupModalProps {
  config: SyncConfig;
  client: SupabaseClient | null;
  user: User | null;
  plans: PlanItem[];
  onClose: () => void;
  onSave: (config: SyncConfig) => void;
  onSignIn: () => void;
  onSeedPlans: () => Promise<void>;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  config,
  client,
  user,
  plans,
  onClose,
  onSave,
  onSignIn,
  onSeedPlans
}) => {
  const [url, setUrl] = useState(config.supabaseUrl || '');
  const [anonKey, setAnonKey] = useState(config.supabaseAnonKey || '');
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co') || !anonKey.trim()) {
        throw new Error('กรุณาใช้ Project URL และ anon/public key จาก Supabase');
      }
      onSave({ ...config, supabaseUrl: parsed.origin, supabaseAnonKey: anonKey.trim() });
      setMessage('บันทึกการเชื่อมต่อแล้ว กำลังโหลดข้อมูลส่วนกลาง');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ข้อมูลเชื่อมต่อไม่ถูกต้อง');
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage('');
    try {
      await onSeedPlans();
      setMessage('นำข้อมูลแผนงานจากเครื่องนี้ขึ้นฐานข้อมูลส่วนกลางแล้ว');
    } catch (error) {
      console.error('Unable to initialize shared plans', error);
      setMessage(error instanceof Error ? error.message : 'ส่งข้อมูลขึ้นฐานข้อมูลไม่สำเร็จ');
    } finally {
      setIsSeeding(false);
    }
  };

  const copyShareUrl = async () => {
    if (!config.supabaseUrl || !config.supabaseAnonKey) return;
    const shareUrl = new URL(window.location.href);
    shareUrl.search = '';
    shareUrl.searchParams.set('view', 'readonly');
    shareUrl.searchParams.set('sbUrl', config.supabaseUrl);
    shareUrl.searchParams.set('sbKey', config.supabaseAnonKey);
    await navigator.clipboard.writeText(shareUrl.toString());
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade">
      <section className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 animate-pop">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--blue-ink)]" />
            <div>
              <h2 className="font-headline text-lg text-[var(--ink)]">ฐานข้อมูลกลาง · Supabase</h2>
              <p className="font-type text-xs text-[var(--ink-soft)] mt-1">แชร์ลิงก์ดูอย่างเดียวที่รับข้อมูลอัปเดตสด</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="ปิด" className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ol className="list-decimal pl-5 space-y-1 font-type text-xs text-[var(--ink-soft)] mb-4">
          <li>สร้างโปรเจกต์ Supabase แล้วเปิด SQL Editor</li>
          <li>รันไฟล์ <code>supabase/schema.sql</code> ใน repository นี้</li>
          <li>คัดลอก Project URL และ anon/public key มาวางด้านล่าง</li>
          <li>เพิ่มบัญชีผู้แก้ไขใน Supabase Authentication → Users</li>
        </ol>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block font-type text-xs">
            Supabase Project URL
            <input required type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://your-project.supabase.co" className="mt-1 w-full px-3 py-2 border border-[var(--ink)] bg-white font-mono" />
          </label>
          <label className="block font-type text-xs">
            anon / publishable key
            <textarea required rows={2} value={anonKey} onChange={event => setAnonKey(event.target.value)} className="mt-1 w-full px-3 py-2 border border-[var(--ink)] bg-white font-mono break-all" />
          </label>
          <button type="submit" className="btn-ink btn-red w-full px-4 py-2">บันทึกและเชื่อมต่อ</button>
        </form>

        {message && <p role="status" className="mt-3 font-type text-xs text-[var(--blue-ink)]">{message}</p>}

        {client && (
          <div className="mt-5 pt-4 border-t border-[var(--ink)]/30 space-y-3">
            {user ? (
              <>
                <p className="font-type text-xs text-[var(--green-ink)]">เข้าสู่ระบบเป็น {user.email} · แก้ไขฐานข้อมูลกลางได้</p>
                <button onClick={handleSeed} disabled={isSeeding || plans.length === 0} className="btn-ink w-full px-4 py-2 disabled:opacity-50">
                  {isSeeding ? 'กำลังนำเข้าข้อมูล...' : `นำเข้าข้อมูลในเครื่อง (${plans.length} รายการ)`}
                </button>
                <button onClick={copyShareUrl} className="btn-ink w-full px-4 py-2 flex items-center justify-center gap-2">
                  {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'คัดลอกลิงก์ดูสดแล้ว' : 'คัดลอกลิงก์ดูอย่างเดียว · LIVE'}
                </button>
              </>
            ) : (
              <button onClick={onSignIn} className="btn-ink w-full px-4 py-2">เข้าสู่ระบบบัญชีผู้แก้ไข</button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
