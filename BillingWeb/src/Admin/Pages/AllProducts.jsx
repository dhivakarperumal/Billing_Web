import React, { useState, useEffect, useContext } from "react";
import { useAdmin } from "../../PrivateRouter/AdminContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { toast, Toaster } from "react-hot-toast";
import { FaRupeeSign } from "react-icons/fa";
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiBox,
    FiGrid,
    FiList,
    FiLayout,
    FiDatabase,
    FiPrinter,
    FiDownload,
    FiUpload,
    FiChevronRight,
    FiPackage
} from "react-icons/fi";
import JsBarcode from "jsbarcode";

const AllProducts = () => {
    const navigate = useNavigate();
    const { productsCache, setProductsCached } = useAdmin();

    const [searchTerm, setSearchTerm] = useState("");
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const currentCacheKey = JSON.stringify({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: showLowStockOnly ? "Low Stock" : "All"
    });

    const pageData = productsCache[currentCacheKey];
    const [products, setProducts] = useState(pageData?.products || []);
    const [loading, setLoading] = useState(!pageData);
    const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

    // Stock Update Modal State
    const [currentProduct, setCurrentProduct] = useState(null);
    const [newStock, setNewStock] = useState("");
    const [updatingStock, setUpdatingStock] = useState(false);

    const [pagination, setPagination] = useState(pageData?.pagination || { total: 0, totalPages: 1 });
    const [stats, setStats] = useState(pageData?.stats || { total: 0, active: 0, lowStock: 0, outOfStock: 0 });

    // Rapid Add Modal
    const [isRapidAddOpen, setIsRapidAddOpen] = useState(false);
    const [rapidSaving, setRapidSaving] = useState(false);
    const [rapidProd, setRapidProd] = useState({ name: "", mrp: "", status: "Active" });

    const handleRapidAdd = async (e, shouldContinue = false) => {
        if (e) e.preventDefault();
        if (!rapidProd.name || !rapidProd.mrp) return toast.error("Essentials missing!");

        setRapidSaving(true);
        try {
            await api.post("/products", {
                ...rapidProd,
                category: "Saree",
                total_stock: "0",
                variants: []
            });
            toast.success("Boutique addition live!");
            if (shouldContinue) {
                setRapidProd({ name: "", mrp: "", status: "Active" });
            } else {
                setIsRapidAddOpen(false);
                setRapidProd({ name: "", mrp: "", status: "Active" });
            }
            fetchProducts();
        } catch (error) {
            toast.error("Process failed.");
        } finally {
            setRapidSaving(false);
        }
    };

    const fetchProducts = async () => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            status: showLowStockOnly ? "Low Stock" : "All"
        };
        const cacheKey = JSON.stringify(params);
        if (!productsCache[cacheKey]) setLoading(true);

        try {
            const response = await api.get("/products", { params });
            const data = response.data;
            let finalData = {};
            if (Array.isArray(data)) {
                finalData = { products: data, pagination: { total: data.length, totalPages: 1 }, stats: { total: 0, active: 0, lowStock: 0, outOfStock: 0 } };
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
            setProductsCached(prev => ({ ...prev, [cacheKey]: finalData }));
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // EXPORT FUNCTIONALITY
    const handleExport = () => {
        try {
            const exportData = JSON.stringify(products, null, 2);
            const blob = new Blob([exportData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Inventory exported successfully!");
        } catch (err) {
            toast.error("Export failed!");
        }
    };

    // IMPORT FUNCTIONALITY
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!Array.isArray(data)) throw new Error("Invalid format");
                
                setLoading(true);
                let successCount = 0;
                for (const item of data) {
                    try {
                        if (!item.name) continue;
                        await api.post("/products", item);
                        successCount++;
                    } catch (e) {
                        console.error("Individual item import fail", e);
                    }
                }
                toast.success(`Broadly imported ${successCount} products!`);
                fetchProducts();
            } catch (err) {
                toast.error("Import failed! Ensure JSON format is valid.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    // PRINT BARCODES (4 COLUMNS - FETCH ALL)
    const handlePrintBarcodes = async () => {
        setLoading(true);
        try {
            const response = await api.get("/products", { params: { limit: 1000 } });
            const allProducts = Array.isArray(response.data) ? response.data : (response.data.products || []);
            
            if (allProducts.length === 0) return toast.error("No products to print!");

            const printWindow = window.open('', '_blank');
            const barcodeHtml = allProducts.map(p => `
                <div style="width: 23%; display: inline-block; padding: 10px; border: 1px solid #eee; margin: 1%; text-align: center; box-sizing: border-box; break-inside: avoid; background: white;">
                    <p style="font-size: 10px; font-weight: bold; margin: 0 0 5px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</p>
                    <svg id="barcode-${p.id}"></svg>
                    <p style="font-size: 8px; margin: 5px 0 0 0; color: #666;">${p.product_code || `PRD-${p.id}`}</p>
                    <p style="font-size: 10px; font-weight: bold; margin: 2px 0 0 0;">₹${p.offer_price || p.price || 0}</p>
                </div>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Master Inventory Barcodes</title>
                        <style>
                            body { font-family: sans-serif; margin: 20px; background: #f9f9f9; }
                            @media print {
                                body { margin: 0; background: white; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div style="display: flex; flex-wrap: wrap; width: 100%;">
                            ${barcodeHtml}
                        </div>
                        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
                        <script>
                            window.onload = function() {
                                ${allProducts.map(p => `
                                    try {
                                        JsBarcode("#barcode-${p.id}", "${p.product_code || `PRD-${p.id}`}", { 
                                            width: 1.2, 
                                            height: 45, 
                                            fontSize: 0, 
                                            margin: 0,
                                            displayValue: false
                                        });
                                    } catch(e) { console.error("Barcode fail ${p.id}", e); }
                                `).join('\n')}
                                setTimeout(() => { 
                                    window.print(); 
                                    window.close(); 
                                }, 1500);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            toast.success("Barcode master sheet generated!");
        } catch (err) {
            console.error("Master print fail:", err);
            toast.error("Failed to generate master sheet!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timeout);
    }, [currentPage, searchTerm, showLowStockOnly]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product removed from vault.");
            fetchProducts();
        } catch (error) {
            toast.error("Deletion failed.");
            console.error("Error deleting product:", error);
        }
    };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        if (!currentProduct || newStock === "") return;

        setUpdatingStock(true);
        try {
            // Send partial update - most backends handle this if we send just what changed, 
            // but for ours we might need to send all or use a specific endpoint.
            // Assuming current backend needs a full update based on our previous look.
            const updatedProduct = { ...currentProduct, total_stock: parseInt(newStock) };
            await api.put(`/products/${currentProduct.id}`, updatedProduct);

            toast.success("Stock updated instantly!");
            setProducts(products.map(p => p.id === currentProduct.id ? { ...p, total_stock: parseInt(newStock), status: parseInt(newStock) === 0 ? 'Out of Stock' : parseInt(newStock) < 10 ? 'Low Stock' : 'Active' } : p));
            setCurrentProduct(null);
        } catch (error) {
            toast.error("Failed to update stock");
        } finally {
            setUpdatingStock(false);
        }
    };


    const getStatusStyle = (status) => {
        switch (status) {
            case "Active": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Low Stock": return "bg-amber-50 text-amber-600 border-amber-100";
            case "Out of Stock": return "bg-rose-50 text-rose-600 border-rose-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    // Simplified Pagination (Handled by backend)
    const totalPages = pagination.totalPages;
    const currentItems = products;

    // Reset to page 1 when search/filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, showLowStockOnly]);

    const getProductImage = (product) => {
        let imgUrl = null;
        try {
            const processUrl = (url) => {
                if (!url || typeof url !== 'string') return null;
                if (url.startsWith('http') || url.startsWith('data:')) return url;
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                const cleanPath = url.startsWith('/') ? url : `/${url}`;
                return `${backendUrl}${cleanPath}`;
            };

            // 1. Try variants first
            if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                const firstVar = product.variants[0];
                const vImgs = typeof firstVar.images === 'string' ? JSON.parse(firstVar.images) : firstVar.images;
                if (Array.isArray(vImgs) && vImgs.length > 0) imgUrl = vImgs[0];
            }

            // 2. Try main images column
            if (!imgUrl && product.images) {
                const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                if (Array.isArray(imgs) && imgs.length > 0) imgUrl = imgs[0];
            }

            const finalUrl = processUrl(imgUrl);
            if (finalUrl) return finalUrl;
        } catch (e) {
            console.error("Error getting product image:", e);
        }

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'P')}&background=random`;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>

                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-rose-600 shadow-sm" : "text-gray-400 hover:text-slate-600"}`}
                        >
                            <FiList size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-rose-600 shadow-sm" : "text-gray-400 hover:text-slate-600"}`}
                        >
                            <FiGrid size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrintBarcodes}
                            className="p-4 bg-white border border-gray-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                            title="Print Labels (4-Column Grid)"
                        >
                            <FiPrinter size={16} /> <span className="hidden md:inline">Print Labels</span>
                        </button>

                        <button
                            onClick={handleExport}
                            className="p-4 bg-white border border-gray-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                            title="Export Data (.json)"
                        >
                            <FiDownload size={16} /> <span className="hidden md:inline">Export</span>
                        </button>

                        <label className="p-4 bg-white border border-gray-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer" title="Import Data (.json)">
                            <FiUpload size={16} /> <span className="hidden md:inline">Import</span>
                            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                        </label>
                    </div>

                    <button
                        onClick={() => navigate("/admin/products/add")}
                        className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-100 active:scale-95 whitespace-nowrap"
                    >
                        <FiPlus /> New Product
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Vault...</p>
                </div>
            ) : (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Products", value: stats.total },
                            { label: "Active", value: stats.active },
                            { label: "Low Stock", value: stats.lowStock },
                            { label: "Out of Stock", value: stats.outOfStock },
                        ].map((stat, i) => {
                            const bgGradients = [
                              { from: "from-[#4387F6]", to: "to-[#5C9CF8]", text: "text-[#4387F6]" }, // Blue
                              { from: "from-[#F85A6C]", to: "to-[#FA7082]", text: "text-[#F85A6C]" }, // Red
                              { from: "from-[#28C382]", to: "to-[#3DD09A]", text: "text-[#28C382]" }, // Green
                              { from: "from-[#FC8C41]", to: "to-[#FD9D5B]", text: "text-[#FC8C41]" }, // Orange
                            ];
                            const dummyTrends = [
                              { isUp: true, val: "+427" },
                              { isUp: false, val: "-23.09%" },
                              { isUp: true, val: "52.09%" },
                              { isUp: false, val: "-152.3" }
                            ];
                  
                            const styleInfo = bgGradients[i % bgGradients.length];
                            const trend = dummyTrends[i % dummyTrends.length];
                  
                            return (
                              <div
                                key={i}
                                className={`relative overflow-hidden bg-gradient-to-r ${styleInfo.from} ${styleInfo.to} p-5 rounded-md shadow-sm transition-all hover:-translate-y-1 text-white flex flex-col justify-between`}
                              >
                                <div className="z-10 relative">
                                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-white/90">
                                    {stat.label}
                                  </p>
                                  
                                  <div className="flex justify-between items-end mb-4">
                                    <p className="text-2xl font-bold tracking-tight">
                                      {stat.value}
                                    </p>
                                    <div className="flex items-center gap-1 text-sm font-medium">
                                      <div className={`w-4 h-4 rounded-full bg-white flex items-center justify-center ${styleInfo.text}`}>
                                         {trend.isUp ? (
                                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                         ) : (
                                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                         )}
                                      </div>
                                      {trend.val}
                                    </div>
                                  </div>
                  
                                  <p className="text-[11px] text-white/80 mt-1">
                                    Compared to last week
                                  </p>
                                </div>
                  
                                {/* Bottom wave SVG */}
                                <svg className="absolute bottom-0 left-0 w-full opacity-[0.25] pointer-events-none translate-y-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '45px' }}>
                                  <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                </svg>
                              </div>
                            );
                        })}
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full md:max-w-md group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-xs font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            <button
                                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${showLowStockOnly ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-slate-800 hover:bg-white'}`}
                            >
                                <FiFilter /> {showLowStockOnly ? "Showing Low Stock" : "All Inventory"}
                            </button>
                            <select className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none hover:bg-white transition-all cursor-pointer whitespace-nowrap">
                                <option>Sort: Newest First</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Stock: Low to High</option>
                            </select>
                        </div>
                    </div>

                    {viewMode === "table" ? (
                        /* Modern Table View */
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse block md:table">
                                    <thead className="hidden md:table-header-group border-b border-gray-200">
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Name</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stock Count</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="block md:table-row-group md:divide-y divide-gray-200 p-4 md:p-0">
                                        {currentItems.map((product) => (
                                            <tr key={product.id} className="hover:bg-primary/10/20 transition-colors group block md:table-row bg-white md:bg-transparent border border-gray-100 md:border-x-0 md:border-t-0 md:border-b md:border-gray-200 rounded-2xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none">
                                                <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell border-b border-gray-50 md:border-b-0">
                                                    <div className="flex flex-col md:block w-full gap-3 md:gap-0">
                                                        <span className="md:hidden text-[11px] font-black text-gray-400 uppercase tracking-widest">Product Name</span>
                                                        <div className="flex items-center gap-4 md:gap-5 text-left w-full min-w-0">
                                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                                                 <img
                                                                    src={getProductImage(product)}
                                                                    alt={product.name}
                                                                    loading="lazy"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=No+Image'}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1 md:flex-none">
                                                                <p className="text-sm font-black text-slate-800 break-words whitespace-normal leading-tight md:truncate md:whitespace-nowrap md:max-w-[200px] lg:max-w-xs">{product.name}</p>
                                                                <div className="flex flex-wrap md:flex-nowrap items-center justify-start gap-2 mt-1.5">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                                                                        {product.product_code || `PRD-${product.id}`}
                                                                    </span>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                                                                        {product.category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell border-b border-gray-50 md:border-b-0">
                                                    <div className="flex flex-col md:block w-full gap-3 md:gap-0">
                                                        <span className="md:hidden text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                                        <div>
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(product.status)}`}>
                                                                {product.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell border-b border-gray-50 md:border-b-0">
                                                    <div className="flex flex-col md:block w-full gap-3 md:gap-0">
                                                        <span className="md:hidden text-[11px] font-black text-gray-400 uppercase tracking-widest">Stock Count</span>
                                                        <div className="flex items-center justify-start gap-2 cursor-pointer group/stock" onClick={() => { setCurrentProduct(product); setNewStock(product.total_stock || "0"); }}>
                                                            <FiPackage className="text-gray-300 group-hover/stock:text-primary transition-colors" size={14} />
                                                            <span className="text-sm font-black text-slate-700 underline decoration-dotted decoration-gray-200 group-hover/stock:text-primary transition-colors">{product.total_stock ?? product.stock ?? 0}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Units</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell border-b border-gray-50 md:border-b-0">
                                                    <div className="flex flex-col md:block w-full gap-3 md:gap-0">
                                                        <span className="md:hidden text-[11px] font-black text-gray-400 uppercase tracking-widest">Price</span>
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-base font-black text-slate-800 tracking-tighter">₹{parseFloat(product.offer_price || product.discount_price || 0).toLocaleString()}</span>
                                                            <span className="text-[10px] text-gray-400 line-through font-bold">MRP: ₹{parseFloat(product.mrp || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 md:px-8 md:py-6 block md:table-cell text-left md:text-right">
                                                    <div className="flex flex-col md:block w-full gap-3 md:gap-0">
                                                        <span className="md:hidden text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</span>
                                                        <div className="flex items-center justify-start md:justify-end gap-3">
                                                            <Link
                                                                to={`/admin/products/detail/${product.id}`}
                                                                className="p-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm md:shadow-none"
                                                                title="View Product"
                                                            >
                                                                <FiEye size={18} />
                                                            </Link>
                                                            <Link
                                                                to={`/admin/products/edit/${product.id}`}
                                                                className="p-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm md:shadow-none"
                                                                title="Edit Product"
                                                            >
                                                                <FiEdit2 size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm md:shadow-none"
                                                                title="Delete Product"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Premium Grid View */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {currentItems.map((product) => (
                                <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all flex flex-col">
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=No+Image'}
                                        />
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md pointer-events-auto shadow-sm ${getStatusStyle(product.status)}`}>
                                                {product.status}
                                            </span>
                                            <div className="flex flex-col gap-2 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/admin/products/edit/${product.id}`} className="p-2.5 bg-white/90 backdrop-blur rounded-full text-amber-500 shadow-xl hover:bg-white border border-white/50 transition-all hover:scale-110">
                                                    <FiEdit2 size={14} />
                                                </Link>
                                                <button onClick={() => handleDelete(product.id)} className="p-2.5 bg-white/90 backdrop-blur rounded-full text-rose-500 shadow-xl hover:bg-rose-50 border border-white/50 transition-all hover:scale-110">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <Link to={`/admin/products/detail/${product.id}`} className="w-full py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-2xl hover:bg-white hover:text-slate-900 transition-all">
                                                Visual Details <FiChevronRight />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1 leading-none">{product.category}</p>
                                                <h4 className="text-sm font-black text-slate-800 truncate leading-tight mt-1">{product.name}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-slate-800 tracking-tighter">₹{parseFloat(product.offer_price || product.discount_price || 0).toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-300 font-bold line-through">₹{parseFloat(product.mrp || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${product.status === 'Active' ? 'bg-emerald-500 ring-2 ring-emerald-50' : product.status === 'Low Stock' ? 'bg-amber-500 ring-2 ring-amber-50' : 'bg-rose-500 ring-2 ring-rose-50'}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">Stock: {product.total_stock ?? product.stock ?? 0}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                                {product.product_code || `PRD-${product.id}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                {/* Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} Items */}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:border-blue-100 disabled:opacity-30 transition-all shadow-sm"
                                >
                                    Prev
                                </button>
                                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] md:max-w-none hide-scrollbar">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`min-w-[40px] h-10 rounded-xl text-[10px] font-black transition-all border shrink-0 ${currentPage === i + 1 ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:border-blue-100 disabled:opacity-30 transition-all shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {currentItems.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                                <FiBox size={40} />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Match Found</p>
                            <p className="text-slate-300 font-bold text-[10px] mt-2 italic px-8">"{searchTerm}" did not return any inventory records.</p>
                        </div>
                    )}


                </>
            )}

            {/* QUICK STOCK UPDATE MODAL */}
            {currentProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCurrentProduct(null)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><FiPackage size={80} /></div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight truncate">{currentProduct.name}</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">AJAX Stock Controller</p>
                        </div>

                        <form onSubmit={handleStockUpdate} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Inventory</span>
                                    <span className="text-lg font-black text-slate-800">{currentProduct.total_stock} Units</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Stock Level</label>
                                    <input
                                        autoFocus
                                        type="number"
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-slate-800 transition-all text-2xl text-center"
                                        placeholder="0"
                                        value={newStock}
                                        onChange={(e) => setNewStock(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={updatingStock}
                                className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-rose-100 flex items-center justify-center gap-3"
                            >
                                {updatingStock ? <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin"></div> : "Sync Stock Record"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setCurrentProduct(null)}
                                className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-slate-800 uppercase tracking-widest transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* RAPID PRODUCT ADD MODAL */}
            {isRapidAddOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRapidAddOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><FiBox size={80} /></div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">Rapid Addition</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Instant AJAX Listing</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-slate-800 transition-all"
                                        placeholder="e.g. Traditional Silk"
                                        value={rapidProd.name}
                                        onChange={(e) => setRapidProd({ ...rapidProd, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (MRP)</label>
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
                                    onClick={(e) => handleRapidAdd(e, true)}
                                    disabled={rapidSaving}
                                    className="w-full py-5 bg-white border-2 border-rose-100 hover:bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    List & Add Another
                                </button>
                                <button
                                    onClick={(e) => handleRapidAdd(e, false)}
                                    disabled={rapidSaving}
                                    className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-rose-100 flex items-center justify-center gap-3"
                                >
                                    {rapidSaving ? <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin"></div> : "Save & Close"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsRapidAddOpen(false)}
                                className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-slate-800 uppercase tracking-widest transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// SVG Helper Components
const FiCheckCircle = () => <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
const FiAlertCircle = () => <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
const FiXCircle = () => <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>

export default AllProducts;
