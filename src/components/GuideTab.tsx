import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Database, 
  Smartphone, 
  Globe, 
  Copy, 
  Check, 
  Zap, 
  Bell, 
  Layers, 
  FileSpreadsheet, 
  HelpCircle,
  Code
} from 'lucide-react';
import { RECOMMENDED_SHEET_COLUMNS, GOOGLE_APPS_SCRIPT_TEMPLATE } from '../utils/sheetSync';

export const GuideTab: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'schema' | 'functions' | 'architecture' | 'script' | 'install'>('schema');

  const copyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const copyHeadersOnly = () => {
    const headers = RECOMMENDED_SHEET_COLUMNS.map(c => c.name).join('\t');
    navigator.clipboard.writeText(headers);
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Introduction */}
      <div className="bg-[#211a12] border-2 border-[var(--ink)] rounded-none p-6 sm:p-8 text-[#f3ecdb] shadow-[4px_4px_0_rgba(33,26,18,0.25)] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            P.NVS System Architecture Guide
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            PLANFLOW <span className="text-indigo-400">NAVASIAM</span> (<span className="text-emerald-400">P.NVS</span>)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            ระบบติดตามแผนงานเรียลไทม์สำหรับ <strong>Navasiam</strong> 
            เชื่อมต่อ <strong>AppSheet Mobile</strong> (ทีมงานหน้างาน) + 
            <strong>Google Sheets</strong> (Cloud Database) + 
            <strong>Web Dashboard</strong> (ผู้บริหาร)
          </p>
        </div>

        {/* Tab navigation within guide */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-700/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveCategory('schema')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'schema' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            1. โครงสร้างข้อมูล (Data Schema)
          </button>
          <button
            onClick={() => setActiveCategory('functions')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'functions' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            2. ฟังก์ชันหลัก (Key Features)
          </button>
          <button
            onClick={() => setActiveCategory('architecture')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'architecture' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            3. สถาปัตยกรรมระบบ (Architecture)
          </button>
          <button
            onClick={() => setActiveCategory('script')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'script' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            4. Google Apps Script
          </button>
          <button
            onClick={() => setActiveCategory('install')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'install' ? 'bg-[var(--red-ink)] text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            5.  คู่มือติดตั้ง (เริ่มใช้งาน)
          </button>
        </div>
      </div>

      {/* 1. DATA SCHEMA SECTION */}
      {activeCategory === 'schema' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  ตารางคอลัมน์ที่แนะนำใน Google Sheets & AppSheet
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  โครงสร้างข้อมูลนี้ครอบคลุมการติดตามงาน การเงิน การแนบรูปภาพ และการวัดผล KPI ครบวงจร
                </p>
              </div>
              <button
                onClick={copyHeadersOnly}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 transition-colors cursor-pointer"
              >
                {copiedHeaders ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHeaders ? 'คัดลอกเรียบร้อย! (วางใน Sheet ได้เลย)' : 'คัดลอกหัวตาราง (Headers) นำไปวางใน Google Sheet'}</span>
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">ชื่อคอลัมน์ (Field Name)</th>
                    <th className="py-2.5 px-3">ชื่อภาษาไทย</th>
                    <th className="py-2.5 px-3">Data Type (AppSheet / Sheet)</th>
                    <th className="py-2.5 px-3">คำอธิบายการใช้งาน</th>
                    <th className="py-2.5 px-3">สูตรแนะนำ (Formula)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {RECOMMENDED_SHEET_COLUMNS.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-blue-700">
                        {col.name}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">
                        {col.title}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {col.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">
                        {col.desc}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 text-[10px]">
                        {col.formula ? <code>{col.formula}</code> : <span className="text-slate-300 font-sans">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Group Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5 text-indigo-600">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                1. รหัสและการจัดกลุ่ม
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li><strong>ID:</strong> <code>NVS-2025-001</code> รหัสแผนงานไม่ซ้ำ</li>
                <li><strong>Project Code:</strong> <code>NVS-001</code> รหัสโครงการ</li>
                <li><strong>Phase:</strong> Phase 1-4 เฟสการทำงาน</li>
                <li><strong>Department:</strong> Modeling, Scripting, Animation, etc.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                2. การวัดผลและสถานะ
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li><strong>Status:</strong> not_started, in_progress, under_review, completed, delayed</li>
                <li><strong>Progress:</strong> 0-100% ความคืบหน้า</li>
                <li><strong>Dates:</strong> Planned vs Actual สำหรับติดตาม</li>
                <li><strong>KPI:</strong> เป้าหมาย vs ผลงานจริง</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5 text-purple-600">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                3. หมวดหมู่และหลักฐาน
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li><strong>Category:</strong> สามารถเลือกได้หลายตัว เช่น งานออกแบบ, งานปรับปรุงระบบ</li>
                <li><strong>Evidence:</strong> รูปภาพ/เอกสารหลักฐานจาก AppSheet</li>
                <li><strong>Budget:</strong> งบประมาณตามแผน vs ใช้จริง</li>
                <li><strong>Sync:</strong> AppSheet Row ID สำหรับการซิงค์</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* 2. FUNCTIONS SECTION */}
      {activeCategory === 'functions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Function 1 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              1. Real-time Webhook & Auto-Sync
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              เมื่อทีมงาน (Modeling, Animation, etc.) อัปเดตข้อมูลผ่าน AppSheet Mobile ข้อมูลจะซิงค์เข้าสู่ Google Sheets และส่ง Webhook มาสะกิดเว็บ Dashboard ให้อัปเดตข้อมูลและรูปภาพแบบเรียลไทม์โดยไม่ต้องรีเฟรช
            </p>
          </div>

          {/* Function 2 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              2. Check-in & Photo Evidence
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              หัวหน้าทีมสามารถตรวจรับงาน ดูรูปถ่ายผลงาน (Before/After) จาก AppSheet Mobile ตรวจสอบพิกัด GPS บันทึกหมายเหตุ และยืนยันการส่งมอบงานแบบดิจิทัล
            </p>
          </div>

          {/* Function 3 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              3. ระบบแจ้งเตือนงานเกินกำหนด (Smart Overdue Alert)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ระบบตรวจสอบวันที่ <code>plannedEndDate</code> เทียบกับ <code>TODAY()</code> อัตโนมัติ หากยังไม่เสร็จจะขึ้นแถบเตือนสีแดงกระพริบ และสามารถต่อยอดส่งข้อความแจ้งเตือนเข้า LINE Notify หรืออีเมลผู้รับผิดชอบได้ทันที
            </p>
          </div>

          {/* Function 4 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              4. มุมมองการแสดงผลหลากหลาย (Multi-View Tracking)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              - <strong>Table View:</strong> ดูละเอียดทุกฟิลด์ ค้นหา ปรับ % สด<br />
              - <strong>Kanban Board:</strong> ลากย้ายสถานะแบบการ์ด<br />
              - <strong>Timeline / Gantt:</strong> ดูความสอดคล้องของช่วงเวลาแผน vs วันทำจริง<br />
              - <strong>Executive Analytics:</strong> สรุป KPI และงบประมาณสำหรับประชุม
            </p>
          </div>

          {/* Function 5 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              5. Import & Export CSV
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ส่งออกข้อมูลเป็นไฟล์ CSV/Excel เพื่อรายงานสรุป หรือนำเข้าข้อมูลจากไฟล์ CSV เข้าสู่ระบบในคลิกเดียว
            </p>
          </div>

          {/* Function 6 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              6. บันทึกประวัติการเปลี่ยนแปลง (Audit Trail)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              เก็บประวัติว่าใครเป็นผู้อัปเดตสถานะ เปลี่ยนจากกี่เปอร์เซ็นต์เป็นกี่เปอร์เซ็นต์ เวลาใด ป้องกันการแก้ไขข้อมูลโดยไม่ทราบสาเหตุและเพิ่มความโปร่งใสในองค์กร
            </p>
          </div>

        </div>
      )}

      {/* 3. ARCHITECTURE SECTION */}
      {activeCategory === 'architecture' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              สถาปัตยกรรมระบบ (System Architecture)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Workflow: AppSheet Mobile → Google Sheets → Apps Script API → Web Dashboard (P.NVS)
            </p>
          </div>

          {/* Diagram Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-2">
                1
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>AppSheet Mobile</span>
              </div>
              <p className="text-xs text-slate-600">
                ทีมงาน (Modeling, Animation, etc.) ใช้ AppSheet บนมือถือ: บันทึกงาน, ถ่ายรูป, เช็คอิน GPS
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-2">
                2
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets</span>
              </div>
              <p className="text-xs text-slate-600">
                AppSheet ซิงค์ข้อมูลลง Google Sheet อัตโนมัติ พร้อมอัปโหลดรูปลง Google Drive
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-2">
                3
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1">
                <Code className="w-4 h-4 text-purple-600" />
                <span>Apps Script API</span>
              </div>
              <p className="text-xs text-slate-600">
                Google Apps Script Web App เป็น REST API สำหรับดึงและส่งข้อมูล JSON 2 ทาง
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-2">
                4
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>PLANFLOW Dashboard</span>
              </div>
              <p className="text-xs text-slate-600">
                เว็บ Dashboard (P.NVS) แสดงข้อมูลเรียลไทม์ ผู้บริหารตรวจรับงาน และอัปเดตสถานะกลับได้
              </p>
            </div>

          </div>

          {/* Integration tips */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              💡 เทคนิคการตั้งค่า Real-time Webhook ใน AppSheet:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>ใน AppSheet ไปที่เมนู <strong>Automation &gt; Bots &gt; Create a new bot</strong></li>
              <li>ตั้งเงื่อนไข Event เมื่อตาราง <code>ActionPlans</code> มีการ <strong>Adds and Updates</strong></li>
              <li>ในส่วน Tasks เลือกประเภทเป็น <strong>Call a webhook</strong></li>
              <li>ใส่ URL ของ Google Apps Script Web App หรือ Endpoint ของเว็บแดชบอร์ดนี้</li>
              <li>เลือก HTTP Verb เป็น <strong>POST</strong> และส่งข้อมูล Payload เป็น JSON</li>
            </ol>
          </div>
        </div>
      )}

      {/* 4. SCRIPT CODE SECTION */}
      {activeCategory === 'script' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-600" />
                โค้ด Google Apps Script (พร้อมใช้งานทันที)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                นำโค้ดนี้ไปแปะใน Google Sheets &gt; Extensions &gt; Apps Script แล้ว Deploy เป็น Web App
              </p>
            </div>
            <button
              onClick={copyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript ? 'คัดลอกโค้ดเรียบร้อย!' : 'คัดลอกโค้ด Apps Script ทั้งหมด'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[450px]">
              {GOOGLE_APPS_SCRIPT_TEMPLATE}
            </pre>
          </div>
        </div>
      )}

      {/* 5. INSTALL GUIDE SECTION */}
      {activeCategory === 'install' && (
        <div className="space-y-5">

          {/* ===== OPTION A ===== */}
          <div className="paper-card p-5">
            <div className="flex items-start gap-3 mb-4 pb-3 border-b-2 border-[var(--ink)]">
              <span className="stamp text-xs text-[var(--green-ink)] shrink-0">แบบ A</span>
              <div>
                <h3 className="font-headline text-base text-[var(--ink)]">
                  โหมดพื้นฐาน — ไม่ต้องมี Backend (ใช้ได้เลยทันที)
                </h3>
                <p className="font-type text-[11px] text-[var(--ink-soft)] mt-0.5">
                  แนะนำสำหรับเริ่มต้น ทดสอบระบบ และทดลองให้ทีมดู — เริ่มต้นได้ใน 1 นาที
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {[
                {
                  t: 'เปิดเว็บให้ทำงาน',
                  lines: [
                    'ทดลองคนเดียว → ดับเบิลคลิกไฟล์ dist/index.html ก็ใช้ได้เลย',
                    'ใช้ทั้งทีม → ลากโฟลเดอร์ dist ทิ้งที่ Netlify Drop แล้วคัดลอกลิงก์ส่งให้ทีม'
                  ]
                },
                {
                  t: 'ลงข่าวแรก — กดปุ่ม "＋ เพิ่มงาน"',
                  lines: [
                    'กรอกชื่อโครงการ + ชื่องานที่ต้องทำ',
                    'เลือกทีม · เฟส (Phase 1–4) · หมวดหมู่ (กด Ctrl ค้าง เลือกได้หลายหมวด)',
                    'ตั้งวันเริ่ม–สิ้นสุด + KPI + ผู้รับผิดชอบ',
                    'กด "สร้างแผนงาน" → ระบบตั้งรหัส NVS-2025-xxx ให้อัตโนมัติ'
                  ]
                },
                {
                  t: 'ติดตามงานตามสไตล์ที่ชอบ',
                  lines: [
                    'ตาราง → ปรับ % และเปลี่ยนสถานะได้เลย',
                    'คัมบัง → เลื่อนการ์ดตามสถานะ',
                    'ไทม์ไลน์ → ดูแผนรายเฟส · กราฟ KPI → ดูภาพรวม',
                    'งานเกินกำหนด → ติดตราแดง "ล่าช้า" ให้โดยอัตโนมัติ'
                  ]
                },
                {
                  t: 'ทดลองดู Real-time',
                  lines: [
                    'กดปุ่ม "⚡ จำลอง AppSheet" บนแถบเครื่องมือ',
                    'ดูพาดหัวข่าววิ่ง + การแจ้งเตือน + ตัวเลขอัปเดตสดๆ'
                  ]
                },
                {
                  t: 'แชร์ข้อมูลกับทีม',
                  lines: [
                    'กด "ส่งออก CSV" → ส่งไฟล์ให้ทีมเปิดดูใน Excel / Sheets',
                    'ต้องการเก็บข้อมูลกลับ → "เชื่อมต่อ Sheets" → นำเข้าไฟล์ CSV'
                  ]
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-3 animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="w-8 h-8 border-2 border-[var(--ink)] bg-[var(--ink)] text-[#f6efdd] font-headline text-sm flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="pt-0.5 min-w-0">
                    <p className="font-bold text-[15px] leading-snug text-[var(--ink)]">{step.t}</p>
                    <div className="mt-1.5 space-y-1">
                      {step.lines.map((ln, li) => (
                        <p key={li} className="font-type text-xs leading-relaxed text-[var(--ink-soft)] flex gap-2">
                          <span className="text-[var(--red-ink)] shrink-0">▸</span>
                          <span>{ln}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3.5 bg-[rgba(158,43,37,0.05)] border border-[var(--red-ink)]/40">
              <p className="font-type text-xs text-[var(--red-ink)] leading-relaxed font-bold">
                ⚠ ข้อจำกัดของแบบ A: ข้อมูลเก็บในเบราว์เซอร์เครื่องนั้นๆ (localStorage)
              </p>
              <p className="font-type text-xs text-[var(--red-ink)]/90 leading-relaxed mt-1">
                เปิดคนละเครื่อง หรือล้าง Cache แล้วข้อมูลจะไม่เหมือนกัน — ต้องการแชร์ข้ามอุปกรณ์จริง ให้ไปต่อที่ <strong>แบบ B</strong> ได้เลยครับ
              </p>
            </div>
          </div>

          {/* ===== OPTION B ===== */}
          <div className="paper-card p-5">
            <div className="flex items-start gap-3 mb-4 pb-3 border-b-2 border-[var(--ink)]">
              <span className="stamp text-xs text-[var(--blue-ink)] shrink-0">แบบ B</span>
              <div>
                <h3 className="font-headline text-base text-[var(--ink)]">
                  โหมด Live — เชื่อม Google Apps Script (ใช้ข้อมูลจริงจาก Google Sheets)
                </h3>
                <p className="font-type text-[11px] text-[var(--ink-soft)] mt-0.5">
                  ใช้ Google Account เดียวเท่านั้น • ฟรี • ไม่ต้องมีเซิร์ฟเวอร์เอง
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              {[
                {
                  t: 'สร้างตาราง Google Sheets',
                  d: 'สร้าง Sheet ใหม่ → ไปแท็บ "1. โครงสร้างข้อมูล" ด้านบนของหน้านี้ → กดปุ่ม "คัดลอกหัวตาราง" → วางใน A1 ของ Google Sheet → ตั้งชื่อ Tab ว่า ActionPlans'
                },
                {
                  t: 'วางโค้ด Google Apps Script',
                  d: 'ใน Google Sheet: เมนู ส่วนขยาย (Extensions) → Apps Script → ลบโค้ดเดิม → ไปแท็บ "4. Google Apps Script" ด้านบน → กด "คัดลอกโค้ด" → วาง → บันทึก'
                },
                {
                  t: 'Deploy เป็น Web App (ขั้นตอนสำคัญ)',
                  d: 'มุมขวาบน กด Deploy (การทำให้ใช้งานได้) → New deployment → เลือกประเภท "Web app" → Execute as: "Me (ฉัน)" → Who has access: "Anyone (ทุกคน)" ← ต้องเลือก Anyone เท่านั้น! → กด Deploy → อนุญาตสิทธิ์ → คัดลอก "Web app URL" (ลงท้ายด้วย /exec)'
                },
                {
                  t: 'นำ URL มาเชื่อมในระบบ',
                  d: 'บนเว็บนี้: กดปุ่ม "เชื่อมต่อ Sheets" บนแถบเครื่องมือ → เลือกโหมด "Live GAS Web App" → วาง URL → กด "ทดสอบการเชื่อมต่อ (Ping Test)" → ถ้าขึ้น "เชื่อมต่อสำเร็จ" → กด "บันทึกการตั้งค่า"'
                },
                {
                  t: 'เสร็จ! ใช้ได้จริง',
                  d: 'กดปุ่ม "รีเฟรช" ระบบจะดึงข้อมูลจริงจาก Google Sheets มาแสดง และข้อมูลใน Sheet จะอัปเดตตามการกระทำทุกอย่างบนเว็บทันที'
                }
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 border-2 border-[var(--ink)] bg-[var(--ink)] text-[#f6efdd] font-headline text-sm flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="font-bold text-sm text-[var(--ink)]">{step.t}</p>
                    <p className="font-type text-[11px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 p-3 bg-[rgba(45,83,112,0.06)] border border-[var(--blue-ink)]/40">
              <p className="font-type text-[11px] text-[var(--blue-ink)] leading-relaxed">
                💡 ถ้าทดสอบแล้วขึ้น "เชื่อมต่อไม่สำเร็จ": ตรวจว่า Deploy เลือก Who has access เป็น "Anyone" (ไม่ใช่ "Anyone with the link") หรือไม่ และหากแก้ไขโค้ดต้อง Deploy แบบ "Manage deployments → แก้ไข → เวอร์ชันใหม่" ทุกครั้ง
              </p>
            </div>
          </div>

          {/* ===== OPTION C ===== */}
          <div className="paper-card p-5">
            <div className="flex items-start gap-3 mb-4 pb-3 border-b-2 border-[var(--ink)]">
              <span className="stamp text-xs text-[var(--amber-ink)] shrink-0">แบบ C</span>
              <div>
                <h3 className="font-headline text-base text-[var(--ink)]">
                  โหมดเต็มรูปแบบ — AppSheet Real-time (ทีมงานหน้างานส่งข้อมูลเข้าเว็บ)
                </h3>
                <p className="font-type text-[11px] text-[var(--ink-soft)] mt-0.5">
                  ใช้ต่อจากแบบ B • ทีมงานเปิด AppSheet บนมือถือ → ข้อมูลวิ่งเข้าเว็บภายในไม่กี่วินาที
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              {[
                {
                  t: 'สร้างแอป AppSheet (หรือใช้แอปเดิม)',
                  d: 'เข้า appsheet.com → Create app → เลือก Google Sheet เดียวกับแบบ B → ตั้งค่าคอลัมน์ตามตารางโครงสร้างข้อมูล (status เป็น Enum, evidenceUrl เป็น Image)'
                },
                {
                  t: 'ตั้ง Webhook Bot ใน AppSheet',
                  d: 'เมนู Automation → Bots → Create a new bot → ตั้งชื่อ เช่น "Notify Dashboard" → Event: เลือก "Adds and Updates" ของตาราง ActionPlans'
                },
                {
                  t: 'ตั้ง Task: Call a webhook',
                  d: 'Tasks → Add task → เลือก "Call a webhook" → Method: POST → URL: ใส่ Web App URL ของแบบ B (หรือ URL ของเซิร์ฟเวอร์รับเว็บนี้) → Body: เลือกส่งข้อมูลแถวที่เปลี่ยนแปลงเป็น JSON → Deploy bot'
                },
                {
                  t: 'ทดสอบระบบ',
                  d: 'เปิด AppSheet บนมือถือ → แก้ไข % งานรายการใดก็ได้ → กลับมาดูเว็บ PLANFLOW NAVASIAM → ข้อมูลจะอัปเดตทันที พร้อมพาดหัวข่าววิ่ง + Toast แจ้งเตือน'
                }
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 border-2 border-[var(--ink)] bg-[var(--ink)] text-[#f6efdd] font-headline text-sm flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="font-bold text-sm text-[var(--ink)]">{step.t}</p>
                    <p className="font-type text-[11px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 p-3 bg-[rgba(138,101,32,0.07)] border border-[var(--amber-ink)]/40">
              <p className="font-type text-[11px] text-[var(--amber-ink)] leading-relaxed">
                ✅ เมื่อติดตั้งครบแบบ A → B → C แล้ว ทีมงานหน้างาน (Modeling/Scripting/Animation/...) จะอัปเดตงานผ่านมือถือ แล้วผู้บริหารเห็นผลแบบเรียลไทม์บนหน้านี้ทันที — ครบวงจรตามสถาปัตยกรรมที่ออกแบบไว้
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
