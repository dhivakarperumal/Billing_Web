import React, { useState } from "react";

const AddProducts = () => {
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
      unit: "kg",
      minStock: ""
    },

    variants: [],

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

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;

    if (section) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product Data:", formData);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Add New Product
            </h2>
            <p className="text-sm text-gray-500">
              Fill product details for billing and inventory
            </p>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Save Product
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* BASIC INFO */}
          <Section title="Basic Information">
            <Grid>
              <Input label="Product Name" name="name" onChange={handleChange} />
              <Input label="Category" name="category" onChange={handleChange} />
              <Input label="Sub Category" name="subCategory" onChange={handleChange} />
              <Input label="Brand" name="brand" onChange={handleChange} />
              <Input label="SKU" name="sku" onChange={handleChange} />
              <Input label="Barcode" name="barcode" onChange={handleChange} />
            </Grid>
          </Section>

          {/* PRICING */}
          <Section title="Pricing Details">
            <Grid>
              <Input label="MRP" name="mrp" onChange={(e) => handleChange(e, "pricing")} />
              <Input label="Selling Price" name="sellingPrice" onChange={(e) => handleChange(e, "pricing")} />
              <Input label="Cost Price" name="costPrice" onChange={(e) => handleChange(e, "pricing")} />
              <Input label="Discount (%)" name="discount" onChange={(e) => handleChange(e, "pricing")} />
              <Input label="Tax (%)" name="tax" onChange={(e) => handleChange(e, "pricing")} />
            </Grid>
          </Section>

          {/* STOCK */}
          <Section title="Stock Information">
            <Grid>
              <Input label="Quantity" name="quantity" onChange={(e) => handleChange(e, "stock")} />
              <Input label="Unit (kg, pcs)" name="unit" onChange={(e) => handleChange(e, "stock")} />
              <Input label="Minimum Stock" name="minStock" onChange={(e) => handleChange(e, "stock")} />
            </Grid>
          </Section>

          {/* EXPIRY */}
          <Section title="Expiry Details">
            <Grid>
              <Input type="date" label="Manufacturing Date" name="mfgDate" onChange={(e) => handleChange(e, "expiry")} />
              <Input type="date" label="Expiry Date" name="expDate" onChange={(e) => handleChange(e, "expiry")} />
              <Input label="Batch Number" name="batchNo" onChange={(e) => handleChange(e, "expiry")} />
            </Grid>
          </Section>

          {/* SUPPLIER */}
          <Section title="Supplier Details">
            <Grid>
              <Input label="Supplier Name" name="name" onChange={(e) => handleChange(e, "supplier")} />
              <Input label="Contact Number" name="contact" onChange={(e) => handleChange(e, "supplier")} />
            </Grid>
          </Section>

          {/* MEDIA */}
          <Section title="Product Media">
            <Input
              label="Image URL"
              name="image"
              onChange={(e) => handleChange(e, "media")}
            />
          </Section>

        </div>
      </form>
    </div>
  );
};

export default AddProducts;

/* 🔹 Reusable Components */

const Section = ({ title, children }) => (
  <div className="bg-gray-50 p-5 rounded-xl border">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {children}
  </div>
);

const Input = ({ label, name, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
    />
  </div>
);