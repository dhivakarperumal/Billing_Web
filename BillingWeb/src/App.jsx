import React, { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Footer from "./components/Footer";


import ScrollToTop from "./components/ScrollToTop";
import ScrollNavigator from "./components/ScrollNavigator";
import Loader from "./components/Loader";


function App() {
   const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loader />;
  }

  return (
    <section>
      <Header />
      <Navbar />
      <ScrollToTop/>
      <ScrollNavigator/>
      <Outlet />
      <Footer />
    </section>
  );
}

export default App;
