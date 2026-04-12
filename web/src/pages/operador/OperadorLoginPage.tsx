import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export function OperadorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/operador/scanner", { replace: true });
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wider">SERRAT</h1>
          <p className="text-blue-300 text-sm mt-1">App do Operador</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Sua senha"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center mt-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl mt-6 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
