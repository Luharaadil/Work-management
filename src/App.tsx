import React, { useState } from "react";
import { AlertCircle, HelpCircle, X, Sparkles, Copy, CheckCircle2 } from "lucide-react";
import { CODE_GS, INDEX_HTML } from "./V3Code";

export default function App() {
  const [showHelp, setShowHelp] = useState(true);
  const [showV2Modal, setShowV2Modal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const copyCode = (text: string, setter: any) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex overflow-hidden relative">
      <iframe 
        src="https://script.google.com/macros/s/AKfycbz6YOJjgOmXaKVU04-udAS81t5QPr4tGcO4oozA1FtUJBOw_4_uMolK5A_IlOt-CIDN/exec" 
        className="w-full h-screen border-0 flex-1"
        title="Live App Script Preview"
      />

      {showV2Modal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-indigo-400" /> V2 Upgrade: Maxxis Rubber India & Analytics
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Copy and paste these new codes into Google Apps Script to get the Chart updates and rebranding.</p>
               </div>
               <button onClick={() => setShowV2Modal(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-lg">1. <code>Code.gs</code> Update</h3>
                    <button onClick={() => copyCode(CODE_GS, setCopiedCode)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                       {copiedCode ? <CheckCircle2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>} 
                       {copiedCode ? "Copied!" : "Copy Code.gs"}
                    </button>
                 </div>
                 <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto h-[500px]">
                    <pre className="text-xs text-emerald-400 font-mono"><code>{CODE_GS}</code></pre>
                 </div>
               </div>

               <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-lg">2. <code>Index.html</code> Update</h3>
                    <button onClick={() => copyCode(INDEX_HTML, setCopiedHtml)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                       {copiedHtml ? <CheckCircle2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>} 
                       {copiedHtml ? "Copied!" : "Copy Index.html"}
                    </button>
                 </div>
                 <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto h-[500px]">
                    <pre className="text-xs text-sky-400 font-mono"><code>{INDEX_HTML}</code></pre>
                 </div>
               </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
               <button onClick={() => setShowV2Modal(false)} className="bg-slate-800 text-white hover:bg-slate-700 px-6 py-2 rounded-lg font-bold">Done</button>
            </div>
          </div>
        </div>
      )}

      {showHelp && !showV2Modal && (
        <div className="w-full md:w-[400px] h-screen bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right-8 shrink-0 absolute right-0 top-0 z-10">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h2 className="font-semibold flex items-center gap-2 text-slate-100">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Developer Support
            </h2>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-300">
            {/* NEW V2 PROMO */}
            <div className="bg-indigo-600/20 border border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.15)] p-5 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-indigo-400/30"></div>
               <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
                 <Sparkles className="w-5 h-5 text-indigo-300" /> Version 3.0 Ready!
               </h3>
               <p className="text-sm text-indigo-200 mb-4 leading-relaxed relative z-10">
                 Upgraded Individual Tracking, Manager-Staff linking, and automatic historical missed-task logging.
               </p>
               <button 
                 onClick={() => setShowV2Modal(true)}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95 relative z-10"
               >
                 View Upgraded Code
               </button>
            </div>

            {/* Q1 */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h3 className="font-bold text-slate-100 mb-2">Q: Where to save Username & Password?</h3>
              <p className="text-sm leading-relaxed mb-3 text-slate-300">
                All usernames and passwords must be securely saved directly in your Google Sheet in the tab exactly named <strong>Users</strong>.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-400 overflow-x-auto">
                <table className="w-full text-left min-w-max">
                  <thead>
                    <tr><th className="pb-2 pr-4">A (UserID)</th><th className="pb-2 pr-4">B (Username)</th><th className="pb-2 pr-4">C (Password)</th><th className="pb-2">D (Role)</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-800/50"><td className="py-2 pr-4">user-123</td><td className="py-2 pr-4 text-emerald-400">admin</td><td className="py-2 pr-4 text-rose-400">admin123</td><td className="py-2 text-indigo-400">Admin</td></tr>
                    <tr className="border-t border-slate-800/50"><td className="py-2 pr-4">user-456</td><td className="py-2 pr-4 text-emerald-400">staff1</td><td className="py-2 pr-4 text-rose-400">pass1</td><td className="py-2 text-indigo-400">Staff</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Q2 */}
            <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/50 shadow-sm shadow-rose-900/10">
              <h3 className="font-bold text-rose-100 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" /> Tasks not showing up?
              </h3>
              <p className="text-sm leading-relaxed text-slate-300 mb-3">
                If your tasks save to the sheet correctly but don't show up on the dashboard for you or your staff, it is almost always caused by <strong>Column Header Mismatches</strong>.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 mb-3">
                The App Script code searches your columns by EXACT names. Make sure Row 1 of your <strong>Tasks</strong> sheet is EXACTLY this (case-sensitive):
              </p>
              <ul className="text-sm space-y-2 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                <li className="flex gap-2"><span className="text-slate-500 w-6">A1:</span><span className="text-emerald-300">TaskID</span></li>
                <li className="flex gap-2"><span className="text-slate-500 w-6">B1:</span><span className="text-emerald-300">Title</span></li>
                <li className="flex gap-2"><span className="text-slate-500 w-6">C1:</span><span className="text-emerald-300">AssigneeID</span></li>
                <li className="flex gap-2"><span className="text-slate-500 w-6">D1:</span><span className="text-emerald-300">Deadline</span></li>
                <li className="flex gap-2"><span className="text-slate-500 w-6">E1:</span><span className="text-emerald-300">Recurrence</span></li>
                <li className="flex gap-2"><span className="text-slate-500 w-6">F1:</span><span className="text-emerald-300">Status</span></li>
              </ul>
              
              <div className="mt-4 text-[13px] text-slate-400 space-y-3 bg-slate-900/50 p-3 flex flex-col gap-1 rounded-lg">
                <p><strong>Note 1:</strong> Do not add spaces (e.g., use <code>TaskID</code> not <code>Task ID</code>). The casing must exactly match the list above.</p>
                <p><strong>Note 2:</strong> Check your <strong>Users</strong> sheet to make sure Column A (UserID) is populated for all users. If user IDs are blank there, assigning tasks will fail secretly!</p>
              </div>
            </div>
            {/* Q3 */}
            <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/50 shadow-sm shadow-amber-900/10">
              <h3 className="font-bold text-amber-100 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Still not showing? Advanced Fixes
              </h3>
              <ul className="text-sm space-y-3 text-slate-300">
                <li>
                  <strong className="text-amber-200">1. Assignee ID Mismatch:</strong> The 'AssigneeID' in your Tasks sheet MUST perfectly match the 'UserID' in your Users sheet. If you previously manually typed a name (like "admin") instead of the long UUID, it won't work. Try creating a brand NEW task to test.
                </li>
                <li>
                  <strong className="text-amber-200">2. Delete Empty Rows:</strong> If your sheet has hundreds of blank rows at the bottom, Google sometimes reads them and breaks the table. Select all empty rows below your data, right click, and click <strong>Delete rows</strong>.
                </li>
                <li>
                  <strong className="text-amber-200">3. The Bulletproof Fix:</strong> If you're still stuck on "Loading tasks..." or an empty list, replace your entire <code>getTasks</code> function in Code.gs with this exact code. It ignores header spelling mistakes and blank rows:
                  <div className="mt-3 bg-slate-950 p-4 rounded border border-slate-800 overflow-x-auto">
                    <pre className="text-xs font-mono text-emerald-400">
{`function getTasks(userId, role) {
  const sheet = getSheet(TASKS_SHEET);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // No tasks
  
  let tasks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip completely empty rows
    
    // Safely convert IDs to string to prevent number vs text mismatch
    const rowAssignee = String(row[2]).trim();
    const currentUserId = String(userId).trim();
    
    if (role === 'Admin' || rowAssignee === currentUserId) {
      tasks.push({
        TaskID: row[0],
        Title: row[1],
        AssigneeID: row[2],
        Deadline: row[3] instanceof Date ? row[3].toISOString() : row[3],
        Recurrence: row[4],
        Status: row[5] || 'Pending'
      });
    }
  }
  return tasks;
}`}
                    </pre>
                  </div>
                </li>
                <li>
                  <strong className="text-amber-200">4. The "New Version" Rule:</strong> Did you modify the logic in <code>Code.gs</code> at all? Google Apps Script aggressively caches the live link. You MUST go to <strong>Deploy &gt; Manage Deployments &gt; Edit (Pencil symbol) &gt; Version: select 'New' &gt; Deploy</strong>.
                </li>
              </ul>
            </div>
            {/* Q4 */}
            <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/50 shadow-sm shadow-red-900/10">
              <h3 className="font-bold text-red-100 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Error: Script function not found: doGet?
              </h3>
              <p className="text-sm leading-relaxed text-slate-300 mb-3">
                This error happens if you accidentally deleted the other functions in your code, or if you forgot to save/deploy. 
                <br /><br />
                To fix this immediately, <strong>replace everything</strong> in your <code>Code.gs</code> file with this complete, fixed script:
              </p>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-400">
{`const SHEET_ID = '1dVWL-JmxT452POX758Ua_E7n7-qI0xsyGRFfUnQsnj0';
const USERS_SHEET = 'Users';
const TASKS_SHEET = 'Tasks';

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Task Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheet(sheetName) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
}

function loginUser(username, password) {
  const sheet = getSheet(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(username).trim() && String(data[i][2]).trim() === String(password).trim()) { 
      return { success: true, user: { id: data[i][0], username: data[i][1], role: data[i][3] } };
    }
  }
  return { success: false, message: 'Invalid username or password' };
}

function getTasks(userId, role) {
  const sheet = getSheet(TASKS_SHEET);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  let tasks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const rowAssignee = String(row[2]).trim();
    const currentUserId = String(userId).trim();
    
    if (role === 'Admin' || rowAssignee === currentUserId) {
      tasks.push({
        TaskID: row[0], Title: row[1], AssigneeID: row[2],
        Deadline: row[3] instanceof Date ? row[3].toISOString() : row[3],
        Recurrence: row[4], Status: row[5] || 'Pending'
      });
    }
  }
  return tasks;
}

function createTask(taskData) {
  const sheet = getSheet(TASKS_SHEET);
  const id = Utilities.getUuid();
  sheet.appendRow([id, taskData.title, taskData.assigneeId, taskData.deadline, taskData.recurrence, taskData.status || 'Pending']);
  return { success: true, message: 'Task created successfully' };
}

function updateTaskStatus(taskId, newStatus) {
  const sheet = getSheet(TASKS_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      sheet.getRange(i + 1, 6).setValue(newStatus);
      return { success: true, message: 'Status updated' };
    }
  }
  return { success: false, message: 'Task not found' };
}

function createUser(userData) {
  const sheet = getSheet(USERS_SHEET);
  const data = sheet.getDataRange().getValues();
  for(let i = 1; i < data.length; i++) {
    if(String(data[i][1]).trim() === String(userData.username).trim()) return { success: false, message: 'Username already exists' };
  }
  sheet.appendRow([Utilities.getUuid(), userData.username, userData.password, userData.role]);
  return { success: true, message: 'User created successfully' };
}

function getUsers() {
    const sheet = getSheet(USERS_SHEET);
    const data = sheet.getDataRange().getValues();
    const users = [];
    for (let i = 1; i < data.length; i++) {
        if(data[i][0]) users.push({ id: data[i][0], username: data[i][1], role: data[i][3] });
    }
    return users;
}`}
                </pre>
              </div>
                <p className="text-sm leading-relaxed text-red-200 mt-3 font-semibold">
                  After pasting, remember to deploy as a "New" version! (Deploy &gt; Manage Deployments &gt; Pencil Icon &gt; New &gt; Deploy).
                </p>
              </div>
            </div>
          </div>
      )}

      {!showHelp && (
        <button 
          onClick={() => setShowHelp(true)}
          className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center transition-all hover:scale-105 z-20"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
