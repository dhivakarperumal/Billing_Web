import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

// Lazy Load Main Components
const Home = React.lazy(() => import("./Home/Home.jsx"));

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      

    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/admin",
    element: (
      <PrivateRoute allowedRoles={["admin"]}>
        <AdminProvider>
          <AdminPanel />
        </AdminProvider>
      </PrivateRoute>
    ),
  
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products/all", element: <AllProducts /> },
      { path: "products/add", element: <AddProducts /> },
      { path: "products/edit/:id", element: <AddProducts /> },
      { path: "products/detail/:id", element: <ProductDetail /> },
      { path: "products/category", element: <Category /> },
      { path: "products/addcategory", element: <AddCategory /> },
      { path: "products/category/edit/:id", element: <AddCategory /> },
      { path: "products/stock", element: <StockDetails /> },
      { path: "products/stock/add", element: <AddStock /> },
      { path: "users/all", element: <Users /> },
      { path: "dealers", element: <Dealers /> },
      { path: "dealers/add", element: <AddDealer /> },
      { path: "invoices/add", element: <AddInvoice /> },
      { path: "billing", element: <Billing /> },
      { path: "billing/create", element: <CreateBilling /> },
      { path: "orders/:id", element: <OrderDetail /> },
      { path: "banners", element: <BannerManagement /> },
      { path: "videos", element: <VideoManagement /> },
      { path: "reviews", element: <Reviews /> },
      { path: "reports", element: <Reports /> },
      { path: "more", element: <More /> },
      { path: "printer", element: <PrinterConfig /> },
      { path: "printer-settings", element: <PrinterSettings /> },
      { path: "gst-settings", element: <GSTSettings /> },
      { path: "profile", element: <Profile /> },
    
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

