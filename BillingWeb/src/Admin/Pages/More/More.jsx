import React from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Settings, Database, ChevronRight } from "lucide-react";

const More = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Printer Configuration",
      desc: "Setup and manage billing printer",
      icon: Printer,
      path: "/admin/printer",
    },
    {
      title: "Printer Settings",
      desc: "Customize invoice print layout & behavior",
      icon: Settings,
      path: "/admin/printer-settings",
    },
    {
      title: "Backup & Restore",
      desc: "Secure your data",
      icon: Database,
      path: "/admin/backup",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          More Settings
        </h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
          Advanced Configuration Panel
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="
                bg-white rounded-[2.5rem] border border-gray-100 shadow-sm
                hover:shadow-xl transition-all duration-300
                p-6 cursor-pointer group
              "
            >
              {/* ICON */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                  <Icon />
                </div>

                <ChevronRight className="text-gray-300 group-hover:text-primary transition-all" />
              </div>

              {/* TEXT */}
              <div>
                <h2 className="text-lg font-black text-slate-800 leading-tight">
                  {card.title}
                </h2>
                <p className="text-[11px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
                  {card.desc}
                </p>
              </div>

              {/* FOOTER LINE */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Open Panel
                </span>
                <span className="text-[10px] text-gray-300 group-hover:text-primary transition-all">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default More;
