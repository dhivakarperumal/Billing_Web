import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiSave, FiLayers, FiBox, FiPlus, FiCheck, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast, Toaster } from "react-hot-toast";

const AddStock = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    // UI state for inputs
    const [stockAdditions, setStockAdditions] = useState({});
    const [manualTotalStockAdd, setManualTotalStockAdd] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { search };
            const res = await api.get("/products", { params });
            const data = res.data;
            setProducts(Array.isArray(data) ? data : (data.products || []));
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProduct = async (prod) => {
        setSelectedProduct(null);
        setStockAdditions({});
        setManualTotalStockAdd("");
        setSearch("");
        try {
            const res = await api.get(`/products/${prod.id}`);
            const p = res.data;
            let variants = [];
            if (p.variants) {
                variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
            }
            setSelectedProduct({ ...p, variants: Array.isArray(variants) ? variants : [] });
        } catch (error) {
            toast.error("Failed to fetch product details");
        }
    };

    const handleAdditionChange = (key, value) => {
        const val = value.replace(/[^0-9]/g, '');
        setStockAdditions(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        if (!selectedProduct) return;
        setIsSaving(true);
        try {
            const updatedVariants = [...selectedProduct.variants];
            let addedTotal = 0;
            const hasVariantsWithSizes = updatedVariants.some(v => v.sizesStock && Object.keys(v.sizesStock).length > 0);

            if (hasVariantsWithSizes) {
                updatedVariants.forEach((v, vIndex) => {
                    if (v.sizesStock) {
                        Object.keys(v.sizesStock).forEach(size => {
                            const key = `${vIndex}-${size}`;
                            const addition = parseInt(stockAdditions[key]) || 0;
                            v.sizesStock[size] = (parseInt(v.sizesStock[size]) || 0) + addition;
                            addedTotal += addition;
                        });
                    }
                });
            } else {
                addedTotal = parseInt(manualTotalStockAdd) || 0;
            }

            if (addedTotal === 0) {
                toast.error("Please add a quantity greater than 0");
                setIsSaving(false);
                return;
            }

            const oldTotal = parseInt(selectedProduct.total_stock) || 0;
            const newTotalStock = oldTotal + addedTotal;
            const status = newTotalStock <= 0 ? "Out of Stock" : newTotalStock < 10 ? "Low Stock" : "Active";

            const payload = {
                ...selectedProduct,
                total_stock: newTotalStock.toString(),
                status: status,
                variants: updatedVariants
            };

            await api.put(`/products/${selectedProduct.id}`, payload);
            toast.success(`Broadly added ${addedTotal} to stock!`);
            setTimeout(() => navigate(-1), 1200);
        } catch (error) {
            toast.error("Failed to add stock");
        } finally {
            setIsSaving(false);
        }
    };

    const hasSizes = selectedProduct && selectedProduct.variants && selectedProduct.variants.some(v => v.sizesStock && Object.keys(v.sizesStock).length > 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-2 md:p-6 bg-slate-50 min-h-screen">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-rose-600 transition-all shadow-sm"><FiArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">New Stock Entry</h1>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Update your inventory levels</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Product Search & Selection */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-[10px] font-black italic">1</div>
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Find Product</h3>
                        </div>
                        
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search sku or name..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-rose-100 rounded-2xl outline-none focus:bg-white transition-all text-[11px] font-black uppercase tracking-widest shadow-inner shadow-gray-100/50"
                            />
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {loading ? (
                                    <div className="py-10 flex flex-col items-center justify-center gap-2">
                                        <div className="w-6 h-6 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
                                        <p className="text-[8px] font-black uppercase text-gray-300">Searching...</p>
                                    </div>
                            ) : (
                                <>
                                    {products.map(prod => (
                                        <button
                                            key={prod.id}
                                            onClick={() => handleSelectProduct(prod)}
                                            className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-4 group border ${selectedProduct?.id === prod.id ? 'bg-rose-600 border-rose-600 shadow-lg shadow-rose-100' : 'bg-gray-50 border-transparent hover:bg-white hover:border-rose-100 hover:shadow-md'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 p-1 shrink-0">
                                                <img
                                                    src={(prod.images && prod.images.length > 0) ? prod.images[0] : `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.name)}&background=random`}
                                                    alt={prod.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className={`text-[12px] font-black uppercase truncate leading-tight ${selectedProduct?.id === prod.id ? 'text-white' : 'text-slate-800'}`}>{prod.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedProduct?.id === prod.id ? 'text-rose-200' : 'text-gray-400'}`}># {prod.product_code || prod.id}</p>
                                                     <span className={`w-1 h-1 rounded-full ${selectedProduct?.id === prod.id ? 'bg-rose-300' : 'bg-gray-200'}`}></span>
                                                     <p className={`text-[9px] font-bold uppercase ${selectedProduct?.id === prod.id ? 'text-rose-200' : 'text-rose-500'}`}>Stock: {prod.total_stock || 0}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {products.length === 0 && search && (
                                        <div className="py-20 text-center opacity-30">
                                            <FiBox className="mx-auto mb-2" size={24} />
                                            <p className="font-black text-[10px] uppercase tracking-widest">No Matches</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Entry Form */}
                <div className="lg:col-span-8">
                    {selectedProduct ? (
                        <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-12 animate-in zoom-in-95 duration-500">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-[10px] font-black italic">2</div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Add Stock Details</h3>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl shadow-gray-100 p-2 shrink-0">
                                    <img
                                        src={(selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[0] : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProduct.name)}&background=random`}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="text-center md:text-left space-y-2">
                                    <div className="inline-block px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 italic shadow-sm">Selected Product</div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">{selectedProduct.name}</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{selectedProduct.category} <span className="mx-2">/</span> SKU {selectedProduct.product_code || selectedProduct.id}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-[3rem] border border-gray-100 shadow-inner space-y-8">
                                {hasSizes ? (
                                    <div className="space-y-10">
                                        {selectedProduct.variants.map((v, vIndex) => {
                                            if (!v.sizesStock || Object.keys(v.sizesStock).length === 0) return null;
                                            return (
                                                <div key={vIndex} className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full shadow-md border-2 border-white" style={{ backgroundColor: v.color }}></div>
                                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{v.colorName || 'Option Shade'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {Object.entries(v.sizesStock).map(([size, currentStock]) => {
                                                            const key = `${vIndex}-${size}`;
                                                            const added = parseInt(stockAdditions[key]) || 0;
                                                            return (
                                                                <div key={size} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm group focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                                                                    <div className="flex justify-between items-center mb-4">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{size}</label>
                                                                        <span className="text-[9px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-lg">Now: {currentStock}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-2xl font-black text-rose-200">+</span>
                                                                        <input
                                                                            type="text"
                                                                            value={stockAdditions[key] || ""}
                                                                            onChange={(e) => handleAdditionChange(key, e.target.value)}
                                                                            className="w-full text-3xl font-black text-slate-800 outline-none placeholder:text-gray-100 bg-transparent"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                    {added > 0 && (
                                                                        <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center animate-in slide-in-from-top-2">
                                                                            <span className="text-[9px] font-black uppercase text-gray-400 italic">Expected Total:</span>
                                                                            <span className="text-[14px] font-black text-emerald-500 italic">{(parseInt(currentStock)||0) + added}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-8">
                                         <div className="text-center">
                                            <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-2 italic">Quantity to Increase</p>
                                            <p className="text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full inline-block">Current Global Stock: {selectedProduct.total_stock || 0}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 group">
                                            <span className="text-6xl font-black text-rose-100 group-focus-within:text-rose-500 transition-colors">+</span>
                                            <input
                                                type="text"
                                                value={manualTotalStockAdd}
                                                onChange={(e) => setManualTotalStockAdd(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="00"
                                                className="w-48 text-[90px] text-center font-black text-rose-600 outline-none bg-transparent placeholder:text-gray-100 tracking-tighter italic"
                                                autoFocus
                                            />
                                        </div>

                                        {parseInt(manualTotalStockAdd) > 0 && (
                                            <div className="bg-emerald-50 text-emerald-700 px-8 py-4 rounded-[2rem] border-2 border-emerald-100 shadow-lg shadow-emerald-50 animate-in zoom-in-90 timescale-300">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-center opacity-60 mb-1">Projected Total Inventory</p>
                                                <p className="text-4xl font-black text-center tracking-tighter italic">{(parseInt(selectedProduct.total_stock) || 0) + (parseInt(manualTotalStockAdd) || 0)} Units</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-slate-900 border-4 border-white hover:bg-black text-white py-6 rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-rose-100 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                {isSaving ? (
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FiSave className="text-2xl group-hover:scale-110 transition-transform" />
                                        <span>Confirm Stock Update</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border-4 border-dashed border-gray-100 rounded-[4rem] flex flex-col items-center justify-center bg-gray-50/20 text-center p-20 gap-6 opacity-60">
                            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-gray-100 flex items-center justify-center text-gray-200 group hover:scale-110 transition-transform duration-500">
                                <FiBox size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tighter italic">Pick a Product</h3>
                                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest max-w-xs mx-auto">Select an item from the left tracking panel to begin inventory replenishment</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddStock;
