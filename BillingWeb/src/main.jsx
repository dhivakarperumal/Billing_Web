import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./PrivateRouter/AuthContext.jsx";
import { StoreProvider } from "./PrivateRouter/StoreContext.jsx";
import PrivateRoute from "./PrivateRouter/PrivateRouter.jsx";
import { AdminProvider } from "./PrivateRouter/AdminContext.jsx";
import { Toaster } from "react-hot-toast";

import More from "./Admin/Pages/More/More.jsx";
import PrinterSettings from "./Admin/Pages/More/PrinterSettings.jsx";
import PrinterConfig from "./Admin/Pages/More/PrinterConfig.jsx";
import GSTSettings from "./Admin/Pages/More/GstSettings.jsx";

// Lazy Load Auth Components
const Login = React.lazy(() => import("./components/Auth/Login.jsx"));
const Register = React.lazy(() => import("./components/Auth/Register.jsx"));

// Lazy Load Admin Components
const AdminPanel = React.lazy(() => import("./Admin/AdminPanel.jsx"));
const Dashboard = React.lazy(() => import("./Admin/Dashboard.jsx"));
const AllProducts = React.lazy(() => import("./Admin/Pages/AllProducts.jsx"));
const AddProducts = React.lazy(() => import("./Admin/Pages/AddProducts.jsx"));
const Category = React.lazy(() => import("./Admin/Products/Category.jsx"));
const AddCategory = React.lazy(() => import("./Admin/Products/AddCategory.jsx"));
const StockDetails = React.lazy(() => import("./Admin/Pages/StockDetails.jsx"));
const AddStock = React.lazy(() => import("./Admin/Pages/AddStock.jsx"));
const Users = React.lazy(() => import("./Admin/Pages/Users.jsx"));
const Dealers = React.lazy(() => import("./Admin/Pages/Dealers.jsx"));
const AddDealer = React.lazy(() => import("./Admin/Pages/AddDealer.jsx"));
const AddInvoice = React.lazy(() => import("./Admin/Pages/AddInvoice.jsx"));
const BannerManagement = React.lazy(() => import("./Admin/Pages/BannerManagement.jsx"));
const VideoManagement = React.lazy(() => import("./Admin/Pages/VideoManagement.jsx"));
const Reviews = React.lazy(() => import("./Admin/Pages/Reviews.jsx"));
const Reports = React.lazy(() => import("./Admin/Pages/Reports.jsx"));
const Profile = React.lazy(() => import("./Admin/Pages/Profile.jsx"));
const ProductDetail = React.lazy(() => import("./Admin/Pages/ProductDetail.jsx"));
const CreateBilling = React.lazy(() => import("./Admin/Pages/CreateBilling.jsx"));
const Billing = React.lazy(() => import("./Admin/Pages/Billing.jsx"));
const OrderDetail = React.lazy(() => import("./Admin/Pages/OrderDetail.jsx"));
const ErrorPage = React.lazy(() => import("./Admin/Pages/ErrorPage.jsx"));

// Suspense fallback loader
const PageLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a", color: "#94a3b8", fontSize: "1rem" }}>
    Loading...
  </div>
);

// Helper to wrap lazy elements
const lazy = (element) => <React.Suspense fallback={<PageLoader />}>{element}</React.Suspense>;

const router = createBrowserRouter([
  { path: "/login", element: lazy(<Login />) },
  { path: "/register", element: lazy(<Register />) },
  { path: "/admin", element: <Navigate to="/" replace /> },
  {
    path: "/",
    errorElement: lazy(<ErrorPage />),
    element: (
      <React.Suspense fallback={<PageLoader />}>
        <PrivateRoute allowedRoles={["admin"]}>
          <AdminProvider>
            <AdminPanel />
          </AdminProvider>
        </PrivateRoute>
      </React.Suspense>
    ),
    children: [
      { index: true, element: lazy(<Dashboard />) },
      { path: "products/all", element: lazy(<AllProducts />) },
      { path: "products/add", element: lazy(<AddProducts />) },
      { path: "products/edit/:id", element: lazy(<AddProducts />) },
      { path: "products/detail/:id", element: lazy(<ProductDetail />) },
      { path: "products/category", element: lazy(<Category />) },
      { path: "products/addcategory", element: lazy(<AddCategory />) },
      { path: "products/category/edit/:id", element: lazy(<AddCategory />) },
      { path: "products/stock", element: lazy(<StockDetails />) },
      { path: "products/stock/add", element: lazy(<AddStock />) },
      { path: "users/all", element: lazy(<Users />) },
      { path: "dealers", element: lazy(<Dealers />) },
      { path: "dealers/add", element: lazy(<AddDealer />) },
      { path: "invoices/add", element: lazy(<AddInvoice />) },
      { path: "billing", element: lazy(<Billing />) },
      { path: "billing/create", element: lazy(<CreateBilling />) },
      { path: "orders/:id", element: lazy(<OrderDetail />) },
      { path: "banners", element: lazy(<BannerManagement />) },
      { path: "videos", element: lazy(<VideoManagement />) },
      { path: "reviews", element: lazy(<Reviews />) },
      { path: "reports", element: lazy(<Reports />) },
      { path: "more", element: lazy(<More />) },
      { path: "printer", element: lazy(<PrinterConfig />) },
      { path: "printer-settings", element: lazy(<PrinterSettings />) },
      { path: "gst-settings", element: lazy(<GSTSettings />) },
      { path: "profile", element: lazy(<Profile />) },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="92181265196-n9a9p26qe601hg7lar8acq6s4f1cknq7.apps.googleusercontent.com">
    <AuthProvider>
      <StoreProvider>
        <Toaster position="top-left" reverseOrder={false} />
        
          <RouterProvider router={router} />
       
      </StoreProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);

