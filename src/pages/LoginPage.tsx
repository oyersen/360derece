import { useState } from "react";
import { Building2, LogIn } from "lucide-react";
import { theme } from "@/config/theme";

type Props = {
  onSuccess: () => void;
};

export default function LoginPage({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!email || !pass) {
      setErr("Lütfen e-posta ve şifre giriniz.");
      return;
    }
    onSuccess();
  };

  return (
    <div className="min-h-screen grid place-items-center" style={{ background: theme.brand.bg }}>
      <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg" style={{ background: theme.brand.primary }}>
            <Building2 size={18} color="white" />
          </div>
          <div className="text-lg font-semibold">Kurumsal 360° Giriş</div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-zinc-600">E-posta</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="ad.soyad@firma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600">Şifre</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            onClick={submit}
            className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2 text-sm"
            style={{ background: theme.brand.primary }}
          >
            <LogIn size={16} />
            Giriş Yap
          </button>
        </div>
        <div className="mt-4 text-xs text-zinc-500">
          Kurum SSO / LDAP entegrasyonu için ek butonlar bu alana eklenebilir.
        </div>
      </div>
    </div>
  );
}
