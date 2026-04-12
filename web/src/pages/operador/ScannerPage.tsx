import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  QrCode,
  RefreshCw,
} from "lucide-react";

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalizacao nao suportada neste navegador");
      return;
    }
    setLoadingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoadingLocation(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Permissao de localizacao negada. Ative nas configuracoes."
            : "Erro ao obter localizacao. Tente novamente."
        );
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const startScanner = async () => {
    setCameraError(null);
    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScannedData(decodedText);
          scanner.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      );
      setScanning(true);
    } catch (err: any) {
      const message = err?.message || String(err);
      if (message.includes("Permission") || message.includes("NotAllowed")) {
        setCameraError("Permissao de camera negada. Ative nas configuracoes do navegador.");
      } else if (message.includes("NotFound") || message.includes("Requested device not found")) {
        setCameraError("Nenhuma camera encontrada neste dispositivo.");
      } else {
        setCameraError("Erro ao acessar a camera: " + message);
      }
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleSubmitOS = async () => {
    if (!scannedData) return;
    setSubmitting(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("work_orders").insert({
          qr_code_data: scannedData,
          latitude: location?.latitude,
          longitude: location?.longitude,
          geo_accuracy: location?.accuracy,
          status: "concluida",
          completed_at: new Date().toISOString(),
        });
        if (error) throw error;
      }

      setSuccess(true);
      toast.success("Ordem de servico registrada com sucesso!");

      setTimeout(() => {
        setSuccess(false);
        setScannedData(null);
      }, 3000);
    } catch (err: any) {
      toast.error("Erro ao registrar OS: " + (err.message || "Tente novamente"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setSuccess(false);
    setCameraError(null);
  };

  // Success screen
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">OS Registrada!</h2>
        <p className="text-slate-500 text-center text-sm mb-6">
          Ordem de servico registrada com sucesso.
        </p>
        <button
          onClick={handleReset}
          className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-xl"
        >
          Escanear Novo QR Code
        </button>
      </div>
    );
  }

  // Scanned - confirm screen
  if (scannedData) {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <QrCode size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">QR Code Lido</h3>
              <p className="text-xs text-slate-500">Confirme os dados abaixo</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-mono text-slate-700 break-all">{scannedData}</p>
          </div>

          {/* Location info */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className={location ? "text-green-500" : "text-red-400"} />
            {location ? (
              <span className="text-xs text-slate-500">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} (±{location.accuracy.toFixed(0)}m)
              </span>
            ) : loadingLocation ? (
              <span className="text-xs text-slate-400">Obtendo localizacao...</span>
            ) : (
              <span className="text-xs text-red-400">{locationError || "Localizacao indisponivel"}</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 h-12 bg-slate-100 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              Cancelar
            </button>
            <button
              onClick={handleSubmitOS}
              disabled={submitting}
              className="flex-1 h-12 bg-amber-500 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Registrar OS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scanner screen
  return (
    <div className="p-4 space-y-4">
      {/* Stats summary */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 text-center">
          <p className="text-lg font-bold text-blue-600">--</p>
          <p className="text-[10px] text-slate-500">OS Hoje</p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 text-center">
          <p className="text-lg font-bold text-green-600">--</p>
          <p className="text-[10px] text-slate-500">OS Mes</p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 text-center">
          <div className="flex items-center justify-center gap-1">
            <MapPin size={12} className={location ? "text-green-500" : "text-red-400"} />
            <p className="text-[10px] text-slate-500">{location ? "GPS OK" : "Sem GPS"}</p>
          </div>
          {!location && !loadingLocation && (
            <button onClick={getLocation} className="text-[10px] text-blue-500 mt-1">
              Ativar
            </button>
          )}
        </div>
      </div>

      {/* Camera area */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden relative">
        <div
          id={scannerContainerId}
          className={scanning ? "min-h-[350px]" : "hidden"}
        />

        {!scanning && (
          <div className="min-h-[350px] flex flex-col items-center justify-center p-6">
            {cameraError ? (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle size={32} className="text-red-400" />
                </div>
                <p className="text-red-300 text-sm text-center mb-4">{cameraError}</p>
                <button
                  onClick={startScanner}
                  className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl"
                >
                  <RefreshCw size={16} />
                  Tentar Novamente
                </button>
              </>
            ) : (
              <>
                {/* Scan frame illustration */}
                <div className="w-48 h-48 relative mb-6">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera size={40} className="text-white/30" />
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-6">Aponte para o QR Code da cabine</p>
                <button
                  onClick={startScanner}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <Camera size={20} />
                  Abrir Camera
                </button>
              </>
            )}
          </div>
        )}

        {scanning && (
          <button
            onClick={stopScanner}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl font-medium z-10"
          >
            Fechar Camera
          </button>
        )}
      </div>
    </div>
  );
}
