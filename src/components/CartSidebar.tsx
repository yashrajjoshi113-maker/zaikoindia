"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  name: string;
  price: number;
  qty: number;
  img: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onAddItem: (name: string, price: number) => void;
  onRemoveItem: (name: string) => void;
  onClearCart: () => void;
  showToast: (msg: string, error?: boolean) => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onAddItem,
  onRemoveItem,
  onClearCart,
  showToast,
}: CartSidebarProps) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<"ZAIKO50" | "FREEVEG" | null>(null);

  const totalCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Delivery calculations
  const isFreeDeliveryByPromo = appliedPromo === "FREEVEG";
  const isFreeDeliveryBySubtotal = subtotal >= 199;
  const isFreeDelivery = isFreeDeliveryByPromo || isFreeDeliveryBySubtotal;
  const deliveryFee = cartItems.length > 0 && !isFreeDelivery ? 35 : 0;

  // Discount calculations
  let discount = 0;
  if (appliedPromo === "ZAIKO50" && subtotal >= 199) {
    discount = 50;
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "ZAIKO50") {
      if (subtotal < 199) {
        showToast("⚠️ Coupon ZAIKO50 is only valid on orders above ₹199", true);
        return;
      }
      setAppliedPromo("ZAIKO50");
      showToast("🎉 ZAIKO50 applied! Flat ₹50 off your order");
    } else if (code === "FREEVEG") {
      setAppliedPromo("FREEVEG");
      showToast("🎉 FREEVEG applied! Free delivery added");
    } else {
      showToast("❌ Invalid promo code. Try ZAIKO50 or FREEVEG", true);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast("🛒 Add items to cart first!", true);
      return;
    }
    showToast("💳 Razorpay checkout — integration ready for production!");
    
    // Simulate Razorpay transaction delay
    setTimeout(() => {
      showToast("✅ Order placed successfully! 🎉");
      onClearCart();
      setAppliedPromo(null);
      setPromoCode("");
      onClose();
    }, 2000);
  };

  return (
    <>
      <div 
        className={`cart-overlay ${isOpen ? "open" : ""}`} 
        onClick={onClose} 
      />
      <div className={`cart-sidebar ${isOpen ? "open" : ""}`} id="cartSidebar">
        <div className="cart-header">
          <span className="cart-title">
            🛒 Your Cart (<span id="cartCount">{totalCount}</span>)
          </span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-body" id="cartBody">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                Your cart is empty
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Add some delicious dishes!
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item-row" key={item.name}>
                <img 
                  className="cart-item-img" 
                  src={item.img} 
                  alt={item.name} 
                />
                <div style={{ flex: 1 }}>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price * item.qty}</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => onRemoveItem(item.name)}>
                    −
                  </button>
                  <span className="qty-count">{item.qty}</span>
                  <button className="qty-btn" onClick={() => onAddItem(item.name, item.price)}>
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer" id="cartFooter">
            <div style={{
              background: "rgba(249,115,22,.08)",
              border: "1px solid rgba(249,115,22,.2)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: "4px" }}>
                <span>Promo code</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  className="form-input" 
                  id="promoInput" 
                  placeholder="ZAIKO50 or FREEVEG" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ padding: "10px 14px", fontSize: 13 }}
                />
                <button 
                  className="btn btn-primary" 
                  style={{ padding: "10px 16px", fontSize: 13 }}
                  onClick={handleApplyPromo}
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="cart-total-row">
              <span style={{ color: "var(--muted)" }}>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="cart-total-row">
                <span style={{ color: "var(--muted)" }}>Coupon Discount</span>
                <span style={{ color: "var(--green)" }}>- ₹{discount}</span>
              </div>
            )}

            <div className="cart-total-row">
              <span style={{ color: "var(--muted)" }}>Delivery fee</span>
              <span style={{ color: deliveryFee === 0 ? "var(--green)" : "var(--text)" }}>
                {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="cart-total-row" style={{ fontSize: 18, color: "var(--primary)" }}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "15px", fontSize: 15, borderRadius: "12px" }}
              onClick={handleCheckout}
            >
              Proceed to Pay via Razorpay →
            </button>
            <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: "10px" }}>
              🔐 Secured by Razorpay · 256-bit SSL
            </p>
          </div>
        )}
      </div>
    </>
  );
}
