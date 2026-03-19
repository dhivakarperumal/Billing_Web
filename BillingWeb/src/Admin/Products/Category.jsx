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
  ChevronLeft,
  Eye,
} from "lucide-react";

export default function CategoryList() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("card"); // table | card
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

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
    if (
      !window.confirm("Acknowledge permanent removal of this category stream?")
    )
      return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Stream archived successfully");
      setCategories((prev) =>
        Array.isArray(prev) ? prev.filter((c) => c.id !== id) : [],
      );
    } catch {
      toast.error("Process failed");
    }
  };

  const filtered = Array.isArray(categories)
    ? categories.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.catId?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-10 pb-24">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div></div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-lg ${view === "table" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
            >
              <TableIcon size={18} />
            </button>

            <button
              onClick={() => setView("card")}
              className={`p-2 rounded-lg ${view === "card" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <button
            onClick={() => navigate("/products/addcategory")}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-transform hover:scale-105"
          >
            <Plus size={16} /> New Category
          </button>
        </div>
      </div>

      {/* Control Matrix */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories by name or ID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all rounded-2xl outline-none text-sm font-semibold text-slate-700 placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
          Total: <span className="text-slate-700">{filtered.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs uppercase font-black tracking-[0.3em]">
            Synchronizing Stream Grid...
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {view === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentData.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative flex flex-col h-full"
                >
                  <div className="relative aspect-video bg-slate-50 overflow-hidden flex-shrink-0">
                    <img
                      src={cat.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=random&color=fff&size=400`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={cat.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-[0.8rem] text-[10px] font-black tracking-widest text-slate-800 shadow-sm border border-white/20">
                      {cat.catId}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h4 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                        {cat.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {cat.description || "No description provided for this category."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-auto pb-6">
                      {(cat.subcategories || []).slice(0, 3).map((sub, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50"
                        >
                          {sub}
                        </span>
                      ))}
                      {(cat.subcategories || []).length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400 px-1 py-1">
                          +{(cat.subcategories || []).length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                      <button
                        onClick={() => navigate(`/products/category/edit/${cat.id}`)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors px-3 py-2 -ml-3 rounded-xl hover:bg-blue-50"
                      >
                        <Pencil size={15} strokeWidth={2.5} /> Edit
                      </button>

                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors px-3 py-2 -mr-3 rounded-xl hover:bg-rose-50"
                      >
                        <Trash2 size={15} strokeWidth={2.5} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left font-bold">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-8 py-6">Category Detail</th>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Subcategories</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.map((cat) => (
                    <tr
                      key={cat.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group-hover:scale-105 transition-transform">
                            <img
                              src={cat.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=random&color=fff`}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight truncate max-w-[200px]">
                              {cat.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 line-clamp-1 max-w-[200px]">
                              {cat.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                          {cat.catId}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2 max-w-[250px]">
                          {(cat.subcategories || [])
                            .slice(0, 3)
                            .map((sub, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                              >
                                {sub}
                              </span>
                            ))}
                          {(cat.subcategories || []).length > 3 && (
                            <span className="text-[10px] font-bold text-slate-400">
                              +{(cat.subcategories || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() =>
                              navigate(
                                `/products/category/edit/${cat.id}`,
                              )
                            }
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all shadow-sm"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6 px-2">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * pageSize, filtered.length)}</span> of <span className="text-slate-800">{filtered.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-slate-50 hover:text-blue-600 transition-all font-bold"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl border font-bold text-sm transition-all ${
                        currentPage === page
                          ? "bg-slate-900 border-slate-900 text-white shadow-md rounded-2xl scale-110"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-slate-50 hover:text-blue-600 transition-all font-bold"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400 shadow-sm">
              <Layers size={64} className="mb-6 opacity-20" />
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">
                No Categories Found
              </h3>
              <p className="text-sm font-semibold mt-2 text-slate-500">
                You haven't setup any categories matching that search yet.
              </p>
              <button
                onClick={() => navigate("/products/addcategory")}
                className="mt-8 flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                <Plus size={16} /> Add First Category
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
