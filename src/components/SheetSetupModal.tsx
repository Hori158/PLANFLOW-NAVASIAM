import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Link2, 
  CheckCircle2, 
  FileSpreadsheet, 
  Upload, 
  Check, 
  Copy,
  Radio
} from 'lucide-react';
import { SyncConfig } from '../types';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../utils/sheetSync';

interface SheetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SyncConfig;
  onSaveConfig: (newConfig: SyncConfig) => void;
  onImportCSV: (file: File) => void;
}

export const SheetSetupModal: React.FC<SheetSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onImportCSV
}) => {
  if (!isOpen) return null;

  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl || '');
  const [appSheetAppId, setAppSheetAppId] = useState(config.appSheetAppId || '');
  const [appSheetAccessKey, setAppSheetAccessKey] = useState(config.appSheetAccessKey || '');
  const [isLiveMode, setIsLiveMode] = useState(config.isLiveMode);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  const handleTestConnection = async () => {
    if (!sheetUrl) {
      setTestStatus('error');
      setTestMessage('กรุณาระบุ Google Apps Script Web App URL หรือ Google Sheet CSV URL');
      return;
    }

    setTestStatus('testing');
    setTestMessage('กำลังทดสอบเชื่อมต่อไปยังเซิร์ฟเวอร์ Google...');

    try {
      const resp = await fetch(sheetUrl, { method: 'GET', mode: 'cors' });
      if (resp.ok) {
        setTestStatus('success');
        setTestMessage('✅ เชื่อมต่อสำเร็จ! ดึงข้อมูลจาก Google Sheets ได้เรียบร้อย');
      } else {
        setTestStatus('error');
        setTestMessage(`⚠️ การเชื่อมต่อตอบกลับสถานะ HTTP ${resp.status} (อาจติดสิทธิ์ Anyone เข้าถึงได้)`);
      }
    } catch (err: any) {
      // Due to CORS restrictions on some Google redirects, we explain clearly:
      setTestStatus('error');
      setTestMessage('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ (ตรวจดูว่า Web App Deploy เป็น "Anyone" หรือไม่ หรือใช้ Simulated Mode)');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      sheetUrl,
      appSheetAppId,
      appSheetAccessKey,
      isLiveMode
    });
    onClose();
  };

  const copyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCSV(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-pop">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                ตั้งค่าเชื่อมต่อ Google Sheets & AppSheet
              </h3>
              <p className="text-xs text-slate-500">
                รองรับทั้งโหมด Live Webhook และ Realtime Simulation
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

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Mode Switcher */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              โหมดการทำงาน (Sync Mode)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsLiveMode(false)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  !isLiveMode 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Real-time Simulation</span>
                </div>
                <p className={`text-[11px] ${!isLiveMode ? 'text-blue-100' : 'text-slate-400'}`}>
                  จำลองการส่งข้อมูล AppSheet แบบเรียลไทม์ (แนะนำสำหรับการทดสอบ)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsLiveMode(true)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  isLiveMode 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Live GAS Web App</span>
                </div>
                <p className={`text-[11px] ${isLiveMode ? 'text-blue-100' : 'text-slate-400'}`}>
                  เชื่อมต่อตรงผ่าน Google Apps Script API URL
                </p>
              </button>
            </div>
          </div>

          {/* Google Apps Script / Sheet URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Google Apps Script Web App URL หรือ Published CSV URL</span>
              <button
                type="button"
                onClick={copyScript}
                className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-normal"
              >
                {copiedScript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScript ? 'คัดลอกโค้ดแล้ว' : 'ดูโค้ด GAS'}</span>
              </button>
            </label>
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="https://script.google.com/macros/s/.../exec หรือ https://docs.google.com/spreadsheets/...pub?output=csv"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              วาง Web App URL ที่ได้จากการกด "Deploy &gt; Web app" ใน Google Apps Script
            </p>
          </div>

          {/* AppSheet API settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AppSheet Application ID (ถ้ามี)
              </label>
              <input
                type="text"
                value={appSheetAppId}
                onChange={(e) => setAppSheetAppId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="เช่น 123456-abc-xyz"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AppSheet Access Key (ถ้ามี)
              </label>
              <input
                type="password"
                value={appSheetAccessKey}
                onChange={(e) => setAppSheetAccessKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Test connection action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{testStatus === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ (Ping Test)'}</span>
            </button>
            {testMessage && (
              <p className={`text-xs mt-2 p-2 rounded-lg ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {testMessage}
              </p>
            )}
          </div>

          {/* Alternative: Local CSV Import */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                นำเข้าไฟล์ CSV จากคอมพิวเตอร์ของคุณ
              </span>
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-colors text-xs text-slate-600">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>เลือกไฟล์ .csv ที่ดาวน์โหลดจาก Google Sheets</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ปิด
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
