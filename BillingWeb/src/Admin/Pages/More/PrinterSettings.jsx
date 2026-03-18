import React, { useState } from "react";
import {
  FiPrinter,
  FiSave,
  FiSettings,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

const PrinterSettings = () => {
  const [settings, setSettings] = useState({
    name: "Thermal Printer",
    type: "thermal",
    paperSize: "80mm",

    showLogo: true,
    showGST: true,
    showAddress: true,
    footer: "Thank you! Visit Again",

    autoPrint: true,
    duplicatePrint: false,
    openDrawer: false,

    fontSize: "medium",
    alignment: "center",
    margin: "normal",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    console.log("Saved Settings:", settings);
    alert("Printer settings saved!");
  };

  return (
    <div className="space-y-6 min-h-screen pb-20">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Printer System Settings
        </h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
          Customize your billing printer experience
        </p>
      </div>

      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= PRINTER SETUP ================= */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiPrinter className="text-primary" />
            <h2 className="font-black text-slate-800">Printer Setup</h2>
          </div>

          <div className="space-y-4">
            <input
              name="name"
              value={settings.name}
              onChange={handleChange}
              placeholder="Printer Name"
              className="w-full px-5 py-3 bg-gray-50 rounded-2xl border"
            />

            <select
              name="type"
              value={settings.type}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 rounded-2xl border"
            >
              <option value="thermal">Thermal</option>
              <option value="inkjet">Inkjet</option>
              <option value="laser">Laser</option>
            </select>

            <select
              name="paperSize"
              value={settings.paperSize}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 rounded-2xl border"
            >
              <option value="80mm">80mm</option>
              <option value="58mm">58mm</option>
            </select>
          </div>
        </div>

        {/* ================= INVOICE CUSTOM ================= */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiFileText className="text-primary" />
            <h2 className="font-black text-slate-800">Invoice Customization</h2>
          </div>

          <div className="space-y-3 text-sm">
            <label className="flex justify-between">
              Show Logo
              <input type="checkbox" name="showLogo" checked={settings.showLogo} onChange={handleChange} />
            </label>

            <label className="flex justify-between">
              Show GST
              <input type="checkbox" name="showGST" checked={settings.showGST} onChange={handleChange} />
            </label>

            <label className="flex justify-between">
              Show Address
              <input type="checkbox" name="showAddress" checked={settings.showAddress} onChange={handleChange} />
            </label>

            <textarea
              name="footer"
              value={settings.footer}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border mt-3"
              placeholder="Footer message"
            />
          </div>
        </div>

        {/* ================= PRINT BEHAVIOR ================= */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiSettings className="text-primary" />
            <h2 className="font-black text-slate-800">Print Behavior</h2>
          </div>

          <div className="space-y-3">
            <label className="flex justify-between">
              Auto Print
              <input type="checkbox" name="autoPrint" checked={settings.autoPrint} onChange={handleChange} />
            </label>

            <label className="flex justify-between">
              Duplicate Copy
              <input type="checkbox" name="duplicatePrint" checked={settings.duplicatePrint} onChange={handleChange} />
            </label>

            <label className="flex justify-between">
              Open Cash Drawer
              <input type="checkbox" name="openDrawer" checked={settings.openDrawer} onChange={handleChange} />
            </label>
          </div>
        </div>

        {/* ================= LAYOUT ================= */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiSettings className="text-primary" />
            <h2 className="font-black text-slate-800">Layout Settings</h2>
          </div>

          <div className="space-y-4">
            <select name="fontSize" value={settings.fontSize} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <select name="alignment" value={settings.alignment} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>

            <select name="margin" value={settings.margin} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border">
              <option value="narrow">Narrow</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg"
        >
          <FiSave /> Save Settings
        </button>

        <button className="flex items-center gap-2 px-6 py-3 bg-white border rounded-2xl text-gray-600 font-black text-xs uppercase tracking-widest">
          <FiCheckCircle /> Test Print
        </button>
      </div>
    </div>
  );
};

export default PrinterSettings;