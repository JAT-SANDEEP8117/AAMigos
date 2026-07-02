import { motion } from "framer-motion";
import motionConfig from "../../design/motion";
import logo from "../../assets/logo.svg";
import "./CardWrapper.css";

export default function CardWrapper({ children }) {
  return (
    <motion.div
      className="onboarding-card"
      initial={motionConfig.card.initial}
      animate={motionConfig.card.animate}
      exit={motionConfig.card.exit}
      transition={motionConfig.card.transition}
    >
      <img src={logo} alt="AAmigo's" className="onboarding-card__logo" />
      {children}
    </motion.div>
  );
}
