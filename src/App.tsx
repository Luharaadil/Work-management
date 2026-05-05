import React, { useState } from "react";
import { X, Sparkles, Copy, CheckCircle2 } from "lucide-react";
import { CODE_GS, INDEX_HTML } from "./V3Code";

export default function App() {
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

    </div>
  );
}
