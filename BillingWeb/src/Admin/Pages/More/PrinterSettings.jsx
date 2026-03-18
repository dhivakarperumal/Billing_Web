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

    upiId: "",
    showQR: false,
    qrGenerated: false,

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

  const handleGenerateQR = () => {
    if (!settings.upiId) {
      alert("Enter UPI ID first");
      return;
    }

    setSettings({ ...settings, qrGenerated: true });
  };

  const handleRemoveUPI = () => {
    setSettings({
      ...settings,
      upiId: "",
      qrGenerated: false,
      showQR: false,
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

          {/* UPI SETTINGS */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              UPI ID
            </label>

            <input
              name="upiId"
              value={settings.upiId}
              onChange={handleChange}
              placeholder="example@upi"
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerateQR}
                className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase"
              >
                Generate QR
              </button>

              <button
                type="button"
                onClick={handleRemoveUPI}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase"
              >
                Remove
              </button>
            </div>
            {/* LEFT SIDE QR PREVIEW */}
            {settings.qrGenerated && settings.upiId && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${settings.upiId}&pn=${settings.shopName}`}
                  alt="UPI QR"
                  className="mb-2"
                />
                <p className="text-[10px] font-bold text-gray-500">
                  Generated QR (Preview)
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">Show UPI QR</span>
            <input
              type="checkbox"
              name="showQR"
              checked={settings.showQR}
              onChange={handleChange}
              disabled={!settings.qrGenerated} // ✅ important
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
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 flex justify-center h-fit self-start">
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

            {settings.showQR && settings.qrGenerated && settings.upiId && (
              <>
                <hr className="my-2" />

                <div className="flex flex-col items-center text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${settings.upiId}&pn=${settings.shopName}`}
                    alt="UPI QR"
                    className="mb-2"
                  />
                  <p className="text-[10px]">Scan & Pay via UPI</p>
                </div>
              </>
            )}

            <p>{settings.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettings;
