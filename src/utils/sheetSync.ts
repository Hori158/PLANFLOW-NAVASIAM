import { PlanItem } from '../types';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script (GAS) สำหรับเชื่อมต่อ Google Sheets & AppSheet กับ Web Plan Tracker
 * 
 * วิธีการติดตั้ง:
 * 1. เปิด Google Sheets ของคุณ
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดชุดนี้ลงไป
 * 4. กดบันทึก (Ctrl + S)
 * 5. กด Deploy (การทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้ใหม่)
 * 6. เลือกประเภทเป็น "Web app" (เว็บแอปพลิเคชัน)
 *    - Execute as: "Me" (ฉัน)
 *    - Who has access: "Anyone" (ทุกคน)
 * 7. กด Deploy แล้วคัดลอก "Web app URL" มาวางในเว็บนี้ได้ทันที!
 */

const SHEET_NAME = "ActionPlans";

// ฟังก์ชันดึงข้อมูล (GET)
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) {
      return responseJSON({ success: true, count: 0, data: [] });
    }
    
    const headers = rows[0];
    const data = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const item = {};
      headers.forEach((h, index) => {
        item[h] = row[index];
      });
      data.push(item);
    }
    
    return responseJSON({ success: true, count: data.length, data: data });
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

// ฟังก์ชันบันทึกข้อมูล (POST) รองรับการอัปเดตจาก Web และ Webhook จาก AppSheet
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const idColIndex = headers.indexOf("id");
    
    if (idColIndex === -1) {
      return responseJSON({ success: false, error: "Column 'id' not found in Google Sheet header" });
    }
    
    // ค้นหาแถวที่มี id ตรงกัน
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idColIndex] == contents.id) {
        targetRowIndex = i + 1; // 1-indexed for sheet
        break;
      }
    }
    
    if (targetRowIndex !== -1) {
      // อัปเดตแถวเดิม
      headers.forEach((header, colIdx) => {
        if (contents[header] !== undefined) {
          sheet.getRange(targetRowIndex, colIdx + 1).setValue(contents[header]);
        }
      });
      sheet.getRange(targetRowIndex, headers.indexOf("lastUpdated") + 1).setValue(new Date().toISOString());
      return responseJSON({ success: true, action: "updated", id: contents.id });
    } else {
      // เพิ่มแถวใหม่
      const newRow = headers.map(header => contents[header] !== undefined ? contents[header] : "");
      sheet.appendRow(newRow);
      return responseJSON({ success: true, action: "inserted", id: contents.id });
    }
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const RECOMMENDED_SHEET_COLUMNS = [
  { name: 'id', title: 'รหัสแผน (ID)', type: 'Text (Key)', desc: 'NVS-2025-001, NVS-2025-002 (รหัสไม่ซ้ำ)', formula: '="NVS-" & YEAR(TODAY()) & "-" & TEXT(ROW()-1, "000")' },
  { name: 'projectCode', title: 'รหัสโครงการ', type: 'Text', desc: 'NVS-001, NVS-002, NVS-003' },
  { name: 'projectName', title: 'ชื่อโครงการ', type: 'Text', desc: 'ชื่อโครงการหลัก เช่น Character Modeling Pipeline' },
  { name: 'taskTitle', title: 'ชื่องาน / กิจกรรม', type: 'Long Text', desc: 'กิจกรรมที่ต้องปฏิบัติจริง' },
  { name: 'department', title: 'ทีมงาน', type: 'Enum / Dropdown', desc: 'Modeling Team, Scripting Team, Animation Team, Graphics Team, Activities Team, Map Management Team, Quality Assurance Team' },
  { name: 'phase', title: 'เฟสงาน', type: 'Enum (Phase 1-4)', desc: 'Phase 1, Phase 2, Phase 3, Phase 4' },
  { name: 'category', title: 'หมวดหมู่งาน', type: 'Text (Multiple)', desc: 'เลือกได้หลายตัว: งานปรับปรุงระบบ;งานซ่อมบำรุง;งานออกแบบ;งานทั่วไป;งานเนื้อเรื่อง;งานการตลาด;งานจัดซื้อ จัดจ้าง' },
  { name: 'plannedStartDate', title: 'วันเริ่มตามแผน', type: 'Date', desc: 'รูปแบบ YYYY-MM-DD' },
  { name: 'plannedEndDate', title: 'วันสิ้นสุดตามแผน', type: 'Date', desc: 'กำหนดส่งมอบ' },
  { name: 'actualStartDate', title: 'วันเริ่มทำจริง', type: 'Date', desc: 'บันทึกเมื่อเริ่มลงมือ' },
  { name: 'actualEndDate', title: 'วันเสร็จจริง', type: 'Date', desc: 'บันทึกเมื่อตรวจรับเสร็จ' },
  { name: 'status', title: 'สถานะ', type: 'Enum', desc: 'not_started, in_progress, under_review, completed, delayed', formula: '=IF(K2<>"","completed", IF(TODAY()>I2,"delayed","in_progress"))' },
  { name: 'progress', title: '% ความคืบหน้า', type: 'Percent (0-100)', desc: 'ความสำเร็จ 0-100%' },
  { name: 'priority', title: 'ความสำคัญ', type: 'Enum', desc: 'urgent, high, medium, low' },
  { name: 'plannedKpi', title: 'เป้าหมายเชิงปริมาณ', type: 'Text', desc: 'เป้าหมาย KPI ที่วางไว้' },
  { name: 'actualKpi', title: 'ผลงานจริง', type: 'Text', desc: 'ผลงานที่ทำได้จริง' },
  { name: 'assigneeName', title: 'ผู้รับผิดชอบ', type: 'Text / Email', desc: 'ชื่อผู้ปฏิบัติงาน' },
  { name: 'assigneeRole', title: 'ตำแหน่ง', type: 'Text', desc: 'บทบาทในทีม' },
  { name: 'approverName', title: 'ผู้ตรวจรับ', type: 'Text / Email', desc: 'หัวหน้าทีมหรือผู้ประเมิน' },
  { name: 'budgetPlanned', title: 'งบประมาณ (บาท)', type: 'Price / Number', desc: 'งบที่วางแผนไว้' },
  { name: 'budgetActual', title: 'งบใช้จริง (บาท)', type: 'Price / Number', desc: 'งบที่ใช้ไปจริง' },
  { name: 'evidenceUrl', title: 'หลักฐาน/รูปภาพ', type: 'Image / URL', desc: 'ลิงก์รูปภาพหรือเอกสารแนบ' },
  { name: 'location', title: 'สถานที่', type: 'Text', desc: 'สถานที่ปฏิบัติงาน' },
  { name: 'completionNotes', title: 'หมายเหตุ', type: 'Long Text', desc: 'รายละเอียดผลการตรวจรับ' },
  { name: 'appSheetRowId', title: 'AppSheet Row ID', type: 'UniqueID()', desc: 'คีย์สำหรับ Sync กับ AppSheet' },
  { name: 'lastUpdated', title: 'อัปเดตล่าสุด', type: 'DateTime', desc: 'เวลาที่มีการเปลี่ยนแปลง' },
  { name: 'syncStatus', title: 'สถานะ Sync', type: 'Enum', desc: 'synced, pending, syncing, error' }
];

export function exportPlansToCSV(plans: PlanItem[]): void {
  const headers = [
    'id', 'projectCode', 'projectName', 'taskTitle', 'department', 'phase', 'category',
    'plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate',
    'status', 'progress', 'priority', 'plannedKpi', 'actualKpi',
    'assigneeName', 'approverName', 'budgetPlanned', 'budgetActual',
    'evidenceUrl', 'location', 'completionNotes', 'appSheetRowId', 'lastUpdated'
  ];

  const rows = plans.map(p => [
    p.id,
    `"${(p.projectCode || '').replace(/"/g, '""')}"`,
    `"${(p.projectName || '').replace(/"/g, '""')}"`,
    `"${(p.taskTitle || '').replace(/"/g, '""')}"`,
    `"${(p.department || '').replace(/"/g, '""')}"`,
    p.phase,
    `"${Array.isArray(p.category) ? p.category.join(';') : (p.category || '')}"`,
    p.plannedStartDate,
    p.plannedEndDate,
    p.actualStartDate || '',
    p.actualEndDate || '',
    p.status,
    p.progress,
    p.priority,
    `"${(p.plannedKpi || '').replace(/"/g, '""')}"`,
    `"${(p.actualKpi || '').replace(/"/g, '""')}"`,
    `"${(p.assigneeName || '').replace(/"/g, '""')}"`,
    `"${(p.approverName || '').replace(/"/g, '""')}"`,
    p.budgetPlanned,
    p.budgetActual,
    `"${(p.evidenceUrl || '').replace(/"/g, '""')}"`,
    `"${(p.location || '').replace(/"/g, '""')}"`,
    `"${(p.completionNotes || '').replace(/"/g, '""')}"`,
    p.appSheetRowId,
    p.lastUpdated
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `action_plans_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVToPlans(csvText: string): PlanItem[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const results: PlanItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Regex for parsing CSV with quotes
    const values: string[] = [];
    let match;
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      values.push(val ? val.trim() : '');
    }

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });

    if (rowObj.id || rowObj.taskTitle) {
      results.push({
        id: rowObj.id || `PLN-IMP-${i}`,
        projectCode: rowObj.projectCode || 'PRJ-IMP',
        projectName: rowObj.projectName || 'โครงการนำเข้า',
        taskTitle: rowObj.taskTitle || 'งานที่นำเข้า',
        department: rowObj.department || 'ทั่วไป',
        category: rowObj.category ? rowObj.category.split(';').filter(c => c) : ['งานปรับปรุงระบบ'],
        phase: (rowObj.phase as any) || 'Phase 1',
        plannedStartDate: rowObj.plannedStartDate || new Date().toISOString().slice(0, 10),
        plannedEndDate: rowObj.plannedEndDate || new Date().toISOString().slice(0, 10),
        actualStartDate: rowObj.actualStartDate || undefined,
        actualEndDate: rowObj.actualEndDate || undefined,
        status: (rowObj.status as any) || 'in_progress',
        priority: (rowObj.priority as any) || 'medium',
        progress: Number(rowObj.progress) || 0,
        plannedKpi: rowObj.plannedKpi || '',
        actualKpi: rowObj.actualKpi || '',
        assigneeName: rowObj.assigneeName || 'ไม่ระบุ',
        approverName: rowObj.approverName || '',
        budgetPlanned: Number(rowObj.budgetPlanned) || 0,
        budgetActual: Number(rowObj.budgetActual) || 0,
        evidenceUrl: rowObj.evidenceUrl || '',
        location: rowObj.location || '',
        remarks: rowObj.completionNotes || '',
        completionNotes: rowObj.completionNotes || '',
        appSheetRowId: rowObj.appSheetRowId || `ROW-${Date.now()}-${i}`,
        lastUpdated: rowObj.lastUpdated || new Date().toISOString(),
        syncStatus: 'synced'
      });
    }
  }

  return results;
}
