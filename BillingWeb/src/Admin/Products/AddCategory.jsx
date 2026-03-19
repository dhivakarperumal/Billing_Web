import React, { useState, useEffect } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export default function AddCategory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    catId: id ? "" : "CAT001",
    name: "",
    description: "",
    image: "",
  });

  const [subcategories, setSubcategories] = useState([""]);

  useEffect(() => {
    if (!id) {
      fetchCategories();
    } else {
      loadCategory();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");

      let nextNum = 1;
      const data = Array.isArray(res.data) ? res.data : [];

      if (data.length > 0) {
        const ids = data.map((c) => {
          const num = parseInt(c.catId?.replace("CAT", ""), 10);
          return isNaN(num) ? 0 : num;
        });
        nextNum = Math.max(...ids, 0) + 1;
      }

      const formattedNum = nextNum.toString().padStart(3, "0");

      setFormData((prev) => ({
        ...prev,
        catId: `CAT${formattedNum}`,
      }));
    } catch (err) {
      console.error("Failed to fetch categories for ID generation:", err);
      // Fallback to CAT001 if it's already empty or was loading
      setFormData((prev) => ({
        ...prev,
        catId: prev.catId || "CAT001",
      }));
    }
  };

  const loadCategory = async () => {
    try {
      const res = await api.get(`/categories/${id}`);
      const data = res.data;

      setFormData({
        catId: data.catId,
        name: data.name,
        description: data.description || "",
        image: data.image || "",
      });

      setSubcategories(
        Array.isArray(data.subcategories) ? data.subcategories : [""],
      );

      if (data.image) setPreview(data.image);
    } catch (err) {
      toast.error("Failed to load category");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image: event.target.result,
      }));
      setPreview(event.target.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubChange = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const addSub = () => setSubcategories([...subcategories, ""]);

  const removeSub = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        subcategories: subcategories.filter((s) => s.trim() !== ""),
      };

      if (id) {
        await api.put(`/categories/${id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created");
      }

      navigate("/products/category");
    } catch (err) {
      toast.error("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-2xl font-black text-slate-800">
            {id ? "Edit Category" : "Add Category"}
          </h1>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm grid md:grid-cols-2 gap-6">
          {/* Category ID */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Category ID
            </label>
            <input
              name="catId"
              value={formData.catId}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-[#F8F9FF] rounded-[1.25rem] border-2 border-transparent focus:border-rose-100 focus:bg-white outline-none font-semibold text-sm"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Category Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-[#F8F9FF] rounded-[1.25rem] border-2 border-transparent focus:border-rose-100 focus:bg-white outline-none font-semibold text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-5 py-4 bg-[#F8F9FF] rounded-[1.25rem] border-2 border-transparent focus:border-rose-100 focus:bg-white outline-none font-semibold text-sm"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">
              Category Image
            </label>

            <div className="relative h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
              <input
                type="file"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-xs font-black text-gray-400 uppercase">
                Click to Upload
              </span>
            </div>

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-4 w-32 h-32 object-cover rounded-xl border"
              />
            )}
          </div>

          {/* Subcategories */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">
              Subcategories
            </label>

            <div className="space-y-3">
              {subcategories.map((sub, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    value={sub}
                    onChange={(e) => handleSubChange(index, e.target.value)}
                    className="flex-1 px-5 py-4 bg-[#F8F9FF] rounded-[1.25rem] border-2 border-transparent focus:border-rose-100 focus:bg-white outline-none font-semibold text-sm"
                    placeholder="Subcategory name"
                  />

                  {subcategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSub(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addSub}
                  className="px-5 py-2 border-2 border-dashed border-rose-100 rounded-xl text-rose-500 font-bold hover:bg-rose-50 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Subcategory
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-100 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
