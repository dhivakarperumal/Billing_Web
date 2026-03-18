import React, { useState } from "react";
import {
  FiSearch,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiLayers,
} from "react-icons/fi";

/* MOCK DATA */
const customers = [
  { name: "Rahul", total: 1200, billing: 3 },
  { name: "Anita", total: 2400, billing: 5 },
  { name: "Kumar", total: 800, billing: 2 },
];

const sales = [
  { date: "2026-03-01", total: 1200 },
  { date: "2026-03-02", total: 1800 },
  { date: "2026-03-03", total: 900 },
];

const categories = [
  { name: "Rice", total: 2000 },
  { name: "Oil", total: 1500 },
  { name: "Snacks", total: 1000 },
];

const ReportPage = () => {
  const [tab, setTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const totalRevenue = sales.reduce((a, b) => a + b.total, 0);
  const totalBilling = customers.reduce((a, b) => a + b.billing, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div></div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue",
            value: totalRevenue,
            icon: <FiDollarSign />,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Billing",
            value: totalBilling,
            icon: <FiBarChart2 />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Customers",
            value: customers.length,
            icon: <FiUsers />,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Categories",
            value: categories.length,
            icon: <FiLayers />,
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white px-4 py-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-xl font-black text-slate-800 mt-1">
                {stat.label === "Revenue" ? `₹${stat.value}` : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
        {/* SEARCH */}
        <div className="relative flex-1 w-full md:max-w-md group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-xs font-bold"
          />
        </div>

        {/* TABS */}
        <div className="flex items-center gap-3 overflow-x-auto">
          {[
            { key: "overview", label: "Overview" },
            { key: "customers", label: "Customers" },
            { key: "sales", label: "Sales" },
            { key: "category", label: "Category" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${
                tab === t.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="p-8 space-y-4">
              <div className="flex justify-between border-b border-b-gray-400 pb-4">
                <span className="text-sm font-black text-gray-400 uppercase">
                  Total Revenue
                </span>
                <span className="text-lg font-black text-slate-800">
                  ₹{totalRevenue}
                </span>
              </div>

              <div className="flex justify-between border-b border-b-gray-400 pb-4">
                <span className="text-sm font-black text-gray-400 uppercase">
                  Total Billing
                </span>
                <span className="text-lg font-black text-slate-800">
                  {totalBilling}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-black text-gray-400 uppercase">
                  Customers
                </span>
                <span className="text-lg font-black text-slate-800">
                  {customers.length}
                </span>
              </div>
            </div>
          )}

          {/* TABLE */}
          {tab !== "overview" && (
            <table className="w-full text-left block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {tab === "customers"
                      ? "Customer Name"
                      : tab === "sales"
                        ? "Date"
                        : "Category"}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {tab === "customers" ? "Billing" : "Details"}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="block md:table-row-group p-4 md:p-0">
                {(tab === "customers"
                  ? customers
                  : tab === "sales"
                    ? sales
                    : categories
                )
                  .filter((item) =>
                    (item.name || item.date)
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                  )
                  .map((item, i) => (
                    <tr
                      key={i}
                      className="block md:table-row border border-gray-100 md:border-0 rounded-2xl mb-4 md:mb-0"
                    >
                      <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell">
                        <p className="font-black text-slate-800">
                          {item.name || item.date}
                        </p>
                      </td>

                      <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell">
                        <p className="font-bold text-slate-600">
                          {item.billing || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell">
                        <p className="font-black text-slate-800">
                          ₹{item.total}
                        </p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
