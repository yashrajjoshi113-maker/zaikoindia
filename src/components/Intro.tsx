"use client";

import { useEffect, useState } from "react";

interface IntroProps {
  onComplete: () => void;
}

export default function Intro({ onComplete }: IntroProps) {
  const [isOut, setIsOut] = useState(false);
  const [stars, setStars] = useState<{ id: number; size: number; top: number; left: number; delay: number; duration: number }[]>([]);
  const [buildings, setBuildings] = useState<{ id: number; width: number; height: number; margin: number; windows: { row: number; col: number; lit: boolean }[] }[]>([]);
  const [activeDot, setActiveDot] = useState(1);

  useEffect(() => {
    // Generate stars
    const tempStars = [];
    for (let i = 0; i < 120; i++) {
      tempStars.push({
        id: i,
        size: Math.random() * 2.5 + 0.5,
        top: Math.random() * 55,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 1.5 + Math.random() * 2,
      });
    }
    setStars(tempStars);

    // Generate city buildings
    const tempBuildings: any[] = [];
    const buildingConfigs = [
      { w: 40, h: 80 }, { w: 60, h: 130 }, { w: 35, h: 70 }, { w: 80, h: 175 },
      { w: 50, h: 115 }, { w: 30, h: 65 }, { w: 70, h: 195 }, { w: 45, h: 95 },
      { w: 90, h: 155 }, { w: 55, h: 125 }, { w: 38, h: 90 }, { w: 65, h: 145 },
      { w: 42, h: 105 }, { w: 75, h: 165 }, { w: 50, h: 85 }, { w: 35, h: 75 },
      { w: 60, h: 135 }, { w: 80, h: 185 }, { w: 40, h: 95 }, { w: 55, h: 120 }
    ];

    buildingConfigs.forEach((cfg, idx) => {
      const windowRows = Math.floor(cfg.h / 22);
      const windowCols = Math.floor(cfg.w / 14);
      const windows: any[] = [];

      for (let r = 0; r < windowRows; r++) {
        for (let c = 0; c < windowCols; c++) {
          windows.push({
            row: r,
            col: c,
            lit: Math.random() > 0.45,
          });
        }
      }

      tempBuildings.push({
        id: idx,
        width: cfg.w,
        height: cfg.h,
        margin: idx === 0 ? 0 : Math.random() * 7,
        windows,
      });
    });
    setBuildings(tempBuildings);

    // Timeline dots animation
    const dotTimer1 = setTimeout(() => setActiveDot(2), 1000);
    const dotTimer2 = setTimeout(() => setActiveDot(3), 2000);

    // Auto complete intro
    const autoTimer = setTimeout(() => {
      handleSkip();
    }, 3400);

    return () => {
      clearTimeout(dotTimer1);
      clearTimeout(dotTimer2);
      clearTimeout(autoTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsOut(true);
    setTimeout(() => {
      onComplete();
    }, 900); // Wait for transition fadeout
  };

  return (
    <div id="intro" className={isOut ? "out" : ""}>
      <div className="intro-sky" />
      
      {/* Stars Container */}
      <div id="starsC">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              top: `${s.top}%`,
              left: `${s.left}%`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      {/* City Container */}
      <div className="city-wrap" id="cityWrap">
        {buildings.map((b) => (
          <div
            key={b.id}
            className="bldg"
            style={{
              width: `${b.width}px`,
              height: `${b.height}px`,
              marginLeft: `${b.margin}px`,
            }}
          >
            {b.windows.map((w, wIdx) => (
              w.lit && (
                <div
                  key={wIdx}
                  className="bldg-win"
                  style={{
                    width: "7px",
                    height: "9px",
                    top: `${w.row * 18 + 8}px`,
                    left: `${w.col * 12 + 6}px`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              )
            ))}
          </div>
        ))}
      </div>

      {/* Road & Rider */}
      <div className="road-stripe">
        <div className="road-line" style={{ width: "120px", left: "0%" }} />
        <div className="road-line" style={{ width: "90px", left: "20%", animationDelay: ".12s" }} />
        <div className="road-line" style={{ width: "110px", left: "42%", animationDelay: ".06s" }} />
        <div className="road-line" style={{ width: "80px", left: "64%", animationDelay: ".18s" }} />
        <div className="road-line" style={{ width: "100px", left: "82%", animationDelay: ".09s" }} />
      </div>
      <div className="ground" />

      {/* Rider Animation block */}
      <div
        id="riderEl"
        className="rider-wrap"
      >
        <div className="speed-lines">
          <div className="spd" style={{ width: "90px" }} />
          <div className="spd" style={{ width: "65px", animationDelay: ".07s" }} />
          <div className="spd" style={{ width: "100px", animationDelay: ".15s" }} />
          <div className="spd" style={{ width: "55px", animationDelay: ".04s" }} />
        </div>
        <div className="bike-scene">
          <div className="bike-glow" />
          <div className="wheel wback">
            <div className="wheel-spoke" style={{ transform: "rotate(0deg)" }} />
            <div className="wheel-spoke" style={{ transform: "rotate(45deg)" }} />
            <div className="wheel-spoke" style={{ transform: "rotate(90deg)" }} />
            <div className="wheel-spoke" style={{ transform: "rotate(135deg)" }} />
          </div>
          <div className="wheel wfront">
            <div className="wheel-spoke" style={{ transform: "rotate(0deg)" }} />
            <div className="wheel-spoke" style={{ transform: "rotate(45deg)" }} />
            <div className="wheel-spoke" style={{ transform: "rotate(90deg)" }} />
            <div className="wheel-spoke" style={{ transform: "rotate(135deg)" }} />
          </div>
          <div className="bframe">
            <div className="fbar" style={{ width: "82px", height: "5px", bottom: "10px", left: "18px" }} />
            <div className="fbar" style={{ width: "5px", height: "32px", bottom: "10px", left: "86px" }} />
            <div className="fbar" style={{ width: "54px", height: "5px", bottom: "36px", left: "33px", transform: "rotate(-8deg)" }} />
            <div className="fbar" style={{ width: "5px", height: "34px", bottom: "10px", right: "18px", transform: "rotate(-8deg)" }} />
            <div className="fbar" style={{ width: "22px", height: "5px", bottom: "42px", right: "12px", transform: "rotate(-20deg)" }} />
          </div>
          <div className="rider-figure">
            <div className="rider-head"><div className="rider-helmet" /></div>
            <div className="rider-body">
              <div className="rarm1" />
              <div className="rarm2" />
              <div className="dbag">🍱</div>
            </div>
          </div>
          <div className="exhaust-puff">
            <div className="puff" />
            <div className="puff" />
            <div className="puff" />
          </div>
        </div>
      </div>

      {/* Brand Text */}
      <div className="intro-brand">
        <div className="intro-logo-text">ZAIKO</div>
        <div className="intro-tag">Food Delivered at the Speed of Hunger</div>
      </div>

      {/* Floating Notification */}
      <div className="intro-notif">
        <div className="intro-notif-dot" />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
          🎉 Your order is 2 min away!
        </span>
      </div>

      {/* Dot Indicators */}
      <div className="intro-dots">
        <div className={`i-dot ${activeDot === 1 ? "active" : ""}`} />
        <div className={`i-dot ${activeDot === 2 ? "active" : ""}`} />
        <div className={`i-dot ${activeDot === 3 ? "active" : ""}`} />
      </div>

      <button className="intro-skip" onClick={handleSkip}>
        Skip ✕
      </button>
    </div>
  );
}
