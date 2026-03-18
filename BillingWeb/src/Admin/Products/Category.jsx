import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
  Zap,
  Layers,
  ChevronRight,
  Eye
} from "lucide-react";

export default function CategoryList() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("card"); // table | card

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to sync category stream");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Acknowledge permanent removal of this category stream?")) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Stream archived successfully");
      setCategories((prev) => Array.isArray(prev) ? prev.filter((c) => c.id !== id) : []);
    } catch {
      toast.error("Process failed");
    }
  };

  const filtered = Array.isArray(categories) ? categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.catId?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="space-y-10 pb-24">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-2 text-slate-900">Category Stream</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Layers className="text-orange-500" size={14} /> Architecting Asset Classification Archetypes
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-slate-100 border border-slate-200 rounded-2xl p-1">
             <button onClick={() => setView("table")} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase italic transition-all ${view === "table" ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-900"}`}>
               <TableIcon size={14} /> Table
             </button>
             <button onClick={() => setView("card")} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase italic transition-all ${view === "card" ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-900"}`}>
               <LayoutGrid size={14} /> Grid
             </button>
          </div>
          <button 
            onClick={() => navigate("/admin/products/addcategory")}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-orange-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> New Architect
          </button>
        </div>
      </div>

      {/* Control Matrix */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm">
        <div className="relative w-full lg:w-96">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
              placeholder="Search Stream Identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm text-slate-900 focus:border-orange-500 outline-none transition-all"
           />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
           Active Streams Detected: <span className="text-orange-500">{filtered.length}</span> / {categories.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
           <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.5em]">Synchronizing Stream Grid...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {view === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
               {filtered.map((cat) => (
                 <div key={cat.id} className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:border-orange-500/50 transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="w-20 h-20 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl transition-transform group-hover:scale-110 duration-500">
                             <img src={cat.image || "https://via.placeholder.com/200"} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="px-3 py-1 bg-slate-900 rounded-full text-[9px] font-black text-orange-500 italic tracking-tighter uppercase border border-slate-800">
                             #{cat.catId}
                          </div>
                       </div>

                       <div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2 leading-tight">{cat.name}</h3>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic font-medium">{cat.description || "Foundational stream for asset classification within the ZipKart ecosystem."}</p>
                       </div>

                       <div className="pt-4 space-y-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sub-Stream Modules</p>
                          <div className="flex flex-wrap gap-2">
                             {(cat.subcategories || []).map((sub, i) => (
                               <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-600 uppercase tracking-tighter hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                  {sub}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/admin/products/category/edit/${cat.id}`)} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 transition-all shadow-sm"><Pencil size={18} /></button>
                          <button onClick={() => deleteCategory(cat.id)} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-sm"><Trash2 size={18} /></button>
                       </div>
                       <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors group/btn">
                          View Archives <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
               <table className="w-full text-left font-bold">
                  <thead>
                     <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <th className="px-10 py-8">Stream Architecture</th>
                        <th className="px-10 py-8">Identity</th>
                        <th className="px-10 py-8">Node Modules</th>
                        <th className="px-10 py-8 text-right">Operational Logic</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filtered.map((cat) => (
                        <tr key={cat.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 group-hover:scale-110 transition-transform">
                                   <img src={cat.image || "https://via.placeholder.com/100"} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                   <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter truncate max-w-[200px]">{cat.name}</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class: Foundational</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <span className="text-xl font-black text-orange-500 italic tracking-tighter uppercase px-4 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">#{cat.catId}</span>
                          </td>
                           <td className="px-10 py-8">
                             <div className="flex flex-wrap gap-2 max-w-[300px]">
                                {(cat.subcategories || []).slice(0, 3).map((sub, i) => (
                                  <span key={i} className="text-[9px] font-black text-slate-600 uppercase whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{sub}</span>
                                ))}
                                {(cat.subcategories || []).length > 3 && (
                                  <span className="text-[9px] font-black text-orange-500 uppercase">+{(cat.subcategories || []).length - 3} More</span>
                                )}
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => navigate(`/admin/products/category/edit/${cat.id}`)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><Pencil size={18} /></button>
                                <button onClick={() => deleteCategory(cat.id)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400 shadow-sm">
               <Layers size={64} className="mb-6 opacity-20" />
               <h3 className="text-lg font-black uppercase tracking-widest">Void Stream</h3>
               <p className="text-sm font-medium mt-2">No category archetypes matching your query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
