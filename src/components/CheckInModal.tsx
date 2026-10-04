import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Camera, 
  Calendar, 
  Coins, 
  Award, 
  UserCheck, 
  FileText,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlanItem, PlanStatus } from '../types';

interface CheckInModalProps {
  plan: PlanItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlan: PlanItem) => void;
}

const SAMPLE_EVIDENCE_PHOTOS = [
  { label: 'งานติดตั้งอุปกรณ์/ฮาร์ดแวร์', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' },
  { label: 'งานตรวจสอบคลังสินค้า', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
  { label: 'งานระบบซอฟต์แวร์/โค้ด', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80' },
  { label: 'งานซ่อมบำรุง/ความปลอดภัย', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
  { label: 'งานจัดอบรม/สัมมนา', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
];

export const CheckInModal: React.FC<CheckInModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  const [actualEndDate, setActualEndDate] = useState(plan.actualEndDate || todayStr);
  const [progress, setProgress] = useState(plan.status === 'completed' ? 100 : Math.max(plan.progress, 100));
  const [status, setStatus] = useState<PlanStatus>(plan.status === 'completed' ? 'completed' : 'completed');
  const [actualKpi, setActualKpi] = useState(plan.actualKpi || plan.plannedKpi || '');
  const [budgetActual, setBudgetActual] = useState(plan.budgetActual || plan.budgetPlanned || 0);
  const [evidenceUrl, setEvidenceUrl] = useState(plan.evidenceUrl || '');
  const [approverName, setApproverName] = useState(plan.approverName || 'วิชัย ก้องกังวาน (ผู้จัดการ)');
  const [completionNotes, setCompletionNotes] = useState(plan.completionNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'completed' || progress === 100) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Fallback gracefully
      }
    }

    const updated: PlanItem = {
      ...plan,
      actualEndDate,
      actualStartDate: plan.actualStartDate || plan.plannedStartDate,
      progress,
      status,
      actualKpi,
      budgetActual: Number(budgetActual),
      evidenceUrl,
      approverName,
      completionNotes,
      lastUpdated: new Date().toISOString(),
      syncStatus: 'pending' // trigger sync
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-pop">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                ตรวจเช็คและบันทึกผลงานที่ทำแล้ว
              </h3>
              <p className="text-xs text-slate-500">
                Action Check-in & Evidence Verification (ซิงค์เข้า Google Sheet ทันที)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Target Task Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {plan.id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {plan.department}
              </span>
            </div>
            <p className="font-semibold text-slate-800 text-sm">
              {plan.taskTitle}
            </p>
            <p className="text-xs text-slate-500">
              📂 โครงการ: {plan.projectName}
            </p>
            <p className="text-xs text-slate-500">
              🎯 เป้าหมายตามแผน: <strong>{plan.plannedKpi}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Status Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะผลงาน <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as PlanStatus;
                  setStatus(val);
                  if (val === 'completed') setProgress(100);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="completed">✅ เสร็จสมบูรณ์ (Completed)</option>
                <option value="under_review">🔍 รอผู้บริหารตรวจรับ (Under Review)</option>
                <option value="in_progress">⏳ ยังไม่เสร็จสิ้น (In Progress)</option>
              </select>
            </div>

            {/* 2. Progress Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  ความคืบหน้า (%)
                </label>
                <span className="font-bold text-blue-600 text-xs">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
            </div>

            {/* 3. Actual Completion Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่แล้วเสร็จจริง
              </label>
              <input
                type="date"
                value={actualEndDate}
                onChange={(e) => setActualEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            {/* 4. Actual Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-slate-400" />
                งบประมาณที่ใช้จริง (บาท)
              </label>
              <input
                type="number"
                value={budgetActual}
                onChange={(e) => setBudgetActual(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="0"
              />
            </div>

          </div>

          {/* Actual KPI achieved */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              ผลงานที่ทำได้จริง (Actual KPI Achieved) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={actualKpi}
              onChange={(e) => setActualKpi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="เช่น ติดตั้งเสร็จครบ 8 เครื่อง ทดสอบส่งข้อมูลผ่าน 100%"
            />
          </div>

          {/* Evidence Photo URL + Sample Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              รูปถ่ายหลักฐานผลงาน (Photo Proof / Google Drive URL)
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none mb-2"
              placeholder="https://... หรือคลิกเลือกภาพตัวอย่างด้านล่าง"
            />
            {/* Quick sample pickers */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-400 mr-1">เลือกตัวอย่างรูป:</span>
              {SAMPLE_EVIDENCE_PHOTOS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setEvidenceUrl(sample.url)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Thumbnail Preview */}
            {evidenceUrl && (
              <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100">
                <img 
                  src={evidenceUrl} 
                  alt="ภาพผลงานตัวอย่าง" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            )}
          </div>

          {/* Approver & Completion Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                ผู้ตรวจรับงาน
              </label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                หมายเหตุการตรวจรับ
              </label>
              <input
                type="text"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="เช่น ตรวจรับเรียบร้อยตามเกณฑ์ SLA"
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>บันทึกผลงาน (Save & Sync)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
