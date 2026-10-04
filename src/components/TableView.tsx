import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Camera, 
  CheckSquare,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { PlanItem, PlanStatus } from '../types';

interface TableViewProps {
  plans: PlanItem[];
  onStatusChange: (id: string, newStatus: PlanStatus) => void;
  onProgressChange: (id: string, newProgress: number) => void;
  onCheckIn: (plan: PlanItem) => void;
  onEdit: (plan: PlanItem) => void;
  onDelete: (id: string) => void;
  onViewPhoto: (url: string, title: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  plans,
  onStatusChange,
  onProgressChange,
  onCheckIn,
  onEdit,
  onDelete,
  onViewPhoto
}) => {
  const [editingProgressId, setEditingProgressId] = useState<string | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);

  const getStatusStamp = (status: PlanStatus, isOverdue: boolean) => {
    if (isOverdue && status !== 'completed') {
      return (
        <span className="stamp text-[11px] font-bold text-[var(--red-ink)] animate-pulse-subtle">
          <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> ล่าช้าเกินกำหนด</span>
        </span>
      );
    }
    switch (status) {
      case 'completed':
        return <span className="stamp text-[11px] font-bold text-[var(--green-ink)]">✓ เสร็จสิ้น</span>;
      case 'in_progress':
        return <span className="stamp text-[11px] font-bold text-[var(--blue-ink)]">กำลังทำ</span>;
      case 'under_review':
        return <span className="stamp text-[11px] font-bold text-[var(--amber-ink)]">รอตรวจรับ</span>;
      case 'delayed':
        return (
          <span className="stamp text-[11px] font-bold text-[var(--red-ink)]">
            <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> มีปัญหา</span>
          </span>
        );
      default:
        return <span className="stamp text-[11px] text-[var(--ink-faint)]">ยังไม่เริ่ม</span>;
    }
  };

  const getPriorityMark = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="font-type text-[9px] font-bold bg-[var(--red-ink)] text-[#fdf8ec] px-1.5 py-0.5 uppercase tracking-wider">ด่วน!!</span>;
      case 'high':
        return <span className="font-type text-[9px] font-bold border border-[var(--red-ink)] text-[var(--red-ink)] px-1.5 py-0.5 uppercase tracking-wider">สำคัญ</span>;
      case 'medium':
        return <span className="font-type text-[9px] border border-[var(--blue-ink)] text-[var(--blue-ink)] px-1.5 py-0.5 uppercase tracking-wider">ปานกลาง</span>;
      default:
        return <span className="font-type text-[9px] border border-[var(--ink-faint)] text-[var(--ink-faint)] px-1.5 py-0.5 uppercase tracking-wider">ทั่วไป</span>;
    }
  };

  return (
    <div className="paper-card overflow-hidden">
      
      {/* Front page header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2 border-b-2 border-[var(--ink)]">
        <h3 className="font-headline text-sm sm:text-lg tracking-wide text-[var(--ink)]">
          หน้าหนึ่ง · ตารางติดตามแผนงาน
        </h3>
        <span className="font-type text-[11px] text-[var(--ink-soft)]">{plans.length} ข่าว</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-[var(--ink)] bg-[rgba(33,26,18,0.04)]">
              <th className="py-2.5 px-3 w-12 text-center font-type text-[10px] uppercase tracking-wider font-normal text-[var(--ink-soft)]">#</th>
              <th className="py-2.5 px-3 min-w-[220px] font-type text-[10px] uppercase tracking-wider font-normal">ข่าว / ชื่องาน</th>
              <th className="py-2.5 px-3 min-w-[130px] font-type text-[10px] uppercase tracking-wider font-normal">ทีม / เฟส</th>
              <th className="py-2.5 px-3 min-w-[150px] font-type text-[10px] uppercase tracking-wider font-normal">กำหนดการ</th>
              <th className="py-2.5 px-3 min-w-[140px] font-type text-[10px] uppercase tracking-wider font-normal">คืบหน้า</th>
              <th className="py-2.5 px-3 min-w-[120px] font-type text-[10px] uppercase tracking-wider font-normal">สถานะ</th>
              <th className="py-2.5 px-3 min-w-[140px] font-type text-[10px] uppercase tracking-wider font-normal">ผู้รับผิดชอบ</th>
              <th className="py-2.5 px-3 min-w-[80px] text-center font-type text-[10px] uppercase tracking-wider font-normal">รูปถ่าย</th>
              <th className="py-2.5 px-3 min-w-[130px] text-center font-type text-[10px] uppercase tracking-wider font-normal no-print">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center">
                  <p className="font-display italic text-lg text-[var(--ink-soft)]">— ไม่มีข่าวในหน้านี้ —</p>
                  <p className="font-type text-xs text-[var(--ink-faint)] mt-2">ลองปรับเปลี่ยนตัวกรอง หรือกดปุ่ม "เพิ่มงาน" ด้านบนเพื่อลงข่าวใหม่</p>
                </td>
              </tr>
            ) : (
              plans.map((plan, index) => {
                const isOverdue = plan.status !== 'completed' && plan.plannedEndDate < todayStr;
                const isCompleted = plan.status === 'completed';

                return (
                  <tr
                    key={plan.id}
                    className={`animate-rise border-b border-dotted border-[var(--ink)]/40 align-top transition-colors ${
                      isOverdue ? 'bg-[rgba(158,43,37,0.05)]' : 'hover:bg-[rgba(33,26,18,0.03)]'
                    }`}
                    style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
                  >
                    <td className="py-3 px-3 text-center">
                      <span className="font-type text-[11px] text-[var(--ink-faint)]">{String(index + 1).padStart(2, '0')}</span>
                      <div className="mt-1">
                        <span 
                          title={`AppSheet: ${plan.appSheetRowId}`}
                          className={`inline-block w-2 h-2 rounded-full ${plan.syncStatus === 'synced' ? 'bg-[var(--green-ink)]' : 'bg-amber-500 animate-ping'}`} 
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="font-type text-[10px] font-bold text-[var(--red-ink)]">{plan.id}</span>
                        <span className="font-type text-[10px] text-[var(--ink-faint)]">{plan.projectCode}</span>
                        {getPriorityMark(plan.priority)}
                      </div>
                      <p className="font-bold text-[15px] leading-snug text-[var(--ink)]">{plan.taskTitle}</p>
                      <p className="font-display italic text-[12px] text-[var(--ink-soft)] mt-0.5 truncate max-w-xs" title={plan.projectName}>
                        {plan.projectName}
                      </p>
                      {plan.location && (
                        <p className="font-type text-[10px] text-[var(--ink-faint)] mt-0.5">📍 {plan.location}</p>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-type text-[10px] font-bold uppercase tracking-wide text-[var(--ink)]">{plan.department}</span>
                      <div className="mt-1 flex items-center gap-1.5 font-type text-[10px] text-[var(--ink-soft)]">
                        <span className="border border-[var(--ink)]/60 px-1 py-px">{plan.phase}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(Array.isArray(plan.category) ? plan.category : [plan.category]).map((c: string) => (
                          <span key={c} className="font-type text-[9px] text-[var(--ink-faint)]">#{c.replace(/\s/g, '')}</span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-type text-[11px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--ink-soft)]">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{plan.plannedStartDate.slice(5)} → <strong className={isOverdue ? 'text-[var(--red-ink)]' : 'text-[var(--ink)]'}>{plan.plannedEndDate.slice(5)}</strong></span>
                        </div>
                        {plan.actualEndDate ? (
                          <div className="text-[var(--green-ink)] font-bold">✓ เสร็จ: {plan.actualEndDate.slice(5)}</div>
                        ) : plan.actualStartDate ? (
                          <div className="text-[var(--blue-ink)]">● เริ่ม: {plan.actualStartDate.slice(5)}</div>
                        ) : (
                          <div className="text-[var(--ink-faint)] italic">ยังไม่เริ่มลงมือ</div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-lg font-black text-[var(--ink)]">{plan.progress}%</span>
                          <button
                            onClick={() => setEditingProgressId(editingProgressId === plan.id ? null : plan.id)}
                            className="font-type text-[10px] text-[var(--blue-ink)] hover:underline cursor-pointer no-print"
                          >
                            {editingProgressId === plan.id ? 'ปิด' : 'ปรับ%'}
                          </button>
                        </div>
                        <div className="w-full h-2.5 border border-[var(--ink)]/60 bg-[#fffdf2]">
                          <div 
                            className={`h-full ${plan.progress === 100 ? 'bg-[var(--green-ink)]' : 'bg-[var(--ink)]'}`}
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                        {editingProgressId === plan.id && (
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={plan.progress}
                            onChange={(e) => onProgressChange(plan.id, Number(e.target.value))}
                            className="w-full h-1.5 cursor-pointer"
                          />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1.5">
                        <div key={plan.status + (isOverdue ? '-overdue' : '')} className="animate-stamp-wrap">
                          {getStatusStamp(plan.status, isOverdue)}
                        </div>
                        <select
                          value={plan.status}
                          onChange={(e) => onStatusChange(plan.id, e.target.value as PlanStatus)}
                          className="font-type text-[10px] bg-transparent border-b border-[var(--ink)]/60 text-[var(--ink-soft)] focus:outline-none cursor-pointer no-print w-full"
                        >
                          <option value="not_started">ยังไม่เริ่ม</option>
                          <option value="in_progress">กำลังดำเนินการ</option>
                          <option value="under_review">รอตรวจรับ</option>
                          <option value="completed">เสร็จสมบูรณ์</option>
                          <option value="delayed">มีปัญหา/ล่าช้า</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {plan.assigneeAvatar ? (
                          <img 
                            src={plan.assigneeAvatar} 
                            alt={plan.assigneeName} 
                            className="w-7 h-7 rounded-full object-cover border border-[var(--ink)]/50 photo-bw shrink-0" 
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#e9e0c9] flex items-center justify-center text-[var(--ink-soft)] shrink-0 border border-[var(--ink)]/40">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-[12px] text-[var(--ink)] truncate">{plan.assigneeName}</p>
                          <p className="font-type text-[9px] text-[var(--ink-faint)] truncate">{plan.assigneeRole || 'เจ้าหน้าที่'}</p>
                        </div>
                      </div>
                      {plan.plannedKpi && (
                        <div className="mt-1.5 font-type text-[10px] text-[var(--ink-soft)] border-l-2 border-[var(--ink)]/50 pl-1.5">
                          <strong>KPI:</strong> {plan.actualKpi || plan.plannedKpi}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {plan.evidenceUrl ? (
                        <button
                          onClick={() => onViewPhoto(plan.evidenceUrl!, plan.taskTitle)}
                          className="group relative inline-block rounded-sm overflow-hidden border-2 border-[var(--ink)]/70 shadow-[2px_2px_0_rgba(33,26,18,0.25)] cursor-pointer"
                          title="คลิกดูรูปถ่ายหลักฐาน (ส.ค.ส.)"
                        >
                          <img 
                            src={plan.evidenceUrl} 
                            alt="หลักฐานผลงาน" 
                            className="w-11 h-11 object-cover photo-bw" 
                          />
                          <div className="absolute inset-0 bg-[var(--ink)]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-3.5 h-3.5 text-[#f3ecdb]" />
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => onCheckIn(plan)}
                          className="inline-flex flex-col items-center justify-center w-11 h-11 border-2 border-dashed border-[var(--ink)]/40 text-[var(--ink-faint)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors cursor-pointer no-print"
                          title="แนบรูปถ่ายหลักฐาน"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="font-type text-[8px]">แนบรูป</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onCheckIn(plan)}
                          className={`btn-ink text-[11px] px-2.5 py-1.5 flex items-center gap-1 ${
                            isCompleted ? '' : 'btn-red font-bold'
                          }`}
                          title="ตรวจเช็ค / บันทึกผลงาน"
                        >
                          {isCompleted ? (
                            <><CheckSquare className="w-3.5 h-3.5 text-[var(--green-ink)]" /> <span>ผลงาน</span></>
                          ) : (
                            <><Sparkles className="w-3.5 h-3.5" /> <span>ตรวจงาน</span></>
                          )}
                        </button>
                        <button
                          onClick={() => onEdit(plan)}
                          className="btn-ink p-1.5"
                          title="แก้ไขรายละเอียด"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(plan.id)}
                          className="btn-ink p-1.5 !text-[var(--red-ink)]"
                          title="ลบข่าวนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footnote */}
      <div className="px-4 py-2 border-t border-[var(--ink)]/40 font-type text-[10px] text-[var(--ink-faint)] flex items-center justify-between">
        <span>※ ข้อมูลซิงค์จาก Google Sheets & AppSheet อัตโนมัติ</span>
        <span className="hidden sm:block">PLANFLOW NAVASIAM — P.NVS Daily</span>
      </div>

    </div>
  );
};
