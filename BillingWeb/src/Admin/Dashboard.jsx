import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../PrivateRouter/AuthContext";
import { useAdmin } from "../PrivateRouter/AdminContext";
import api from "../api";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    FiTrendingUp,
    FiActivity,
    FiArrowUpRight,
    FiArrowDownLeft,
    FiShoppingBag,
    FiUsers,
    FiBox,
    FiMoreVertical,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiMapPin
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { dashboardData, setDashboardCached } = useAdmin();
    const [loading, setLoading] = useState(!dashboardData);

    // Quick Add Modals State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [catName, setCatName] = useState("");
    const [catSaving, setCatSaving] = useState(false);
    const [catImage, setCatImage] = useState(null);

    // Rapid Product Modal
    const [isProdModalOpen, setIsProdModalOpen] = useState(false);
    const [prodSaving, setProdSaving] = useState(false);
    const [rapidProd, setRapidProd] = useState({ name: "", mrp: "", status: "Active" });

    const handleRapidProductAdd = async (e, shouldContinue = false) => {
        if (e) e.preventDefault();
        if (!rapidProd.name || !rapidProd.mrp) return toast.error("Name and MRP are required");

        setProdSaving(true);
        try {
            await api.post("/products", { 
                ...rapidProd, 
                category: "Saree", // Default for rapid add
                total_stock: "0",
                variants: []
            });
            toast.success("Product listed instantly!");
            if (shouldContinue) {
                setRapidProd({ name: "", mrp: "", status: "Active" });
            } else {
                setIsProdModalOpen(false);
                setRapidProd({ name: "", mrp: "", status: "Active" });
            }
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add product");
        } finally {
            setProdSaving(false);
        }
    };

    const handleQuickCategoryAdd = async (e, shouldContinue = false) => {
        if (e) e.preventDefault();
        if (!catName) return toast.error("Category name is required");

        setCatSaving(true);
        try {
            // For a rapid add, we just send name and empty array for images if none provided
            await api.post("/categories", { name: catName, images: catImage ? [catImage] : [], subcategory: [] });
            toast.success("Category added instantly!");

            if (shouldContinue) {
                setCatName("");
                setCatImage(null);
            } else {
                setIsCatModalOpen(false);
                setCatName("");
                setCatImage(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add category");
        } finally {
            setCatSaving(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        if (!dashboardData) setLoading(true);
        try {
            const response = await api.get('/dashboard');
            setDashboardCached(response.data);
        } catch (error) {
            console.error("Fetch Dashboard Error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const getStatIcon = (label) => {
        switch (label) {
            case "Low Stock": return <FiAlertTriangle />;
            case "Total Products": return <FiBox />;
            default: return <FiActivity />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">Loading Dashboard...</p>
            </div>
        )
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No data available</p>
            </div>
        )
    }

    const { 
        stats = [], 
        topProducts = [], 
        lowStockAlerts = [], 
    } = dashboardData || {};

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <Toaster position="top-right" />

            {/* Quick Productivity Actions */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/50 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Boutique Rapid Studio</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button
                            onClick={() => setIsProdModalOpen(true)}
                            className="bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 group/btn"
                        >
                            <FiBox className="group-hover:rotate-12 transition-transform" /> Add Product
                        </button>
                        <button
                            onClick={() => setIsCatModalOpen(true)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-slate-100 flex items-center justify-center gap-2"
                        >
                            <FiActivity /> New Category
                        </button>
                        <button
                            onClick={() => navigate("/admin/users/all")}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-slate-100 flex items-center justify-center gap-2"
                        >
                            <FiUsers /> Add User
                        </button>
                    </div>
                </div>
            </div>

            <Toaster position="top-right" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform`}>
                                {getStatIcon(stat.label)}
                            </div>
                            <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 bg-gray-50'} px-2.5 py-1 rounded-lg border border-transparent group-hover:border-current transition-all uppercase tracking-widest`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value?.toString().replace('$', '₹')}</h3>
                    </div>
                ))}
            </div>

            {/* Inventory Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Low Stock Alerts */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Low Stock Alerts</h3>
                            <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mt-1">Priority Restock Needed</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center animate-pulse">
                            <FiAlertTriangle />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-50 flex-1">
                        {lowStockAlerts.length > 0 ? lowStockAlerts.map((item, i) => (
                            <div key={i} className="p-6 flex items-center gap-6 group hover:bg-red-50/30 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-800 truncate">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.cat}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-black ${item.color}`}>{item.stock} Left</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-sm text-gray-500">No low stock alerts.</div>
                        )}
                    </div>
                </div>
            </div>




            {/* QUICK PRODUCT MODAL */}
            {isProdModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsProdModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-primary p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><FiBox size={80} /></div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">Rapid Product</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">AJAX Listing Console</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-slate-800 transition-all"
                                        placeholder="e.g. Silk Saree"
                                        value={rapidProd.name}
                                        onChange={(e) => setRapidProd({ ...rapidProd, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Market MRP</label>
                                    <div className="relative">
                                        <FaRupeeSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-slate-800 transition-all"
                                            placeholder="2999"
                                            value={rapidProd.mrp}
                                            onChange={(e) => setRapidProd({ ...rapidProd, mrp: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={(e) => handleRapidProductAdd(e, true)}
                                    disabled={prodSaving}
                                    className="w-full py-5 bg-white border-2 border-blue-100 hover:bg-primary/10 text-primary rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    List & Add Another
                                </button>
                                <button
                                    onClick={(e) => handleRapidProductAdd(e, false)}
                                    disabled={prodSaving}
                                    className="w-full py-5 bg-primary hover:bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    {prodSaving ? <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin"></div> : "Finalize & Close"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsProdModalOpen(false)}
                                className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-slate-800 uppercase tracking-widest transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK CATEGORY MODAL */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCatModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><FiActivity size={80} /></div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">Rapid Category</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Instant AJAX Creation</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-slate-800 transition-all"
                                    placeholder="e.g. Traditional Silk"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={(e) => handleQuickCategoryAdd(e, true)}
                                    disabled={catSaving}
                                    className="w-full py-5 bg-white border-2 border-blue-100 hover:bg-primary/10 text-primary rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Create & Add Another
                                </button>
                                <button
                                    onClick={(e) => handleQuickCategoryAdd(e, false)}
                                    disabled={catSaving}
                                    className="w-full py-5 bg-primary hover:bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    {catSaving ? <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin"></div> : "Save & Close"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsCatModalOpen(false)}
                                className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-slate-800 uppercase tracking-widest transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

