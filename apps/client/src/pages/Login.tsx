import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import { motion } from "framer-motion";
import { useEffect } from "react";

export function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const { register, login } = useAuth();
  const { isLoading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/lobby");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      register({ email, password, nickname });
    } else {
      login({ email, password });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-gamion-surface rounded-xl p-8 shadow-lg border border-white/10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegisterMode ? "Create Account" : "Sign In"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gamion-dark rounded-lg border border-white/10 focus:border-gamion-primary focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-gamion-dark rounded-lg border border-white/10 focus:border-gamion-primary focus:outline-none"
          />
          {isRegisterMode && (
            <input
              type="text"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gamion-dark rounded-lg border border-white/10 focus:border-gamion-primary focus:outline-none"
            />
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gamion-primary rounded-lg font-semibold hover:bg-gamion-secondary disabled:opacity-50 transition-colors"
          >
            {isLoading ? "..." : isRegisterMode ? "Register" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          {isRegisterMode ? "Already have an account?" : "No account?"}{" "}
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-gamion-primary hover:underline"
          >
            {isRegisterMode ? "Sign in" : "Register"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
