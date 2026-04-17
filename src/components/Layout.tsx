import * as React from "react";
import { Home, Package, UtensilsCrossed, Users, Bell, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { canInstall, installApp } = usePWAInstall();
  
  const menuGroups = [
    {
      title: "OPERASIONAL",
      items: [
        { id: "home", label: "Dashboard", icon: Home },
      ]
    },
    {
      title: "GUDANG & DAPUR",
      items: [
        { id: "bahan", label: "Stok Gudang", icon: Package },
        { id: "resep", label: "Resep & Menu", icon: UtensilsCrossed },
      ]
    },
    {
      title: "ADMINISTRASI",
      items: [
        { id: "karyawan", label: "SDM", icon: Users },
      ]
    }
  ];

  const allTabs = menuGroups.flatMap(group => group.items);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <Logo size={48} />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">
              Elvera<span className="text-emerald-600">57</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cost Control</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto no-scrollbar pb-6">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
                {group.title}
              </h2>
              <div className="space-y-1">
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                        isActive 
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 space-y-4 border-t border-slate-50">
          {canInstall && (
            <button 
              onClick={installApp}
              className="flex items-center gap-3 w-full px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-100/50"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Admin Kedai Elvira 57</p>
              <p className="text-[10px] text-slate-400 truncate">Owner Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 safe-top shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Logo size={40} />
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              Elvera<span className="text-emerald-600">57</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {canInstall && (
              <button 
                onClick={installApp}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
          <div className="max-w-md mx-auto flex items-center justify-around h-16">
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                    isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div className={cn(
                    "p-1 rounded-xl transition-all duration-200",
                    isActive && "bg-emerald-50"
                  )}>
                    <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    isActive ? "opacity-100" : "opacity-70"
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
