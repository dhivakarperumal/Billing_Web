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
    image: ""
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
        const ids = data
          .map(c => {
            const num = parseInt(c.catId?.replace("CAT", ""), 10);
            return isNaN(num) ? 0 : num;
          });
        nextNum = Math.max(...ids, 0) + 1;
      }

      const formattedNum = nextNum.toString().padStart(3, "0");

      setFormData(prev => ({
        ...prev,
        catId: `CAT${formattedNum}`
      }));
    } catch (err) {
      console.error("Failed to fetch categories for ID generation:", err);
      // Fallback to CAT001 if it's already empty or was loading
      setFormData(prev => ({
        ...prev,
        catId: prev.catId || "CAT001"
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
        image: data.image || ""
      });

      setSubcategories(
        Array.isArray(data.subcategories)
          ? data.subcategories
          : [""]
      );

      if (data.image) setPreview(data.image);
    } catch (err) {
      toast.error("Failed to load category");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = event => {
      setFormData(prev => ({
        ...prev,
        image: event.target.result
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

  const removeSub = index => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        subcategories: subcategories.filter(s => s.trim() !== "")
      };

      if (id) {
        await api.put(`/categories/${id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created");
      }

      navigate("/admin/products/category");
    } catch (err) {
      toast.error("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border rounded"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-2xl font-semibold">
          {id ? "Edit Category" : "Add Category"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >

        {/* Category ID */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category ID
          </label>

          <input
            name="catId"
            value={formData.catId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category Name
          </label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category Image
          </label>

          <input
            type="file"
            onChange={handleImageChange}
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-3 w-32 h-32 object-cover border rounded"
            />
          )}
        </div>

        {/* Subcategories */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Subcategories
          </label>

          <div className="space-y-2">
            {subcategories.map((sub, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={sub}
                  onChange={e =>
                    handleSubChange(index, e.target.value)
                  }
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Subcategory name"
                />

                {subcategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSub(index)}
                    className="p-2 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addSub}
              className="flex items-center gap-2 text-blue-600 text-sm"
            >
              <Plus size={16} /> Add Subcategory
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save Category"}
        </button>

      </form>
    </div>
  );
}