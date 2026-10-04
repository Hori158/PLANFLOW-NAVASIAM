import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FolderPlus, 
  Calendar, 
  User, 
  Coins, 
  MapPin, 
  Target
} from 'lucide-react';
import { PlanItem, PlanStatus, PlanPriority, PlanPhase } from '../types';
import { DEPARTMENTS, CATEGORIES, PHASES } from '../data/initialPlans';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PlanItem) => void;
  initialData?: PlanItem | null;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const isEditing = Boolean(initialData);

  // Generate next sequential ID
  const getNextId = () => {
    if (isEditing) return initialData!.id;
    // For demo purposes, generate a random but formatted ID
    const randomNum = Math.floor(1 + Math.random() * 999);
    return `NVS-2025-${String(randomNum).padStart(3, '0')}`;
  };

  const getNextProjectCode = () => {
    if (isEditing) return initialData!.projectCode;
    const randomNum = Math.floor(1 + Math.random() * 999);
    return `NVS-${String(randomNum).padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<Partial<PlanItem>>({
    id: getNextId(),
    projectCode: getNextProjectCode(),
    projectName: '',
    taskTitle: '',
    department: DEPARTMENTS[0],
    category: [CATEGORIES[0]],
    phase: 'Phase 1' as PlanPhase,
    plannedStartDate: new Date().toISOString().slice(0, 10),
    plannedEndDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    status: 'not_started' as PlanStatus,
    priority: 'medium' as PlanPriority,
    progress: 0,
    plannedKpi: '',
    actualKpi: '',
    assigneeName: '',
    assigneeRole: 'ผู้ประสานงาน',
    approverName: '',
    budgetPlanned: 0,
    budgetActual: 0,
    location: '',
    remarks: '',
    appSheetRowId: `APP-${Date.now()}`,
    syncStatus: 'pending'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: getNextId(),
        projectCode: getNextProjectCode(),
        projectName: '',
        taskTitle: '',
        department: DEPARTMENTS[0],
        category: [CATEGORIES[0]],
        phase: 'Phase 1',
        plannedStartDate: new Date().toISOString().slice(0, 10),
        plannedEndDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: 'not_started',
        priority: 'medium',
        progress: 0,
        plannedKpi: '',
        actualKpi: '',
        assigneeName: '',
        assigneeRole: 'ผู้ประสานงาน',
        approverName: '',
        budgetPlanned: 0,
        budgetActual: 0,
        location: '',
        remarks: '',
        appSheetRowId: `APP-${Date.now()}`,
        syncStatus: 'pending'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskTitle || !formData.projectName) return;

    const planToSave: PlanItem = {
      ...formData as PlanItem,
      lastUpdated: new Date().toISOString(),
      syncStatus: 'pending'
    };

    onSave(planToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 animate-pop">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                {isEditing ? 'แก้ไขข้อมูลแผนงาน' : 'เพิ่มแผนงานใหม่ (New Action Plan)'}
              </h3>
              <p className="text-xs text-slate-500">
                ข้อมูลจะบันทึกลงระบบและซิงค์ไปยัง Google Sheet / AppSheet
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
          
          {/* Row 1: ID, Code, Quarter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสแผนงาน (ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสโครงการ
              </label>
              <input
                type="text"
                value={formData.projectCode}
                onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="เช่น PRJ-WMS"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เฟสงาน (Phase)
              </label>
              <select
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value as PlanPhase })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {PHASES.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อโครงการหลัก (Project Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="เช่น พัฒนาระบบคลังสินค้าดิจิทัล (Smart WMS)"
            />
          </div>

          {/* Row 3: Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่องาน / กิจกรรมที่ต้องปฏิบัติ (Action Task) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.taskTitle}
              onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium"
              placeholder="เช่น ติดตั้งเครื่องสแกนบาร์โค้ดไร้สาย จุดรับสินค้า Gate A-D"
            />
          </div>

          {/* Row 4: Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ฝ่าย / แผนก
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่งาน (สามารถเลือกได้หลายตัว)
              </label>
              <select
                multiple
                value={formData.category || []}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, category: options });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none h-24"
                size={4}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">กด Ctrl/Cmd ค้างไว้เพื่อเลือกหลายหมวด</p>
            </div>
          </div>

          {/* Row 5: Planned Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันเริ่มต้นตามแผน <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.plannedStartDate}
                onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันสิ้นสุดตามแผน (Deadline) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.plannedEndDate}
                onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 6: Priority & Status & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความสำคัญ
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PlanPriority })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="urgent">🔴 ด่วนสุด (Urgent)</option>
                <option value="high">🟠 สูง (High)</option>
                <option value="medium">🔵 ปานกลาง (Medium)</option>
                <option value="low">⚪ ทั่วไป (Low)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะ
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  const s = e.target.value as PlanStatus;
                  setFormData({ 
                    ...formData, 
                    status: s,
                    progress: s === 'completed' ? 100 : formData.progress
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="not_started">ยังไม่เริ่ม</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="under_review">รอตรวจรับงาน</option>
                <option value="completed">เสร็จสมบูรณ์</option>
                <option value="delayed">มีปัญหา/ล่าช้า</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ความคืบหน้า ({formData.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress || 0}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
            </div>
          </div>

          {/* Row 7: Planned KPI Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              เป้าหมายผลผลิตเชิงปริมาณ (Planned KPI)
            </label>
            <input
              type="text"
              value={formData.plannedKpi}
              onChange={(e) => setFormData({ ...formData, plannedKpi: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="เช่น ติดตั้งครบ 8 เครื่อง ทดสอบส่งข้อมูลสำเร็จ"
            />
          </div>

          {/* Row 8: Assignee & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                ผู้รับผิดชอบหลัก
              </label>
              <input
                type="text"
                value={formData.assigneeName}
                onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="ชื่อ-นามสกุล หรือ อีเมล"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่ง / บทบาท
              </label>
              <input
                type="text"
                value={formData.assigneeRole}
                onChange={(e) => setFormData({ ...formData, assigneeRole: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="เช่น วิศวกรโครงการ"
              />
            </div>
          </div>

          {/* Row 9: Budget & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-slate-400" />
                งบประมาณตามแผน (บาท)
              </label>
              <input
                type="number"
                value={formData.budgetPlanned || ''}
                onChange={(e) => setFormData({ ...formData, budgetPlanned: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                สถานที่ปฏิบัติงาน / พิกัด
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="เช่น คลังสินค้ากลาง บางนา กม.19"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'บันทึกการแก้ไข' : 'สร้างแผนงาน'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
