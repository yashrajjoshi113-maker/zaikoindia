"use client";

import { useState, useRef, useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, error?: boolean) => void;
  onLoginSuccess: (role: string, phone: string) => void;
}

export default function AuthModal({ isOpen, onClose, showToast, onLoginSuccess }: AuthModalProps) {
  const [loginType, setLoginType] = useState<"customer" | "rider" | "restaurant" | "admin">("customer");
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Reset state when modal closes/opens
    if (!isOpen) {
      setShowPhoneLogin(false);
      setPhoneNumber("");
      setShowOtpSection(false);
      setOtp(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneSubmit = () => {
    if (phoneNumber.length < 10) {
      showToast("📱 Enter a valid 10-digit number", true);
      return;
    }
    setShowOtpSection(true);
    showToast(`📱 OTP sent to +91 ${phoneNumber} (use 123456 for demo)`);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Shift focus to next input
    if (value !== "" && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp === "123456") {
      const messages = {
        customer: "👋 Welcome back! Redirecting to your dashboard...",
        rider: "🛵 Rider dashboard loading...!",
        restaurant: "🍽️ Restaurant panel loading...!",
        admin: "🛡️ Admin panel access granted!",
      };
      showToast(messages[loginType]);
      onLoginSuccess(loginType, phoneNumber);
      onClose();
    } else {
      showToast("❌ Wrong OTP. Use 123456 for demo", true);
    }
  };

  return (
    <div className={`modal-overlay open`} id="loginModal">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="modal-box">
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="modal-logo">zaiko</div>
        
        {!showPhoneLogin ? (
          <div id="loginContent">
            <div className="modal-title">Welcome Back</div>
            <div className="modal-sub">Choose how you want to sign in</div>
            
            <div className="login-selector">
              <div 
                className={`ls-option ${loginType === "customer" ? "selected" : ""}`}
                onClick={() => setLoginType("customer")}
              >
                <div className="ls-icon">🛒</div>
                <div className="ls-label">Customer</div>
                <div className="ls-sub">Order food</div>
              </div>
              
              <div 
                className={`ls-option ${loginType === "rider" ? "selected" : ""}`}
                onClick={() => setLoginType("rider")}
              >
                <div className="ls-icon">🛵</div>
                <div className="ls-label">Rider</div>
                <div className="ls-sub">Deliver orders</div>
              </div>
              
              <div 
                className={`ls-option ${loginType === "restaurant" ? "selected" : ""}`}
                onClick={() => setLoginType("restaurant")}
              >
                <div className="ls-icon">🍽️</div>
                <div className="ls-label">Restaurant</div>
                <div className="ls-sub">Manage menu</div>
              </div>
              
              <div 
                className={`ls-option ${loginType === "admin" ? "selected" : ""}`}
                onClick={() => setLoginType("admin")}
              >
                <div className="ls-icon">🛡️</div>
                <div className="ls-label">Admin</div>
                <div className="ls-sub">Control panel</div>
              </div>
            </div>
            
            <button 
              className="btn btn-primary w-full mt-5 py-3.5"
              style={{ width: "100%", marginTop: "20px", padding: "14px" }}
              onClick={() => setShowPhoneLogin(true)}
            >
              Continue →
            </button>
            
            <div className="divider-row">
              <div className="divider-line" />
              <span className="divider-text">OR</span>
              <div className="divider-line" />
            </div>
            
            <button 
              className="google-btn w-full"
              onClick={() => showToast("🌐 Google login coming soon!")}
            >
              <span>🌐</span> Continue with Google
            </button>
          </div>
        ) : (
          <div id="phoneLoginContent">
            <div className="modal-title text-capitalize" style={{ textTransform: "capitalize" }}>
              {loginType} Login
            </div>
            <div className="modal-sub">Enter your mobile number to receive OTP</div>
            
            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label">Mobile Number</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "12px",
                  padding: "13px 14px",
                  color: "var(--sub)",
                  fontWeight: "700",
                  whiteSpace: "nowrap"
                }}>
                  +91
                </div>
                <input 
                  className="form-input" 
                  type="tel" 
                  placeholder="98765 43210" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  disabled={showOtpSection}
                />
              </div>
            </div>

            {showOtpSection && (
              <div id="otpSection">
                <label className="form-label" style={{ marginTop: "16px", display: "block" }}>
                  Enter OTP
                </label>
                <div className="auth-otp-row">
                  {otp.map((val, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      className="otp-cell"
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted)", textAlign: "center" }}>
                  Use <strong style={{ color: "var(--primary)" }}>1 2 3 4 5 6</strong> for demo
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: "100%", marginTop: "12px", padding: "14px" }}
                  onClick={handleVerifyOtp}
                >
                  Verify & Enter ✓
                </button>
              </div>
            )}

            {!showOtpSection && (
              <div id="sendOtpBtn">
                <button 
                  className="btn btn-primary" 
                  style={{ width: "100%", marginTop: "16px", padding: "14px" }}
                  onClick={handlePhoneSubmit}
                >
                  Send OTP 📱
                </button>
                <button 
                  className="btn btn-ghost" 
                  style={{ width: "100%", marginTop: "10px", padding: "12px" }}
                  onClick={() => {
                    showToast("🧪 Demo mode activated!");
                    onLoginSuccess("customer", "9876543210");
                    onClose();
                  }}
                >
                  🧪 Demo Mode
                </button>
              </div>
            )}

            <button 
              onClick={() => {
                setShowPhoneLogin(false);
                setShowOtpSection(false);
                setOtp(["", "", "", "", "", ""]);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                marginTop: "14px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
