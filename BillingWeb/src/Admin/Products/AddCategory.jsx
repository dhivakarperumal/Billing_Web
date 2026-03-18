import React, { useState, useEffect } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  Zap, 
  Layers, 
  ShieldCheck, 
  Cpu,
  Save,
  X
} from "lucide-react";

export default function AddCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    catId: "",
    name: "",
    description: "",
    image: ""
  });

  const [subcategories, setSubcategories] = useState([""]);

  useEffect(() => {
    fetchCategories();
    if (id) {
      loadCategory();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      if (!id) {
        const nextNum = (res.data.length + 1).toString().padStart(3, '0');
        setFormData(prev => ({ ...prev, catId: `CAT${nextNum}` }));
      }
    } catch (err) {
      console.error("Failed to load categories context");
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
      setSubcategories(Array.isArray(data.subcategories) ? data.subcategories : [""]);
      if (data.image) setPreview(data.image);
    } catch (err) {
      toast.error("Failed to load category blueprint");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setFormData(prev => ({ ...prev, image: dataUrl }));
          setPreview(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubChange = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const addSub = () => setSubcategories([...subcategories, ""]);
  const removeSub = (index) => setSubcategories(subcategories.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        subcategories: subcategories.filter(s => s.trim() !== "")
      };

      if (id) {
        await api.put(`/categories/${id}`, payload);
        toast.success("Blueprint updated successfully");
      } else {
        await api.post("/categories", payload);
        toast.success("New stream initialized");
      }
      navigate("/admin/categories"); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Execution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            {id ? "Edit Architect" : "Stream Architect"}
          </h1>
          <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.4em] flex items-center gap-2 mt-1">
            <Zap className="text-orange-500" size={12} /> Designing Classification Modules
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Identity & Core */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-10 text-white">
               <Cpu className="text-orange-500" size={20} />
               <h3 className="text-sm font-black uppercase italic tracking-widest">Base Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Stream Code</label>
                  <input 
                    name="catId"
                    value={formData.catId}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10"
                    placeholder="e.g. CAT-ALPHA"
                    required
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Display name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10"
                    placeholder="e.g. Premium Tech"
                    required
                  />
               </div>
               <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Stream Narrative</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-orange-500 outline-none transition-all placeholder:text-white/10 resize-none italic"
                    placeholder="Brief description of the classification logic..."
                  />
               </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-10 text-white">
               <Layers className="text-primary" size={20} />
               <h3 className="text-sm font-black uppercase italic tracking-widest">Sub-Stream Modules</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {subcategories.map((sub, index) => (
                 <div key={index} className="group relative">
                    <input 
                      value={sub}
                      onChange={(e) => handleSubChange(index, e.target.value)}
                      placeholder="Module Identity..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary outline-none transition-all pr-12"
                    />
                    {subcategories.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeSub(index)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                 </div>
               ))}
               <button 
                 type="button" 
                 onClick={addSub}
                 className="py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:border-primary/50 hover:text-white transition-all flex items-center justify-center gap-2"
               >
                 <Plus size={14} /> Add Module
               </button>
            </div>
          </div>
        </div>

        {/* Right: Asset & Execution */}
        <div className="space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-10 text-white">
                <Upload className="text-emerald-500" size={20} />
                <h3 className="text-sm font-black uppercase italic tracking-widest">Stream Visual</h3>
              </div>

              <div className="relative group aspect-square rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-emerald-500/50 transition-all">
                 {preview ? (
                    <>
                       <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                          <Upload className="text-white" size={32} />
                       </div>
                    </>
                 ) : (
                    <div className="text-center p-8">
                       <Upload className="text-white/10 mx-auto mb-4" size={48} />
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Archiver Upload</p>
                    </div>
                 )}
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
              </div>
           </div>

           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <div className="space-y-4">
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase italic rounded-3xl transition-all shadow-2xl shadow-orange-600/20 flex items-center justify-center gap-3 disabled:opacity-20"
                 >
                   <Save size={18} /> {loading ? "Executing..." : id ? "Commit Changes" : "Initialize Stream"}
                 </button>
                 <button 
                   type="button" 
                   onClick={() => navigate(-1)}
                   className="w-full py-6 bg-white/5 border border-white/10 text-white/40 font-black uppercase italic rounded-3xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                 >
                   <X size={18} /> Abort Operation
                 </button>
              </div>
              <div className="mt-8 px-4 flex items-center gap-3">
                 <ShieldCheck className="text-orange-500" size={14} />
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Neural Cryptography Active</p>
              </div>
           </div>
        </div>

      </form>
    </div>
  );
}
