import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import motionConfig from "../../design/motion";
import useOnboardingStore from "../../store/onboardingStore";
import { submitProfile } from "../../services/api";
import CardWrapper from "../components/CardWrapper";
import InputField from "../components/InputField";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import "./VerificationPage.css";

const AADHAAR_REGEX = /^\d{12}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export default function VerificationPage() {
  const navigate = useNavigate();
  const { role } = useParams();
  const onboardingData = useOnboardingStore();
  const { aadhaar, pan, setField } = onboardingData;
  const [aadhaarError, setAadhaarError] = useState("");
  const [panError, setPanError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aadhaarFocused, setAadhaarFocused] = useState(false);

  const formatAadhaar = (val) => {
    const digits = val.replace(/\D/g, "");
    const parts = [];
    for (let i = 0; i < digits.length && i < 12; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const maskAadhaar = (val) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 12) {
      return `XXXX XXXX ${digits.slice(8)}`;
    }
    return formatAadhaar(val);
  };

  const handleAadhaar = useCallback(
    (e) => {
      const raw = e.target.value.replace(/\D/g, "");
      if (raw.length <= 12) {
        setField("aadhaar", raw);
        if (raw.length > 0 && raw.length < 12) {
          setAadhaarError("Aadhaar must be 12 digits");
        } else {
          setAadhaarError("");
        }
      }
    },
    [setField],
  );

  const handlePan = useCallback(
    (e) => {
      const val = e.target.value.toUpperCase().slice(0, 10);
      setField("pan", val);
      if (val.length > 0 && !PAN_REGEX.test(val)) {
        setPanError("Format: ABCDE1234F");
      } else {
        setPanError("");
      }
    },
    [setField],
  );

  const handleNext = async () => {
    let valid = true;
    if (!AADHAAR_REGEX.test(aadhaar)) {
      setAadhaarError("Aadhaar must be 12 digits");
      valid = false;
    }
    if (!PAN_REGEX.test(pan)) {
      setPanError("Format: ABCDE1234F");
      valid = false;
    }
    if (!valid) return;

    setSubmitError("");
    setLoading(true);
    try {
      await submitProfile(role, onboardingData);
      navigate(`/${role}`);
    } catch (err) {
      setSubmitError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const aadhaarDisplay = aadhaarFocused
    ? formatAadhaar(aadhaar)
    : maskAadhaar(aadhaar);

  return (
    <CardWrapper>
      <ProgressBar current={3} total={3} />

      <motion.div
        className="verification-fields"
        variants={motionConfig.stagger}
        initial="initial"
        animate="animate"
      >
        <InputField
          label="Aadhaar Number"
          value={aadhaarDisplay}
          onChange={handleAadhaar}
          onFocus={() => setAadhaarFocused(true)}
          onBlur={() => setAadhaarFocused(false)}
          placeholder="XXXX XXXX XXXX"
          error={aadhaarError}
          isValid={AADHAAR_REGEX.test(aadhaar)}
          maxLength={14}
          className="aadhaar-input"
        />
        <InputField
          label="Pan Card Number"
          value={pan}
          onChange={handlePan}
          placeholder="ABCDE1234F"
          error={panError}
          isValid={PAN_REGEX.test(pan)}
          maxLength={10}
        />
      </motion.div>

      {submitError && <p className="ob-submit-error">{submitError}</p>}

      <div className="ob-btn-row">
        <Button
          variant="ghost"
          onClick={() => navigate(`/${role}/onboarding/address`)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={loading || !AADHAAR_REGEX.test(aadhaar) || !PAN_REGEX.test(pan)}
        >
          {loading ? "Saving..." : "Finish"}
        </Button>
      </div>
    </CardWrapper>
  );
}
