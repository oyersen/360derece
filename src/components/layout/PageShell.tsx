import type { ReactNode } from "react";
import { theme } from "@/config/theme";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: theme.brand.bg }} className="min-h-[calc(100vh-4rem)] w-full">
      <div className="px-8 py-6 space-y-6">{children}</div>
    </div>
  );
}
