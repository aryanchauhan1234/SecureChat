import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen py-10 bg-white dark:bg-base-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Illustration and Message */}
        <div className="hidden md:flex flex-col items-center justify-center text-primary">
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">Join our community</h2>
            <p className="text-base-content/70 text-white font-bold text-2xl max-w-md">
              Connect with friends, share moments, and stay in touch with your loved ones.
            </p>
            <img
              src="/undraw_my-password_iyga.svg"
              alt="Signup Illustration"
              className="w-full max-w-sm mx-auto"
            />
          </div>
        </div>

        {/* Right: Sign Up Form */}
        <div className="bg-base-100 dark:bg-neutral shadow-md rounded-2xl p-8 sm:p-10 w-full max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-base-content dark:text-white mb-8">
            Create your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-base-content dark:text-white">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-base-content/50 dark:text-blue-600" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input input-bordered w-full pl-10 bg-white dark:bg-neutral-focus text-base-content dark:text-black"
                  required
                />
              </div>
            </div>

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigningUp}
              className="btn btn-primary w-full mt-3"
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Link to login */}
          <div className="text-sm text-center text-base-content/60 dark:text-white/60 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
