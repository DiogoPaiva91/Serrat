import { useState, useEffect, Component, type ReactNode } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { QrCode, ClipboardList, Download, X } from "lucide-react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 16 }}>Erro na página</p>
        <p style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>{this.state.error}</p>
        <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "#eab308", border: "none", fontWeight: 700, cursor: "pointer" }}>
          Recarregar
        </button>
      </div>
    );
    return this.props.children;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function OperadorLayout() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed && !isStandalone) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <img src="/serrat-logo.png" alt="Serrat" style={{ height: 36, objectFit: "contain" }} />
        {installPrompt && !isInstalled && !showInstallBanner && (
          <button onClick={handleInstall} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#eab308", color: "#1a1a1a", padding: "6px 14px",
            borderRadius: 10, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
          }}>
            <Download size={14} /> Instalar
          </button>
        )}
      </header>

      {/* PWA Install Banner */}
      {showInstallBanner && !isInstalled && (
        <div style={{
          background: "linear-gradient(90deg, #eab308, #ca8a04)",
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
          position: "relative", zIndex: 40,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Download size={20} style={{ color: "#1a1a1a" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Instalar Serrat</p>
            <p style={{ fontSize: 11, color: "rgba(26,26,26,0.6)", margin: 0 }}>Acesso rapido na tela inicial</p>
          </div>
          <button onClick={handleInstall} style={{
            background: "#1a1a1a", color: "#fff", padding: "8px 16px",
            borderRadius: 10, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", flexShrink: 0,
          }}>Instalar</button>
          <button onClick={handleDismissBanner} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, color: "rgba(26,26,26,0.4)" }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "#fff", borderTop: "1px solid #e2e8f0",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        <NavLink
          to="/operador/scanner"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${isActive ? "text-yellow-600" : "text-slate-400"}`
          }
          style={({ isActive }) => isActive ? { borderTop: "2px solid #eab308" } : { borderTop: "2px solid transparent" }}
        >
          <QrCode size={22} />
          <span style={{ fontSize: 10, fontWeight: 600 }}>Scanner</span>
        </NavLink>
        <NavLink
          to="/operador/historico"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${isActive ? "text-yellow-600" : "text-slate-400"}`
          }
          style={({ isActive }) => isActive ? { borderTop: "2px solid #eab308" } : { borderTop: "2px solid transparent" }}
        >
          <ClipboardList size={22} />
          <span style={{ fontSize: 10, fontWeight: 600 }}>Historico</span>
        </NavLink>
      </nav>
    </div>
  );
}
