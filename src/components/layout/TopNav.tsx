import { NavLink } from "react-router-dom";
import {
  Building2,
  Shield,
  Users,
  ClipboardList,
  History,
  BarChart3,
  LogOut,
} from "lucide-react";
import { theme } from "@/config/theme";

type Props = {
  onLogout: () => void;
};

export function TopNav({ onLogout }: Props) {
  const items = [
    { key: "dashboard", label: "Panel", icon: Shield, to: "/" },
    { key: "assign", label: "Atamalar", icon: Users, to: "/assignments" },
    { key: "survey", label: "Anket", icon: ClipboardList, to: "/survey" },
    {
      key: "survey-builder",
      label: "Anket Oluştur",
      icon: Building2,
      to: "/survey-builder",
    },
    { key: "saved", label: "Kayıtlı Anketler", icon: History, to: "/saved" },
    { key: "reports", label: "Raporlar", icon: BarChart3, to: "/reports" },
  ];

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="w-full px-8 h-16 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-[15px]">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: theme.brand.primary }}
          >
            <Building2 size={18} color="white" />
          </div>
          Kurumsal 360° Değerlendirme
        </div>
        <div className="flex gap-1">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm flex items-center gap-2 border transition ${
                  isActive
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-white hover:bg-zinc-50"
                }`
              }
            >
              <it.icon size={16} />
              {it.label}
            </NavLink>
          ))}
        </div>
        <div className="ml-auto">
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg border bg-white hover:bg-zinc-50 flex items-center gap-2 text-sm"
          >
            <LogOut size={16} />
            Çıkış
          </button>
        </div>
      </div>
    </div>
  );
}
