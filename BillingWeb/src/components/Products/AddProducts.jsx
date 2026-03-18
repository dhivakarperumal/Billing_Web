import React, { useState, useEffect } from "react";

/* 🔹 Category Config */
const categoryConfig = {
  Groceries: {
    subcategories: [
      "Rice",
      "Wheat",
      "Pulses",
      "Flours",
      "Spices",
      "Dry Fruits",
      "Oils",
      "Snacks",
      "Beverages",
      "Dairy",
      "Frozen Foods",
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

    pricing: {
      mrp: "",
      discount: "",
      sellingPrice: "",
    },

    variants: [
      {
        quantity: "",
        unit: "",
        mrp: "",
        discount: "",
        sellingPrice: "",
      },
    ],

    expiry: {
      mfgDate: "",
      expDate: "",
      batchNo: "",
    },

    supplier: {
      name: "",
      contact: "",
    },

    media: {
      images: [],
    },
  });

  const selectedCategory = categoryConfig["Groceries"];

  /* 🔹 Handle Change */
  const handleChange = (e, section = null) => {
    const { name, value } = e.target;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* 🔹 Pricing Auto Calculation */
  useEffect(() => {
    const { mrp, discount } = formData.pricing;

    if (mrp && discount !== "") {
      const selling = Number(mrp) - (Number(mrp) * Number(discount)) / 100;

      setFormData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          sellingPrice: selling.toFixed(2),
        },
      }));
    }
  }, [formData.pricing.mrp, formData.pricing.discount]);

  /* 🔹 Variant Change */
  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;

    const mrp = Number(updated[index].mrp);
    const discount = Number(updated[index].discount);

    if (mrp && discount >= 0) {
      updated[index].sellingPrice = mrp - (mrp * discount) / 100;
    }

    setFormData({ ...formData, variants: updated });
  };

  /* 🔹 Add Variant */
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
        },
      ],
    }));
  };

  /* 🔹 Remove Variant */
  const removeVariant = (index) => {
    const updated = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updated });
  };

  /* 🔹 Image Upload */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      media: { images: files },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final Product:", formData);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Add Grocery Product</h2>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Save
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* BASIC */}
          <Section title="Basic Information">
            <Grid>
              <Input
                label="Product ID"
                name="productId"
                onChange={handleChange}
              />
              <Input label="Product Name" name="name" onChange={handleChange} />

              <Select
                label="Category"
                name="category"
                value={formData.category}
                options={["Groceries"]}
                onChange={handleChange}
              />

              <Select
                label="Sub Category"
                name="subCategory"
                value={formData.subCategory}
                options={selectedCategory.subcategories}
                onChange={handleChange}
              />

              <Input
                label="Rating (1-5)"
                name="rating"
                onChange={handleChange}
              />
            </Grid>

            <div className="mt-4">
              <Input
                label="Description"
                name="description"
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* PRICING */}
          <Section title="Pricing">
            <Grid>
              <Input
                label="MRP"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: { ...prev.pricing, mrp: e.target.value },
                  }))
                }
              />

              <Input
                label="Discount %"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: { ...prev.pricing, discount: e.target.value },
                  }))
                }
              />

              <Input
                label="Selling Price"
                value={formData.pricing.sellingPrice}
                readOnly
              />
            </Grid>
          </Section>

          {/* VARIANTS */}
          <Section title="Stock Variants Pricing">
            {formData.variants.map((variant, i) => (
              <div key={i} className="grid md:grid-cols-6 gap-3 mb-3 items-end">
                <Input
                  label="Qty"
                  value={variant.quantity}
                  onChange={(e) =>
                    handleVariantChange(i, "quantity", e.target.value)
                  }
                />

                <Select
                  label="Unit"
                  value={variant.unit}
                  options={
                    selectedCategory.unitsMap[formData.subCategory] || []
                  }
                  onChange={(e) =>
                    handleVariantChange(i, "unit", e.target.value)
                  }
                />

                <Input
                  label="MRP"
                  value={variant.mrp}
                  onChange={(e) =>
                    handleVariantChange(i, "mrp", e.target.value)
                  }
                />

                <Input
                  label="Discount %"
                  value={variant.discount}
                  onChange={(e) =>
                    handleVariantChange(i, "discount", e.target.value)
                  }
                />

                <Input label="Selling" value={variant.sellingPrice} readOnly />

                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="mt-2 text-blue-600"
            >
              + Add Variant
            </button>
          </Section>

          {/* IMAGE */}
          <Section title="Product Images (Max 5)">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />

            {formData.media.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.media.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-lg border"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.media.images.filter(
                          (_, i) => i !== index,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          media: { images: updated },
                        }));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;

/* 🔹 UI Components */

const Section = ({ title, children }) => (
  <div className="bg-gray-50 p-5 rounded-xl border">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      {...props}
      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <select
      {...props}
      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
