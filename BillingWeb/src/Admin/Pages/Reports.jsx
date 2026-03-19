import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiLayers,
} from "react-icons/fi";
import api from "../../api";
import { toast, Toaster } from "react-hot-toast";

const ReportPage = () => {
    const [tab, setTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        stats: { totalRevenue: 0, totalBilling: 0, totalCustomers: 0, totalCategories: 0 },
        sales: [],
        categories: [],
        customers: []
    });

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const res = await api.get("/reports/summary");
                setReportData(res.data);
            } catch (error) {
                console.error("Report Error:", error);
                toast.error("Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    const { stats, sales, categories, customers } = reportData;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
            <Toaster position="top-right" />
            
            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Revenue", value: stats.totalRevenue, icon: <FiDollarSign />, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Billing", value: stats.totalBilling, icon: <FiBarChart2 />, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Customers", value: stats.totalCustomers, icon: <FiUsers />, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Categories", value: stats.totalCategories, icon: <FiLayers />, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white px-4 py-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-inner`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-slate-800 mt-1">
                                {loading ? "..." : (
                                    stat.label === "Revenue"
                                        ? `₹${parseFloat(stat.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : stat.value
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CONTROLS */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={`Search ${tab === 'overview' ? 'reports' : tab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-xs font-bold"
                    />
                </div>

                <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
                    {[
                        { key: "overview", label: "Overview" },
                        { key: "customers", label: "Top Customers" },
                        { key: "sales", label: "Daily Sales" },
                        { key: "category", label: "Categories" },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95 ${tab === t.key ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-white"}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase text-gray-400">Compiling Data...</p>
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    {tab === "overview" && (
                        <div className="p-8 space-y-6">
                            {[
                                { label: "Total Revenue Generated", value: `₹${stats.totalRevenue.toLocaleString()}` },
                                { label: "Total Billing Transactions", value: stats.totalBilling },
                                { label: "Unique Customer Base", value: stats.totalCustomers },
                                { label: "Active Product Categories", value: stats.totalCategories }
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50/50 p-6 rounded-2xl border border-gray-50">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-wider">{row.label}</span>
                                    <span className="text-2xl font-black text-slate-800 italic">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab !== "overview" && (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-gray-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        {tab === "customers" ? "Customer Profile" : tab === "sales" ? "Transaction Date" : "Category / Product Line"}
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        {tab === "customers" ? "Transaction Count" : "Performance Metrics"}
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                                        Total Revenue
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {(tab === "customers" ? customers : tab === "sales" ? sales : categories)
                                    .filter((item) => {
                                        const name = item.name || item.date || "";
                                        return name.toString().toLowerCase().includes(searchTerm.toLowerCase());
                                    })
                                    .map((item, i) => (
                                        <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-slate-800 text-sm italic">
                                                    {tab === "sales" ? new Date(item.date).toLocaleDateString(undefined, {
                                                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                    }) : (item.name || "N/A")}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-100">
                                                        {tab === "customers" ? `${item.billing} Invoices` : `${item.count || 0} Units Sold`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="font-black text-slate-800">
                                                    ₹{parseFloat(item.total || 0).toLocaleString()}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                {((tab === "customers" ? customers : tab === "sales" ? sales : categories).filter((item) => {
                                    const name = item.name || item.date || "";
                                    return name.toString().toLowerCase().includes(searchTerm.toLowerCase());
                                }).length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No matching records found for "{searchTerm}"</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default ReportPage;
