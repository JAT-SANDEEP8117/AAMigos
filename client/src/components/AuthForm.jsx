import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../store/authStore";
import { login, register, fetchProfile, isProfileComplete } from "../services/api";
import logo from "../assets/logo.svg";
import "./AuthForm.css";

const formVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction * 40,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction * -40,
    transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] },
  }),
};

const MailIcon = () => (
  <svg
    className="input-group__icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function AuthForm() {
  const navigate = useNavigate();
  const { mode, role, loading, error, setAuth, setLoading, setError } = useAuthStore();
  const isLogin = mode === "login" || role === "admin";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const direction = isLogin ? 1 : -1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authFn = isLogin ? login : register;
      const { token } = await authFn(role, email.trim(), password);
      setAuth({ token, role });

      const profile = await fetchProfile(role);
      if (isProfileComplete(profile)) {
        navigate(`/${role}`);
      } else {
        navigate(`/${role}/onboarding/profile`);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <img src={logo} alt="AAmigo's Logo" className="form-panel__logo" />
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={mode}
          custom={direction}
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ width: "100%" }}
        >
          <h2 className="form-panel__title">
            {role === "admin" ? "Admin Log In" : isLogin ? "Log In" : "Sign Up"}
          </h2>

          {error && <p className="auth-error">{error}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                className="input-group__input"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <MailIcon />
            </div>

            <div className="input-group">
              <input
                className="input-group__input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="input-group__toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
