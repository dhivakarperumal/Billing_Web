import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import {
  FiBox,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const COLORS = ["#F43F5E", "#10B981", "#F59E0B", "#6366F1", "#8B5CF6", "#EC4899"];

const Dashboard = () => {
  const [data, setData] = useState({
    stats: [],
    stockStats: [],
    recentBills: [],
    categoryData: [],
    revenueGraphData: [],
    loading: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get("/products", { params: { limit: 1000 } }),
          api.get("/orders", { params: { limit: 1000 } })
        ]);

        const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products || []);
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        // 🟢 PREPARE STATS
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
        const monthOrders = orders.filter(o => new Date(o.created_at) >= startOfMonth);

        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const uniqueCustomers = new Set(orders.map(o => o.customer_phone)).size;
        const totalStockQuantity = products.reduce((sum, p) => sum + Number(p.total_stock || 0), 0);

        const mainStats = [
          { title: "Total Products", value: products.length, icon: <FiBox />, color: "bg-emerald-100 text-emerald-600" },
          { title: "Total Stock", value: totalStockQuantity, icon: <FiBox />, color: "bg-orange-100 text-orange-600" },
          { title: "Total Customers", value: uniqueCustomers, icon: <FiUsers />, color: "bg-purple-100 text-purple-600" },
          { title: "Total Bills", value: orders.length, icon: <FiFileText />, color: "bg-rose-100 text-rose-600" },
          { title: "Today's Bills", value: todayOrders.length, icon: <FiShoppingBag />, color: "bg-indigo-100 text-indigo-600" },
          { title: "This Month", value: monthOrders.length, icon: <FiPackage />, color: "bg-blue-100 text-blue-600" },
          { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: "bg-emerald-50 text-emerald-700" },
          { title: "Today Revenue", value: `₹${todayRevenue.toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: "bg-rose-50 text-rose-700" },
        ];

        // 🟠 STOCK STATS
        const lowStock = products.filter(p => Number(p.total_stock || 0) > 0 && Number(p.total_stock || 0) <= 10).length;
        const outOfStock = products.filter(p => Number(p.total_stock || 0) <= 0).length;
        const inStock = products.length - outOfStock;

        const sStats = [
          { title: "Total items", value: products.length, icon: <FiBox />, color: "bg-slate-100 text-slate-600" },
          { title: "In Stock", value: inStock, icon: <FiBox />, color: "bg-emerald-100 text-emerald-600" },
          { title: "Low Stock", value: lowStock, icon: <FiAlertTriangle />, color: "bg-amber-100 text-amber-600" },
          { title: "Out of Stock", value: outOfStock, icon: <FiAlertTriangle />, color: "bg-rose-100 text-rose-600" },
        ];

        // 🔵 CATEGORY DISTRIBUTION
        const catMap = {};
        products.forEach(p => {
          const cat = p.category || "Uncategorized";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const cData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6);

        // 🟣 REVENUE GRAPH (Last 6 months)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6 = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthName = months[d.getMonth()];
          const mOrders = orders.filter(o => {
            const od = new Date(o.created_at);
            return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
          });
          last6.push({
            name: monthName,
            total: mOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
            count: mOrders.length
          });
        }

        setData({
          stats: mainStats,
          stockStats: sStats,
          recentBills: orders.slice(0, 5),
          categoryData: cData,
          revenueGraphData: last6,
          loading: false
        });
      } catch (e) {
        console.error("Dashboard fetch error", e);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  if (data.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
         <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Business Intelligence...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
    

      {/* QUICK ACTIONS */}
     {/* <div className="flex items-center justify-end gap-4 mb-4 p-4 bg-gradient-to-r from-rose-50 to-white border border-gray-100 rounded-2xl shadow-sm">

  <button 
    onClick={() => navigate('/admin/billing/create')}
    className="flex items-center gap-3 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-200 active:scale-95 cursor-pointer"
  >
    <FiShoppingBag className="text-lg" /> New Bill
  </button>

  <button 
    onClick={() => navigate('/admin/products/all')}
    className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
  >
    <FiPackage className="text-lg text-rose-500" /> Inventory
  </button>

  <button 
    onClick={() => navigate('/admin/products/add')}
    className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
  >
    <FiBox className="text-lg text-rose-500" /> Add Product
  </button>

</div> */}

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((item, i) => {
          const bgGradients = [
            { from: "from-[#4387F6]", to: "to-[#5C9CF8]", text: "text-[#4387F6]" }, // Blue
            { from: "from-[#F85A6C]", to: "to-[#FA7082]", text: "text-[#F85A6C]" }, // Red
            { from: "from-[#28C382]", to: "to-[#3DD09A]", text: "text-[#28C382]" }, // Green
            { from: "from-[#FC8C41]", to: "to-[#FD9D5B]", text: "text-[#FC8C41]" }, // Orange
            { from: "from-[#8B5CF6]", to: "to-[#A78BFA]", text: "text-[#8B5CF6]" }, // Purple
            { from: "from-[#14B8A6]", to: "to-[#2DD4BF]", text: "text-[#14B8A6]" }, // Teal
            { from: "from-[#F59E0B]", to: "to-[#FBBF24]", text: "text-[#F59E0B]" }, // Yellow
          ];
          const dummyTrends = [
            { isUp: true, val: "+427" },
            { isUp: false, val: "-23.09%" },
            { isUp: true, val: "52.09%" },
            { isUp: false, val: "-152.3" },
            { isUp: true, val: "+14.5%" },
            { isUp: true, val: "+8.2%" },
            { isUp: false, val: "-2.4%" }
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
                  {item.title}
                </p>
                
                <div className="flex justify-between items-end mb-4">
                  <p className="text-2xl font-bold tracking-tight">
                    {item.value}
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

      {/* STOCK OVERVIEW */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-slate-800">Stock Overview</h2>

          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Inventory Status
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.stockStats.map((item, i) => (
            <div
              key={i}
              className="bg-gray-50/50 border border-gray-100 p-5 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate('/admin/products/stock')}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`p-2 rounded-xl ${item.color}`}>
                  {item.icon}
                </span>
              </div>

              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {item.title}
              </p>

              <p className="text-xl font-black text-slate-800 mt-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CHART + REVENUE */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* REVENUE GRAPH */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 pt-5">
          <h2 className="text-[1.1rem] font-black text-slate-800 mb-6">
            Shipment Statistic
          </h2>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueGraphData} barSize={20} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12, fontWeight: 800}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12, fontWeight: 800}} 
                  dx={-10}
                />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{backgroundColor: '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                   itemStyle={{fontWeight: 900, fontSize: '12px'}}
                />
                <Bar
                  dataKey="count"
                  fill="#F43F5E"
                  radius={[10, 10, 0, 0]}
                  name="Shipments"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black text-slate-800">
              Category Distribution
            </h2>

            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Inventory Split
            </span>
          </div>

          <div className="flex items-center justify-center">
            {/* DONUT CHART */}
            <div className="h-80 w-full md:w-2/3 relative">
              {" "}
              {/* 🔥 increased size */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontSize: '10px', fontWeight: 900}}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* CENTER TEXT */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-sm text-gray-400 font-bold uppercase">
                  Total
                </p>
                <h2 className="text-3xl font-black text-slate-800">
                  {data.categoryData.reduce((a, b) => a + b.value, 0)}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT BILLS FULL WIDTH */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-black text-slate-800 mb-4">Recent Bills</h2>

        <div className="space-y-4">
          {data.recentBills.length > 0 ? data.recentBills.map((bill, i) => (
            <div
              key={i}
              onClick={() => navigate(`/admin/orders/${bill.id}`)}
              className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-none hover:bg-rose-50/30 px-3 py-3 rounded-[1.5rem] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-rose-600 transition-all border border-transparent group-hover:border-rose-100">
                    <FiFileText />
                 </div>
                 <div>
                   <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">#ORD-0{bill.id}</p>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bill.customer_name || 'Guest User'}</p>
                 </div>
              </div>

              <div className="text-right">
                 <p className="text-sm font-black text-slate-800">₹{Number(bill.total_amount).toLocaleString('en-IN')}</p>
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(bill.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center text-[10px] font-black uppercase text-gray-300 tracking-widest">No Sales Found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
