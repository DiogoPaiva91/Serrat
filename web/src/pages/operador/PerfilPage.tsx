import { Smartphone, Wifi, MapPin, Camera } from "lucide-react";
import { useState, useEffect } from "react";

export function PerfilPage() {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [hasGeo, setHasGeo] = useState<boolean | null>(null);

  useEffect(() => {
    // Check camera
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => setHasCamera(devices.some((d) => d.kind === "videoinput")))
      .catch(() => setHasCamera(false));

    // Check geolocation
    setHasGeo(!!navigator.geolocation);
  }, []);

  const statusItems = [
    { icon: Camera, label: "Camera", ok: hasCamera, desc: hasCamera ? "Disponivel" : "Nao encontrada" },
    { icon: MapPin, label: "GPS", ok: hasGeo, desc: hasGeo ? "Disponivel" : "Nao suportado" },
    { icon: Wifi, label: "Conexao", ok: navigator.onLine, desc: navigator.onLine ? "Online" : "Offline" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* App info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-3">
          <Smartphone size={32} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Serrat Operador</h2>
        <p className="text-sm text-slate-500">App de Scanner QR Code</p>
      </div>

      {/* Device status */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        <div className="p-4">
          <h3 className="text-sm font-bold text-slate-700">Status do Dispositivo</h3>
        </div>
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 p-4">
            <item.icon size={18} className="text-slate-400" />
            <div className="flex-1">
              <p className="text-sm text-slate-700">{item.label}</p>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                item.ok === null ? "bg-slate-300" : item.ok ? "bg-green-500" : "bg-red-400"
              }`}
            />
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-300 mt-4">Serrat v1.0.0</p>
    </div>
  );
}
