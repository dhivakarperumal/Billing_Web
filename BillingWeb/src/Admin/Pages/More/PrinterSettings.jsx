import React, { useState } from "react";
import { FiSave } from "react-icons/fi";

const PrinterSettings = () => {
  const [settings, setSettings] = useState({
    shopName: "My Store",
    gst: "GSTIN123456",
    address: "Mumbai, India",
    footer: "Thank You! Visit Again",

    showLogo: true,
    logo: null, // ✅ NEW

    fontSize: "14",
    align: "center",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="min-h-screen space-y-6 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Printer Settings</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Customize your invoice & preview in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= LEFT PANEL ================= */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-slate-800 text-lg">
            Invoice Settings
          </h2>

          <input
            name="shopName"
            value={settings.shopName}
            onChange={handleChange}
            placeholder="Shop Name"
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border"
          />

          <input
            name="gst"
            value={settings.gst}
            onChange={handleChange}
            placeholder="GST Number"
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border"
          />

          <input
            name="address"
            value={settings.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border"
          />

          <textarea
            name="footer"
            value={settings.footer}
            onChange={handleChange}
            placeholder="Footer Message"
            className="w-full px-4 py-
            3 bg-gray-50 rounded-2xl border"
          />

          {/* LOGO UPLOAD */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Upload Logo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const previewUrl = URL.createObjectURL(file);
                  setSettings({ ...settings, logo: previewUrl });
                }
              }}
              className="w-full text-xs font-bold"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">Show Logo</span>
            <input
              type="checkbox"
              name="showLogo"
              checked={settings.showLogo}
              onChange={handleChange}
            />
          </div>

          <select
            name="fontSize"
            value={settings.fontSize}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border"
          >
            <option value="12">Small</option>
            <option value="14">Medium</option>
            <option value="18">Large</option>
          </select>

          <select
            name="align"
            value={settings.align}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>

          <button className="w-full py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <FiSave /> Save Settings
          </button>
        </div>

        {/* ================= RIGHT PANEL (LIVE PREVIEW) ================= */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 flex justify-center">
          {/* THERMAL BILL */}
          <div
            className="bg-white border border-gray-200 p-4 w-[260px] text-black"
            style={{
              fontSize: `${settings.fontSize}px`,
              textAlign: settings.align,
            }}
          >
            {settings.showLogo && settings.logo && (
              <div className="flex justify-center mb-2">
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="h-12 object-contain"
                />
              </div>
            )}

            <h2 className="font-bold">{settings.shopName}</h2>
            <p>{settings.address}</p>
            <p>{settings.gst}</p>

            <hr className="my-2" />

            <div className="text-left text-xs">
              <p>Item 1 x1 ₹100</p>
              <p>Item 2 x2 ₹200</p>
            </div>

            <hr className="my-2" />

            <p>Total: ₹300</p>

            <hr className="my-2" />

            <p>{settings.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettings;
