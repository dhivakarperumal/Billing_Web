// import axios from "axios";
// import { toast } from "react-hot-toast";
// import imageCompression from "browser-image-compression";
// import { useParams, useNavigate } from "react-router-dom";
// import JsBarcode from "jsbarcode";
// import { transliterateToTamil } from "../../utils/tamilPhonetic";
// import { getTamilProductName } from "../../utils/tamilProductNames";
// import {
//   FiPackage,
//   FiTag,
//   FiPercent,
//   FiTruck,
//   FiCalendar,
//   FiImage,
//   FiPlus,
//   FiTrash2,
//   FiCheckCircle,
//   FiInfo,
//   FiTrendingUp,
//   FiBox,
//   FiMaximize2,
// } from "react-icons/fi";

// const AddProducts = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEdit = !!id;
//   const barcodeRef = useRef(null);

//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   const [formData, setFormData] = useState({
//     product_code: "",
//     name: "",
//     name_tamil: "",
//     description: "",
//     rating: "",
//     category: "",
//     subCategory: "",
//     status: "Active",
//     total_stock: "",

//     pricing: { mrp: "", discount: "", sellingPrice: "" },

//     variants: [
//       {
//         quantity: "",
//         unit: "",
//         mrp: "",
//         discount: "",
//         sellingPrice: "",
//         stock: "",
//       },
//     ],

//     expiry: { mfgDate: "", expDate: "", batchNo: "" },
//     supplier: { name: "", contact: "" },
//     media: { images: [], previews: [] },
//   });

//   // Fetch Next ID for New Products
//   useEffect(() => {
//     if (!isEdit) {
//       const fetchNextId = async () => {
//         try {
//           const res = await axios.get(
//             "http://localhost:5000/api/products/next-id",
//           );
//           setFormData((prev) => ({ ...prev, product_code: res.data.nextId }));
//         } catch (err) {
//           console.error("Error fetching next ID:", err);
//         }
//       };
//       fetchNextId();
//     }
//   }, [isEdit]);

//   // Fetch Categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/categories");
//         setCategories(res.data);

//         if (isEdit) {
//           fetchProductData(res.data);
//         }
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//       }
//     };
//     fetchCategories();
//   }, [id]);

//   const fetchProductData = async (allCategories) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`http://localhost:5000/api/products/${id}`);
//       const product = res.data;

//       setFormData({
//         product_code: product.product_code || "",
//         name: product.name || "",
//         name_tamil: product.name_tamil || (product.name ? (getTamilProductName(product.name) || transliterateToTamil(product.name)) : ""),
//         description: product.description || "",
//         rating: product.rating || "",
//         category: product.category || "",
//         subCategory: product.subcategory || product.subCategory || "", // Handle both names
//         status: product.status || "Active",
//         total_stock: product.total_stock || "0",
//         pricing: {
//           mrp: product.mrp || "",
//           discount: product.discount || "",
//           sellingPrice: product.offer_price || "",
//         },
//         variants:
//           product.variants && product.variants.length > 0
//             ? product.variants
//             : [
//                 {
//                   quantity: "",
//                   unit: "",
//                   mrp: "",
//                   discount: "",
//                   sellingPrice: "",
//                   stock: "",
//                 },
//               ],
//         expiry: product.expiry || { mfgDate: "", expDate: "", batchNo: "" },
//         supplier: product.supplier || { name: "", contact: "" },
//         media: {
//           images: product.images || [],
//           previews: product.images || [],
//         },
//       });

//       if (product.category && allCategories) {
//         const cat = allCategories.find((c) => c.name === product.category);
//         setSelectedCategory(cat);
//       }
//     } catch (err) {
//       console.error("Error fetching product:", err);
//       toast.error("Failed to load product data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update Barcode
//   useEffect(() => {
//     if (barcodeRef.current && formData.product_code) {
//       try {
//         JsBarcode(barcodeRef.current, formData.product_code, {
//           format: "CODE128",
//           lineColor: "#1e293b",
//           width: 2,
//           height: 50,
//           displayValue: true,
//           fontSize: 14,
//           margin: 10,
//         });
//       } catch (err) {
//         console.error("Barcode generation error:", err);
//       }
//     }
//   }, [formData.product_code]);

//   // Update Total Stock
//   useEffect(() => {
//     const total = formData.variants.reduce(
//       (acc, v) => acc + (Number(v.stock) || 0),
//       0,
//     );
//     setFormData((prev) => ({ ...prev, total_stock: total }));
//   }, [formData.variants]);

//   // Update logic when mrp/discount changes
//   useEffect(() => {
//     const { mrp, discount } = formData.pricing;
//     if (mrp && discount !== "") {
//       const selling = Number(mrp) - (Number(mrp) * Number(discount)) / 100;
//       setFormData((prev) => ({
//         ...prev,
//         pricing: { ...prev.pricing, sellingPrice: selling.toFixed(2) },
//       }));
//     }
//   }, [formData.pricing.mrp, formData.pricing.discount]);

//   const handleChange = (e, section = null) => {
//     const { name, value } = e.target;

//     if (section) {
//       setFormData((prev) => ({
//         ...prev,
//         [section]: { ...prev[section], [name]: value },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//         // If the user is typing the product name, first check for proper Tamil translation,
//         // then fall back to phonetic transliteration
//         ...(name === "name" ? { 
//           name_tamil: getTamilProductName(value) || transliterateToTamil(value) 
//         } : {}),
//       }));
//     }

//     if (name === "category") {
//       const cat = categories.find((c) => c.name === value);
//       setSelectedCategory(cat);
//       setFormData((prev) => ({ ...prev, subCategory: "" }));
//     }
//   };

//   const handleVariantChange = (i, field, value) => {
//     const updated = [...formData.variants];
//     updated[i][field] = value;

//     // Better Auto-fill stock from weight (quantity)
//     if (field === "quantity") {
//       const currentStock = updated[i].stock;
//       const prevWeight = formData.variants[i].quantity;
//       if (
//         currentStock === "" ||
//         currentStock === "0" ||
//         currentStock === prevWeight
//       ) {
//         updated[i].stock = value;
//       }
//     }

//     if (field === "mrp" || field === "discount") {
//       const mrp = Number(updated[i].mrp);
//       const discount = Number(updated[i].discount);
//       if (mrp && discount >= 0) {
//         updated[i].sellingPrice = (mrp - (mrp * discount) / 100).toFixed(2);
//       }
//     }

//     setFormData({ ...formData, variants: updated });
//   };

//   const addVariant = () => {
//     setFormData((prev) => ({
//       ...prev,
//       variants: [
//         ...prev.variants,
//         {
//           quantity: "",
//           unit: "",
//           mrp: "",
//           discount: "",
//           sellingPrice: "",
//           stock: "",
//         },
//       ],
//     }));
//   };

//   const removeVariant = (i) => {
//     setFormData({
//       ...formData,
//       variants: formData.variants.filter((_, index) => index !== i),
//     });
//   };

//   const handleImageUpload = async (e) => {
//     const files = Array.from(e.target.files).slice(0, 5);
//     const compressedImages = [];
//     const previews = [];

//     setLoading(true);

//     for (let file of files) {
//       try {
//         const options = {
//           maxSizeMB: 5, // Max 5MB
//           maxWidthOrHeight: 1920,
//           useWebWorker: true,
//         };

//         const compressedFile = await imageCompression(file, options);

//         // Convert to base64
//         const base64 =
//           await imageCompression.getDataUrlFromFile(compressedFile);

//         compressedImages.push(base64);
//         previews.push(base64);
//       } catch (error) {
//         console.error("Image compression error:", error);
//       }
//     }

//     setFormData((prev) => ({
//       ...prev,
//       media: {
//         images: compressedImages,
//         previews,
//       },
//     }));
//     setLoading(false);
//   };

//   const removeImage = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       media: {
//         images: prev.media.images.filter((_, i) => i !== index),
//         previews: prev.media.previews.filter((_, i) => i !== index),
//       },
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const payload = {
//         product_code: formData.product_code,
//         name: formData.name,
//         name_tamil: formData.name_tamil,
//         description: formData.description,
//         rating: formData.rating,
//         category: formData.category,
//         subCategory: formData.subCategory,
//         status: formData.status,
//         total_stock: formData.total_stock,
//         mrp: formData.pricing.mrp,
//         offer_price: formData.pricing.sellingPrice,
//         variants: formData.variants,
//         expiry: formData.expiry,
//         supplier: formData.supplier,
//         images: formData.media.images,
//       };

//       if (isEdit) {
//         await axios.put(`http://localhost:5000/api/products/${id}`, payload);
//         toast.success("Product updated successfully!");
//       } else {
//         await axios.post("http://localhost:5000/api/products", payload);
//         toast.success("Product added successfully!");
//       }
//       navigate("/admin/products/all");
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to save product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#FDFDFF] p-4 lg:p-8">
//       <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* LEFT COLUMN: Main Info */}
//           <div className="lg:col-span-2 space-y-8">
//             <FormSection
//               title="Core Details"
//               icon={<FiInfo className="text-blue-500" />}
//             >
//               <div className="space-y-6">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <FormInput
//                     label="Product Name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="e.g. Organic Brown Rice"
//                     required
//                   />
//                   <FormInput
//                     label="Product Code / Barcode"
//                     name="product_code"
//                     value={formData.product_code}
//                     onChange={handleChange}
//                     placeholder="PB001"
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//                     Generated Barcode Preview
//                   </label>
//                   <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[80px]">
//                     <svg ref={barcodeRef}></svg>
//                   </div>
//                 </div>
//                 <FormTextArea
//                   label="Description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   placeholder="Describe your product in detail..."
//                 />

//                 <div className="grid md:grid-cols-3 gap-6">
//                   <FormSelect
//                     label="Primary Category"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleChange}
//                     options={categories.map((c) => c.name)}
//                   />
//                   <FormSelect
//                     label="Sub-Category"
//                     name="subCategory"
//                     value={formData.subCategory}
//                     onChange={handleChange}
//                     options={selectedCategory?.subcategories || []}
//                     disabled={!formData.category}
//                   />
//                   <FormInput
//                     label="Rating (1-5)"
//                     name="rating"
//                     type="number"
//                     step="0.1"
//                     max="5"
//                     min="0"
//                     value={formData.rating}
//                     onChange={handleChange}
//                     placeholder="4.5"
//                   />
//                 </div>
//               </div>
//             </FormSection>

//             <FormSection
//               title="Pricing & Stock"
//               icon={<FiTrendingUp className="text-emerald-500" />}
//             >
//               <div className="grid md:grid-cols-3 gap-6">
//                 <FormInput
//                   label="MRP (Base Price)"
//                   name="mrp"
//                   type="number"
//                   value={formData.pricing.mrp}
//                   onChange={(e) => handleChange(e, "pricing")}
//                   placeholder="0.00"
//                   icon="₹"
//                 />
//                 <FormInput
//                   label="Offer (%)"
//                   name="discount"
//                   type="number"
//                   value={formData.pricing.discount}
//                   onChange={(e) => handleChange(e, "pricing")}
//                   placeholder="0"
//                   icon="%"
//                 />
//                 <FormInput
//                   label="Offer Price"
//                   name="sellingPrice"
//                   value={formData.pricing.sellingPrice}
//                   readOnly
//                   placeholder="0.00"
//                   icon="₹"
//                   className="bg-gray-50"
//                 />
//               </div>
//               {/* <div className="mt-6 grid md:grid-cols-2 gap-6">
//                                 <FormInput label="Total Stock Available" name="total_stock" value={formData.total_stock} readOnly placeholder="0" className="bg-gray-50 font-bold text-rose-600" />
//                                 <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange} options={["Active", "Inactive", "Low Stock", "Out of Stock"]} />
//                             </div> */}
//             </FormSection>
//           </div>

//           {/* RIGHT COLUMN: Sidebar Info */}
//           <div className="space-y-8">
//             <FormSection
//               title="Media Assets"
//               icon={<FiImage className="text-orange-500" />}
//             >
//               <div className="space-y-4">
//                 <div className="relative h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
//                   <input
//                     type="file"
//                     multiple
//                     onChange={handleImageUpload}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   />
//                   <FiImage size={32} className="text-gray-300 mb-2" />
//                   <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
//                     Click to Upload Images
//                   </span>
//                   <span className="text-[10px] text-gray-300 mt-1">
//                     Up to 5 images. Max 0.2MB each.
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   {formData.media.previews.map((src, i) => (
//                     <div
//                       key={i}
//                       className="relative group rounded-xl overflow-hidden aspect-square border border-gray-100 shadow-sm"
//                     >
//                       <img
//                         src={(() => {
//                           if (!src)
//                             return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "P")}&background=random&color=fff`;
//                           if (
//                             src.startsWith("data:image") ||
//                             src.startsWith("http")
//                           )
//                             return src;
//                           const backendUrl =
//                             import.meta.env.VITE_BACKEND_URL ||
//                             "http://localhost:5000";
//                           return `${backendUrl}${src.startsWith("/") ? src : `/${src}`}`;
//                         })()}
//                         className="h-full w-full object-cover"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(i)}
//                         className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
//                       >
//                         <FiTrash2 size={12} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </FormSection>

//             <FormSection
//               title="Expiry & Supplier"
//               icon={<FiCalendar className="text-yellow-500" />}
//             >
//               <div className="space-y-6">
//                 <div>
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
//                     Shelf Life Details
//                   </label>
//                   <div className="grid grid-cols-2 gap-4">
//                     <FormInput
//                       label="MFG Date"
//                       name="mfgDate"
//                       type="date"
//                       value={formData.expiry.mfgDate}
//                       onChange={(e) => handleChange(e, "expiry")}
//                     />
//                     <FormInput
//                       label="EXP Date"
//                       name="expDate"
//                       type="date"
//                       value={formData.expiry.expDate}
//                       onChange={(e) => handleChange(e, "expiry")}
//                     />
//                   </div>
//                   <div className="mt-4">
//                     <FormInput
//                       label="Batch Number"
//                       name="batchNo"
//                       value={formData.expiry.batchNo}
//                       onChange={(e) => handleChange(e, "expiry")}
//                       placeholder="B-882-X"
//                     />
//                   </div>
//                 </div>

//                 <div className="pt-6 border-t border-gray-100">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
//                     Supplier Information
//                   </label>
//                   <FormInput
//                     label="Supplier Name"
//                     name="name"
//                     value={formData.supplier.name}
//                     onChange={(e) => handleChange(e, "supplier")}
//                     placeholder="WholeSale Corp"
//                   />
//                   <div className="mt-4">
//                     <FormInput
//                       label="Contact Info"
//                       name="contact"
//                       value={formData.supplier.contact}
//                       onChange={(e) => handleChange(e, "supplier")}
//                       placeholder="+91 98765 43210"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </FormSection>
//           </div>
//         </div>
//         <FormSection
//           title="Product Variants"
//           icon={<FiBox className="text-purple-500" />}
//         >
//           <div className="space-y-4">
//             {formData.variants.map((v, i) => (
//               <div
//                 key={i}
//                 className="group relative bg-[#F8F9FF] p-5 rounded-2xl border border-rose-50 grid md:grid-cols-7 gap-4 items-end"
//               >
//                 <FormInput
//                   label="Weight"
//                   value={v.quantity}
//                   onChange={(e) =>
//                     handleVariantChange(i, "quantity", e.target.value)
//                   }
//                   placeholder="e.g. 500"
//                   className="bg-white"
//                 />
//                 <FormSelect
//                   label="Unit"
//                   value={v.unit}
//                   onChange={(e) =>
//                     handleVariantChange(i, "unit", e.target.value)
//                   }
//                   options={["kg", "g", "mg", "L", "ml", "pcs", "box", "pack"]}
//                   className="bg-white"
//                 />
//                 <FormInput
//                   label="MRP"
//                   value={v.mrp}
//                   onChange={(e) =>
//                     handleVariantChange(i, "mrp", e.target.value)
//                   }
//                   placeholder="0"
//                   className="bg-white"
//                 />
//                 <FormInput
//                   label="Offer (%)"
//                   value={v.discount}
//                   onChange={(e) =>
//                     handleVariantChange(i, "discount", e.target.value)
//                   }
//                   placeholder="0"
//                   className="bg-white"
//                 />
//                 <FormInput
//                   label="Offer Price"
//                   value={v.sellingPrice}
//                   readOnly
//                   placeholder="0"
//                   className="bg-white"
//                 />
//                 <FormInput
//                   label="Stock"
//                   value={v.stock}
//                   onChange={(e) =>
//                     handleVariantChange(i, "stock", e.target.value)
//                   }
//                   placeholder="0"
//                   className="bg-white"
//                 />
//                 <div className="flex items-center gap-2">
//                   {formData.variants.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeVariant(i)}
//                       className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
//                     >
//                       <FiTrash2 size={18} />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={addVariant}
//               className="w-full py-4 border-2 border-dashed border-rose-100 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
//             >
//               <FiPlus /> Add more variants (Size, Weight, Pack)
//             </button>
//             <div className="mt-6 grid md:grid-cols-2 gap-6">
//               <FormInput
//                 label="Total Stock Available"
//                 name="total_stock"
//                 value={formData.total_stock}
//                 readOnly
//                 placeholder="0"
//                 className="bg-gray-50 font-bold text-rose-600"
//               />
//               <FormSelect
//                 label="Status"
//                 name="status"
//                 value={formData.status}
//                 onChange={handleChange}
//                 options={["Active", "Inactive", "Low Stock", "Out of Stock"]}
//               />
//             </div>
//           </div>
//         </FormSection>
//         {/* FORM ACTION BUTTONS */}
//         <div className="sticky bottom-0 bg-[#FDFDFF] pt-6">
//           <div className="max-w-6xl mx-auto flex justify-end gap-4 border-t border-gray-200 pt-4">
//             <button
//               type="button"
//               onClick={() => navigate("/admin/products/all")}
//               className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-100 transition-all flex items-center gap-2 disabled:opacity-50"
//             >
//               {loading ? (
//                 "Saving..."
//               ) : (
//                 <>
//                   <FiCheckCircle />
//                   {isEdit ? "Update Product" : "Publish Product"}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// /* COMPONENT PARTS */

// const FormSection = ({ title, icon, children }) => (
//   <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
//     <div className="flex items-center gap-3 mb-8">
//       <div className="p-2.5 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
//         {icon}
//       </div>
//       <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
//         {title}
//       </h3>
//     </div>
//     {children}
//   </div>
// );

// const FormInput = ({ label, icon, ...props }) => (
//   <div className="flex flex-col gap-2.5">
//     {label && (
//       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//         {label}
//       </label>
//     )}
//     <div className="relative">
//       {icon && (
//         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
//           {icon}
//         </span>
//       )}
//       <input
//         {...props}
//         className={`w-full ${icon ? "pl-8" : "px-5"} py-4 bg-[#F8F9FF] border-2 border-transparent rounded-[1.25rem] focus:border-rose-100 focus:bg-white focus:outline-none text-sm font-semibold text-slate-700 transition-all placeholder:text-gray-300 ${props.className || ""}`}
//       />
//     </div>
//   </div>
// );

// const FormTextArea = ({ label, ...props }) => (
//   <div className="flex flex-col gap-2.5">
//     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//       {label}
//     </label>
//     <textarea
//       {...props}
//       rows="4"
//       className="w-full px-5 py-4 bg-[#F8F9FF] border-2 border-transparent rounded-[1.25rem] focus:border-rose-100 focus:bg-white focus:outline-none text-sm font-semibold text-slate-700 transition-all placeholder:text-gray-300"
//     />
//   </div>
// );

// const FormSelect = ({ label, options, ...props }) => (
//   <div className="flex flex-col gap-2.5">
//     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//       {label}
//     </label>
//     <div className="relative">
//       <select
//         {...props}
//         className={`w-full px-5 pr-12 py-4 bg-[#F8F9FF] border-2 border-transparent rounded-[1.25rem] focus:border-rose-100 focus:bg-white focus:outline-none text-sm font-semibold text-slate-700 transition-all appearance-none cursor-pointer ${props.className || ""}`}
//       >
//         <option value="">Choose Options</option>
//         {options.map((opt, i) => (
//           <option key={i} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </select>

//       <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
//         ▼
//       </span>
//     </div>
//   </div>
// );

// export default AddProducts;


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { useParams, useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import { transliterateToTamil } from "../../utils/tamilPhonetic";
import { getTamilProductName } from "../../utils/tamilProductNames";
import {
  FiPackage,
  FiTag,
  FiPercent,
  FiTruck,
  FiCalendar,
  FiImage,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiInfo,
  FiTrendingUp,
  FiBox,
  FiMaximize2,
} from "react-icons/fi";

const AddProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const barcodeRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    product_code: "",
    name: "",
    name_tamil: "",
    description: "",
    rating: "",
    category: "",
    subCategory: "",
    status: "Active",
    total_stock: "",

    pricing: { mrp: "", discount: "", sellingPrice: "" },

    variants: [
      {
        quantity: "",
        unit: "",
        mrp: "",
        discount: "",
        sellingPrice: "",
        stock: "",
      },
    ],

    expiry: { mfgDate: "", expDate: "", batchNo: "" },
    supplier: { name: "", contact: "" },
    media: { images: [], previews: [] },
  });

  // Fetch Next ID for New Products
  useEffect(() => {
    if (!isEdit) {
      const fetchNextId = async () => {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/products/next-id",
          );
          setFormData((prev) => ({ ...prev, product_code: res.data.nextId }));
        } catch (err) {
          console.error("Error fetching next ID:", err);
        }
      };
      fetchNextId();
    }
  }, [isEdit]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(res.data);

        if (isEdit) {
          fetchProductData(res.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [id]);

  const fetchProductData = async (allCategories) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      const product = res.data;

      setFormData({
        product_code: product.product_code || "",
        name: product.name || "",
        name_tamil: product.name_tamil || (product.name ? (getTamilProductName(product.name) || transliterateToTamil(product.name)) : ""),
        description: product.description || "",
        rating: product.rating || "",
        category: product.category || "",
        subCategory: product.subcategory || product.subCategory || "", // Handle both names
        status: product.status || "Active",
        total_stock: product.total_stock || "0",
        pricing: {
          mrp: product.mrp || "",
          discount: product.discount || "",
          sellingPrice: product.offer_price || "",
        },
        variants:
          product.variants && product.variants.length > 0
            ? product.variants
            : [
              {
                quantity: "",
                unit: "",
                mrp: "",
                discount: "",
                sellingPrice: "",
                stock: "",
              },
            ],
        expiry: product.expiry || { mfgDate: "", expDate: "", batchNo: "" },
        supplier: product.supplier || { name: "", contact: "" },
        media: {
          images: product.images?.map((img) =>
            img.startsWith("data:image") ? img : img
          ) || [],
          previews: product.images?.map((img) =>
            img.startsWith("data:image") ? img : img
          ) || [],
        },
      });

      if (product.category && allCategories) {
        const cat = allCategories.find((c) => c.name === product.category);
        setSelectedCategory(cat);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      toast.error("Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  // Update Barcode
  useEffect(() => {
    if (barcodeRef.current && formData.product_code) {
      try {
        JsBarcode(barcodeRef.current, formData.product_code, {
          format: "CODE128",
          lineColor: "#1e293b",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (err) {
        console.error("Barcode generation error:", err);
      }
    }
  }, [formData.product_code]);

  // Update Total Stock
  useEffect(() => {
    const total = formData.variants.reduce(
      (acc, v) => acc + (Number(v.stock) || 0),
      0,
    );
    setFormData((prev) => ({ ...prev, total_stock: total }));
  }, [formData.variants]);

  // Update logic when mrp/discount changes
  useEffect(() => {
    const { mrp, discount } = formData.pricing;
    if (mrp && discount !== "") {
      const selling = Number(mrp) - (Number(mrp) * Number(discount)) / 100;
      setFormData((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, sellingPrice: selling.toFixed(2) },
      }));
    }
  }, [formData.pricing.mrp, formData.pricing.discount]);

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // If the user is typing the product name, first check for proper Tamil translation,
        // then fall back to phonetic transliteration
        ...(name === "name" ? {
          name_tamil: getTamilProductName(value) || transliterateToTamil(value)
        } : {}),
      }));
    }

    if (name === "category") {
      const cat = categories.find((c) => c.name === value);
      setSelectedCategory(cat);
      setFormData((prev) => ({ ...prev, subCategory: "" }));
    }
  };

  const handleVariantChange = (i, field, value) => {
    const updated = [...formData.variants];
    updated[i][field] = value;

    // Better Auto-fill stock from weight (quantity)
    if (field === "quantity") {
      const currentStock = updated[i].stock;
      const prevWeight = formData.variants[i].quantity;
      if (
        currentStock === "" ||
        currentStock === "0" ||
        currentStock === prevWeight
      ) {
        updated[i].stock = value;
      }
    }

    if (field === "mrp" || field === "discount") {
      const mrp = Number(updated[i].mrp);
      const discount = Number(updated[i].discount);
      if (mrp && discount >= 0) {
        updated[i].sellingPrice = (mrp - (mrp * discount) / 100).toFixed(2);
      }
    }

    setFormData({ ...formData, variants: updated });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          quantity: "",
          unit: "",
          mrp: "",
          discount: "",
          sellingPrice: "",
          stock: "",
        },
      ],
    }));
  };

  const removeVariant = (i) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, index) => index !== i),
    });
  };

  // const handleImageUpload = async (e) => {
  //   const files = Array.from(e.target.files).slice(0, 5);
  //   const compressedImages = [];
  //   const previews = [];

  //   setLoading(true);

  //   for (let file of files) {
  //     try {
  //       const options = {
  //         maxSizeMB: 5, // Max 5MB
  //         maxWidthOrHeight: 1920,
  //         useWebWorker: true,
  //       };

  //       const compressedFile = await imageCompression(file, options);

  //       // Convert to base64
  //       const base64 =
  //         await imageCompression.getDataUrlFromFile(compressedFile);

  //       compressedImages.push(base64);
  //       previews.push(base64);
  //     } catch (error) {
  //       console.error("Image compression error:", error);
  //     }
  //   }

  //   setFormData((prev) => ({
  //     ...prev,
  //     media: {
  //       images: compressedImages,
  //       previews,
  //     },
  //   }));
  //   setLoading(false);
  // };


  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // limit to 5 images total
    if (formData.media.images.length + files.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }

    try {
      setLoading(true);

      const imagesArray = await Promise.all(
        files.map(async (file) => {
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 600,
            useWebWorker: true,
          };

          const compressed = await imageCompression(file, options);

          // ✅ ALWAYS BASE64
          return await imageCompression.getDataUrlFromFile(compressed);
        })
      );

      setFormData((prev) => ({
        ...prev,
        media: {
          images: [...prev.media.images, ...imagesArray],   // ✅ base64 only
          previews: [...prev.media.previews, ...imagesArray], // ✅ same
        },
      }));

      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        images: prev.media.images.filter((_, i) => i !== index),
        previews: prev.media.previews.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        product_code: formData.product_code,
        name: formData.name,
        name_tamil: formData.name_tamil,
        description: formData.description,
        rating: formData.rating,
        category: formData.category,
        subCategory: formData.subCategory,
        status: formData.status,
        total_stock: formData.total_stock,
        mrp: formData.pricing.mrp,
        offer_price: formData.pricing.sellingPrice,
        variants: formData.variants,
        expiry: formData.expiry,
        supplier: formData.supplier,
        images: formData.media.images,
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/products/${id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/products", payload);
        toast.success("Product added successfully!");
      }
      navigate("/products/all");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <FormSection
              title="Core Details"
              icon={<FiInfo className="text-blue-500" />}
            >
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <FormInput
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Organic Brown Rice"
                    required
                  />
                  <FormInput
                    label="Tamil Name"
                    name="name_tamil"
                    value={formData.name_tamil}
                    onChange={handleChange}
                    placeholder="e.g. ஆர்கானிக் பிரவுன் ரைஸ்"
                  />
                  <FormInput
                    label="Product Code / Barcode"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleChange}
                    placeholder="PB001"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Generated Barcode Preview
                  </label>
                  <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[80px]">
                    <svg ref={barcodeRef}></svg>
                  </div>
                </div>
                <FormTextArea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product in detail..."
                />

                <div className="grid md:grid-cols-3 gap-6">
                  <FormSelect
                    label="Primary Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={categories.map((c) => c.name)}
                  />
                  <FormSelect
                    label="Sub-Category"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    options={selectedCategory?.subcategories || []}
                    disabled={!formData.category}
                  />
                  <FormInput
                    label="Rating (1-5)"
                    name="rating"
                    type="number"
                    step="0.1"
                    max="5"
                    min="0"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Pricing & Stock"
              icon={<FiTrendingUp className="text-emerald-500" />}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <FormInput
                  label="MRP (Base Price)"
                  name="mrp"
                  type="number"
                  value={formData.pricing.mrp}
                  onChange={(e) => handleChange(e, "pricing")}
                  placeholder="0.00"
                  icon="₹"
                />
                <FormInput
                  label="Offer (%)"
                  name="discount"
                  type="number"
                  value={formData.pricing.discount}
                  onChange={(e) => handleChange(e, "pricing")}
                  placeholder="0"
                  icon="%"
                />
                <FormInput
                  label="Offer Price"
                  name="sellingPrice"
                  value={formData.pricing.sellingPrice}
                  readOnly
                  placeholder="0.00"
                  icon="₹"
                  className="bg-gray-50"
                />
              </div>
              {/* <div className="mt-6 grid md:grid-cols-2 gap-6">
                                <FormInput label="Total Stock Available" name="total_stock" value={formData.total_stock} readOnly placeholder="0" className="bg-gray-50 font-bold text-rose-600" />
                                <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange} options={["Active", "Inactive", "Low Stock", "Out of Stock"]} />
                            </div> */}
            </FormSection>
          </div>

          {/* RIGHT COLUMN: Sidebar Info */}
          <div className="space-y-8">
            <FormSection
              title="Media Assets"
              icon={<FiImage className="text-orange-500" />}
            >
              <div className="space-y-4">
                <div className="relative h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FiImage size={32} className="text-gray-300 mb-2" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Click to Upload Images
                  </span>
                  <span className="text-[10px] text-gray-300 mt-1">
                    Up to 5 images. Max 0.2MB each.
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {formData.media.previews.map((src, i) => (
                    <div
                      key={i}
                      className="relative group rounded-xl overflow-hidden aspect-square border border-gray-100 shadow-sm"
                    >
                      <img
                        src={(() => {
                          if (!src)
                            return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "P")}&background=random&color=fff`;
                          if (
                            src.startsWith("data:image") ||
                            src.startsWith("http")
                          )
                            return src;
                          const backendUrl =
                            import.meta.env.VITE_BACKEND_URL ||
                            "http://localhost:5000";
                          return `${backendUrl}${src.startsWith("/") ? src : `/${src}`}`;
                        })()}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Expiry & Supplier"
              icon={<FiCalendar className="text-yellow-500" />}
            >
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
                    Shelf Life Details
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="MFG Date"
                      name="mfgDate"
                      type="date"
                      value={formData.expiry.mfgDate}
                      onChange={(e) => handleChange(e, "expiry")}
                    />
                    <FormInput
                      label="EXP Date"
                      name="expDate"
                      type="date"
                      value={formData.expiry.expDate}
                      onChange={(e) => handleChange(e, "expiry")}
                    />
                  </div>
                  <div className="mt-4">
                    <FormInput
                      label="Batch Number"
                      name="batchNo"
                      value={formData.expiry.batchNo}
                      onChange={(e) => handleChange(e, "expiry")}
                      placeholder="B-882-X"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
                    Supplier Information
                  </label>
                  <FormInput
                    label="Supplier Name"
                    name="name"
                    value={formData.supplier.name}
                    onChange={(e) => handleChange(e, "supplier")}
                    placeholder="WholeSale Corp"
                  />
                  <div className="mt-4">
                    <FormInput
                      label="Contact Info"
                      name="contact"
                      value={formData.supplier.contact}
                      onChange={(e) => handleChange(e, "supplier")}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          </div>
        </div>
        <FormSection
          title="Product Variants"
          icon={<FiBox className="text-purple-500" />}
        >
          <div className="space-y-4">
            {formData.variants.map((v, i) => (
              <div
                key={i}
                className="group relative bg-[#F8F9FF] p-5 rounded-2xl border border-rose-50 grid md:grid-cols-7 gap-4 items-end"
              >
                <FormInput
                  label="Weight"
                  value={v.quantity}
                  onChange={(e) =>
                    handleVariantChange(i, "quantity", e.target.value)
                  }
                  placeholder="e.g. 500"
                  className="bg-white"
                />
                <FormSelect
                  label="Unit"
                  value={v.unit}
                  onChange={(e) =>
                    handleVariantChange(i, "unit", e.target.value)
                  }
                  options={["kg", "g", "mg", "L", "ml", "pcs", "box", "pack"]}
                  className="bg-white"
                />
                <FormInput
                  label="MRP"
                  value={v.mrp}
                  onChange={(e) =>
                    handleVariantChange(i, "mrp", e.target.value)
                  }
                  placeholder="0"
                  className="bg-white"
                />
                <FormInput
                  label="Offer (%)"
                  value={v.discount}
                  onChange={(e) =>
                    handleVariantChange(i, "discount", e.target.value)
                  }
                  placeholder="0"
                  className="bg-white"
                />
                <FormInput
                  label="Offer Price"
                  value={v.sellingPrice}
                  readOnly
                  placeholder="0"
                  className="bg-white"
                />
                <FormInput
                  label="Stock"
                  value={v.stock}
                  onChange={(e) =>
                    handleVariantChange(i, "stock", e.target.value)
                  }
                  placeholder="0"
                  className="bg-white"
                />
                <div className="flex items-center gap-2">
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariant}
              className="w-full py-4 border-2 border-dashed border-rose-100 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
            >
              <FiPlus /> Add more variants (Size, Weight, Pack)
            </button>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <FormInput
                label="Total Stock Available"
                name="total_stock"
                value={formData.total_stock}
                readOnly
                placeholder="0"
                className="bg-gray-50 font-bold text-rose-600"
              />
              <FormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={["Active", "Inactive", "Low Stock", "Out of Stock"]}
              />
            </div>
          </div>
        </FormSection>
        {/* FORM ACTION BUTTONS */}
        <div className="sticky bottom-0 bg-[#FDFDFF] pt-6">
          <div className="max-w-6xl mx-auto flex justify-end gap-4 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => navigate("/products/all")}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-100 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <FiCheckCircle />
                  {isEdit ? "Update Product" : "Publish Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

/* COMPONENT PARTS */

const FormSection = ({ title, icon, children }) => (
  <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2.5 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const FormInput = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-2.5">
    {label && (
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full ${icon ? "pl-8" : "px-5"} py-4 bg-[#F8F9FF] border-2 border-transparent rounded-[1.25rem] focus:border-rose-100 focus:bg-white focus:outline-none text-sm font-semibold text-slate-700 transition-all placeholder:text-gray-300 ${props.className || ""}`}
      />
    </div>
  </div>
);

const FormTextArea = ({ label, ...props }) => (
  <div className="flex flex-col gap-2.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <textarea
      {...props}
      rows="4"
      className="w-full px-5 py-4 bg-[#F8F9FF] border-2 border-transparent rounded-[1.25rem] focus:border-rose-100 focus:bg-white focus:outline-none text-sm font-semibold text-slate-700 transition-all placeholder:text-gray-300"
    />
  </div>
);

const FormSelect = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-2.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`w-full px-5 pr-12 py-4 bg-[#F8F9FF] border-2 border-transparent rounded-[1.25rem] focus:border-rose-100 focus:bg-white focus:outline-none text-sm font-semibold text-slate-700 transition-all appearance-none cursor-pointer ${props.className || ""}`}
      >
        <option value="">Choose Options</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
        ▼
      </span>
    </div>
  </div>
);

export default AddProducts;