import React, { useState, useEffect } from "react";
import { useAdmin } from "../../PrivateRouter/AdminContext";
import api from "../../api";
import { toast, Toaster } from "react-hot-toast";
import {
    FiBox, FiAlertCircle, FiTrendingDown, FiPackage, FiFilter, 
    FiSearch, FiSave, FiPlus, FiX, FiArrowLeft, FiActivity, FiRefreshCw
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const StockDetails = () => {
    const navigate = useNavigate();
    const { stockCache, setStockCached } = useAdmin();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const currentCacheKey = JSON.stringify({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
    });
    
    const pageData = stockCache[currentCacheKey];
    const [products, setProducts] = useState(pageData?.products || []);
    const [loading, setLoading] = useState(!pageData);
    const [isSyncing, setIsSyncing] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pagination, setPagination] = useState(pageData?.pagination || { total: 0, totalPages: 1 });
    const [stats, setStats] = useState(pageData?.stats || { total: 0, active: 0, lowStock: 0, outOfStock: 0 });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [updatedVariants, setUpdatedVariants] = useState([]);
    const [manualTotalStock, setManualTotalStock] = useState("0");
    const [isUpdating, setIsUpdating] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    const fetchProducts = async () => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm
        };
        const cacheKey = JSON.stringify(params);
        if (!stockCache[cacheKey]) setLoading(true);

        try {
            const response = await api.get("/products", { params });
            const data = response.data;
            let finalData = {};

            if (Array.isArray(data)) {
                finalData = { 
                    products: data, 
                    pagination: { total: data.length, totalPages: 1 }, 
                    stats: { total: data.length, active: 0, lowStock: 0, outOfStock: 0 }
                };
            } else {
                finalData = {
                    products: Array.isArray(data.products) ? data.products : [],
                    pagination: data.pagination || { total: 0, totalPages: 1 },
                    stats: data.stats || { total: 0, active: 0, lowStock: 0, outOfStock: 0 }
                };
            }
            setProducts(finalData.products);
            setPagination(finalData.pagination);
            setStats(finalData.stats);
            setStockCached(prev => ({ ...prev, [cacheKey]: finalData }));
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm]);

    const handleSync = () => {
        setIsSyncing(true);
        fetchProducts();
    };

    const getStockLevel = (product) => {
        return product.total_stock ?? product.stock ?? 0;
    };

    const getProductImage = (product) => {
        try {
            let imgUrl = null;
            const images = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
            if (Array.isArray(images) && images.length > 0) imgUrl = images[0];

            if (!imgUrl) return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'P')}&background=random`;
            if (imgUrl.startsWith('http') || imgUrl.startsWith('data:')) return imgUrl;

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const cleanPath = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
            return `${backendUrl}${cleanPath}`;
        } catch (e) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'P')}&background=random`;
        }
    };

    const deriveStatus = (stock) => {
        if (stock <= 0) return "Out of Stock";
        if (stock < 10) return "Low Stock";
        return "In Stock";
    };

    const totalInventoryValue = products.reduce((acc, p) => {
        const stock = getStockLevel(p);
        const price = parseFloat(p.offer_price || p.price || 0);
        return acc + (stock * price);
    }, 0);

    const openUpdateModal = async (product) => {
        setIsModalOpen(true);
        setSelectedProduct(product);
        setUpdatedVariants(Array.isArray(product.variants) ? product.variants : []);
        setManualTotalStock(product.total_stock?.toString() || "0");
        setFetchingDetail(true);

        try {
            const res = await api.get(`/products/${product.id}`);
            const fullP = res.data;
            let vars = [];
            if (fullP.variants) {
                vars = typeof fullP.variants === 'string' ? JSON.parse(fullP.variants) : fullP.variants;
            }
            setSelectedProduct(fullP);
            setUpdatedVariants(Array.isArray(vars) ? vars : []);
            setManualTotalStock(fullP.total_stock?.toString() || "0");
        } catch (e) {
            console.error("Failed to fetch full product details", e);
            toast.error("Failed to fetch detailed stock data");
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleVariantStockChange = (vIndex, size, value) => {
        const newVars = [...updatedVariants];
        if (!newVars[vIndex].sizesStock) newVars[vIndex].sizesStock = {};
        newVars[vIndex].sizesStock[size] = parseInt(value) || 0;
        setUpdatedVariants(newVars);
    };

    const handleSaveStock = async () => {
        if (!selectedProduct) return;
        setIsUpdating(true);
        try {
            let newTotalStock = 0;
            const vars = Array.isArray(updatedVariants) ? updatedVariants : [];
            const hasVariantsWithSizes = vars.some(v => v.sizesStock && Object.keys(v.sizesStock).length > 0);

            if (hasVariantsWithSizes) {
                vars.forEach(v => {
                    Object.values(v.sizesStock || {}).forEach(qty => {
                        newTotalStock += parseInt(qty) || 0;
                    });
                });
            } else {
                newTotalStock = parseInt(manualTotalStock) || 0;
            }

            const status = deriveStatus(newTotalStock);

            const payload = {
                ...selectedProduct,
                total_stock: newTotalStock.toString(),
                status: status,
                variants: vars
            };

            await api.put(`/products/${selectedProduct.id}`, payload);
            toast.success("Stock updated successfully");
            fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Failed to update stock");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-2 md:p-6 bg-slate-50 min-h-screen">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-rose-600 transition-all shadow-sm"><FiArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Inventory Status</h1>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Real-time Stock Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSync} className={`p-3 bg-white border border-rose-100 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2 ${isSyncing ? 'animate-spin' : ''}`}>
                        <FiRefreshCw size={18} />
                    </button>
                    <button onClick={() => navigate('/admin/products/stock/add')} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 transition-all active:scale-95">
                        <FiPlus size={16} /> <span>New Stock Entry</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Total Value</p>
                        <h2 className="text-2xl font-black text-slate-800 leading-none italic">₹{totalInventoryValue.toLocaleString()}</h2>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <FiActivity />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Healthy Items</p>
                        <h2 className="text-2xl font-black text-slate-800 leading-none">{stats.total - stats.lowStock - stats.outOfStock} items</h2>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <FiPackage />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-amber-100 shadow-sm flex items-center justify-between group hover:bg-amber-50/50 transition-all">
                    <div>
                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2 leading-none">Low Stock</p>
                        <h2 className="text-2xl font-black text-slate-800 leading-none">{stats.lowStock} items</h2>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-xl animate-pulse">
                        <FiAlertCircle />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-red-100 shadow-sm flex items-center justify-between group hover:bg-red-50 transition-all">
                    <div>
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] mb-2 leading-none">Out Of Stock</p>
                        <h2 className="text-2xl font-black text-slate-800 leading-none">{stats.outOfStock} items</h2>
                    </div>
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-xl group-hover:shake transition-all">
                        <FiTrendingDown />
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-slate-800">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><FiBox className="text-indigo-500" /> Stock Listing</h3>
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-rose-100 rounded-2xl outline-none focus:bg-white transition-all text-[11px] font-black uppercase tracking-widest w-72"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Fetching inventory details...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-gray-400 text-[9px] font-black uppercase tracking-widest leading-none">
                                <tr>
                                    <th className="px-8 py-5">Product Details</th>
                                    <th className="px-8 py-5">Category</th>
                                    <th className="px-8 py-5">Inventory Depth</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.length > 0 ? (
                                    products.map((item) => {
                                        const stock = getStockLevel(item);
                                        const status = deriveStatus(stock);
                                        const minStock = 10;

                                        return (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm p-1">
                                                            <img
                                                                src={getProductImage(item)}
                                                                alt={item.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-[13px] uppercase tracking-tight">{item.name}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
                                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded"># {item.product_code || item.id}</span>
                                                                {item.brand && <span className="opacity-60">{item.brand}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">{item.category}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="w-full max-w-[140px] space-y-2">
                                                        <div className="flex items-center justify-between text-[11px] font-black italic">
                                                            <span className={stock <= 0 ? 'text-red-500' : stock < minStock ? 'text-amber-500' : 'text-emerald-500'}>{stock} Units</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${stock <= 0 ? 'bg-red-500' : stock < minStock ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min((stock / 100) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                                                        status === "Out of Stock" ? 'bg-red-50 text-red-600 border-red-100' : 
                                                        status === "Low Stock" ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                                            status === "Out of Stock" ? 'bg-red-500' : 
                                                            status === "Low Stock" ? 'bg-amber-500' : 
                                                            'bg-emerald-500'
                                                        }`}></div>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => openUpdateModal(item)}
                                                        className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                                                    >
                                                        <FiActivity size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center text-3xl"><FiBox /></div>
                                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No matching stock found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-8 bg-slate-900 flex items-center justify-between text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            Page {currentPage} of {pagination.totalPages} <span className="mx-2">|</span> {pagination.total} Total Records
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:text-rose-400 disabled:opacity-20 transition-all font-black italic"
                            >
                                Prev
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-white text-slate-900 shadow-xl scale-110' : 'text-white hover:bg-white/10'}`}
                                >
                                    {i + 1}
                                </button>
                            )).slice(0, 5)}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                disabled={currentPage === pagination.totalPages}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:text-rose-400 disabled:opacity-20 transition-all font-black italic"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Modal Update */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 border-4 border-white">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Update Inventory</h3>
                                <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-1">{selectedProduct.name}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {fetchingDetail ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Loading Configuration...</p>
                                </div>
                            ) : (
                                <>
                                    {updatedVariants.length > 0 && updatedVariants.some(v => v.sizesStock) ? (
                                        <div className="space-y-6">
                                            {updatedVariants.map((variant, vIndex) => (
                                                <div key={vIndex} className="bg-slate-50 p-6 rounded-[2rem] border border-gray-100">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: variant.color }}></div>
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{variant.colorName || 'Option Shade'}</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {variant.sizesStock && Object.entries(variant.sizesStock).map(([size, currentQty]) => (
                                                            <div key={size} className="bg-white p-3.5 rounded-2xl border border-gray-100 focus-within:border-rose-400 transition-all shadow-sm">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="text-[9px] font-black text-gray-400 uppercase">{size}</label>
                                                                    <span className="text-[8px] font-black text-rose-500">Stock: {currentQty}</span>
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={variant.sizesStock?.[size] ?? 0}
                                                                    onChange={(e) => handleVariantStockChange(vIndex, size, e.target.value)}
                                                                    className="w-full text-lg font-black text-slate-800 outline-none bg-transparent"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 italic opacity-50">Manual Total Stock</label>
                                            <div className="flex items-center gap-4">
                                                <FiBox className="text-3xl text-rose-500" />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={manualTotalStock}
                                                    onChange={(e) => setManualTotalStock(e.target.value)}
                                                    className="bg-transparent text-5xl font-black text-white w-full outline-none italic transition-all focus:scale-105"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-8 border-t bg-gray-50/50 flex gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[11px] font-black uppercase text-gray-400 hover:text-gray-800 transition-colors">Discard</button>
                            <button 
                                onClick={handleSaveStock} 
                                disabled={isUpdating || fetchingDetail}
                                className="flex-2 w-2/3 bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-100 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                            >
                                {isUpdating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><FiSave /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockDetails;
