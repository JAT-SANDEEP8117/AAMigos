import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import OrangeBubble from "./OrangeBubble";
import AuthForm from "./AuthForm";
import "./AuthPage.css";

const panelTransition = {
  duration: 0.7,
  ease: [0.65, 0, 0.35, 1],
};

export default function AuthPage() {
  const { mode } = useAuthStore();
  const isLogin = mode === "login";

  const loginFrames = [
    "80px 0px 0px 80px",
    "80px 80px 80px 80px",
    "0px 80px 80px 0px",
  ];
  const signupFrames = [
    "0px 80px 80px 0px",
    "80px 80px 80px 80px",
    "80px 0px 0px 80px",
  ];
  const borderRadiusAnim = isLogin ? loginFrames : signupFrames;

  return (
    <div className="auth-page">
      <div className={`auth-card ${isLogin ? "is-login" : "is-signup"}`}>
        {/* Orange Panel — swaps position via flex-direction driven by parent class */}
        <motion.div
          className="orange-panel"
          layout
          transition={panelTransition}
          // Scale and borderRadius keyframes play nicely together
          animate={{
            scale: [1, 1.03, 1],
            borderRadius: borderRadiusAnim,
          }}
        >
          <OrangeBubble />
        </motion.div>

        {/* Form Panel — automatically fills remaining space and swaps position */}
        <motion.div className="form-panel" layout transition={panelTransition}>
          <AuthForm />
        </motion.div>
      </div>
    </div>
  );
}
