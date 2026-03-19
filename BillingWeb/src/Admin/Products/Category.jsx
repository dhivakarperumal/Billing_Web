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
  Eye,
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
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl"
          >
            <Plus /> New Category
          </button>
        </div>
      </div>

      {/* Control Matrix */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Search category..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-xs font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Total: {filtered.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.5em]">
            Synchronizing Stream Grid...
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {view === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all"
                >
                  <div className="aspect-[4/5] bg-gray-100">
                    <img
                      src={cat.image || "https://via.placeholder.com/200"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <h4 className="text-sm font-black text-slate-800">
                      {cat.name}
                    </h4>

                    <p className="text-[10px] text-gray-400">#{cat.catId}</p>

                    <div className="flex flex-wrap gap-2">
                      {(cat.subcategories || []).slice(0, 3).map((sub, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-black bg-gray-50 px-2 py-1 rounded border"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                      <button
                        onClick={() =>
                          navigate(`/products/category/edit/${cat.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button onClick={() => deleteCategory(cat.id)}>
                        <Trash2 size={16} />
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
                    <th className="px-10 py-8">Stream Architecture</th>
                    <th className="px-10 py-8">Identity</th>
                    <th className="px-10 py-8">Node Modules</th>
                    <th className="px-10 py-8 text-right">Operational Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((cat) => (
                    <tr
                      key={cat.id}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 group-hover:scale-110 transition-transform">
                            <img
                              src={
                                cat.image || "https://via.placeholder.com/100"
                              }
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter truncate max-w-[200px]">
                              {cat.name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              Class: Foundational
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xl font-black text-orange-500 italic tracking-tighter uppercase px-4 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                          #{cat.catId}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-wrap gap-2 max-w-[300px]">
                          {(cat.subcategories || [])
                            .slice(0, 3)
                            .map((sub, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-black text-slate-600 uppercase whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                              >
                                {sub}
                              </span>
                            ))}
                          {(cat.subcategories || []).length > 3 && (
                            <span className="text-[9px] font-black text-orange-500 uppercase">
                              +{(cat.subcategories || []).length - 3} More
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() =>
                              navigate(
                                `/products/category/edit/${cat.id}`,
                              )
                            }
                            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
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
              <h3 className="text-lg font-black uppercase tracking-widest">
                Void Stream
              </h3>
              <p className="text-sm font-medium mt-2">
                No category archetypes matching your query.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
