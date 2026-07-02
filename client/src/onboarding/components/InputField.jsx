import { motion } from "framer-motion";
import motionConfig from "../../design/motion";
import "./InputField.css";

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function InputField({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = "",
  type = "text",
  disabled = false,
  error = "",
  isValid = false,
  maxLength,
  className = "",
}) {
  return (
    <motion.div
      className={`ob-input ${className}`}
      variants={motionConfig.item}
    >
      {label && <label className="ob-input__label">{label}</label>}
      <div className="ob-input__field-wrap">
        <input
          className={`ob-input__field ${error ? "ob-input__field--error" : ""}`}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete="off"
        />
        {isValid && (
          <span className="ob-input__valid-icon">
            <CheckIcon />
          </span>
        )}
      </div>
      {error && <span className="ob-input__error">{error}</span>}
    </motion.div>
  );
}
