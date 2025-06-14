import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen bg-white  dark:bg-base-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding / Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center text-primary">
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">Welcome Back!</h2>
            <p className="text-base-content/70 text-white font-bold text-2xl max-w-md">
              Reconnect and continue your conversations. Your people are waiting!
            </p>
            <img
              src="/undraw_my-password_iyga.svg"
              alt="Login Illustration"
              className="w-full max-w-sm mx-auto"
            />
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="bg-base-100 dark:bg-neutral shadow-md rounded-2xl p-8 sm:p-10 w-full max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-base-content dark:text-white mb-8">
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-base-content dark:text-white">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-base-content/50 dark:text-blue-600" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input input-bordered w-full pl-10 bg-white dark:bg-neutral-focus text-base-content dark:text-black"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-base-content dark:text-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-base-content/50 dark:text-blue-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input input-bordered w-full pl-10 pr-10 bg-white dark:bg-neutral-focus text-base-content dark:text-black"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-base-content/50 dark:text-white/50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn btn-primary w-full mt-3"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-sm text-center text-base-content/60 dark:text-white/60 mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
