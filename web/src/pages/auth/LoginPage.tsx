import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/constants";
import { ParticleBackground } from "@/components/shared/ParticleBackground";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Credenciais invalidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a14]">
      {/* WebGL Particle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1e] via-[#0a0a14] to-[#141428]" />
      <ParticleBackground />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <img src="/serrat-logo.png" alt="Serrat" className="h-20 w-auto mb-3 drop-shadow-2xl" />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500/50" />
              <p className="text-xs tracking-[0.3em] uppercase text-amber-400/60 font-medium">
                Gestao Inteligente
              </p>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all duration-300 text-sm"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all duration-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400/80 text-xs text-center bg-red-500/10 border border-red-500/15 rounded-lg py-2.5 px-3"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between pt-2"
            >
              <a href={ROUTES.FORGOT_PASSWORD} className="text-xs text-white/30 hover:text-amber-400/60 transition-colors">
                Esqueceu a senha?
              </a>
              <span className="text-xs text-white/15">v2.0</span>
            </motion.div>
          </form>
        </div>

        {/* Bottom branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[10px] text-white/15 mt-6 tracking-wider"
        >
          SERRAT LOGISTICA &amp; LOCACAO &bull; DESDE 1987
        </motion.p>
      </motion.div>
    </div>
  );
}
