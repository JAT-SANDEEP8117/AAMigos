import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import motionConfig from "../../design/motion";
import useOnboardingStore from "../../store/onboardingStore";
import { submitProfile } from "../../services/api";
import CardWrapper from "../components/CardWrapper";
import InputField from "../components/InputField";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import "./AddressPage.css";

export default function AddressPage() {
  const navigate = useNavigate();
  const { role } = useParams();
  const onboardingData = useOnboardingStore();
  const { doorNo, street, city, pincode, setField } = onboardingData;
  const isAgent = role === "agent";
  const totalSteps = isAgent ? 3 : 2;
  const [pincodeError, setPincodeError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePincode = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 6) {
      setField("pincode", val);
      if (val.length > 0 && val.length < 6) {
        setPincodeError("Pincode must be exactly 6 digits");
      } else {
        setPincodeError("");
      }
    }
  };

  const handleSubmitProfile = async () => {
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

  const handleNext = async () => {
    if (pincode.length !== 6) {
      setPincodeError("Pincode must be exactly 6 digits");
      return;
    }
    if (isAgent) {
      navigate(`/${role}/onboarding/verification`);
    } else {
      await handleSubmitProfile();
    }
  };

  return (
    <CardWrapper>
      <ProgressBar current={2} total={totalSteps} />

      <motion.div
        className="address-fields"
        variants={motionConfig.stagger}
        initial="initial"
        animate="animate"
      >
        <InputField
          label="Door No / Apartment Name"
          value={doorNo}
          onChange={(e) => setField("doorNo", e.target.value)}
          placeholder="e.g. 12-A, Sunrise Apartments"
        />
        <InputField
          label="Street Name / Area / Landmark"
          value={street}
          onChange={(e) => setField("street", e.target.value)}
          placeholder="e.g. MG Road, Near Central Mall"
        />
        <div className="address-row">
          <InputField
            label="City"
            value={city}
            onChange={(e) => setField("city", e.target.value)}
            placeholder="City"
          />
          <InputField
            label="Pincode"
            value={pincode}
            onChange={handlePincode}
            placeholder="Pincode"
            error={pincodeError}
            isValid={pincode.length === 6 && !pincodeError}
            maxLength={6}
          />
        </div>
      </motion.div>

      {submitError && <p className="ob-submit-error">{submitError}</p>}

      <div className="ob-btn-row">
        <Button
          variant="ghost"
          onClick={() => navigate(`/${role}/onboarding/profile`)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            loading ||
            !doorNo.trim() ||
            !street.trim() ||
            !city.trim() ||
            pincode.length !== 6
          }
        >
          {loading ? "Saving..." : isAgent ? "Next" : "Finish"}
        </Button>
      </div>
    </CardWrapper>
  );
}
