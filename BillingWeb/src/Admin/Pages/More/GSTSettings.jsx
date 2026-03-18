import React, { useState } from "react";

const GSTSettings = () => {
  const [gst, setGst] = useState(localStorage.getItem("gst") || "");
  const [gstType, setGstType] = useState(localStorage.getItem("gstType") || "exclude");

  const handleSave = () => {
    localStorage.setItem("gst", gst);
    localStorage.setItem("gstType", gstType);
    alert("GST Updated Successfully");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          GST Settings
        </h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
          Configure GST for Billing
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 max-w-md space-y-6">
        
        {/* GST INPUT */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            GST Percentage (%)
          </label>

          <input
            type="number"
            value={gst}
            onChange={(e) => setGst(e.target.value)}
            placeholder="Enter GST (e.g. 5, 12, 18)"
            className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold focus:bg-white focus:border-primary transition-all"
          />
        </div>

        {/* GST MODE */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            GST Mode
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => setGstType("include")}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                gstType === "include"
                  ? "bg-primary text-white border-primary shadow"
                  : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-white"
              }`}
            >
              Include GST
            </button>

            <button
              onClick={() => setGstType("exclude")}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                gstType === "exclude"
                  ? "bg-primary text-white border-primary shadow"
                  : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-white"
              }`}
            >
              Exclude GST
            </button>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 cursor-pointer"
        >
          Save GST Settings
        </button>
      </div>
    </div>
  );
};

export default GSTSettings;