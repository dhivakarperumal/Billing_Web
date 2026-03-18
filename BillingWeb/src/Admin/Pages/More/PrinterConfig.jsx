import React, { useState } from "react";
import { FiPrinter, FiSave, FiCheckCircle } from "react-icons/fi";

const PrinterConfig = () => {
  const [printer, setPrinter] = useState({
    name: "Thermal Printer",
    type: "thermal",
    paperSize: "80mm",
    autoPrint: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrinter({
      ...printer,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    console.log("Saved:", printer);
    alert("Printer settings saved successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Printer Configuration
        </h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
          Manage billing printer settings
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 max-w-3xl">

        {/* ICON HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner">
            <FiPrinter />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Printer Setup
            </h2>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              Configure your billing device
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Printer Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Printer Name
            </label>
            <input
              type="text"
              name="name"
              value={printer.name}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary transition-all font-bold text-slate-800"
            />
          </div>

          {/* Printer Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Printer Type
            </label>
            <select
              name="type"
              value={printer.type}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-slate-800"
            >
              <option value="thermal">Thermal</option>
              <option value="inkjet">Inkjet</option>
              <option value="laser">Laser</option>
            </select>
          </div>

          {/* Paper Size */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Paper Size
            </label>
            <select
              name="paperSize"
              value={printer.paperSize}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-slate-800"
            >
              <option value="80mm">80mm</option>
              <option value="58mm">58mm</option>
            </select>
          </div>

          {/* Auto Print Toggle */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Auto Print
            </span>
            <input
              type="checkbox"
              name="autoPrint"
              checked={printer.autoPrint}
              onChange={handleChange}
              className="w-5 h-5 accent-primary"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-4 mt-10">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-all"
          >
            <FiSave /> Save Settings
          </button>

          <button
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
          >
            <FiCheckCircle /> Test Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterConfig;