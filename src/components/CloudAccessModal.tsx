import React, { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface CloudAccessModalProps {
  client: SupabaseClient;
  user: User | null;
  onClose: () => void;
  onSignedOut: () => void;
}

export const CloudAccessModal: React.FC<CloudAccessModalProps> = ({ client, user, onClose, onSignedOut }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Supabase sign-in failed', error);
      setErrorMessage(error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      onSignedOut();
      onClose();
    } catch (error) {
      console.error('Supabase sign-out failed', error);
      setErrorMessage(error instanceof Error ? error.message : 'ออกจากระบบไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade">
      <section className="bg-white w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-200 animate-pop">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="font-headline text-lg text-[var(--ink)]">สิทธิ์แก้ไขข้อมูล</h2>
            <p className="font-type text-xs text-[var(--ink-soft)] mt-1">ผู้ชมทั่วไปดูข้อมูลได้อย่างเดียว</p>
          </div>
          <button onClick={onClose} aria-label="ปิด" className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="font-type text-sm break-all">เข้าสู่ระบบเป็น {user.email}</p>
            <button onClick={handleSignOut} disabled={isSubmitting} className="btn-ink w-full px-4 py-2 flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> ออกจากระบบ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block font-type text-xs">
              อีเมล
              <input required type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full px-3 py-2 border border-[var(--ink)] bg-white" />
            </label>
            <label className="block font-type text-xs">
              รหัสผ่าน
              <input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full px-3 py-2 border border-[var(--ink)] bg-white" />
            </label>
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-ink btn-red w-full px-4 py-2">
              {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
            <p className="font-type text-[11px] text-[var(--ink-soft)]">
              ต้องสร้างบัญชีผู้ใช้ใน Supabase ก่อน ผู้ชมที่เปิดลิงก์ดูอย่างเดียวไม่ต้องเข้าสู่ระบบ
            </p>
          </form>
        )}
        {errorMessage && user && <p role="alert" className="mt-3 text-sm text-red-700">{errorMessage}</p>}
      </section>
    </div>
  );
};
