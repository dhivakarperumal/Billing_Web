import React, { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";





import ScrollToTop from "./components/ScrollToTop";
import ScrollNavigator from "./components/ScrollNavigator";



function App() {
  

  return (
    <section>
     
      <ScrollToTop/>
      <ScrollNavigator/>
      <Outlet />
     
    </section>
  );
}

export default App;
