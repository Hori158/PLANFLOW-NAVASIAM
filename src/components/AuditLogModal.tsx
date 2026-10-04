import React from 'react';
import { X, History, CheckCircle2, Trash2 } from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
  onClearLogs: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  if (!isOpen) return null;

  const getActionBadge = (action: AuditLogItem['action']) => {
    switch (action) {
      case 'checkin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">ตรวจรับงาน</span>;
      case 'status_change':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">เปลี่ยนสถานะ</span>;
      case 'update':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">แก้ไขแผน</span>;
      case 'create':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">เพิ่มแผนใหม่</span>;
      case 'sync':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">ซิงค์ระบบ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">ทั่วไป</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-pop">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                ประวัติกิจกรรมและการซิงค์ (Audit Log)
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกการเปลี่ยนแปลงแบบเรียลไทม์ระหว่าง Web, Google Sheets และ AppSheet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="ล้างประวัติ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Log List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>ยังไม่มีบันทึกประวัติการเปลี่ยนแปลงในเซสชันนี้</p>
              <p className="text-[11px] text-slate-400 mt-1">ลองกดปุ่ม "จำลองอัปเดตจาก AppSheet" หรือ "ตรวจงาน" เพื่อดูผล</p>
            </div>
          ) : (
            logs.map(log => (
              <div 
                key={log.id}
                className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs space-y-1 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getActionBadge(log.action)}
                    <span className="font-mono font-bold text-slate-700">{log.taskId}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                  </span>
                </div>

                <p className="font-medium text-slate-800 line-clamp-1">
                  {log.taskTitle}
                </p>

                <p className="text-slate-600 text-[11px]">
                  {log.details}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span>โดย: <strong className="text-slate-700">{log.user}</strong></span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ซิงค์ Sheets เรียบร้อย ({log.syncResult})</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>แสดง {logs.length} กิจกรรมล่าสุด</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
