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
} from "react-icons/fi";

/* 🔹 Category Pie Data */
const categoryData = [
  { name: "Rice", value: 40 },
  { name: "Oils", value: 25 },
  { name: "Snacks", value: 20 },
  { name: "Beverages", value: 15 },
];

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];

/* 🔹 Revenue Graph Data */
const revenueData = [
  { name: "Jan", total: 2800, completed: 2400, rejected: 400 },
  { name: "Feb", total: 2000, completed: 1700, rejected: 300 },
  { name: "Mar", total: 2600, completed: 2200, rejected: 400 },
  { name: "Apr", total: 1800, completed: 1400, rejected: 400 },
  { name: "May", total: 1600, completed: 1300, rejected: 300 },
  { name: "Jun", total: 2400, completed: 2100, rejected: 300 },
  { name: "Jul", total: 3000, completed: 2600, rejected: 400 },
  { name: "Aug", total: 1700, completed: 1400, rejected: 300 },
  { name: "Sep", total: 2200, completed: 1900, rejected: 300 },
  { name: "Oct", total: 1900, completed: 1600, rejected: 300 },
  { name: "Nov", total: 2800, completed: 2400, rejected: 400 },
  { name: "Dec", total: 2600, completed: 2200, rejected: 400 },
];

/* 🔹 Mock Data */
const stats = [
  {
    title: "Total Products",
    value: 124,
    icon: <FiBox />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Total Services",
    value: 75,
    icon: <FiBox />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Total Customers",
    value: 30,
    icon: <FiUsers />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Low Stock Items",
    value: 30,
    icon: <FiAlertTriangle />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Total Bills",
    value: 34,
    icon: <FiFileText />,
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "Today's Bills",
    value: 1,
    icon: <FiFileText />,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "This Month Bills",
    value: 28,
    icon: <FiFileText />,
    color: "bg-gray-100 text-gray-600",
  },
  {
    title: "Total Revenue",
    value: "₹ 20,323",
    icon: <FiDollarSign />,
    color: "bg-green-50 text-green-700",
  },
  {
    title: "Today's Revenue",
    value: "₹ 50",
    icon: <FiDollarSign />,
    color: "bg-blue-50 text-blue-700",
  },
];

const recentBills = [
  { id: "MMBS-2026-0065", name: "rasathi", amount: 50 },
  { id: "MMBS-2026-0060", name: "tamil clg", amount: 50 },
  { id: "MMBS-2026-0059", name: "nasreen", amount: 1726 },
  { id: "MMBS-2026-0058", name: "nasreen", amount: 570 },
];

/* 🔹 Pie Data */
const pieData = [
  { name: "Products", value: 400 },
  { name: "Services", value: 300 },
  { name: "Others", value: 200 },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Overview of your business
          </p>
        </div>

        {/* Highlight Card */}
        <div className="hidden md:block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-xl">
          <p className="text-xs uppercase opacity-80">Today Revenue</p>
          <h2 className="text-xl font-black">₹ 50</h2>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
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

      {/* CHART + REVENUE */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* REVENUE GRAPH */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-slate-800 mb-4">
            Shipment Statistic
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="name" />
                <YAxis />

                <Tooltip />

                <Legend />

                {/* Stacked Bars */}
                <Bar
                  dataKey="total"
                  stackId="a"
                  fill="#A7F3D0"
                  radius={[6, 6, 0, 0]}
                />
                <Bar dataKey="completed" stackId="a" fill="#34D399" />
                <Bar dataKey="rejected" stackId="a" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-slate-800 mb-4">
            Category Distribution
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT BILLS FULL WIDTH */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-black text-slate-800 mb-4">Recent Bills</h2>

        <div className="space-y-4">
          {recentBills.map((bill, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b pb-3 last:border-none hover:bg-gray-50 p-2 rounded-xl transition"
            >
              <div>
                <p className="text-sm font-bold text-slate-700">{bill.id}</p>
                <p className="text-xs text-gray-400">{bill.name}</p>
              </div>

              <p className="text-sm font-black text-slate-800">
                ₹ {bill.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
