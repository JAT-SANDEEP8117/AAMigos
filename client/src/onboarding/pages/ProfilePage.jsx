import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Cropper from "react-easy-crop";
import motionConfig from "../../design/motion";
import useOnboardingStore from "../../store/onboardingStore";
import { fetchProfile, isProfileComplete } from "../../services/api";
import CardWrapper from "../components/CardWrapper";
import InputField from "../components/InputField";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import "./ProfilePage.css";

const UserPlaceholder = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CameraIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to crop image"));
        },
        "image/jpeg",
        0.92,
      );
    };
    image.onerror = () => reject(new Error("Failed to load image"));
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { role } = useParams();
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const { avatarPreview, name, contact, setAvatar, setField } =
    useOnboardingStore();

  const isAgent = role === "agent";
  const totalSteps = isAgent ? 3 : 2;

  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  useEffect(() => {
    let active = true;
    async function checkProfile() {
      try {
        const profile = await fetchProfile(role);
        if (active && isProfileComplete(profile)) {
          navigate(`/${role}`, { replace: true });
        }
      } catch {
        // Stay on onboarding if profile cannot be loaded
      }
    }
    checkProfile();
    return () => {
      active = false;
    };
  }, [role, navigate]);

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setRawImage(url);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }, []);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (rawImage && croppedArea) {
      try {
        const blob = await getCroppedImg(rawImage, croppedArea);
        const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
        setAvatar(file);
      } catch {
        // Keep cropper open if crop fails
        return;
      }
    }
    setShowCropper(false);
    setRawImage(null);
  }, [rawImage, croppedArea, setAvatar]);

  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setRawImage(null);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  return (
    <CardWrapper>
      <ProgressBar current={1} total={totalSteps} />

      <motion.div
        className="profile-avatar"
        variants={motionConfig.item}
        initial="initial"
        animate="animate"
      >
        <div className="profile-avatar__wrap">
          <div
            className={`profile-avatar__circle ${dragging ? "dragging" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="profile-avatar__img"
              />
            ) : (
              <span className="profile-avatar__placeholder">
                <UserPlaceholder />
              </span>
            )}
          </div>
          <span
            className="profile-avatar__camera"
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
          >
            <CameraIcon />
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="profile-avatar__input"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </motion.div>

      <motion.div
        className="profile-fields"
        variants={motionConfig.stagger}
        initial="initial"
        animate="animate"
      >
        <InputField
          label="Name"
          value={name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Enter your full name"
        />
        <InputField
          label="Contact No."
          value={contact}
          onChange={(e) => setField("contact", e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="Enter your contact number"
          maxLength={10}
        />
      </motion.div>

      <div className="ob-btn-row ob-btn-row--end">
        <Button
          onClick={() => navigate(`/${role}/onboarding/address`)}
          disabled={!name.trim() || contact.length < 10 || !avatarPreview}
        >
          Next
        </Button>
      </div>

      {showCropper && rawImage && (
        <div className="crop-modal-overlay" onClick={handleCropCancel}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="crop-modal__title">Crop Photo</h3>
            <div className="crop-modal__container">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="crop-modal__slider-row">
              <span className="crop-modal__label">Zoom</span>
              <input
                type="range"
                className="crop-modal__slider"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <div className="crop-modal__actions">
              <Button variant="ghost" onClick={handleCropCancel}>
                Cancel
              </Button>
              <Button onClick={handleCropSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </CardWrapper>
  );
}
