"use client";

import { useEffect, useState, useRef } from "react";
import Cursor from "../components/Cursor";
import Intro from "../components/Intro";
import AuthModal from "../components/AuthModal";
import CartSidebar, { CartItem } from "../components/CartSidebar";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ msg: string; error: boolean; show: boolean }>({
    msg: "",
    error: false,
    show: false,
  });

  // User session state
  const [user, setUser] = useState<{ role: string; phone: string; isLoggedIn: boolean } | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [restaurantFilter, setRestaurantFilter] = useState("all");

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  // Stats Count-up
  const [stats, setStats] = useState({ orders: 0, restaurants: 0, riders: 0, satisfaction: 0 });
  const [statsTriggered, setStatsTriggered] = useState(false);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  // Forms
  const [partnerForm, setPartnerForm] = useState({ restName: "", ownerName: "", phone: "", cuisine: "North Indian", address: "" });
  const [riderForm, setRiderForm] = useState({ fullName: "", phone: "", vehicleType: "Motorcycle / Scooter", vehicleNumber: "", city: "Delhi", availability: "Full-time (8+ hours)" });
  const [waitlistEmail, setWaitlistEmail] = useState("");

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Parallax orb positioning
  const [scrollY, setScrollY] = useState(0);

  // Toast handler
  const showToast = (msg: string, error = false) => {
    setToast({ msg, error, show: true });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Set body scroll based on intro
  useEffect(() => {
    if (!introDone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Trigger stats count-up after intro finishes
      triggerStatsAnimation();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  // Track scroll for active nav items and parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const mainNav = document.getElementById("mainNav");
      if (mainNav) {
        mainNav.classList.toggle("scrolled", window.scrollY > 60);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown Clock
  useEffect(() => {
    const launchDate = new Date("2026-08-01T00:00:00");
    const interval = setInterval(() => {
      const diff = launchDate.getTime() - new Date().getTime();
      if (diff <= 0) {
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        clearInterval(interval);
        return;
      }
      const days = String(Math.floor(diff / 86400000)).padStart(2, "0");
      const hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for Stats Section
  useEffect(() => {
    if (!introDone) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsTriggered) {
            triggerStatsAnimation();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }
    return () => observer.disconnect();
  }, [introDone, statsTriggered]);

  const triggerStatsAnimation = () => {
    setStatsTriggered(true);
    const duration = 2000;
    const steps = 120;
    const stepTime = duration / steps;
    
    const targets = { orders: 250000, restaurants: 500, riders: 2000, satisfaction: 97 };
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setStats({
        orders: Math.floor(targets.orders * progress),
        restaurants: Math.floor(targets.restaurants * progress),
        riders: Math.floor(targets.riders * progress),
        satisfaction: Math.floor(targets.satisfaction * progress),
      });

      if (currentStep >= steps) {
        setStats(targets);
        clearInterval(timer);
      }
    }, stepTime);
  };

  // Cart operations
  const handleAddToCart = (name: string, price: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.name === name);
      if (existing) {
        return prev.map((item) =>
          item.name === name ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            name,
            price,
            qty: 1,
            img: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=100&q=80",
          },
        ];
      }
    });
    showToast(`🛒 ${name} added to cart!`);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (name: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.name === name);
      if (existing && existing.qty > 1) {
        return prev.map((item) =>
          item.name === name ? { ...item, qty: item.qty - 1 } : item
        );
      } else {
        return prev.filter((item) => item.name !== name);
      }
    });
  };

  const handleClearCart = () => setCartItems([]);

  // Login handler
  const handleLoginSuccess = (role: string, phone: string) => {
    setUser({ role, phone, isLoggedIn: true });
    // In later phase, redirect to proper dashboard using routing
    showToast(`🔑 Logged in as ${role.toUpperCase()}!`);
  };

  // Sign out
  const handleSignOut = () => {
    setUser(null);
    showToast("👋 Signed out successfully.");
  };

  // Form Submissions
  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.restName || !partnerForm.ownerName || !partnerForm.phone || !partnerForm.address) {
      showToast("⚠️ Please fill in all fields", true);
      return;
    }
    showToast("🍽️ Restaurant application submitted! We'll contact you in 24 hours.");
    setPartnerForm({ restName: "", ownerName: "", phone: "", cuisine: "North Indian", address: "" });
  };

  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderForm.fullName || !riderForm.phone || !riderForm.vehicleNumber) {
      showToast("⚠️ Please fill in all fields", true);
      return;
    }
    showToast("🛵 Rider application submitted! Welcome to Team Zaiko!");
    setRiderForm({ fullName: "", phone: "", vehicleType: "Motorcycle / Scooter", vehicleNumber: "", city: "Delhi", availability: "Full-time (8+ hours)" });
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      showToast("⚠️ Enter a valid email address", true);
      return;
    }
    const subject = encodeURIComponent("New Waitlist Signup — Zaiko");
    const body = encodeURIComponent(`New waitlist signup:\nEmail: ${waitlistEmail}\nTime: ${new Date().toLocaleString("en-IN")} IST`);
    window.location.href = `mailto:zaikodelivered@gmail.com?subject=${subject}&body=${body}`;
    setWaitlistEmail("");
    showToast("🎉 You're on the waitlist! ₹100 Zaiko Cash awaits you on launch day.");
  };

  return (
    <>
      <Cursor />

      {/* Intro Overlay Component */}
      {!introDone && <Intro onComplete={() => setIntroDone(true)} />}

      <div id="site" style={{ opacity: introDone ? 1 : 0, transition: "opacity .8s ease" }}>
        
        {/* Navigation Bar */}
        <nav id="mainNav">
          <div className="nav-brand">
            <div className="nav-logo-icon">Z</div>
            <span className="nav-logo-name">zaiko</span>
          </div>
          <ul className="nav-links">
            <li><a href="#hero" className="active">Home</a></li>
            <li><a href="#restaurants">Restaurants</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#offers">Offers</a></li>
            <li><a href="#partner">Partners</a></li>
            <li><a href="#whats-new">What's New</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-actions">
            {user?.isLoggedIn ? (
              <>
                <span style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>
                  👤 {user.role.toUpperCase()}
                </span>
                <button className="btn btn-ghost" onClick={handleSignOut}>Sign Out</button>
              </>
            ) : (
              <button className="btn btn-ghost" onClick={() => setIsLoginOpen(true)}>Sign In</button>
            )}
            <button className="btn btn-primary" onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })}>
              🍛 Order Now
            </button>
          </div>
          <div className="nav-hamburger" onClick={() => setMobileMenuOpen(true)}>
            <span />
            <span />
            <span />
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <span className="menu-close" onClick={() => setMobileMenuOpen(false)}>✕</span>
          <a href="#hero" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#restaurants" onClick={() => setMobileMenuOpen(false)}>Restaurants</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#offers" onClick={() => setMobileMenuOpen(false)}>Offers</a>
          <a href="#partner" onClick={() => setMobileMenuOpen(false)}>Partners</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          {user?.isLoggedIn ? (
            <button className="btn btn-primary" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} style={{ fontSize: 16, padding: "14px 32px" }}>
              Sign Out
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setIsLoginOpen(true); setMobileMenuOpen(false); }} style={{ fontSize: 16, padding: "14px 32px" }}>
              Sign In / Register
            </button>
          )}
        </div>

        {/* Hero Banner Section */}
        <section className="hero" id="hero">
          <div className="hero-ambient">
            <div className="orb orb1" style={{ transform: `translateY(calc(-50% + ${scrollY * 0.12}px))` }} />
            <div className="orb orb2" />
            <div className="orb orb3" />
            <div className="particles-hero">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="p-dot"
                  style={{
                    width: `${Math.random() * 12 + 4}px`,
                    height: `${Math.random() * 12 + 4}px`,
                    background: ["#F97316", "#FF5500", "#22C55E", "#8B5CF6", "#F59E0B"][i % 5],
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 10 + 6}s`,
                    animationDelay: `${Math.random() * 6}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="live-dot" /> Now Live in Delhi-NCR & Gurugram
            </div>
            <h1 className="hero-headline">
              Food Delivered<br />
              <em>Faster Than</em><br />
              <span className="line2">Ever Before.</span>
            </h1>
            <p className="hero-sub">
              Zaiko delivers restaurant-quality meals in under 25 minutes. 100% vegetarian options, lightning fast rider network, and curated AI recommendation vectors.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" style={{ fontSize: 15, padding: "14px 28px" }} onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })}>
                🍛 Order Food Now
              </button>
              <button className="btn btn-outline" style={{ fontSize: 15, padding: "14px 28px" }} onClick={() => document.getElementById("partner")?.scrollIntoView({ behavior: "smooth" })}>
                🏪 Partner With Us
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 15, padding: "14px 28px" }} onClick={() => document.getElementById("rider")?.scrollIntoView({ behavior: "smooth" })}>
                🛵 Become a Rider
              </button>
            </div>
            <div className="hero-stats">
              <div className="hstat">
                <span className="hstat-num">25</span>
                <span className="hstat-label">Avg. Minutes</span>
              </div>
              <div className="hstat">
                <span className="hstat-num">50,000+</span>
                <span className="hstat-label">Happy Customers</span>
              </div>
              <div className="hstat">
                <span className="hstat-num">4.8</span>
                <span className="hstat-label">App Rating ⭐</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="phone">
              <div className="phone-inner">
                <div className="ph-top">
                  <span className="ph-brand">zaiko</span>
                  <span className="ph-notif" />
                </div>
                <div className="ph-search">🔍 &nbsp;Search dishes, restaurants...</div>
                <div className="ph-cats">
                  <span className="ph-cat on">All</span>
                  <span className="ph-cat">Main</span>
                  <span className="ph-cat">Starters</span>
                  <span className="ph-cat">Snacks</span>
                </div>
                <div className="ph-card">
                  <img className="ph-card-img" src="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=400&q=80" alt="food" />
                  <div className="ph-card-body">
                    <div className="ph-card-name">Matar Paneer Premium</div>
                    <div className="ph-row">
                      <span className="ph-price">₹220</span>
                      <button className="ph-add" onClick={() => handleAddToCart("Matar Paneer Premium", 220)}>+ ADD</button>
                    </div>
                    <span className="ph-rating">⭐ 4.5 · 240 votes · 25 min</span>
                  </div>
                </div>
                <div className="ph-card">
                  <img className="ph-card-img" src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80" alt="food" />
                  <div className="ph-card-body">
                    <div className="ph-card-name">Dal Makhani Makhni</div>
                    <div className="ph-row">
                      <span className="ph-price">₹190</span>
                      <button className="ph-add" onClick={() => handleAddToCart("Dal Makhani Makhni", 190)}>+ ADD</button>
                    </div>
                    <span className="ph-rating">⭐ 4.7 · 510 votes · 30 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="float-badge fb1">
              <span className="fb-icon">🛵</span>
              <div>
                <div className="fb-text-label">Live Tracking</div>
                <div className="fb-text-val">Rider Nearby!</div>
              </div>
            </div>
            <div className="float-badge fb2">
              <span className="fb-icon">💰</span>
              <div>
                <div className="fb-text-label">Zaiko Cash</div>
                <div className="fb-text-val">₹50 Saved</div>
              </div>
            </div>
            <div className="float-badge fb3">
              <span className="fb-icon">✅</span>
              <div>
                <div className="fb-text-label">Delivered in</div>
                <div className="fb-text-val">22 minutes</div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Banner */}
        <div className="marquee-bar">
          <div className="marquee-track">
            <span className="m-item">🍛 Free Delivery with FREEVEG<span className="m-sep" /></span>
            <span className="m-item">💸 ₹50 Off with ZAIKO50<span className="m-sep" /></span>
            <span className="m-item">⚡ 25-Minute Delivery Promise<span className="m-sep" /></span>
            <span className="m-item">💎 2% Cashback on Every Order<span className="m-sep" /></span>
            <span className="m-item">🏆 Rated #1 Veg Delivery App 2026<span className="m-sep" /></span>
            <span className="m-item">🚴 Live GPS Rider Tracking<span className="m-sep" /></span>
            <span className="m-item">🌿 100% Pure Vegetarian<span className="m-sep" /></span>
            
            {/* Repeat items for infinite scroll */}
            <span className="m-item">🍛 Free Delivery with FREEVEG<span className="m-sep" /></span>
            <span className="m-item">💸 ₹50 Off with ZAIKO50<span className="m-sep" /></span>
            <span className="m-item">⚡ 25-Minute Delivery Promise<span className="m-sep" /></span>
            <span className="m-item">💎 2% Cashback on Every Order<span className="m-sep" /></span>
            <span className="m-item">🏆 Rated #1 Veg Delivery App 2026<span className="m-sep" /></span>
            <span className="m-item">🚴 Live GPS Rider Tracking<span className="m-sep" /></span>
            <span className="m-item">🌿 100% Pure Vegetarian<span className="m-sep" /></span>
          </div>
        </div>

        {/* Launch Countdown section */}
        <div className="countdown-sec reveal in">
          <div className="cd-title">🚀 Full National Launch Countdown</div>
          <div className="cd-sub">Zaiko is expanding to 12 Indian cities. Don't miss the launch day bonuses!</div>
          <div className="cd-timer">
            <div className="cd-block"><span className="cd-num">{countdown.days}</span><span className="cd-unit">Days</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-block"><span className="cd-num">{countdown.hours}</span><span className="cd-unit">Hours</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-block"><span className="cd-num">{countdown.minutes}</span><span className="cd-unit">Minutes</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-block"><span className="cd-num">{countdown.seconds}</span><span className="cd-unit">Seconds</span></div>
          </div>
        </div>

        {/* Live Statistics Counters */}
        <div className="stats-sec" id="stats" ref={statsSectionRef}>
          <div style={{ textAlign: "center", marginBottom: "0" }}>
            <div className="sec-eyebrow">By the Numbers</div>
            <h2 className="sec-title">Zaiko in Numbers</h2>
          </div>
          <div className="stats-grid stagger in">
            <div className="stat-card">
              <span className="stat-icon">📦</span>
              <div className="stat-num">{stats.orders.toLocaleString("en-IN")}</div>
              <div className="stat-label">Orders Delivered</div>
              <div className="stat-sub">↑ 23% this month</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏪</span>
              <div className="stat-num">{stats.restaurants}</div>
              <div className="stat-label">Active Restaurants</div>
              <div className="stat-sub">Across 4 cities</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🛵</span>
              <div className="stat-num">{stats.riders.toLocaleString("en-IN")}</div>
              <div className="stat-label">Delivery Partners</div>
              <div className="stat-sub">4.8★ avg. rating</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <div className="stat-num">{stats.satisfaction}%</div>
              <div className="stat-label">Customer Satisfaction</div>
              <div className="stat-sub">Industry-leading NPS</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <section style={{ paddingBottom: "0", background: "var(--surface)" }}>
          <div className="sec-eyebrow" style={{ padding: "0 0 14px" }}>What Are You Craving?</div>
          <div className="cat-strip">
            <div className="cat-strip-inner">
              {[
                { name: "All", icon: "🍽️" },
                { name: "North Indian", icon: "🍛" },
                { name: "Biryani", icon: "🥘" },
                { name: "South Indian", icon: "🥞" },
                { name: "Chinese", icon: "🥡" },
                { name: "Fast Food", icon: "🍔" },
                { name: "Pizza", icon: "🍕" },
                { name: "Desserts", icon: "🍮" },
                { name: "Healthy", icon: "🥗" },
                { name: "Street Food", icon: "🧆" },
                { name: "Coffee", icon: "☕" },
              ].map((cat) => (
                <div
                  key={cat.name}
                  className={`cat-pill ${activeCategory === cat.name ? "active" : ""}`}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    showToast(`🍽️ Showing ${cat.name} dishes`);
                  }}
                >
                  <div className="cat-icon-box">{cat.icon}</div>
                  <span className="cat-label">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending / Must Try Dishes */}
        <section className="dishes-sec reveal in">
          <div className="sec-eyebrow">Must Try</div>
          <h2 className="sec-title">Trending Dishes 🔥</h2>
          <div className="dishes-scroll">
            {[
              { name: "Dal Makhani Makhni", price: 190, rest: "Punjabi Tadka", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80" },
              { name: "Veg Biryani Royal", price: 280, rest: "Spice Garden", img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=300&q=80" },
              { name: "Matar Paneer Premium", price: 220, rest: "Dilli Darbar", img: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=300&q=80" },
              { name: "Masala Dosa", price: 120, rest: "South Spice", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=300&q=80" },
              { name: "Paneer Tikka", price: 240, rest: "Grill Nation", img: "https://images.unsplash.com/photo-1567184109411-47a7a39ea897?auto=format&fit=crop&w=300&q=80" },
              { name: "Royal Shahi Tukda", price: 130, rest: "Mithai Corner", img: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80" },
              { name: "Lucknowi Veg Galouti", price: 180, rest: "Nawabi Kitchen", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80" },
              { name: "Hara Bhara Kabab", price: 160, rest: "Green Bowl", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80" }
            ].map((dish) => (
              <div className="dish-card" key={dish.name}>
                <img className="dish-img" src={dish.img} alt={dish.name} />
                <div className="dish-body">
                  <div className="dish-name">{dish.name}</div>
                  <div className="dish-rest">{dish.rest}</div>
                  <div className="dish-row">
                    <span className="dish-price">₹{dish.price}</span>
                    <button className="dish-add-btn" onClick={() => handleAddToCart(dish.name, dish.price)}>
                      + ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Restaurants Section */}
        <section className="rest-sec" id="restaurants">
          <div className="sec-eyebrow">Order Now</div>
          <h2 className="sec-title">Top Restaurants Near You 📍</h2>
          <p className="sec-sub">25+ handpicked restaurants delivering quality food to your doorstep. Fresh. Fast. Delicious.</p>
          <div className="filter-tabs">
            {[
              { id: "all", label: "All" },
              { id: "veg", label: "🟢 Pure Veg" },
              { id: "north", label: "North Indian" },
              { id: "south", label: "South Indian" },
              { id: "chinese", label: "Chinese" },
              { id: "fast", label: "Fast Food" },
              { id: "biryani", label: "Biryani" }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`ftab ${restaurantFilter === tab.id ? "active" : ""}`}
                onClick={() => setRestaurantFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="rest-grid stagger in">
            {[
              { name: "Punjabi Tadka", type: "north veg", cuisine: "North Indian · Punjabi", rating: 4.6, price: 200, eta: 22, veg: true, bestseller: false, offer: "🎁 20% off | ZAIKO50", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80" },
              { name: "Biryani House", type: "biryani", cuisine: "Biryani · Mughlai", rating: 4.8, price: 350, eta: 28, veg: false, bestseller: true, offer: "🎁 Free delivery | FREEVEG", img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=80" },
              { name: "South Spice", type: "south veg", cuisine: "South Indian · Udupi", rating: 4.7, price: 150, eta: 20, veg: true, bestseller: false, offer: "🎁 ₹50 off first order", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80" },
              { name: "Burger Republic", type: "fast", cuisine: "Burgers · Wraps · Fast Food", rating: 4.4, price: 250, eta: 18, veg: false, bestseller: true, offer: "🎁 Buy 1 Get 1 on weekends", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80" },
              { name: "Wok Express", type: "chinese", cuisine: "Chinese · Pan Asian", rating: 4.3, price: 280, eta: 25, veg: false, bestseller: false, offer: "🎁 2% cashback on all orders", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80" },
              { name: "Dilli Darbar", type: "north", cuisine: "North Indian · Mughlai", rating: 4.9, price: 400, eta: 30, veg: false, bestseller: true, offer: "🎁 25% off | WEEKEND25", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80" },
              { name: "Pizza Planet", type: "fast veg", cuisine: "Pizza · Italian · Pasta", rating: 4.5, price: 350, eta: 25, veg: true, bestseller: false, offer: "🎁 Free garlic bread on ₹300+", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80" },
              { name: "Rajdhani Thali", type: "north veg biryani", cuisine: "Thali · Rajasthani · Gujarati", rating: 4.8, price: 220, eta: 25, veg: true, bestseller: false, offer: "🎁 Unlimited thali Sundays", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80" },
              { name: "Noodle Box", type: "chinese fast", cuisine: "Chinese · Noodles · Momos", rating: 4.2, price: 200, eta: 20, veg: false, bestseller: false, offer: "🎁 Free delivery on ₹150+", img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80" },
              { name: "Filter Kaapi House", type: "south veg", cuisine: "Coffee · South Indian · Cafe", rating: 4.5, price: 120, eta: 16, veg: true, bestseller: false, offer: "🎁 Filter coffee + vada ₹59", img: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=400&q=80" },
              { name: "Nawabi Kitchen", type: "biryani north", cuisine: "Mughlai · Kebab · Biryani", rating: 4.7, price: 450, eta: 35, veg: false, bestseller: false, offer: "🎁 Royal thali at ₹299", img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80" },
              { name: "Chaat Chowk", type: "fast veg", cuisine: "Street Food · Chaat · Snacks", rating: 4.4, price: 100, eta: 15, veg: true, bestseller: false, offer: "🎁 Pani puri bucket ₹49", img: "https://images.unsplash.com/photo-1607197109166-50ab86e56b0a?auto=format&fit=crop&w=400&q=80" }
            ].map((rest) => {
              const matchesFilter = restaurantFilter === "all" || rest.type.includes(restaurantFilter);
              if (!matchesFilter) return null;
              return (
                <div className="rest-card" key={rest.name}>
                  <div className="rest-img-wrap">
                    <img className="rest-img" src={rest.img} alt={rest.name} />
                    {rest.veg && <span className="rest-badge-tag badge-veg">🟢 Pure Veg</span>}
                    {rest.bestseller && <span className="rest-badge-tag badge-best">🔥 Bestseller</span>}
                    <span className="rest-eta">⚡ {rest.eta} min</span>
                  </div>
                  <div className="rest-body">
                    <div className="rest-name">{rest.name}</div>
                    <div className="rest-cuisine">{rest.cuisine}</div>
                    <div className="rest-meta">
                      <span className="rest-rating">★ {rest.rating}</span>
                      <span className="rest-price">₹{rest.price} for two</span>
                    </div>
                    <span className="rest-offer">{rest.offer}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Zaiko features */}
        <section className="features-sec" id="features">
          <div className="sec-eyebrow">Why Zaiko</div>
          <h2 className="sec-title">Built Different. Delivered Better.</h2>
          <p className="sec-sub">Every detail — from ingredient sourcing to your doorstep — crafted to give you an experience no other food app offers.</p>
          <div className="feat-grid stagger in">
            <div className="feat-card">
              <div className="feat-icon-box">⚡</div>
              <div className="feat-title">25-Minute Delivery Promise</div>
              <p className="feat-desc">Our geo-optimized rider network and dark kitchen model ensures your order reaches you hot within 25 minutes — or your next delivery is free.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-box">🤖</div>
              <div className="feat-title">AI Food Discovery</div>
              <p className="feat-desc">Zaiko AI learns your mood, the weather, and your cravings to surface the perfect meal every single time. Smarter with every order.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-box">📍</div>
              <div className="feat-title">Live GPS Order Tracking</div>
              <p className="feat-desc">Watch your meal move from chef's hands to your door in real-time. Push notifications at every stage: cooking, packed, picked up, nearby.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-box">💰</div>
              <div className="feat-title">Zaiko Cash Wallet</div>
              <p className="feat-desc">Earn 2% cashback on every order above ₹99. Your wallet balance auto-applies at checkout. The more you order, the more you save.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-box">🔐</div>
              <div className="feat-title">Razorpay Secure Payments</div>
              <p className="feat-desc">Pay via UPI, GPay, PhonePe, Paytm, Debit/Credit Card or Cash on Delivery. All transactions are 256-bit encrypted via Razorpay.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-box">⭐</div>
              <div className="feat-title">Loyalty Tier System</div>
              <p className="feat-desc">Bronze → Silver → Gold → Diamond → Elite. Climb tiers, unlock exclusive deals, priority delivery, and special chef's table experiences.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="hiw-sec" id="how-it-works">
          <div style={{ textAlign: "center" }}>
            <div className="sec-eyebrow">Process</div>
            <h2 className="sec-title">Meal on Your Plate in 4 Simple Steps</h2>
          </div>
          <div className="hiw-steps reveal in">
            <div className="hiw-line" />
            <div className="hiw-step">
              <div className="hiw-num">📱</div>
              <div className="hiw-title">Open the App</div>
              <p className="hiw-desc">Log in with your mobile number. OTP in 10 seconds. Your phone, your identity, done.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">🍛</div>
              <div className="hiw-title">Pick Your Dishes</div>
              <p className="hiw-desc">Browse categories, filter by Must Try, sort by price. Customize spice level, toppings, combos.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">💳</div>
              <div className="hiw-title">Pay Securely</div>
              <p className="hiw-desc">Apply coupon, use Zaiko Cash, pick UPI / Card / COD. Razorpay-powered checkout in 30 seconds.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">🚴</div>
              <div className="hiw-title">Track & Enjoy</div>
              <p className="hiw-desc">Watch your rider live on the map. Get notified at every stage. Eat hot. Rate your meal.</p>
            </div>
          </div>
        </section>

        {/* Offers Grid */}
        <section className="offers-sec" id="offers">
          <div className="sec-eyebrow">Active Offers</div>
          <h2 className="sec-title">Big Savings, Bigger Bites.</h2>
          <p className="sec-sub">Use these codes at checkout. Stack wallet cash for even bigger savings.</p>
          <div className="offers-grid stagger in">
            <div className="offer-card oc-orange wide">
              <span className="offer-tag">🔥 Most Popular</span>
              <div className="offer-code-pill">ZAIKO50</div>
              <div className="offer-title">Flat ₹50 Off Your First Order</div>
              <p className="offer-desc">Valid on orders above ₹199. New users get instant ₹50 discount at checkout.</p>
              <span className="offer-emoji">🎉</span>
            </div>
            <div className="offer-card oc-green">
              <div className="offer-code-pill">FREEVEG</div>
              <div className="offer-title">Zero Delivery Fee — Always</div>
              <p className="offer-desc">Apply FREEVEG to waive off the delivery charge on any cart. Pure savings.</p>
              <span className="offer-emoji">🚴</span>
            </div>
            <div className="offer-card oc-dark">
              <div className="offer-code-pill">CASHBACK2</div>
              <div className="offer-title">2% Wallet Cashback Every Order</div>
              <p className="offer-desc">Auto-applied for orders above ₹99. Earnings land in your Zaiko wallet within minutes.</p>
              <span className="offer-emoji">💎</span>
            </div>
            <div className="offer-card oc-gold">
              <span className="offer-tag">⏰ Weekend</span>
              <div className="offer-code-pill">WEEKEND25</div>
              <div className="offer-title">25% Off Every Weekend</div>
              <p className="offer-desc">Every Saturday & Sunday, use this code for an extra 25% off your total bill.</p>
              <span className="offer-emoji">🍱</span>
            </div>
            <div className="offer-card oc-purple">
              <div className="offer-code-pill">LEVELUP</div>
              <div className="offer-title">Loyalty Tier Bonuses</div>
              <p className="offer-desc">Reach Gold+ to unlock exclusive discounts, early menu access, and priority delivery. The more you order, the better it gets.</p>
              <span className="offer-emoji">⭐</span>
            </div>
          </div>
        </section>

        {/* Restaurant Partner Registration */}
        <section className="partner-sec" id="partner">
          <div className="sec-eyebrow">For Restaurants</div>
          <h2 className="sec-title">Grow Your Restaurant with Zaiko</h2>
          <p className="sec-sub">Join 500+ restaurants already earning more with Zaiko's delivery platform and AI-powered demand forecasting.</p>
          <div className="partner-grid">
            <div className="partner-benefits">
              <div className="pbenefit">
                <div className="pbenefit-icon">📈</div>
                <div>
                  <div className="pbenefit-title">3× Revenue Growth</div>
                  <div className="pbenefit-desc">Average restaurant partner sees 3× revenue increase within the first 3 months of joining Zaiko.</div>
                </div>
              </div>
              <div className="pbenefit">
                <div className="pbenefit-icon">🤖</div>
                <div>
                  <div className="pbenefit-title">AI Demand Forecasting</div>
                  <div className="pbenefit-desc">Get real-time predictions on peak hours, popular dishes, and optimal inventory levels.</div>
                </div>
              </div>
              <div className="pbenefit">
                <div className="pbenefit-icon">📊</div>
                <div>
                  <div className="pbenefit-title">Live Analytics Dashboard</div>
                  <div className="pbenefit-desc">Full revenue analytics, order management, customer insights, competitor benchmarks — all in one place.</div>
                </div>
              </div>
            </div>

            <form className="partner-form reveal in" onSubmit={handlePartnerSubmit}>
              <div className="form-title">Register Your Restaurant</div>
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Punjabi Tadka, Spice Garden..."
                  value={partnerForm.restName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, restName: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Ramesh Kumar"
                    value={partnerForm.ownerName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, ownerName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="98765 43210"
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cuisine Type</label>
                <select
                  className="form-select form-input"
                  value={partnerForm.cuisine}
                  onChange={(e) => setPartnerForm({ ...partnerForm, cuisine: e.target.value })}
                >
                  <option>North Indian</option>
                  <option>South Indian</option>
                  <option>Chinese</option>
                  <option>Fast Food</option>
                  <option>Biryani</option>
                  <option>Multi-Cuisine</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Restaurant Address</label>
                <textarea
                  className="form-textarea"
                  placeholder="Full address with locality and pin code..."
                  value={partnerForm.address}
                  onChange={(e) => setPartnerForm({ ...partnerForm, address: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: "100%", padding: "15px", fontSize: "15px", borderRadius: "12px", background: "linear-gradient(135deg,#10B981,#059669)" }}>
                🍽️ Submit Application
              </button>
            </form>
          </div>
        </section>

        {/* Rider / Delivery Partner Form */}
        <section className="rider-sec" id="rider">
          <div className="rider-grid">
            <div>
              <div className="sec-eyebrow">For Delivery Partners</div>
              <h2 className="sec-title">Earn on Your Terms. Deliver with Zaiko.</h2>
              <p className="sec-sub">Join 2,000+ riders earning great money with flexible hours, peak-hour bonuses, and our industry-leading Gold → Diamond → Elite tier system.</p>
              <div className="rider-stats-group">
                <div className="rstat"><div className="rstat-num">₹847</div><div className="rstat-label">Avg daily earnings</div></div>
                <div className="rstat"><div className="rstat-num">94%</div><div className="rstat-label">Rider satisfaction</div></div>
                <div className="rstat"><div className="rstat-num">3×</div><div className="rstat-label">Peak hour multiplier</div></div>
                <div className="rstat"><div className="rstat-num">₹120</div><div className="rstat-label">Daily streak bonus</div></div>
              </div>
              <div className="rider-perks">
                <div className="rperk">Flexible working hours — morning, afternoon, evening, night</div>
                <div className="rperk">Weekly earnings heat map to maximize your income</div>
                <div className="rperk">Gold → Diamond → Elite rank system with increasing bonuses</div>
                <div className="rperk">Safety Guardian program with accident insurance</div>
              </div>
              <div className="rider-rank-strip">
                <div className="rank-item">🥉 Bronze</div>
                <div className="rank-item">🥈 Silver</div>
                <div className="rank-item" style={{ background: "rgba(249,115,22,.12)", color: "var(--primary)" }}>🥇 Gold</div>
                <div className="rank-item">💎 Diamond</div>
                <div className="rank-item">⭐ Elite</div>
              </div>
            </div>

            <form className="partner-form reveal in" onSubmit={handleRiderSubmit}>
              <div className="form-title">Join as Delivery Partner</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Rahul Kumar"
                    value={riderForm.fullName}
                    onChange={(e) => setRiderForm({ ...riderForm, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="98765 43210"
                    value={riderForm.phone}
                    onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select
                  className="form-select form-input"
                  value={riderForm.vehicleType}
                  onChange={(e) => setRiderForm({ ...riderForm, vehicleType: e.target.value })}
                >
                  <option>Motorcycle / Scooter</option>
                  <option>Electric Scooter</option>
                  <option>Bicycle</option>
                  <option>Cycle</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="KA 05 MX 4521"
                    value={riderForm.vehicleNumber}
                    onChange={(e) => setRiderForm({ ...riderForm, vehicleNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your City</label>
                  <select
                    className="form-select form-input"
                    value={riderForm.city}
                    onChange={(e) => setRiderForm({ ...riderForm, city: e.target.value })}
                  >
                    <option>Delhi</option>
                    <option>Gurugram</option>
                    <option>Noida</option>
                    <option>Faridabad</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select
                  className="form-select form-input"
                  value={riderForm.availability}
                  onChange={(e) => setRiderForm({ ...riderForm, availability: e.target.value })}
                >
                  <option>Full-time (8+ hours)</option>
                  <option>Part-time (4-6 hours)</option>
                  <option>Weekends only</option>
                  <option>Evenings only</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: "100%", padding: "15px", fontSize: "15px", borderRadius: "12px", background: "linear-gradient(135deg,#06B6D4,#0891B2)" }}>
                🛵 Apply to Ride
              </button>
            </form>
          </div>
        </section>

        {/* Latest news / updates feed */}
        <section className="news-sec" id="whats-new">
          <div className="sec-eyebrow">What's New in Zaiko</div>
          <h2 className="sec-title">The Feed — Latest Updates & Features</h2>
          <p className="sec-sub">We're always building. Here's what just dropped and what's coming next.</p>
          <div className="news-grid stagger in">
            <div className="news-card wide">
              <span className="news-emoji">🗺️</span>
              <span className="news-chip chip-new">✦ Just Launched</span>
              <div className="news-title">Real-Time GPS Rider Tracking — Now Live</div>
              <p className="news-desc">Watch your rider move on a live map inside the app. Get push notifications when your order is cooked, packed, and 2 minutes away.</p>
            </div>
            <div className="news-card">
              <span className="news-emoji">🤖</span>
              <span className="news-chip chip-new">✦ New Feature</span>
              <div className="news-title">Zaiko AI Food Assistant</div>
              <p className="news-desc">Ask our AI anything about the menu. Get personalized dish recommendations based on your mood, past orders, and dietary preferences.</p>
            </div>
            <div className="news-card">
              <span className="news-emoji">💳</span>
              <span className="news-chip chip-update">↑ Updated</span>
              <div className="news-title">Razorpay Payment Integration</div>
              <p className="news-desc">Full UPI deep-link support with GPay, PhonePe, Paytm, saved card payments, and a smoother COD flow with digital receipts.</p>
            </div>
          </div>
        </section>

        {/* Ecosystem Overview */}
        <section className="ecosystem-sec">
          <div className="sec-eyebrow">The Zaiko Ecosystem</div>
          <h2 className="sec-title">One Platform. Four Powerful Apps.</h2>
          <p className="sec-sub">Zaiko isn't just a delivery app — it's a complete food ecosystem built for customers, restaurants, riders, and administrators.</p>
          <div className="eco-grid stagger in">
            <div className="eco-card eco-customer">
              <div className="eco-icon">🛒</div>
              <div className="eco-title" style={{ color: "var(--primary)" }}>Customer App</div>
              <div className="eco-desc">Order food, track live, manage wallet, earn loyalty rewards, get AI recommendations.</div>
              <div className="eco-features">
                <div className="eco-feat" style={{ color: "var(--primary)" }}>AI dish recommendations</div>
                <div className="eco-feat" style={{ color: "var(--primary)" }}>Live GPS tracking</div>
                <div className="eco-feat" style={{ color: "var(--primary)" }}>Zaiko Cash wallet</div>
              </div>
            </div>
            <div className="eco-card eco-rider">
              <div className="eco-icon">🛵</div>
              <div className="eco-title" style={{ color: "var(--rider)" }}>Rider App</div>
              <div className="eco-desc">Accept orders, track earnings, view heat maps, climb rank tiers, access safety guardian.</div>
              <div className="eco-features">
                <div className="eco-feat" style={{ color: "var(--rider)" }}>Live order requests</div>
                <div className="eco-feat" style={{ color: "var(--rider)" }}>Weekly earnings charts</div>
                <div className="eco-feat" style={{ color: "var(--rider)" }}>Career rank system</div>
              </div>
            </div>
            <div className="eco-card eco-rest">
              <div className="eco-icon">🍽️</div>
              <div className="eco-title" style={{ color: "var(--rest)" }}>Restaurant Panel</div>
              <div className="eco-desc">Manage orders, view analytics, forecast demand with AI, manage menu inventory live.</div>
              <div className="eco-features">
                <div className="eco-feat" style={{ color: "var(--rest)" }}>AI demand forecasting</div>
                <div className="eco-feat" style={{ color: "var(--rest)" }}>Live order queue</div>
                <div className="eco-feat" style={{ color: "var(--rest)" }}>Revenue analytics</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testi-sec">
          <div className="sec-eyebrow">Real Reviews</div>
          <h2 className="sec-title">Foodies Who Trust Zaiko Every Day</h2>
          <div className="testi-carousel reveal in">
            {[
              { author: "Rahul Sharma", text: "\"The Dal Makhani is insane — tastes like slow-cooked for 12 hours, which apparently they do. Delivered in 28 minutes. My new weekly staple.\"", meta: "Delhi · Gold Member · 28 Orders", theme: "av-orange" },
              { author: "Priya Mehta", text: "\"Finally a food app that doesn't compromise on quality. The customization is chef's kiss. ZAIKO50 actually worked — instant ₹50 off!\"", meta: "Gurugram · Silver Member · 14 Orders", theme: "av-green" },
              { author: "Ankit Verma", text: "\"The live GPS tracking is brilliant — I know exactly when to set my table. The wallet cashback is a great bonus on every order.\"", meta: "Noida · Bronze Member · 9 Orders", theme: "av-gold" },
            ].map((testi, idx) => (
              <div className="testi-card" key={idx}>
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">{testi.text}</p>
                <div className="testi-author">
                  <div className={`tauth-avatar ${testi.theme}`}>{testi.author[0]}</div>
                  <div>
                    <div className="tauth-name">{testi.author}</div>
                    <div className="tauth-meta">{testi.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Areas */}
        <section className="areas-sec">
          <div className="sec-eyebrow">Service Areas</div>
          <h2 className="sec-title">Delivering Across India 🇮🇳</h2>
          <p className="sec-sub">Currently live in Delhi-NCR. Expanding to 12 cities in Q3 2026. Register your city interest below.</p>
          <div className="areas-map">
            <span className="map-bg">🗺️</span>
            <div className="city-pins">
              <div className="city-pin" style={{ top: "28%", left: "28%" }}><div className="pin-dot" /><div className="pin-label">New Delhi ✓</div></div>
              <div className="city-pin" style={{ top: "35%", left: "31%" }}><div className="pin-dot" /><div className="pin-label">Gurugram ✓</div></div>
              <div className="city-pin" style={{ top: "30%", left: "34%" }}>
                <div className="pin-dot" style={{ background: "var(--muted)", boxShadow: "none", animation: "none" }} />
                <div className="pin-label" style={{ color: "var(--muted)" }}>Noida — Soon</div>
              </div>
              <div className="city-pin" style={{ top: "55%", left: "45%" }}>
                <div className="pin-dot" style={{ background: "var(--muted)", boxShadow: "none", animation: "none" }} />
                <div className="pin-label" style={{ color: "var(--muted)" }}>Mumbai — Q3</div>
              </div>
            </div>
          </div>
          <div className="cities-list">
            <span className="city-chip" style={{ background: "rgba(249,115,22,.15)" }}>📍 Delhi ✓ Live</span>
            <span className="city-chip" style={{ background: "rgba(249,115,22,.15)" }}>📍 Gurugram ✓ Live</span>
            <span className="city-chip">📍 Noida — Soon</span>
            <span className="city-chip">📍 Mumbai — Q3 2026</span>
            <span className="city-chip">📍 Bangalore — Q3 2026</span>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="faq-sec">
          <div style={{ textAlign: "center" }}>
            <div className="sec-eyebrow">FAQ</div>
            <h2 className="sec-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {[
              { q: "What payment methods does Zaiko accept?", a: "We accept all major UPI apps (GPay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery. All digital payments are processed securely via Razorpay." },
              { q: "Is Zaiko 100% vegetarian?", a: "Yes! Zaiko is a 100% pure vegetarian food delivery platform. Every restaurant partner is vetted for veg-only kitchens. We have a strict no-meat, no-egg policy across our entire ecosystem." },
              { q: "How does the Zaiko Cash wallet work?", a: "Zaiko Cash is our in-app wallet. You earn 2% cashback on all orders above ₹99. Cashback is credited within minutes of delivery. You can use wallet balance to pay for any future order — it auto-applies at checkout." },
              { q: "Can I track my order in real-time?", a: "Absolutely. Zaiko has a 7-stage Live Kitchen Tracker — you can see exactly where your food is from ingredients prep to delivery. You can also watch your rider's live GPS location on a map once they pick up your order." }
            ].map((item, idx) => {
              const [open, setOpen] = useState(false);
              return (
                <div className={`faq-item ${open ? "open" : ""}`} key={idx}>
                  <button className="faq-q" onClick={() => setOpen(!open)}>
                    {item.q}
                    <span className="faq-icon">{open ? "−" : "+"}</span>
                  </button>
                  <div className="faq-a" style={{ maxHeight: open ? "200px" : "0", paddingBottom: open ? "20px" : "0", overflow: "hidden", transition: "all 0.3s ease" }}>
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Waitlist Email signup */}
        <div className="waitlist-sec" id="contact">
          <div className="waitlist-inner">
            <div>
              <div className="sec-eyebrow">Stay in the Loop</div>
              <h2 className="sec-title" style={{ fontSize: "clamp(28px,3.5vw,44px)" }}>Get Launch Alerts, Exclusive Offers First.</h2>
              <p className="sec-sub" style={{ fontSize: "14px", marginTop: "8px" }}>Join 50,000+ food lovers on the Zaiko waitlist. Get ₹100 Zaiko Cash on launch day when you pre-register.</p>
              
              <form className="wl-input-row" onSubmit={handleWaitlistSubmit}>
                <input
                  className="wl-input"
                  type="email"
                  placeholder="your@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                />
                <button className="btn btn-primary" type="submit" style={{ borderRadius: "50px", whiteSpace: "nowrap" }}>
                  Join Waitlist →
                </button>
              </form>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "10px" }}>🔒 No spam. Unsubscribe anytime. GDPR compliant.</p>
            </div>
            <div className="wl-perks">
              <div className="wl-perk">
                <span className="wl-perk-icon">🎁</span>
                <div>
                  <div className="wl-perk-title">₹100 Launch Bonus</div>
                  <div className="wl-perk-sub">Waitlist members get ₹100 Zaiko Cash on Day 1 of launch in their city.</div>
                </div>
              </div>
              <div className="wl-perk">
                <span className="wl-perk-icon">⚡</span>
                <div>
                  <div className="wl-perk-title">VIP Early Access</div>
                  <div className="wl-perk-sub">Skip the queue — early members get direct Gold tier access and exclusive menu previews.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Download block */}
        <section className="app-sec">
          <div className="app-inner">
            <div>
              <div className="sec-eyebrow">Get the App</div>
              <h2 className="sec-title">Food Delivery in Your Pocket.</h2>
              <p className="sec-sub">Download the Zaiko app for the full experience — AI recommendations, live tracking, exclusive app-only deals, and one-tap reorder.</p>
              <div className="app-badges">
                <div className="app-badge" onClick={() => showToast("App Store link coming soon! 🍎")}>
                  <span className="app-badge-icon">🍎</span>
                  <div>
                    <div className="ab-small">Download on the</div>
                    <div className="ab-big">App Store</div>
                  </div>
                </div>
                <div className="app-badge" onClick={() => showToast("Play Store link coming soon! 🤖")}>
                  <span className="app-badge-icon">▶</span>
                  <div>
                    <div className="ab-small">Get it on</div>
                    <div className="ab-big">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="app-phones-wrap">
              <div className="app-phone-2">
                <div className="app-phone-screen">
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "18px", color: "var(--primary)", letterSpacing: "2px" }}>zaiko</div>
                  <div style={{ background: "rgba(255,255,255,.04)", borderRadius: "10px", height: "60px", marginTop: "8px" }} />
                  <div style={{ background: "rgba(255,255,255,.03)", borderRadius: "8px", height: "40px", marginTop: "6px" }} />
                </div>
              </div>
              <div className="app-phone-1">
                <div className="app-phone-screen">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", color: "var(--primary)", letterSpacing: "2px" }}>zaiko</span>
                    <span style={{ fontSize: "16px" }}>🛒</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "12px", height: "28px", display: "flex", alignItems: "center", padding: "0 10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "9px", color: "var(--muted)" }}>🔍 Search dishes...</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                    <span style={{ background: "var(--primary)", color: "#fff", borderRadius: "10px", padding: "3px 8px", fontSize: "8px", fontWeight: 700 }}>All</span>
                    <span style={{ background: "rgba(255,255,255,.05)", color: "var(--muted)", borderRadius: "10px", padding: "3px 8px", fontSize: "8px" }}>Main</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="footer-top">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="nav-logo-icon">Z</div>
                <span className="nav-logo-name">zaiko</span>
              </div>
              <p className="footer-brand-tag">India's premium pure-veg food delivery platform. Authentic recipes. Lightning delivery. AI-powered experience. Every single time.</p>
              <div className="footer-socials" style={{ marginTop: "20px" }}>
                <div className="fsoc">📸</div>
                <div className="fsoc">🐦</div>
                <div className="fsoc">💼</div>
                <div className="fsoc">▶</div>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Explore</div>
              <ul className="footer-links">
                <li><a href="#restaurants">Restaurants</a></li>
                <li><a href="#offers">Active Offers</a></li>
                <li><a href="#whats-new">What's New</a></li>
                <li><a href="#features">Why Zaiko</a></li>
                <li><a href="#contact">Join Waitlist</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li><a href="#">About Zaiko</a></li>
                <li><a href="#">Our Kitchen</a></li>
                <li><a href="#partner">Partner With Us</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Support</div>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Track Your Order</a></li>
                <li><a href="#">Refund Policy</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Zaiko Foods Pvt. Ltd. · Made with 🧡 in India · FSSAI Certified</span>
            <span>Delhi-NCR · More cities coming 2026</span>
          </div>
        </footer>

      </div> {/* /#site */}

      {/* Floating Action Cart Button */}
      {introDone && (
        <button className="float-cart-btn" onClick={() => setIsCartOpen(true)} id="floatCartBtn">
          🛒
          <span className="float-cart-badge" id="cartBadge">
            {cartItems.reduce((acc, item) => acc + item.qty, 0)}
          </span>
        </button>
      )}

      {/* Floating Toast Notification System */}
      <div className={`toast ${toast.error ? "toast-error" : ""} ${toast.show ? "show" : ""}`} id="toast">
        <span className="toast-dot" />
        <span id="toastMsg">{toast.msg}</span>
      </div>

      {/* Sidebar Cart Drawer Component */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onAddItem={handleAddToCart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        showToast={showToast}
      />

      {/* Login & Role Selection Modal Component */}
      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        showToast={showToast}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
