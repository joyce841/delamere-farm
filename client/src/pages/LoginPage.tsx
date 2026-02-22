import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Link } from "wouter";
import { Sprout, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary">
        {/* Unsplash beautiful farm */}
        <img 
          src="https://pixabay.com/get/g82a6256a21c52200c98b326364c245a850933e1376845cd04ee3a19b7bebcd46cef6f725ab6d448cf9660df7a22582b0b592a8c3092979864c252555d44551e3_1280.jpg" 
          alt="Agriculture" 
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent flex items-end p-16">
          <div className="max-w-md text-white">
            <h2 className="text-4xl font-display font-bold mb-4">Welcome back to Delamere</h2>
            <p className="text-lg text-white/80">Connect with the richest agricultural network in Kenya.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Sprout className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">Delamere Farm</span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground mb-8">Enter your details to access your account.</p>

          {error && (
            <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
