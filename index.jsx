import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  /* ── idle: gentle bob ── */
  @keyframes idleBob {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    30%       { transform: translateY(-5px) rotate(-1deg); }
    70%       { transform: translateY(-3px) rotate(1deg); }
  }

  /* ── happy: big bounce ── */
  @keyframes happyBounce {
    0%, 100% { transform: translateY(0) scaleY(1) scaleX(1); }
    20%       { transform: translateY(-18px) scaleY(1.08) scaleX(0.94); }
    40%       { transform: translateY(0) scaleY(0.92) scaleX(1.06); }
    60%       { transform: translateY(-10px) scaleY(1.04) scaleX(0.97); }
    80%       { transform: translateY(0) scaleY(0.96) scaleX(1.03); }
  }

  /* ── run: side-to-side sprint ── */
  @keyframes runLeft {
    0%   { transform: translateX(0) scaleX(1); }
    45%  { transform: translateX(-70px) scaleX(1); }
    50%  { transform: translateX(-70px) scaleX(-1); }
    95%  { transform: translateX(0) scaleX(-1); }
    100% { transform: translateX(0) scaleX(1); }
  }

  /* ── eating: nod forward ── */
  @keyframes eatNod {
    0%, 100% { transform: rotate(0deg) translateY(0); }
    30%       { transform: rotate(12deg) translateY(4px); }
    60%       { transform: rotate(4deg) translateY(2px); }
  }

  /* ── pet: excited wiggle ── */
  @keyframes petWiggle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    15%       { transform: rotate(-6deg) scale(1.05); }
    35%       { transform: rotate(6deg) scale(1.05); }
    55%       { transform: rotate(-4deg) scale(1.04); }
    75%       { transform: rotate(4deg) scale(1.04); }
  }

  /* ── tail wag fast ── */
  @keyframes tailWagFast {
    0%, 100% { transform: rotate(-10deg) translateX(0); }
    50%       { transform: rotate(35deg) translateX(3px); }
  }

  /* ── tail wag slow ── */
  @keyframes tailWagSlow {
    0%, 100% { transform: rotate(-5deg); }
    50%       { transform: rotate(20deg); }
  }

  /* ── sleep breathe ── */
  @keyframes sleepBreathe {
    0%, 100% { transform: scaleY(1) scaleX(1); }
    50%       { transform: scaleY(0.97) scaleX(1.02); }
  }

  /* ── sad droop ── */
  @keyframes sadDroop {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(3px) rotate(-1.5deg); }
  }

  /* ── zzz float ── */
  @keyframes zzzFloat {
    0%   { opacity: 0; transform: translate(0, 0) scale(0.7); }
    20%  { opacity: 1; }
    80%  { opacity: 0.8; }
    100% { opacity: 0; transform: translate(-12px, -28px) scale(1.3); }
  }

  /* ── heart/star particles ── */
  @keyframes particlePop {
    0%   { opacity: 1; transform: translate(0, 0) scale(0.5) rotate(0deg); }
    60%  { opacity: 1; transform: translate(var(--tx), var(--ty)) scale(1.2) rotate(var(--tr)); }
    100% { opacity: 0; transform: translate(var(--tx2), var(--ty2)) scale(0.6) rotate(var(--tr2)); }
  }

  /* ── pop-in for cards ── */
  @keyframes popIn {
    0%   { transform: scale(0.75) translateY(12px); opacity: 0; }
    70%  { transform: scale(1.03) translateY(-2px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }

  /* ── message bounce ── */
  @keyframes msgBounce {
    0%   { transform: translateX(-50%) scale(0.8) translateY(6px); opacity: 0; }
    70%  { transform: translateX(-50%) scale(1.04) translateY(-2px); opacity: 1; }
    100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
  }

  /* ── shimmer for XP bar ── */
  @keyframes xpShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* ── stage badge pulse ── */
  @keyframes stagePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,180,0,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(255,180,0,0); }
  }

  /* ── ground shadow ── */
  @keyframes shadowPulse {
    0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.25; }
    50%       { transform: translateX(-50%) scaleX(0.75); opacity: 0.12; }
  }

  .breed-card {
    animation: popIn 0.45s var(--ease-bounce) both;
    transition: transform 0.22s var(--ease-bounce), box-shadow 0.22s ease;
    cursor: pointer;
  }
  .breed-card:hover {
    transform: translateY(-8px) scale(1.03) !important;
  }
  .breed-card:active {
    transform: scale(0.97) !important;
  }

  .action-btn {
    transition: transform 0.15s var(--ease-bounce), box-shadow 0.15s ease, background 0.15s ease;
  }
  .action-btn:not(:disabled):hover {
    transform: translateY(-3px) scale(1.07);
  }
  .action-btn:not(:disabled):active {
    transform: scale(0.93);
  }
`;

// ─────────────────────────────────────────────
// BREED DATA
// ─────────────────────────────────────────────
const BREEDS = {
  poodle: {
    name: "Toy Poodle",
    emoji: "🐩",
    primaryColor: "#e879a0",
    lightColor: "#fce4f0",
    accentColor: "#c0527a",
    bgGrad: "linear-gradient(145deg, #fef0f6 0%, #fde4f0 60%, #fcd6ea 100%)",
    cardBg: "#fff8fc",
    statColor: "#e879a0",
    trait: "Clever & Cuddly",
    desc: "Loves cuddles and showing off fluffy curls!",
    sounds: ["Yip yip!", "Woof~", "Mrrf!", "Arf arf!", "Yip!"],
    // SVG palette
    bodyFill: "#f9cce2",
    earFill: "#f0a0c8",
    fluffFill: "#fde0ee",
    noseFill: "#c06080",
    eyeColor: "#3a2030",
    innerEarFill: "#f8b8d8",
    legFill: "#f0a8ca",
    tailFill: "#f0a0c8",
    pawFill: "#e890b8",
  },
  corgi: {
    name: "Corgi",
    emoji: "🐕",
    primaryColor: "#f5a623",
    lightColor: "#fff3d6",
    accentColor: "#c07d10",
    bgGrad: "linear-gradient(145deg, #fffbf0 0%, #fef5d6 60%, #fdecc0 100%)",
    cardBg: "#fffdf5",
    statColor: "#e09010",
    trait: "Playful & Zoomie",
    desc: "Short legs, BIG energy. Zoom mode: always on!",
    sounds: ["BORK!", "Woof!", "Yap yap!", "BORK BORK!", "Arf!"],
    bodyFill: "#f0b850",
    earFill: "#d08820",
    fluffFill: "#fff8e0",
    noseFill: "#5c3810",
    eyeColor: "#2a1808",
    innerEarFill: "#ffcf7a",
    legFill: "#e0a030",
    tailFill: "#d08820",
    pawFill: "#c07018",
  },
  pomeranian: {
    name: "Pomeranian",
    emoji: "🦊",
    primaryColor: "#ff6b35",
    lightColor: "#fff0ea",
    accentColor: "#cc4810",
    bgGrad: "linear-gradient(145deg, #fff5f0 0%, #ffe8dc 60%, #ffd8c8 100%)",
    cardBg: "#fff8f5",
    statColor: "#e05820",
    trait: "Fluffy & Fierce",
    desc: "Tiny floof with the confidence of a giant wolf!",
    sounds: ["Yip yip!", "Bark!", "Mrrf!", "YIPP!", "Woof!"],
    bodyFill: "#f09060",
    earFill: "#e06830",
    fluffFill: "#ffd0a0",
    noseFill: "#6a2808",
    eyeColor: "#2a1000",
    innerEarFill: "#ffb080",
    legFill: "#e07840",
    tailFill: "#e06830",
    pawFill: "#c85820",
  },
};

// ─────────────────────────────────────────────
// STAGE CONFIG
// ─────────────────────────────────────────────
const STAGES = [
  { label: "Newborn 🥚", xpMin: 0,    scale: 0.52 },
  { label: "Puppy 🐾",   xpMin: 120,  scale: 0.70 },
  { label: "Doggo 🐕",   xpMin: 350,  scale: 0.88 },
  { label: "Adult 🐶",   xpMin: 800,  scale: 1.00 },
  { label: "Elder 👑",   xpMin: 1600, scale: 1.08 },
];

function getStage(xp) {
  let s = 0;
  for (let i = 0; i < STAGES.length; i++) if (xp >= STAGES[i].xpMin) s = i;
  return s;
}

// ─────────────────────────────────────────────
// DOG SVG — breed-specific cartoon poses
// ─────────────────────────────────────────────

// Eyes helper
function Eyes({ c: col, pose, mood }) {
  const cx1 = 40, cx2 = 62, cy = 46;
  if (pose === "sleeping") return (
    <>
      <path d={`M ${cx1-5} ${cy} Q ${cx1} ${cy-4} ${cx1+5} ${cy}`} stroke={col.eyeColor} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d={`M ${cx2-5} ${cy} Q ${cx2} ${cy-4} ${cx2+5} ${cy}`} stroke={col.eyeColor} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    </>
  );
  if (mood > 65) return (
    <>
      <path d={`M ${cx1-5} ${cy+1} Q ${cx1} ${cy-5} ${cx1+5} ${cy+1}`} stroke={col.eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d={`M ${cx2-5} ${cy+1} Q ${cx2} ${cy-5} ${cx2+5} ${cy+1}`} stroke={col.eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </>
  );
  if (mood < 28) return (
    <>
      <path d={`M ${cx1-5} ${cy-1} Q ${cx1} ${cy+5} ${cx1+5} ${cy-1}`} stroke={col.eyeColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d={`M ${cx2-5} ${cy-1} Q ${cx2} ${cy+5} ${cx2+5} ${cy-1}`} stroke={col.eyeColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </>
  );
  return (
    <>
      <circle cx={cx1} cy={cy} r="5" fill={col.eyeColor}/>
      <circle cx={cx2} cy={cy} r="5" fill={col.eyeColor}/>
      <circle cx={cx1+2} cy={cy-2} r="1.8" fill="white"/>
      <circle cx={cx2+2} cy={cy-2} r="1.8" fill="white"/>
    </>
  );
}

// Mouth helper
function Mouth({ mood, pose }) {
  if (pose === "sleeping") return <path d="M 44 60 Q 51 63 58 60" stroke="#b08090" strokeWidth="1.8" fill="none" strokeLinecap="round"/>;
  if (mood > 65) return (
    <>
      <path d="M 42 59 Q 51 68 60 59" stroke="#8a5060" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M 42 59 Q 51 68 60 59" stroke="none" fill="#ff8090" opacity="0.25"/>
    </>
  );
  if (mood < 28) return <path d="M 42 63 Q 51 56 60 63" stroke="#8a5060" strokeWidth="2" fill="none" strokeLinecap="round"/>;
  return <path d="M 44 61 Q 51 64 58 61" stroke="#8a5060" strokeWidth="2" fill="none" strokeLinecap="round"/>;
}

// Blush helper
function Blush({ mood, pose }) {
  if (pose === "sleeping" || mood < 50) return null;
  const op = mood > 75 ? 0.5 : 0.28;
  return (
    <>
      <ellipse cx="32" cy="56" rx="7" ry="4.5" fill="#ffb3c8" opacity={op}/>
      <ellipse cx="70" cy="56" rx="7" ry="4.5" fill="#ffb3c8" opacity={op}/>
    </>
  );
}

// ── POODLE SVG ──
function PoodleSVG({ pose, mood }) {
  const c = BREEDS.poodle;
  const isSleep = pose === "sleeping";
  const isHappy = mood > 65;

  return (
    <svg viewBox="0 0 102 130" overflow="visible">
      {/* Tail — poodle has a pom-pom tail */}
      {!isSleep && (
        <g style={{ transformOrigin:"76px 78px", animation: isHappy ? "tailWagFast 0.28s ease-in-out infinite alternate" : "tailWagSlow 1.1s ease-in-out infinite alternate" }}>
          <line x1="68" y1="80" x2="80" y2="72" stroke={c.tailFill} strokeWidth="5" strokeLinecap="round"/>
          <circle cx="83" cy="69" r="8" fill={c.tailFill}/>
          <circle cx="83" cy="69" r="5" fill={c.fluffFill} opacity="0.7"/>
        </g>
      )}

      {/* Body */}
      <ellipse cx="51" cy="84" rx="27" ry="22" fill={c.bodyFill}/>
      {/* Fluffy body curls */}
      <circle cx="35" cy="80" r="8" fill={c.fluffFill} opacity="0.85"/>
      <circle cx="51" cy="92" r="9" fill={c.fluffFill} opacity="0.85"/>
      <circle cx="67" cy="80" r="8" fill={c.fluffFill} opacity="0.85"/>
      <circle cx="44" cy="72" r="7" fill={c.fluffFill} opacity="0.7"/>
      <circle cx="59" cy="72" r="7" fill={c.fluffFill} opacity="0.7"/>

      {/* Legs */}
      {isSleep ? (
        <>
          <ellipse cx="36" cy="105" rx="14" ry="6" fill={c.legFill}/>
          <ellipse cx="66" cy="107" rx="14" ry="6" fill={c.legFill}/>
          <ellipse cx="36" cy="105" rx="10" ry="4" fill={c.pawFill}/>
          <ellipse cx="66" cy="107" rx="10" ry="4" fill={c.pawFill}/>
        </>
      ) : (
        <>
          <rect x="32" y="98" width="11" height="15" rx="5.5" fill={c.legFill}/>
          <rect x="59" y="98" width="11" height="15" rx="5.5" fill={c.legFill}/>
          <ellipse cx="37.5" cy="114" rx="8" ry="5" fill={c.pawFill}/>
          <ellipse cx="64.5" cy="114" rx="8" ry="5" fill={c.pawFill}/>
          {/* Pom-pom paws */}
          <circle cx="37.5" cy="112" r="5" fill={c.fluffFill} opacity="0.7"/>
          <circle cx="64.5" cy="112" r="5" fill={c.fluffFill} opacity="0.7"/>
        </>
      )}

      {/* Head */}
      <circle cx="51" cy="47" r="24" fill={c.bodyFill}/>

      {/* Fluffy head curls */}
      <circle cx="36" cy="38" r="9" fill={c.fluffFill}/>
      <circle cx="51" cy="28" r="10" fill={c.fluffFill}/>
      <circle cx="66" cy="38" r="9" fill={c.fluffFill}/>
      <circle cx="43" cy="33" r="7" fill={c.fluffFill} opacity="0.9"/>
      <circle cx="59" cy="33" r="7" fill={c.fluffFill} opacity="0.9"/>

      {/* Ears — droopy fluffy */}
      <ellipse cx="26" cy="50" rx="9" ry="16" fill={c.earFill} transform="rotate(-12,26,50)"/>
      <ellipse cx="26" cy="50" rx="5" ry="10" fill={c.innerEarFill} opacity="0.6" transform="rotate(-12,26,50)"/>
      <circle cx="21" cy="62" r="8" fill={c.fluffFill}/>
      <ellipse cx="76" cy="50" rx="9" ry="16" fill={c.earFill} transform="rotate(12,76,50)"/>
      <ellipse cx="76" cy="50" rx="5" ry="10" fill={c.innerEarFill} opacity="0.6" transform="rotate(12,76,50)"/>
      <circle cx="81" cy="62" r="8" fill={c.fluffFill}/>

      {/* Face */}
      <Eyes c={c} pose={pose} mood={mood}/>
      {/* Nose */}
      <ellipse cx="51" cy="56" rx="5.5" ry="4" fill={c.noseFill}/>
      <ellipse cx="49.5" cy="54.5" rx="2" ry="1.2" fill="white" opacity="0.45"/>
      <Mouth mood={mood} pose={pose}/>
      <Blush mood={mood} pose={pose}/>

      {isSleep && <ZZZ/>}
      {isHappy && pose === "petting" && <Sparkles/>}
    </svg>
  );
}

// ── CORGI SVG ──
function CorgiSVG({ pose, mood }) {
  const c = BREEDS.corgi;
  const isSleep = pose === "sleeping";
  const isHappy = mood > 65;

  return (
    <svg viewBox="0 0 102 130" overflow="visible">
      {/* Tail — corgi nub */}
      {!isSleep && (
        <g style={{ transformOrigin:"72px 75px", animation: isHappy ? "tailWagFast 0.22s ease-in-out infinite alternate" : "tailWagSlow 1.2s ease-in-out infinite alternate" }}>
          <ellipse cx="76" cy="73" rx="7" ry="5" fill={c.tailFill} transform="rotate(-20,76,73)"/>
          <ellipse cx="80" cy="70" rx="4.5" ry="3.5" fill={c.fluffFill} transform="rotate(-20,80,70)"/>
        </g>
      )}

      {/* Body — corgi is wide and low */}
      <ellipse cx="51" cy="86" rx="30" ry="20" fill={c.bodyFill}/>
      {/* White tummy */}
      <ellipse cx="51" cy="90" rx="20" ry="14" fill={c.fluffFill} opacity="0.85"/>

      {/* Short stubby legs */}
      {isSleep ? (
        <>
          <ellipse cx="36" cy="104" rx="16" ry="7" fill={c.legFill}/>
          <ellipse cx="66" cy="106" rx="16" ry="7" fill={c.legFill}/>
          <ellipse cx="36" cy="104" rx="11" ry="4.5" fill={c.fluffFill} opacity="0.6"/>
          <ellipse cx="66" cy="106" rx="11" ry="4.5" fill={c.fluffFill} opacity="0.6"/>
        </>
      ) : (
        <>
          <rect x="30" y="99" width="13" height="12" rx="6.5" fill={c.legFill}/>
          <rect x="59" y="99" width="13" height="12" rx="6.5" fill={c.legFill}/>
          <ellipse cx="36.5" cy="112" rx="9" ry="5.5" fill={c.pawFill}/>
          <ellipse cx="65.5" cy="112" rx="9" ry="5.5" fill={c.pawFill}/>
        </>
      )}

      {/* Head — corgi has a foxy head */}
      <ellipse cx="51" cy="47" rx="26" ry="22" fill={c.bodyFill}/>
      {/* White face blaze */}
      <ellipse cx="51" cy="52" rx="14" ry="16" fill={c.fluffFill} opacity="0.75"/>

      {/* Big pointy ears */}
      <polygon points="22,40 16,14 36,32" fill={c.earFill}/>
      <polygon points="24,38 19,17 34,31" fill={c.innerEarFill} opacity="0.65"/>
      <polygon points="80,40 86,14 66,32" fill={c.earFill}/>
      <polygon points="78,38 83,17 68,31" fill={c.innerEarFill} opacity="0.65"/>

      {/* Face */}
      <Eyes c={c} pose={pose} mood={mood}/>
      {/* Big corgi nose */}
      <ellipse cx="51" cy="57" rx="6.5" ry="4.5" fill={c.noseFill}/>
      <ellipse cx="49" cy="55.5" rx="2.2" ry="1.4" fill="white" opacity="0.4"/>
      <Mouth mood={mood} pose={pose}/>
      <Blush mood={mood} pose={pose}/>

      {isSleep && <ZZZ/>}
      {isHappy && pose === "petting" && <Sparkles/>}
    </svg>
  );
}

// ── POMERANIAN SVG ──
function PomeranianSVG({ pose, mood }) {
  const c = BREEDS.pomeranian;
  const isSleep = pose === "sleeping";
  const isHappy = mood > 65;

  return (
    <svg viewBox="0 0 102 130" overflow="visible">
      {/* Big fluffy tail */}
      {!isSleep && (
        <g style={{ transformOrigin:"72px 72px", animation: isHappy ? "tailWagFast 0.25s ease-in-out infinite alternate" : "tailWagSlow 1s ease-in-out infinite alternate" }}>
          <ellipse cx="78" cy="68" rx="14" ry="11" fill={c.tailFill} transform="rotate(-30,78,68)"/>
          <ellipse cx="80" cy="64" rx="10" ry="8" fill={c.fluffFill} opacity="0.75" transform="rotate(-30,80,64)"/>
          <ellipse cx="76" cy="72" rx="8" ry="6" fill={c.fluffFill} opacity="0.5" transform="rotate(-30,76,72)"/>
        </g>
      )}

      {/* Huge fluffy body collar */}
      <ellipse cx="51" cy="78" rx="32" ry="14" fill={c.fluffFill} opacity="0.9"/>
      <ellipse cx="51" cy="82" rx="28" ry="20" fill={c.bodyFill}/>
      {/* More fluff layers */}
      <ellipse cx="51" cy="74" rx="30" ry="12" fill={c.fluffFill} opacity="0.75"/>
      <ellipse cx="51" cy="70" rx="26" ry="9" fill={c.fluffFill} opacity="0.6"/>

      {/* Small legs hidden under fluff */}
      {isSleep ? (
        <>
          <ellipse cx="36" cy="103" rx="14" ry="6" fill={c.legFill}/>
          <ellipse cx="66" cy="105" rx="14" ry="6" fill={c.legFill}/>
        </>
      ) : (
        <>
          <rect x="33" y="97" width="11" height="13" rx="5.5" fill={c.legFill}/>
          <rect x="58" y="97" width="11" height="13" rx="5.5" fill={c.legFill}/>
          <ellipse cx="38.5" cy="111" rx="8" ry="5" fill={c.pawFill}/>
          <ellipse cx="63.5" cy="111" rx="8" ry="5" fill={c.pawFill}/>
        </>
      )}

      {/* Huge round fluffy head */}
      <circle cx="51" cy="46" r="26" fill={c.fluffFill}/>
      <circle cx="51" cy="49" r="20" fill={c.bodyFill}/>
      {/* Mane ring */}
      <ellipse cx="51" cy="60" rx="24" ry="9" fill={c.fluffFill} opacity="0.9"/>

      {/* Small pointy ears */}
      <polygon points="28,33 23,13 39,28" fill={c.earFill}/>
      <polygon points="30,31 26,16 38,27" fill={c.innerEarFill} opacity="0.6"/>
      <polygon points="74,33 79,13 63,28" fill={c.earFill}/>
      <polygon points="72,31 76,16 64,27" fill={c.innerEarFill} opacity="0.6"/>

      {/* Pointy foxy face */}
      {/* Snout */}
      <ellipse cx="51" cy="55" rx="9" ry="7" fill={c.fluffFill}/>
      <Eyes c={c} pose={pose} mood={mood}/>
      <ellipse cx="51" cy="57" rx="4.5" ry="3.2" fill={c.noseFill}/>
      <ellipse cx="49.5" cy="55.8" rx="1.5" ry="1" fill="white" opacity="0.4"/>
      <Mouth mood={mood} pose={pose}/>
      <Blush mood={mood} pose={pose}/>

      {isSleep && <ZZZ/>}
      {isHappy && pose === "petting" && <Sparkles/>}
    </svg>
  );
}

// ── Shared decorative helpers ──
function ZZZ() {
  return (
    <>
      <text x="70" y="38" fontSize="9"  fill="#90b8e8" fontFamily="'Baloo 2'" fontWeight="800" style={{ animation:"zzzFloat 2.2s ease-in-out infinite", animationDelay:"0s" }}>z</text>
      <text x="76" y="26" fontSize="12" fill="#90b8e8" fontFamily="'Baloo 2'" fontWeight="800" style={{ animation:"zzzFloat 2.2s ease-in-out infinite", animationDelay:"0.7s" }}>z</text>
      <text x="83" y="14" fontSize="15" fill="#90b8e8" fontFamily="'Baloo 2'" fontWeight="800" style={{ animation:"zzzFloat 2.2s ease-in-out infinite", animationDelay:"1.4s" }}>z</text>
    </>
  );
}

function Sparkles() {
  return (
    <>
      {["✨","💕","⭐","✨"].map((s, i) => (
        <text key={i} x={18 + i*18} y={20 + (i%2)*12} fontSize="12"
          style={{ animation:`zzzFloat 1.1s ease-out infinite`, animationDelay:`${i*0.22}s` }}>{s}</text>
      ))}
    </>
  );
}

// ── Wrapper: picks breed, applies scale + animation ──
function DogDisplay({ breed, pose, mood, stage }) {
  const b = BREEDS[breed];
  const sc = STAGES[stage].scale;

  // Which CSS animation applies to the whole dog group
  let anim = "idleBob 3.5s ease-in-out infinite";
  if (pose === "sleeping")  anim = "sleepBreathe 3s ease-in-out infinite";
  if (pose === "eating")    anim = "eatNod 0.55s ease-in-out infinite";
  if (pose === "petting")   anim = "petWiggle 0.45s ease-in-out infinite";
  if (pose === "playing")   anim = "runLeft 1.6s ease-in-out infinite";
  if (mood < 28 && pose === "idle") anim = "sadDroop 2.8s ease-in-out infinite";
  if (mood > 65 && pose === "idle") anim = "happyBounce 0.9s ease-in-out infinite";

  const DogComp = breed === "poodle" ? PoodleSVG : breed === "corgi" ? CorgiSVG : PomeranianSVG;

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      paddingBottom: 16,
    }}>
      <div style={{
        transform: `scale(${sc})`,
        transformOrigin: "bottom center",
        animation: anim,
        transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        width: 130, height: 130,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}>
        <DogComp pose={pose} mood={mood}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PARTICLES
// ─────────────────────────────────────────────
let _pid = 0;
function makeParticles(emoji, count) {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 55;
    const dist2 = dist + 20 + Math.random() * 30;
    return {
      id: _pid++,
      emoji,
      x: 48 + (Math.random() - 0.5) * 60,
      y: 55 + (Math.random() - 0.5) * 40,
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist - 20}px`,
      tx2: `${Math.cos(angle) * dist2}px`,
      ty2: `${Math.sin(angle) * dist2 - 35}px`,
      tr: `${(Math.random() - 0.5) * 60}deg`,
      tr2: `${(Math.random() - 0.5) * 120}deg`,
      dur: 900 + Math.random() * 400,
    };
  });
}

function ParticleLayer({ particles }) {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left: p.x, top: p.y,
          fontSize: 18,
          "--tx": p.tx, "--ty": p.ty,
          "--tx2": p.tx2, "--ty2": p.ty2,
          "--tr": p.tr, "--tr2": p.tr2,
          animation: `particlePop ${p.dur}ms ease-out forwards`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// STAT BAR
// ─────────────────────────────────────────────
function StatBar({ icon, label, value, color }) {
  const pct = Math.max(0, Math.min(100, value));
  const isLow = pct < 25;
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:12, fontFamily:"'Nunito'", fontWeight:800, color:"#555" }}>
        <span>{icon} {label}</span>
        <span style={{ color: isLow ? "#e05030" : color, transition:"color 0.4s" }}>{Math.round(pct)}</span>
      </div>
      <div style={{ height:10, background:"#ede8e8", borderRadius:999, overflow:"hidden", boxShadow:"inset 0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{
          height:"100%", borderRadius:999, width:`${pct}%`,
          background: isLow
            ? "linear-gradient(90deg, #ff9060, #ff5030)"
            : `linear-gradient(90deg, ${color}99, ${color})`,
          transition:"width 0.55s ease, background 0.5s ease",
          boxShadow: isLow ? `0 0 8px #ff706088` : `0 0 5px ${color}66`,
        }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ACTION BUTTON
// ─────────────────────────────────────────────
function ActionBtn({ icon, label, onClick, disabled, color, pulse }) {
  return (
    <button className="action-btn" onClick={onClick} disabled={disabled} style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:3,
      padding:"10px 12px", borderRadius:18, border:`2.5px solid`,
      borderColor: disabled ? "#ddd" : color,
      background: disabled ? "#f6f6f6" : `${color}18`,
      color: disabled ? "#bbb" : color,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily:"'Nunito'", fontWeight:800, fontSize:12,
      minWidth:58, outline:"none",
      animation: pulse && !disabled ? "stagePulse 1.5s ease-in-out infinite" : "none",
    }}>
      <span style={{ fontSize:22 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// SAVE / LOAD  (window.storage persistent)
// ─────────────────────────────────────────────
const SAVE_KEY = "dogTamagotchi_v2";

async function saveGame(state) {
  try {
    await window.storage.set(SAVE_KEY, JSON.stringify(state), false);
  } catch (e) { /* silent */ }
}

async function loadGame() {
  try {
    const r = await window.storage.get(SAVE_KEY, false);
    if (r && r.value) return JSON.parse(r.value);
  } catch (e) { /* no save */ }
  return null;
}

async function deleteSave() {
  try { await window.storage.delete(SAVE_KEY, false); } catch(e) {}
}

// ─────────────────────────────────────────────
// MAIN GAME COMPONENT
// ─────────────────────────────────────────────
const DEFAULT_STATS = { hunger:80, happiness:80, energy:88, xp:0 };

export default function DogTamagotchi() {
  // ── screens: "loading" | "select" | "naming" | "game" ──
  const [screen, setScreen] = useState("loading");
  const [breed,  setBreed]  = useState(null);
  const [name,   setName]   = useState("");
  const [tempName, setTempName] = useState("");

  // Stats
  const [hunger,    setHunger]    = useState(DEFAULT_STATS.hunger);
  const [happiness, setHappiness] = useState(DEFAULT_STATS.happiness);
  const [energy,    setEnergy]    = useState(DEFAULT_STATS.energy);
  const [xp,        setXp]        = useState(DEFAULT_STATS.xp);

  // UI
  const [pose,      setPose]      = useState("idle");
  const [message,   setMessage]   = useState("");
  const [cooldown,  setCooldown]  = useState(false);
  const [particles, setParticles] = useState([]);
  const [showReset, setShowReset] = useState(false);

  const msgTimer   = useRef(null);
  const poseTimer  = useRef(null);
  const tickRef    = useRef(null);
  const xpRef      = useRef(null);
  const saveRef    = useRef(null);

  // Derived
  const stage = getStage(xp);
  const mood  = (hunger + happiness + energy) / 3;

  // ── Load on mount ──
  useEffect(() => {
    (async () => {
      const saved = await loadGame();
      if (saved && saved.breed) {
        setBreed(saved.breed);
        setName(saved.name || BREEDS[saved.breed].name);
        setHunger(saved.hunger ?? 80);
        setHappiness(saved.happiness ?? 80);
        setEnergy(saved.energy ?? 88);
        setXp(saved.xp ?? 0);
        setScreen("game");
      } else {
        setScreen("select");
      }
    })();
  }, []);

  // ── Auto-save every 8s ──
  useEffect(() => {
    if (screen !== "game") return;
    saveRef.current = setInterval(() => {
      saveGame({ breed, name, hunger, happiness, energy, xp });
    }, 8000);
    return () => clearInterval(saveRef.current);
  }, [screen, breed, name, hunger, happiness, energy, xp]);

  // ── Stat decay tick ──
  useEffect(() => {
    if (screen !== "game") return;
    tickRef.current = setInterval(() => {
      setHunger(h => Math.max(0, h - 0.7));
      setHappiness(hp => Math.max(0, hp - 0.45));
      if (pose === "sleeping") setEnergy(e => Math.min(100, e + 2.2));
      else setEnergy(e => Math.max(0, e - 0.25));
    }, 3000);
    return () => clearInterval(tickRef.current);
  }, [screen, pose]);

  // ── XP tick ──
  useEffect(() => {
    if (screen !== "game") return;
    xpRef.current = setInterval(() => {
      if (mood > 40) setXp(x => x + 1);
    }, 6000);
    return () => clearInterval(xpRef.current);
  }, [screen, mood]);

  // ── Auto sleep / wake ──
  useEffect(() => {
    if (energy < 12 && pose === "idle") {
      setPose("sleeping");
      showMsg("Too tired… 💤 going to sleep");
    }
    if (energy > 55 && pose === "sleeping") {
      setPose("idle");
      showMsg("Good morning! 🌞");
    }
  }, [energy, pose]);

  function showMsg(txt, dur = 2200) {
    clearTimeout(msgTimer.current);
    setMessage(txt);
    msgTimer.current = setTimeout(() => setMessage(""), dur);
  }

  function addParticles(emoji, count) {
    const ps = makeParticles(emoji, count);
    setParticles(prev => [...prev, ...ps]);
    setTimeout(() => setParticles(prev => prev.filter(p => !ps.find(n => n.id === p.id))), 1400);
  }

  const doAction = useCallback((type) => {
    if (cooldown || pose === "sleeping") return;
    clearTimeout(poseTimer.current);

    const b = BREEDS[breed];
    const sound = b.sounds[Math.floor(Math.random() * b.sounds.length)];
    setCooldown(true);
    setPose(type);

    if (type === "eating") {
      setHunger(h => Math.min(100, h + 28));
      setXp(x => x + 6);
      showMsg(`${sound} Om nom nom! 🦴`, 2000);
      addParticles("🦴", 5);
      addParticles("✨", 3);
    } else if (type === "petting") {
      setHappiness(h => Math.min(100, h + 22));
      setXp(x => x + 5);
      showMsg(`${sound} More pats please! 💕`, 2000);
      addParticles("❤️", 6);
      addParticles("💕", 3);
    } else if (type === "playing") {
      setHappiness(h => Math.min(100, h + 16));
      setEnergy(e => Math.max(0, e - 12));
      setXp(x => x + 10);
      showMsg(`ZOOM ZOOM! ${sound} 🎾`, 2000);
      addParticles("⭐", 5);
      addParticles("💨", 4);
    }

    poseTimer.current = setTimeout(() => {
      setPose("idle");
      setCooldown(false);
    }, 2000);
  }, [cooldown, pose, breed]);

  function handleSleepToggle() {
    if (pose === "sleeping") {
      setPose("idle");
      showMsg("Rise and shine! 🌞", 1800);
    } else {
      clearTimeout(poseTimer.current);
      setCooldown(false);
      setPose("sleeping");
      showMsg("Sweet dreams 💤", 1800);
    }
  }

  async function handleReset() {
    await deleteSave();
    setBreed(null); setName(""); setHunger(80); setHappiness(80);
    setEnergy(88); setXp(0); setPose("idle"); setMessage("");
    setShowReset(false);
    setScreen("select");
  }

  function startAdopt(b) {
    setBreed(b);
    setTempName(BREEDS[b].name);
    setScreen("naming");
  }

  function confirmName() {
    const n = tempName.trim() || BREEDS[breed].name;
    setName(n);
    setHunger(80); setHappiness(80); setEnergy(88); setXp(0);
    setPose("idle");
    setScreen("game");
    setTimeout(() => showMsg(`${n} has arrived! 🐾`, 2500), 300);
    saveGame({ breed, name: n, hunger: 80, happiness: 80, energy: 88, xp: 0 });
  }

  const b = breed ? BREEDS[breed] : null;

  // ─── Loading ───────────────────────────────
  if (screen === "loading") return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fdf6ff", fontFamily:"'Nunito'" }}>
      <div style={{ fontSize:48, animation:"idleBob 1s ease-in-out infinite" }}>🐾</div>
    </div>
  );

  // ─── Breed Select ──────────────────────────
  if (screen === "select") return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #fde8f8 0%, #e8f8f0 50%, #e8f0fd 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:24, fontFamily:"'Nunito', sans-serif",
    }}>
      <style>{GLOBAL_CSS}</style>

      <h1 style={{ fontFamily:"'Baloo 2'", fontSize:"clamp(30px,6vw,50px)", color:"#333", textAlign:"center", marginBottom:6, letterSpacing:"-0.5px" }}>
        🐾 Adopt a Pup!
      </h1>
      <p style={{ color:"#999", fontSize:14, marginBottom:32, textAlign:"center", fontWeight:600 }}>
        Pick a breed — they'll grow up with you 🌱
      </p>

      <div style={{ display:"flex", gap:18, flexWrap:"wrap", justifyContent:"center", maxWidth:800 }}>
        {Object.entries(BREEDS).map(([key, br], i) => (
          <div key={key} className="breed-card" onClick={() => startAdopt(key)}
            style={{
              background:"white", borderRadius:26, padding:"28px 22px",
              textAlign:"center", width:200,
              boxShadow:"0 8px 30px rgba(0,0,0,0.09)",
              border:`3px solid ${br.lightColor}`,
              animationDelay:`${i*0.1}s`,
            }}>
            <div style={{ fontSize:70, lineHeight:1.05, marginBottom:10 }}>{br.emoji}</div>
            <div style={{ fontFamily:"'Baloo 2'", fontSize:19, color:"#333", marginBottom:4 }}>{br.name}</div>
            <div style={{
              display:"inline-block", padding:"3px 11px", borderRadius:999,
              background:`${br.primaryColor}20`, color:br.accentColor,
              fontSize:11, fontWeight:800, marginBottom:10,
            }}>{br.trait}</div>
            <p style={{ color:"#888", fontSize:12.5, lineHeight:1.5, marginBottom:16 }}>{br.desc}</p>
            <div style={{
              padding:"10px 0", borderRadius:14,
              background:`linear-gradient(135deg, ${br.primaryColor}, ${br.accentColor})`,
              color:"white", fontWeight:800, fontSize:14,
              boxShadow:`0 4px 16px ${br.primaryColor}55`,
            }}>Adopt! 🐾</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Naming ────────────────────────────────
  if (screen === "naming") return (
    <div style={{
      minHeight:"100vh", background: b.bgGrad,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Nunito'",
    }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        background:"white", borderRadius:28, padding:"38px 40px",
        textAlign:"center", boxShadow:"0 14px 50px rgba(0,0,0,0.12)",
        maxWidth:360, width:"90%", animation:"popIn 0.4s var(--ease-bounce)",
      }}>
        <div style={{ fontSize:72, marginBottom:8 }}>{b.emoji}</div>
        <h2 style={{ fontFamily:"'Baloo 2'", fontSize:26, color:"#333", marginBottom:6 }}>Name your {b.name}!</h2>
        <p style={{ color:"#aaa", fontSize:13, marginBottom:20 }}>What shall we call them?</p>
        <input
          value={tempName}
          onChange={e => setTempName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && confirmName()}
          maxLength={16}
          autoFocus
          style={{
            width:"100%", padding:"13px 16px", borderRadius:14,
            border:`2.5px solid ${b.primaryColor}`,
            fontSize:18, fontFamily:"'Nunito'", fontWeight:800,
            color:"#333", outline:"none", textAlign:"center",
            marginBottom:16,
          }}
        />
        <button onClick={confirmName} style={{
          width:"100%", padding:14, borderRadius:14, border:"none",
          background:`linear-gradient(135deg, ${b.primaryColor}, ${b.accentColor})`,
          color:"white", fontSize:16, fontFamily:"'Nunito'", fontWeight:800,
          cursor:"pointer", boxShadow:`0 6px 22px ${b.primaryColor}55`,
          transition:"transform 0.15s", marginBottom:10,
        }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
        >Let's go! 🐾</button>
        <button onClick={() => setScreen("select")} style={{
          background:"none", border:"none", color:"#bbb", cursor:"pointer",
          fontFamily:"'Nunito'", fontSize:13, fontWeight:700,
        }}>← Back</button>
      </div>
    </div>
  );

  // ─── Game ──────────────────────────────────
  const stageData = STAGES[stage];
  const xpNext = stage < STAGES.length - 1 ? STAGES[stage + 1].xpMin : null;
  const xpPct  = xpNext ? ((xp - STAGES[stage].xpMin) / (xpNext - STAGES[stage].xpMin)) * 100 : 100;
  const moodEmoji = pose === "sleeping" ? "💤" : mood > 78 ? "😄" : mood > 55 ? "🙂" : mood > 32 ? "😐" : "😢";
  const prevStage = stage > 0 ? STAGES[stage - 1].xpMin : 0;

  return (
    <div style={{
      minHeight:"100vh", background: b.bgGrad,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:16, fontFamily:"'Nunito', sans-serif",
    }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ width:"100%", maxWidth:390 }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div>
            <div style={{ fontFamily:"'Baloo 2'", fontSize:22, color:"#333", lineHeight:1.1 }}>
              {b.emoji} {name}
            </div>
            <div style={{
              display:"inline-block", marginTop:3,
              padding:"2px 10px", borderRadius:999,
              background:`linear-gradient(90deg, ${b.primaryColor}, ${b.accentColor})`,
              color:"white", fontSize:11, fontWeight:800,
              animation:"stagePulse 2.5s ease-in-out infinite",
            }}>{stageData.label}</div>
          </div>
          <button onClick={() => setShowReset(r => !r)} style={{
            background:"none", border:`2px solid ${b.primaryColor}55`,
            borderRadius:10, padding:"5px 11px", cursor:"pointer",
            color:b.accentColor, fontWeight:800, fontSize:11,
            fontFamily:"'Nunito'",
          }}>⚙️ Menu</button>
        </div>

        {/* Reset menu */}
        {showReset && (
          <div style={{
            background:"white", borderRadius:16, padding:"14px 16px",
            marginBottom:10, boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
            border:`2px solid ${b.primaryColor}33`, animation:"popIn 0.25s var(--ease-bounce)",
          }}>
            <p style={{ fontSize:13, color:"#777", marginBottom:10, fontWeight:700 }}>
              💾 Your pet is saved automatically every 8 seconds.
            </p>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleReset} style={{
                flex:1, padding:"9px 0", borderRadius:12, border:"2px solid #ff5050",
                background:"#fff0f0", color:"#dd3030", fontWeight:800, fontSize:12,
                cursor:"pointer", fontFamily:"'Nunito'",
              }}>🗑️ Abandon pet</button>
              <button onClick={() => setShowReset(false)} style={{
                flex:1, padding:"9px 0", borderRadius:12, border:`2px solid ${b.primaryColor}`,
                background:`${b.primaryColor}15`, color:b.accentColor, fontWeight:800, fontSize:12,
                cursor:"pointer", fontFamily:"'Nunito'",
              }}>✓ Close</button>
            </div>
          </div>
        )}

        {/* ── XP Bar ── */}
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#aaa", marginBottom:3, fontWeight:700 }}>
            <span>⚡ XP {xp}</span>
            <span>{xpNext ? `Next stage: ${xpNext} XP` : "👑 MAX STAGE"}</span>
          </div>
          <div style={{ height:8, background:"#e8e0e8", borderRadius:999, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:999, width:`${xpPct}%`,
              background:`linear-gradient(90deg, ${b.primaryColor}80, ${b.primaryColor}, ${b.accentColor})`,
              backgroundSize:"200% 100%",
              animation:"xpShimmer 2.5s linear infinite",
              transition:"width 1s ease",
            }}/>
          </div>
        </div>

        {/* ── Dog stage ── */}
        <div style={{
          position:"relative",
          background: b.cardBg,
          borderRadius:28, height:230,
          boxShadow:`0 8px 36px ${b.primaryColor}33`,
          border:`3px solid ${b.primaryColor}40`,
          overflow:"hidden",
          marginBottom:12,
        }}>
          {/* Background scene */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:36,
            background:`linear-gradient(180deg, transparent, ${b.lightColor})`,
            borderRadius:"0 0 26px 26px",
          }}/>
          {/* Ground */}
          <div style={{
            position:"absolute", bottom:12, left:"50%",
            width:90, height:14,
            background:`${b.primaryColor}22`,
            borderRadius:"50%",
            animation: pose==="playing" ? "none" : "shadowPulse 3s ease-in-out infinite",
            transform:"translateX(-50%)",
          }}/>

          <ParticleLayer particles={particles}/>

          <DogDisplay breed={breed} pose={pose} mood={mood} stage={stage}/>

          {/* Mood badge */}
          <div style={{
            position:"absolute", top:10, right:12,
            fontSize:22,
            filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
          }}>{moodEmoji}</div>

          {/* Message bubble */}
          {message && (
            <div style={{
              position:"absolute", top:10, left:"50%",
              background:"white", borderRadius:16, padding:"6px 14px",
              fontSize:13, fontWeight:800, color:"#444",
              boxShadow:"0 4px 18px rgba(0,0,0,0.12)",
              animation:"msgBounce 0.35s var(--ease-bounce)",
              whiteSpace:"nowrap",
              border:`2px solid ${b.primaryColor}55`,
              maxWidth:240, overflow:"hidden", textOverflow:"ellipsis",
            }}>{message}</div>
          )}
        </div>

        {/* ── Stats ── */}
        <div style={{
          background:"white", borderRadius:20, padding:"14px 16px",
          boxShadow:`0 4px 18px ${b.primaryColor}18`,
          border:`2px solid ${b.primaryColor}28`,
          marginBottom:12,
        }}>
          <StatBar icon="🍗" label="Hunger"    value={hunger}    color="#ff7043"/>
          <StatBar icon="😊" label="Happiness" value={happiness} color={b.primaryColor}/>
          <StatBar icon="⚡" label="Energy"    value={energy}    color="#42a5f5"/>
        </div>

        {/* ── Actions ── */}
        <div style={{
          display:"flex", gap:9, justifyContent:"center",
          background:"white", borderRadius:20, padding:"14px 10px",
          boxShadow:`0 4px 18px ${b.primaryColor}18`,
          border:`2px solid ${b.primaryColor}28`,
        }}>
          <ActionBtn icon="🦴" label="Feed"  color="#ff7043"
            onClick={() => doAction("eating")}
            disabled={cooldown || pose==="sleeping" || hunger > 92}/>
          <ActionBtn icon="🤗" label="Pet"   color={b.primaryColor}
            onClick={() => doAction("petting")}
            disabled={cooldown || pose==="sleeping"}/>
          <ActionBtn icon="🎾" label="Play"  color="#43a860"
            onClick={() => doAction("playing")}
            disabled={cooldown || pose==="sleeping" || energy < 18}/>
          <ActionBtn icon={pose==="sleeping" ? "🌅" : "😴"} label={pose==="sleeping" ? "Wake" : "Sleep"}
            color="#5b9bd6" onClick={handleSleepToggle} disabled={false}/>
        </div>

        {/* Footer hint */}
        <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"#bbb", fontWeight:700 }}>
          {mood < 20 ? "⚠️ Your pet needs attention!" : "💾 Auto-saved · " + stageData.label}
        </div>
      </div>
    </div>
  );
}
