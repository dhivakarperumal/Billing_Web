import React, { useState, useEffect, useRef } from "react";
import {
    FiArrowLeft, FiPlus, FiTrash2, FiSave, FiUser, FiPackage,
    FiSearch, FiPhone, FiCheckCircle, FiMic, FiMaximize, FiLayers, FiCamera, FiX
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";

const CreateBilling = () => {
    const navigate = useNavigate();
    const barcodeInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // Data States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [productSearchTerm, setProductSearchTerm] = useState("");

    // UI States
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isScannerFocused, setIsScannerFocused] = useState(true);
    const [showCameraScanner, setShowCameraScanner] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // grid or table
    const [selectMode, setSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_phone: "",
        items: [],
        total_amount: 0,
        status: "Paid"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoryRes] = await Promise.all([
                    api.get("/products?limit=200"),
                    api.get("/categories")
                ]);

                const productsData = productRes.data;
                const productsArray = Array.isArray(productsData) ? productsData : (productsData.products || []);

                setProducts(productsArray);
                setCategories(categoryRes.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load initial data");
            }
        };
        fetchData();

        // Scanner Focus Management
        const handleFocus = () => setIsScannerFocused(true);
        const handleBlur = () => setIsScannerFocused(false);
        const currentInput = barcodeInputRef.current;
        if (currentInput) {
            currentInput.addEventListener("focus", handleFocus);
            currentInput.addEventListener("blur", handleBlur);
            currentInput.focus();
        }
        return () => {
            if (currentInput) {
                currentInput.removeEventListener("focus", handleFocus);
                currentInput.removeEventListener("blur", handleBlur);
            }
        };
    }, []);

    // Global click listener to re-focus scanner
    useEffect(() => {
        const handleClick = (e) => {
            const tagName = e.target.tagName.toLowerCase();
            const ignoreTags = ["input", "textarea", "select", "button"];
            if (!ignoreTags.includes(tagName) && barcodeInputRef.current) {
                barcodeInputRef.current.focus();
            }
        };
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    // Camera Scanner Logic
    useEffect(() => {
        if (showCameraScanner) {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0
            });
            scanner.render((decodedText) => {
                const product = products.find(p => p.product_code === decodedText);
                if (product) {
                    handleProductClick(product);
                    toast.success(`Scanned: ${product.name}`);
                    setShowCameraScanner(false);
                    scanner.clear();
                } else {
                    toast.error(`Product ${decodedText} not found`);
                }
            }, (error) => { });
            return () => { scanner.clear().catch(err => console.error("Scanner clear error", err)); };
        }
    }, [showCameraScanner, products]);

    const filteredProducts = (products || []).filter(p => {
        const matchCat = selectedCategory === "All" || p.category === selectedCategory;
        const matchSearch = (p.name || "").toLowerCase().includes(productSearchTerm.toLowerCase()) || (p.product_code || "").toLowerCase().includes(productSearchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    // Derived State for live search results
    const liveSearchResults = productSearchTerm.trim() !== "" ? filteredProducts.slice(0, 8) : [];

    // Speech Recognition
    const startVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice search not supported in this browser");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setProductSearchTerm(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
    };

    // Handlers
    const handleBarcodeScan = (e) => {
        if (e.key === 'Enter') {
            const code = e.target.value.trim();
            if (code) {
                const product = products.find(p => p.product_code === code);
                if (product) handleProductClick(product);
                else toast.error("Product not found");
                e.target.value = "";
            }
        }
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        if (product.variants && product.variants.length > 0) {
            setShowVariantModal(true);
        } else {
            addItemToBill(product, null);
        }
    };

    const addItemToBill = (product, variant) => {
        const itemId = variant ? `${product.id}-${variant.quantity}-${variant.unit}` : product.id;
        if (formData.items.find(item => item.id === itemId)) {
            toast.error("Item already added");
            return;
        }
        const price = variant ? parseFloat(vPrice(variant)) : parseFloat(product.offer_price || product.price || 0);
        const newItem = {
            id: itemId,
            product_id: product.id,
            name: variant ? `${product.name} (${variant.quantity} ${variant.unit})` : product.name,
            price: price,
            quantity: 1,
            total: price,
            variant_info: variant ? { weight: variant.quantity, unit: variant.unit } : null
        };
        const updatedItems = [...formData.items, newItem];
        updateTotal(updatedItems);
        setShowVariantModal(false);
    };

    const vPrice = (v) => v.sellingPrice || v.mrp || 0;

    const handleRemoveItem = (idx) => {
        const updatedItems = formData.items.filter((_, i) => i !== idx);
        updateTotal(updatedItems);
    };

    const handleQuantityChange = (idx, qty) => {
        const updatedItems = [...formData.items];
        updatedItems[idx].quantity = parseInt(qty) || 1;
        updatedItems[idx].total = updatedItems[idx].price * updatedItems[idx].quantity;
        updateTotal(updatedItems);
    };

    const updateTotal = (items) => {
        const total = items.reduce((sum, item) => sum + item.total, 0);
        setFormData(p => ({ ...p, items, total_amount: total }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customer_name || !formData.customer_phone) return toast.error("Enter customer details");
        if (formData.items.length === 0) return toast.error("Add products to bill");
        setLoading(true);
        try {
            await api.post("/orders", formData);
            toast.success("Bill finalized!");
            setTimeout(() => navigate("/admin/billing"), 1200);
        } catch (error) {
            toast.error("Failed to generate bill");
        } finally {
            setLoading(false);
        }
    };


    const toggleSelectItem = (product) => {
        setSelectedItems(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) return prev.filter(p => p.id !== product.id);
            return [...prev, product];
        });
    };

    const addSelectedToBill = () => {
        selectedItems.forEach(p => {
            if (p.variants && p.variants.length > 0) {
                // For bulk, we'll just add the first variant or default if no selection
                addItemToBill(p, p.variants[0]);
            } else {
                addItemToBill(p, null);
            }
        });
        setSelectedItems([]);
        setSelectMode(false);
        toast.success(`Broadly added ${selectedItems.length} items`);
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-2 md:p-6 bg-slate-50 min-h-screen">
            <input ref={barcodeInputRef} type="text" className="opacity-0 fixed pointer-events-none" onKeyDown={handleBarcodeScan} autoFocus />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-primary transition-all shadow-sm"><FiArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">New Bill</h1>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Quick Billing System</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden lg:block group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <FiSearch size={14} />
                        </div>
                        <input
                            list="product-options"
                            placeholder="Quick Select Product..."
                            onChange={(e) => {
                                const p = products.find(prod => prod.name === e.target.value);
                                if (p) {
                                    handleProductClick(p);
                                    e.target.value = "";
                                }
                            }}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/10 transition-all outline-none w-48"
                        />
                        <datalist id="product-options">
                            {products.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                    </div>


                    <div className="relative hidden lg:block">
                        <select
                            value={selectedProduct}
                            onChange={(e) => {
                                const productId = e.target.value;
                                setSelectedProduct(productId);

                                const p = products.find(prod => prod.id === productId);
                                if (p) {
                                    handleProductClick(p);
                                    setSelectedProduct(""); // reset after adding
                                }
                            }}
                            className="pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/10 transition-all outline-none w-48"
                        >
                            <option value="" disabled>
                                Quick Select Product...
                            </option>

                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button onClick={() => setShowCameraScanner(true)} className="p-3 bg-white border border-rose-100 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2">
                        <FiCamera size={18} /> <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Camera</span>
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Product Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FiUser className="text-primary" /> Customer</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Name" value={formData.customer_name} onChange={(e) => setFormData(p => ({ ...p, customer_name: e.target.value }))} className="w-full px-5 py-3.5 bg-gray-50 rounded-xl focus:bg-white border-2 border-transparent focus:border-rose-100 transition-all text-sm font-bold" />
                            <input type="text" placeholder="Phone" value={formData.customer_phone} onChange={(e) => setFormData(p => ({ ...p, customer_phone: e.target.value }))} className="w-full px-5 py-3.5 bg-gray-50 rounded-xl focus:bg-white border-2 border-transparent focus:border-rose-100 transition-all text-sm font-bold" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FiPackage /> Products</h3>
                                <div className="hidden sm:flex bg-gray-50 p-1 rounded-lg border gap-1">
                                    <button onClick={() => setViewMode("grid")} className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Grid</button>
                                    <button onClick={() => setViewMode("table")} className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Table</button>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectMode(!selectMode);
                                        if (selectMode) setSelectedItems([]);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${selectMode ? 'bg-rose-600 text-white shadow-lg' : 'bg-white border text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {selectMode ? 'Cancel Selection' : 'Select Multiple'}
                                </button>
                                {selectMode && selectedItems.length > 0 && (
                                    <button
                                        onClick={addSelectedToBill}
                                        className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg animate-bounce"
                                    >
                                        Add {selectedItems.length} Items
                                    </button>
                                )}
                            </div>
                            <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-gray-50 rounded-xl">
                                <button onClick={() => setSelectedCategory("All")} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedCategory === 'All' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400'}`}>All</button>
                                {categories.map(c => <button key={c.id} onClick={() => setSelectedCategory(c.name)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedCategory === c.name ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400'}`}>{c.name}</button>)}
                            </div>
                        </div>

                        <div className="flex gap-2 relative">
                            <div className="relative flex-1">
                                <FiSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search product name or code..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white border-2 border-transparent focus:border-rose-100 transition-all text-sm outline-none font-bold"
                                />

                                {/* Live Search Dropdown */}
                                {liveSearchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest px-3">Quick Select</p>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {liveSearchResults.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        handleProductClick(p);
                                                        setProductSearchTerm("");
                                                    }}
                                                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 group text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center p-1 overflow-hidden border border-gray-100">
                                                            <img src={getProductImage(p)} alt="" className="w-full h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase">{p.name}</p>
                                                            <p className="text-[10px] font-black text-gray-400"># {p.product_code}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-slate-800">₹{parseFloat(p.offer_price || p.price || 0)}</p>
                                                        <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">{p.total_stock} Units</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={startVoiceSearch} className={`p-3 rounded-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-500'}`}><FiMic size={18} /></button>
                        </div>

                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {filteredProducts.slice(0, 12).map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => selectMode ? toggleSelectItem(p) : handleProductClick(p)}
                                        className={`p-3 rounded-2xl text-left transition-all border group relative ${selectMode && selectedItems.find(si => si.id === p.id) ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-xl hover:border-rose-100'}`}
                                    >
                                        {selectMode && (
                                            <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedItems.find(si => si.id === p.id) ? 'bg-rose-600 border-rose-600' : 'bg-white border-gray-200'}`}>
                                                {selectedItems.find(si => si.id === p.id) && <FiCheckCircle className="text-white" size={12} />}
                                            </div>
                                        )}
                                        <div className="aspect-square bg-white rounded-xl mb-2 overflow-hidden flex items-center justify-center p-2">
                                            <img
                                                src={getProductImage(p)}
                                                alt={p.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <p className="text-[10px] font-black line-clamp-1 uppercase whitespace-normal">{p.name}</p>
                                        <p className="text-[10px] font-bold text-rose-500 mt-1 italic">₹{parseFloat(p.offer_price || p.price || 0)}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-hidden border rounded-xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50"><tr><th className="px-4 py-2 font-black uppercase text-gray-400">Name</th><th className="px-4 py-2 font-black uppercase text-gray-400">Price</th><th className="px-4 py-2 font-black uppercase text-gray-400">Stock</th><th className="px-4 py-2"></th></tr></thead>
                                    <tbody className="divide-y text-slate-700">
                                        {filteredProducts.slice(0, 15).map(p => (
                                            <tr
                                                key={p.id}
                                                onClick={() => selectMode && toggleSelectItem(p)}
                                                className={`hover:bg-indigo-50 group transition-colors cursor-pointer ${selectMode && selectedItems.find(si => si.id === p.id) ? 'bg-indigo-50/50' : ''}`}
                                            >
                                                <td className="px-4 py-2 font-bold flex items-center gap-3 uppercase">
                                                    {selectMode && (
                                                        <div className={`w-4 h-4 rounded border transition-all ${selectedItems.find(si => si.id === p.id) ? 'bg-indigo-600 border-indigo-600 flex items-center justify-center' : 'bg-white border-gray-300'}`}>
                                                            {selectedItems.find(si => si.id === p.id) && <FiCheckCircle className="text-white" size={10} />}
                                                        </div>
                                                    )}
                                                    {p.name}
                                                </td>
                                                <td className="px-4 py-2 font-black">₹{parseFloat(p.offer_price || p.price || 0)}</td>
                                                <td className="px-4 py-2 text-indigo-400">{p.total_stock} Units</td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleProductClick(p);
                                                        }}
                                                        className="p-1.5 bg-indigo-50 rounded text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
                                                    >
                                                        <FiPlus size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-50"><FiLayers /> Bill Items</h3>
                        <div className="overflow-x-auto min-h-[250px]">
                            <table className="w-full text-left text-xs">
                                <thead className="text-gray-500 border-b border-white/10 uppercase font-black tracking-widest"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Price</th><th className="px-4 py-3 w-16">Qty</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3"></th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr className="bg-white/5 border-none">
                                        <td colSpan={3} className="px-4 py-2"><input type="text" placeholder="Easy Add: Type Name or Code... (Enter)" onKeyDown={(e) => { if (e.key === 'Enter') { const v = e.target.value.trim(); const p = products.find(prod => prod.name.toLowerCase() === v.toLowerCase() || prod.product_code === v); if (p) { handleProductClick(p); e.target.value = ""; } else { toast.error("Product not found"); } } }} className="w-full bg-transparent border-none outline-none text-indigo-300 placeholder:text-gray-600 font-bold" /></td>
                                        <td></td><td></td>
                                    </tr>
                                    {formData.items.length === 0 ? (<tr><td colSpan={5} className="py-20 text-center opacity-30 font-black uppercase tracking-widest">No Items Added</td></tr>) : formData.items.map((item, i) => (
                                        <tr key={item.id} className="hover:bg-white/5 group">
                                            <td className="px-4 py-3"><p className="font-bold leading-none">{item.name}</p>{item.variant_info && <p className="text-[8px] text-indigo-400 uppercase mt-1">Variant: {item.variant_info.weight}{item.variant_info.unit}</p>}</td>
                                            <td className="px-4 py-3 opacity-60">₹{item.price}</td>
                                            <td className="px-4 py-3"><input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(i, e.target.value)} className="w-12 bg-white/10 rounded px-1 text-center py-1 outline-none font-bold" /></td>
                                            <td className="px-4 py-3 text-right font-black">₹{item.total}</td>
                                            <td className="px-4 py-3 text-center"><button onClick={() => handleRemoveItem(i)} className="text-red-400 hover:text-red-500"><FiTrash2 size={14} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-6 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400 tracking-widest"><span>Subtotal</span> <span className="text-slate-800">₹{formData.total_amount}</span></div>
                            <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400 tracking-widest"><span>Items</span> <span className="text-slate-800">{formData.items.reduce((s, i) => s + i.quantity, 0)}</span></div>
                            <div className="flex justify-between items-center text-xs font-black uppercase text-emerald-500 tracking-widest"><span>Tax (0%)</span> <span className="text-emerald-600">₹0</span></div>
                        </div>
                        <div className="pt-8 border-t border-gray-50"><p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-2 text-center text-rose-400">Grand Total</p><h2 className="text-5xl font-black text-center text-slate-800 tracking-tighter italic">₹{formData.total_amount}</h2></div>
                        <button onClick={handleSubmit} disabled={loading || formData.items.length === 0} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-rose-100 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-3">
                            {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <><FiCheckCircle size={22} /> <span>Finish Bill</span></>}
                        </button>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showVariantModal && selectedProduct && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center"><div><h3 className="font-black text-slate-800 text-sm">Select Variant</h3><p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{selectedProduct.name}</p></div><button onClick={() => setShowVariantModal(false)} className="text-gray-400"><FiX size={20} /></button></div>
                        <div className="p-4 space-y-2">
                            {selectedProduct.variants?.map((v, i) => (
                                <button key={i} onClick={() => addItemToBill(selectedProduct, v)} className="w-full p-4 bg-gray-50 rounded-xl flex justify-between items-center hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all">
                                    <div className="text-left"><p className="font-bold text-xs">{v.quantity} {v.unit}</p><p className="text-[8px] font-black uppercase text-gray-400">Stock: {v.stock}</p></div>
                                    <p className="font-black text-indigo-600 text-sm">₹{v.sellingPrice || v.mrp}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showCameraScanner && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden relative shadow-2xl">
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center"><div><h3 className="font-black">Camera Scanner</h3><p className="text-[8px] uppercase tracking-[0.2em] opacity-70">Focus on product barcode</p></div><button onClick={() => setShowCameraScanner(false)} className="bg-white/20 p-2 rounded-xl"><FiX /></button></div>
                        <div className="p-4 bg-slate-100"><div id="reader" className="w-full aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-inner bg-black"></div></div>
                        <div className="p-6 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Ensure good lighting and hold steady</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateBilling;
