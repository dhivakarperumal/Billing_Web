import React, { useState, useEffect } from "react";
import {
    FiPackage,
    FiTag,
    FiBox,
    FiBarChart2,
    FiCalendar,
    FiTruck,
    FiImage,
    FiSave,
    FiArrowLeft,
    FiLayers,
    FiActivity,
    FiInfo,
    FiCode,
    FiHash
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { toast, Toaster } from "react-hot-toast";

const AddProducts = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        subCategory: "",
        brand: "",
        sku: "",
        barcode: "",
        pricing: {
            mrp: "",
            sellingPrice: "",
            costPrice: "",
            discount: "",
            tax: ""
        },
        stock: {
            quantity: "",
            unit: "pcs",
            minStock: ""
        },
        expiry: {
            mfgDate: "",
            expDate: "",
            batchNo: ""
        },
        supplier: {
            name: "",
            contact: ""
        },
        media: {
            image: ""
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Categories
                const catRes = await api.get("/categories");
                setCategories(Array.isArray(catRes.data) ? catRes.data : []);

                if (isEdit) {
                    const prodRes = await api.get(`/products/${id}`);
                    const p = prodRes.data;
                    // Map backend data to nested state
                    setFormData({
                        name: p.name || "",
                        category: p.category || "",
                        subCategory: p.subCategory || "",
                        brand: p.brand || "",
                        sku: p.sku || "",
                        barcode: p.barcode || "",
                        pricing: {
                            mrp: p.mrp || "",
                            sellingPrice: p.sellingPrice || p.offer_price || "",
                            costPrice: p.costPrice || "",
                            discount: p.discount || p.offer || "",
                            tax: p.tax || ""
                        },
                        stock: {
                            quantity: p.quantity || p.total_stock || "",
                            unit: p.unit || "pcs",
                            minStock: p.minStock || ""
                        },
                        expiry: {
                            mfgDate: p.mfgDate ? p.mfgDate.split('T')[0] : "",
                            expDate: p.expDate ? p.expDate.split('T')[0] : "",
                            batchNo: p.batchNo || ""
                        },
                        supplier: {
                            name: p.supplierName || "",
                            contact: p.supplierContact || ""
                        },
                        media: {
                            image: p.image || ""
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load resources.");
            } finally {
                setFetching(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit]);

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.category) {
            return toast.error("Name and Category are essential.");
        }

        setLoading(true);
        try {
            // Flatten data slightly for backend if needed or send as is
            const payload = {
                ...formData,
                // Ensure compatibility with existing backend expectations if any
                total_stock: formData.stock.quantity,
                mrp: formData.pricing.mrp,
                offer_price: formData.pricing.sellingPrice
            };

            if (isEdit) {
                await api.put(`/products/${id}`, payload);
                toast.success("Product updated successfully!");
            } else {
                await api.post("/products", payload);
                toast.success("Product added to inventory!");
            }
            setTimeout(() => navigate("/admin/products/all"), 1500);
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(error.response?.data?.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Inventory System...</p>
        </div>
    );

    return (
        <div className="pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm active:scale-95"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            {isEdit ? "Refine Product" : "New Inventory Item"}
                        </h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {isEdit ? "Modify existing SKU details" : "Register a new item in the system"}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Basic Information Section */}
                    <FormSection title="Core Information" icon={<FiInfo className="text-blue-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputLabel label="Official Product Name" required />
                                <div className="relative">
                                    <FiPackage className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" name="name" value={formData.name} onChange={handleChange}
                                        placeholder="e.g. Premium Basmati Rice"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <InputLabel label="Primary Category" required />
                                <select 
                                    name="category" value={formData.category} onChange={handleChange}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <InputLabel label="Sub-Category" />
                                <input 
                                    type="text" name="subCategory" value={formData.subCategory} onChange={handleChange}
                                    placeholder="e.g. Grains"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-800"
                                />
                            </div>

                            <div>
                                <InputLabel label="Brand / Manufacturer" />
                                <div className="relative">
                                    <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" name="brand" value={formData.brand} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel label="SKU" />
                                    <input 
                                        type="text" name="sku" value={formData.sku} onChange={handleChange}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-700 text-sm uppercase"
                                    />
                                </div>
                                <div>
                                    <InputLabel label="Barcode" />
                                    <input 
                                        type="text" name="barcode" value={formData.barcode} onChange={handleChange}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-700 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </FormSection>

                    {/* Pricing Section */}
                    <FormSection title="Financial & Pricing" icon={<FaRupeeSign className="text-emerald-500" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <PricingInput 
                                label="Market MRP" name="mrp" value={formData.pricing.mrp} 
                                onChange={(e) => handleChange(e, "pricing")} icon={<FiHash />} 
                            />
                            <PricingInput 
                                label="Selling Price" name="sellingPrice" value={formData.pricing.sellingPrice} 
                                onChange={(e) => handleChange(e, "pricing")} icon={<FiTag className="text-emerald-500" />}
                                highlight
                            />
                            <PricingInput 
                                label="Cost Basis" name="costPrice" value={formData.pricing.costPrice} 
                                onChange={(e) => handleChange(e, "pricing")}
                            />
                            <div className="relative group">
                                <InputLabel label="Discount (%)" />
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-black">%</span>
                                    <input 
                                        type="number" name="discount" value={formData.pricing.discount} 
                                        onChange={(e) => handleChange(e, "pricing")}
                                        className="w-full pl-10 pr-4 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl focus:bg-white focus:border-amber-500/30 outline-none transition-all font-black text-amber-600"
                                    />
                                </div>
                            </div>
                            <div className="relative col-span-1 lg:col-span-2">
                                <InputLabel label="Applicable Tax (%)" />
                                <input 
                                    type="number" name="tax" value={formData.pricing.tax} 
                                    onChange={(e) => handleChange(e, "pricing")}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-800"
                                    placeholder="GST, VAT, etc."
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Stock Information */}
                    <FormSection title="Inventory Control" icon={<FiBarChart2 className="text-orange-500" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <InputLabel label="Initial Qty" required />
                                <div className="relative">
                                    <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                                    <input 
                                        type="number" name="quantity" value={formData.stock.quantity} 
                                        onChange={(e) => handleChange(e, "stock")}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel label="Unit" />
                                <select 
                                    name="unit" value={formData.stock.unit} onChange={(e) => handleChange(e, "stock")}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-800"
                                >
                                    <option value="pcs">Pieces (Pcs)</option>
                                    <option value="kg">Kilogram (Kg)</option>
                                    <option value="gm">Gram (Gm)</option>
                                    <option value="ltr">Liter (Ltr)</option>
                                    <option value="box">Box</option>
                                    <option value="mtr">Meter (Mtr)</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel label="Min Alert Level" />
                                <input 
                                    type="number" name="minStock" value={formData.stock.minStock} 
                                    onChange={(e) => handleChange(e, "stock")}
                                    className="w-full px-4 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none transition-all font-bold text-rose-600"
                                    placeholder="Notify when low"
                                />
                            </div>
                        </div>
                    </FormSection>
                </div>

                {/* Right Column - Secondary Details */}
                <div className="space-y-8">
                    
                    {/* Expiry & Logistics */}
                    <FormSection title="Logistics & Expiry" icon={<FiCalendar className="text-purple-500" />} compact>
                        <div className="space-y-4">
                            <div>
                                <InputLabel label="Manufacturing Date" />
                                <input 
                                    type="date" name="mfgDate" value={formData.expiry.mfgDate} 
                                    onChange={(e) => handleChange(e, "expiry")}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary/30 outline-none transition-all font-medium text-slate-600 text-sm"
                                />
                            </div>
                            <div>
                                <InputLabel label="Expiry Date" />
                                <input 
                                    type="date" name="expDate" value={formData.expiry.expDate} 
                                    onChange={(e) => handleChange(e, "expiry")}
                                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary/30 outline-none transition-all font-medium text-sm ${formData.expiry.expDate ? 'text-rose-500 font-bold' : 'text-slate-600'}`}
                                />
                            </div>
                            <div>
                                <InputLabel label="Batch Number" />
                                <div className="relative">
                                    <FiCode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" name="batchNo" value={formData.expiry.batchNo} 
                                        onChange={(e) => handleChange(e, "expiry")}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-700 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </FormSection>

                    {/* Supplier Section */}
                    <FormSection title="Source / Supplier" icon={<FiTruck className="text-indigo-500" />} compact>
                        <div className="space-y-4">
                            <div>
                                <InputLabel label="Supplier Identity" />
                                <input 
                                    type="text" name="name" value={formData.supplier.name} 
                                    onChange={(e) => handleChange(e, "supplier")}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-700 text-sm"
                                />
                            </div>
                            <div>
                                <InputLabel label="Contact / Phone" />
                                <input 
                                    type="text" name="contact" value={formData.supplier.contact} 
                                    onChange={(e) => handleChange(e, "supplier")}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary/30 outline-none transition-all font-bold text-slate-700 text-sm"
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Media Assets */}
                    <FormSection title="Visual Assets" icon={<FiImage className="text-pink-500" />} compact>
                        <div className="space-y-4">
                            <div className="aspect-video w-full rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group hover:border-primary/50 transition-all cursor-pointer">
                                {formData.media.image ? (
                                    <img src={formData.media.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <FiImage size={32} className="text-slate-300 group-hover:text-primary transition-colors mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image Preview</p>
                                    </>
                                )}
                            </div>
                            <div>
                                <InputLabel label="Cloud Image URL" />
                                <input 
                                    type="text" name="image" value={formData.media.image} 
                                    onChange={(e) => handleChange(e, "media")}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary/30 outline-none transition-all font-medium text-slate-600 text-xs"
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Global Save Button */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 border-4 border-white text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <FiSave size={18} className="group-hover:scale-110 transition-transform" />
                                {isEdit ? "Update Registry" : "Commit to Store"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* 🔹 Helper Components */

const FormSection = ({ title, icon, children, compact = false }) => (
    <div className={`bg-white ${compact ? 'p-6' : 'p-8 md:p-10'} rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group`}>
        <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
                <span className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all">{icon}</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            </div>
            {children}
        </div>
        <div className="absolute -top-6 -right-6 opacity-[0.02] text-slate-900 group-hover:scale-110 transition-transform pointer-events-none">
            {icon}
        </div>
    </div>
);

const InputLabel = ({ label, required = false }) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
    </label>
);

const PricingInput = ({ label, name, value, onChange, icon, highlight = false }) => (
    <div className="relative group">
        <InputLabel label={label} />
        <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg ${highlight ? 'text-emerald-500' : 'text-slate-900'}`}>₹</span>
            <input 
                type="number" name={name} value={value} onChange={onChange}
                className={`w-full pl-10 pr-4 py-4 rounded-2xl outline-none transition-all font-black text-lg ${
                    highlight 
                    ? 'bg-emerald-50/50 border border-emerald-100 focus:bg-white focus:border-emerald-500 text-emerald-600' 
                    : 'bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/30 text-slate-900'
                }`}
            />
            {icon && <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity">
                {icon}
            </div>}
        </div>
    </div>
);

export default AddProducts;