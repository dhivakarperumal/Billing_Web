import React, { useState, useEffect } from "react";

/* 🔹 Category Config */
const categoryConfig = {
  Groceries: {
    subcategories: [
      "Rice","Wheat","Pulses","Flours","Spices","Dry Fruits",
      "Oils","Snacks","Beverages","Dairy","Frozen Foods",
    ],
    unitsMap: {
      Rice: ["kg", "g"],
      Wheat: ["kg", "g"],
      Pulses: ["kg", "g"],
      Flours: ["kg", "g"],
      Spices: ["g"],
      "Dry Fruits": ["kg", "g"],
      Oils: ["ltr", "ml"],
      Snacks: ["pcs"],
      Beverages: ["ltr", "ml"],
      Dairy: ["ltr", "ml", "pcs"],
      "Frozen Foods": ["pcs"],
    },
  },
};

const AddProducts = () => {
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    description: "",
    rating: "",
    category: "Groceries",
    subCategory: "",

    pricing: { mrp: "", discount: "", sellingPrice: "" },

    variants: [
      { quantity: "", unit: "", mrp: "", discount: "", sellingPrice: "" },
    ],

    expiry: { mfgDate: "", expDate: "", batchNo: "" },
    supplier: { name: "", contact: "" },
    media: { images: [] },
  });

  const selectedCategory = categoryConfig["Groceries"];

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const { mrp, discount } = formData.pricing;
    if (mrp && discount !== "") {
      const selling =
        Number(mrp) - (Number(mrp) * Number(discount)) / 100;

      setFormData((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, sellingPrice: selling.toFixed(2) },
      }));
    }
  }, [formData.pricing.mrp, formData.pricing.discount]);

  const handleVariantChange = (i, field, value) => {
    const updated = [...formData.variants];
    updated[i][field] = value;

    const mrp = Number(updated[i].mrp);
    const discount = Number(updated[i].discount);

    if (mrp && discount >= 0) {
      updated[i].sellingPrice = mrp - (mrp * discount) / 100;
    }

    setFormData({ ...formData, variants: updated });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { quantity: "", unit: "", mrp: "", discount: "", sellingPrice: "" },
      ],
    }));
  };

  const removeVariant = (i) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, index) => index !== i),
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      media: { images: files },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-8 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Add Product
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Inventory creation panel
            </p>
          </div>

          <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl">
            Save
          </button>
        </div>

        <div className="p-8 space-y-10">

          {/* BASIC */}
          <Section title="Basic Information">
            <Grid>
              <Input label="Product ID" name="productId" onChange={handleChange} />
              <Input label="Product Name" name="name" onChange={handleChange} />

              <Select label="Category" name="category" value={formData.category} options={["Groceries"]} onChange={handleChange} />
              <Select label="Sub Category" name="subCategory" value={formData.subCategory} options={selectedCategory.subcategories} onChange={handleChange} />

              <Input label="Rating" name="rating" onChange={handleChange} />
            </Grid>

            <div className="mt-4">
              <Input label="Description" name="description" onChange={handleChange} />
            </div>
          </Section>

          {/* PRICING */}
          <Section title="Pricing">
            <Grid>
              <Input label="MRP" onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, mrp: e.target.value } }))} />
              <Input label="Discount %" onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, discount: e.target.value } }))} />
              <Input label="Selling Price" value={formData.pricing.sellingPrice} readOnly />
            </Grid>
          </Section>

          {/* VARIANTS */}
          <Section title="Variants">
            {formData.variants.map((v, i) => (
              <div key={i} className="grid md:grid-cols-6 gap-3 mb-4">
                <Input label="Qty" value={v.quantity} onChange={(e) => handleVariantChange(i, "quantity", e.target.value)} />
                <Select label="Unit" value={v.unit} options={selectedCategory.unitsMap[formData.subCategory] || []} onChange={(e) => handleVariantChange(i, "unit", e.target.value)} />
                <Input label="MRP" value={v.mrp} onChange={(e) => handleVariantChange(i, "mrp", e.target.value)} />
                <Input label="Discount" value={v.discount} onChange={(e) => handleVariantChange(i, "discount", e.target.value)} />
                <Input label="Selling" value={v.sellingPrice} readOnly />

                {formData.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-xs font-bold">
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addVariant} className="text-primary text-xs font-black uppercase tracking-widest">
              + Add Variant
            </button>
          </Section>

          {/* IMAGE */}
          <Section title="Images">
            <input type="file" multiple onChange={handleImageUpload} />

            <div className="grid grid-cols-5 gap-4 mt-4">
              {formData.media.images.map((file, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(file)} className="h-24 w-full object-cover rounded-xl" />
                  <button
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      media: { images: prev.media.images.filter((_, index) => index !== i) }
                    }))}
                    className="absolute top-1 right-1 text-white bg-red-500 text-xs px-1 rounded"
                  >✕</button>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </form>
    </div>
  );
};

export default AddProducts;

/* UI */

const Section = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
      {title}
    </h3>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    <input
      {...props}
      className="px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-primary outline-none text-sm font-semibold"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    <select
      {...props}
      className="px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-primary outline-none text-sm font-semibold"
    >
      <option value="">Select</option>
      {options.map((opt, i) => (
        <option key={i}>{opt}</option>
      ))}
    </select>
  </div>
);