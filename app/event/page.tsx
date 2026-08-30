"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Gift,
  Trophy,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ShoppingBag,
  ArrowRight,
  Heart,
  Share2,
  Tag,
  Clock,
  ChevronRight,
  Percent,
  Home,
  ShieldCheck,
  Truck,
  Send,
  Zap,
  Sparkle,
  HelpCircle,
  Award,
  Flame,
  CheckCircle2,
  FlameKindling,
  MessageCircle,
  Smile,
  Music,
  Medal
} from "lucide-react";
import { catalogProducts, CatalogProduct } from "../lib/catalog";

// Wheel Segments Definition
interface WheelSegment {
  id: string;
  code: string;
  label: string;
  discount: string;
  description: string;
  color: string;
  textColor: string;
  icon: string;
  probability: number;
}

const SEGMENTS: WheelSegment[] = [
  {
    id: "seg-1",
    code: "RAKHI75",
    label: "75% OFF",
    discount: "75% OFF",
    description: "Grand Sibling Special 75% OFF Voucher",
    color: "#800A20", // Deep Crimson Maroon
    textColor: "#FFD700",
    icon: "🪔",
    probability: 12,
  },
  {
    id: "seg-2",
    code: "FREEGIFT",
    label: "FREE GIFT",
    discount: "Free Hamper",
    description: "Free Deluxe Rakhi Gift Hamper on any purchase",
    color: "#E63946", // Festive Red
    textColor: "#FFFFFF",
    icon: "🎁",
    probability: 15,
  },
  {
    id: "seg-3",
    code: "RAKHI500",
    label: "₹500 OFF",
    discount: "Flat ₹500",
    description: "Flat ₹500 Discount on orders above ₹999",
    color: "#D4AF37", // Gold
    textColor: "#1A0500",
    icon: "💳",
    probability: 18,
  },
  {
    id: "seg-4",
    code: "SILVERRAKHI",
    label: "FREE RAKHI",
    discount: "Silver Rakhi",
    description: "Free Designer Silver Thread Rakhi included",
    color: "#4A0E17", // Royal Maroon
    textColor: "#FFE893",
    icon: "📿",
    probability: 15,
  },
  {
    id: "seg-5",
    code: "SUPER90",
    label: "90% JACKPOT",
    discount: "90% OFF",
    description: "Bumper Sibling Festival 90% OFF Discount",
    color: "#FFB703", // Bright Gold
    textColor: "#4A000A",
    icon: "💥",
    probability: 5,
  },
  {
    id: "seg-6",
    code: "FREESHIP",
    label: "FREE SHIP",
    discount: "Free Shipping",
    description: "Free Express Shipping + ₹100 Extra OFF",
    color: "#1F4E3D", // Deep Festive Green
    textColor: "#FFFFFF",
    icon: "🚚",
    probability: 20,
  },
  {
    id: "seg-7",
    code: "RAKHI50",
    label: "50% OFF",
    discount: "50% OFF",
    description: "Flat 50% OFF Festive Discount Voucher",
    color: "#B7094C", // Dark Pink / Rose
    textColor: "#FFFFFF",
    icon: "🌟",
    probability: 10,
  },
  {
    id: "seg-8",
    code: "SWEET200",
    label: "₹200 SWEETS",
    discount: "₹200 Sweets",
    description: "₹200 Discount on Rakhi Sweets & Chocolates",
    color: "#FB8500", // Warm Orange
    textColor: "#FFFFFF",
    icon: "🍫",
    probability: 5,
  },
];

// Live Winner Feed Ticker Items
const RECENT_WINNERS = [
  { name: "Priya Sharma", city: "Delhi", prize: "90% OFF (SUPER90)", icon: "💥" },
  { name: "Aman Verma", city: "Mumbai", prize: "Free Designer Silver Rakhi", icon: "📿" },
  { name: "Neha Agarwal", city: "Jaipur", prize: "75% OFF (RAKHI75)", icon: "🪔" },
  { name: "Karan Patel", city: "Ahmedabad", prize: "Flat ₹500 Cashback", icon: "💳" },
  { name: "Simran Kaur", city: "Chandigarh", prize: "Free Rakhi Gift Hamper", icon: "🎁" },
  { name: "Rahul Joshi", city: "Pune", prize: "Free Shipping + ₹100 OFF", icon: "🚚" },
  { name: "Ananya Roy", city: "Kolkata", prize: "50% OFF Festive Voucher", icon: "🌟" },
  { name: "Vicky Malhotra", city: "Lucknow", prize: "₹200 Sweets Discount", icon: "🍫" },
];

// Initial Public Sibling Wall Posts
const INITIAL_WALL_POSTS = [
  { sender: "Pooja", receiver: "Rahul (Bhai)", message: "Happy Raksha Bandhan Bhai! Best brother in the whole world! ❤️📿", time: "2 mins ago" },
  { sender: "Vikram", receiver: "Sneha (Didi)", message: "Happy Rakhi Didi! Thanks for always saving me from mom! 🎁", time: "5 mins ago" },
  { sender: "Kavita", receiver: "Rohan", message: "Sending lots of love, prayers, and sweetness your way! 🍫🪔", time: "12 mins ago" },
  { sender: "Amit", receiver: "Riya", message: "Wishing you lifetime of success and happiness dear sister! 🌟", time: "20 mins ago" },
];

// Virtual Rakhis Selection List
const VIRTUAL_RAKHIS = [
  { id: "rakhi-1", name: "Rudraksha Silk Thread Rakhi", icon: "📿", desc: "Auspicious red & gold silk thread" },
  { id: "rakhi-2", name: "Royal Diamond Emblem Rakhi", icon: "💎", desc: "Sparkling silver diamond emblem" },
  { id: "rakhi-3", name: "Pure Silver Ganesha Rakhi", icon: "🐘", desc: "Crafted pure silver blessing Rakhi" },
  { id: "rakhi-4", name: "Floral Marigold Velvet Rakhi", icon: "🌸", desc: "Fresh marigold silk flower Rakhi" },
];

// Audio Sound Synthesis Helper (Web Audio API)
class SoundFx {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTick(rate = 1.0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650 * rate, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // ignore
    }
  }

  playWinFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.4);
      });
    } catch {
      // ignore
    }
  }

  playRakhiTieSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Festive Shehnai/Bell Chime simulation
      const bellFreqs = [587.33, 880, 1174.66, 1760];
      bellFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.5);
      });
    } catch {
      // ignore
    }
  }

  playBoxOpenSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }
}

const audioManager = new SoundFx();

export default function EventPage() {
  const [spinsLeft, setSpinsLeft] = useState<number>(3);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [wonSegment, setWonSegment] = useState<WheelSegment | null>(null);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [claimedCoupons, setClaimedCoupons] = useState<{ code: string; desc: string; date: string }[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 38, seconds: 42 });

  // Ticker Live Winner State
  const [currentWinnerIdx, setCurrentWinnerIdx] = useState(0);

  // Mystery Box State
  const [boxOpened, setBoxOpened] = useState(false);
  const [mysteryCoupon, setMysteryCoupon] = useState<string | null>(null);

  // Virtual Rakhi Ceremony State
  const [selectedRakhi, setSelectedRakhi] = useState(VIRTUAL_RAKHIS[0]);
  const [rakhiTied, setRakhiTied] = useState(false);

  // Public Wall Messages State
  const [wallPosts, setWallPosts] = useState(INITIAL_WALL_POSTS);
  const [wallSender, setWallSender] = useState("");
  const [wallReceiver, setWallReceiver] = useState("");
  const [wallMsg, setWallMsg] = useState("");

  // Sibling Gift Finder Quiz State
  const [giftTarget, setGiftTarget] = useState<"Sister" | "Brother" | "All">("All");
  const [giftVibe, setGiftVibe] = useState<string>("All");
  const [giftBudget, setGiftBudget] = useState<number>(5000);

  // Wish card state
  const [siblingName, setSiblingName] = useState<string>("");
  const [siblingRole, setSiblingRole] = useState<string>("Sister");
  const [customWish, setCustomWish] = useState<string>("Wishing you a joyous Raksha Bandhan full of laughter, sweet memories, and endless happiness! Here is a special Rakhi discount voucher for you! 🪔📿");
  const [cardGenerated, setCardGenerated] = useState<boolean>(false);
  const [cardCopied, setCardCopied] = useState<boolean>(false);

  // Canvas Refs
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ticker winner rotation effect
  useEffect(() => {
    const ticker = setInterval(() => {
      setCurrentWinnerIdx((prev) => (prev + 1) % RECENT_WINNERS.length);
    }, 3500);
    return () => clearInterval(ticker);
  }, []);

  // Initialize from LocalStorage & Petals
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSpins = localStorage.getItem("rakhi_spins_count");
      if (savedSpins !== null) {
        setSpinsLeft(parseInt(savedSpins, 10));
      } else {
        localStorage.setItem("rakhi_spins_count", "3");
      }

      const savedCoupons = localStorage.getItem("rakhi_claimed_coupons");
      if (savedCoupons) {
        try {
          setClaimedCoupons(JSON.parse(savedCoupons));
        } catch {
          // ignore
        }
      }

      initPetalCanvas();
    }
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    audioManager.enabled = next;
  };

  // Petal Canvas Effect
  const initPetalCanvas = () => {
    const canvas = petalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petals: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      angle: number;
      spin: number;
      color: string;
    }[] = [];

    const colors = ["#FFD700", "#FF1493", "#E63946", "#FFB703", "#FF8C00", "#FFC0CB"];

    for (let i = 0; i < 45; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 9 + 6,
        speedY: Math.random() * 1.6 + 0.8,
        speedX: Math.random() * 0.8 - 0.4,
        angle: Math.random() * 360,
        spin: Math.random() * 2 - 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animatePetals = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animatePetals);
    };

    animatePetals();
  };

  // Spin Logic
  const handleSpin = () => {
    if (isSpinning) return;
    if (spinsLeft <= 0) {
      alert("आपकी आज की लकी व्हील स्पिन की सीमा समाप्त हो चुकी है! (You have used all daily spins!). Tie a virtual Rakhi below to unlock bonus spins!");
      return;
    }

    setIsSpinning(true);
    setWonSegment(null);

    const totalProb = SEGMENTS.reduce((sum, s) => sum + s.probability, 0);
    let randomProb = Math.random() * totalProb;
    let selectedIdx = 0;
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (randomProb < SEGMENTS[i].probability) {
        selectedIdx = i;
        break;
      }
      randomProb -= SEGMENTS[i].probability;
    }

    const selectedSeg = SEGMENTS[selectedIdx];
    const segAngle = 360 / SEGMENTS.length;
    const numFullTurns = 6 + Math.floor(Math.random() * 3);
    const targetSegCenter = selectedIdx * segAngle + segAngle / 2;
    const targetRotation = rotation + (numFullTurns * 360) + (360 - targetSegCenter);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      if (soundOn) audioManager.playTick(1 + (tickCount % 5) * 0.1);
      if (tickCount >= 30) clearInterval(tickInterval);
    }, 140);

    setRotation(targetRotation);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWonSegment(selectedSeg);
      setShowWinModal(true);

      if (soundOn) audioManager.playWinFanfare();
      triggerConfetti();

      const newSpins = Math.max(0, spinsLeft - 1);
      setSpinsLeft(newSpins);
      localStorage.setItem("rakhi_spins_count", newSpins.toString());

      const newClaimed = [
        { code: selectedSeg.code, desc: selectedSeg.description, date: new Date().toLocaleDateString("en-IN") },
        ...claimedCoupons.filter((c) => c.code !== selectedSeg.code),
      ];
      setClaimedCoupons(newClaimed);
      localStorage.setItem("rakhi_claimed_coupons", JSON.stringify(newClaimed));
    }, 4500);
  };

  // Perform Virtual Rakhi Tying Ceremony
  const handleTieRakhi = () => {
    if (soundOn) audioManager.playRakhiTieSound();
    setRakhiTied(true);

    // Grant Rakhi Blessing Coupon RAKHI75
    const newClaimed = [
      { code: "RAKHI75", desc: "Rakhi Blessing 75% OFF Voucher", date: new Date().toLocaleDateString("en-IN") },
      ...claimedCoupons.filter((c) => c.code !== "RAKHI75"),
    ];
    setClaimedCoupons(newClaimed);
    localStorage.setItem("rakhi_claimed_coupons", JSON.stringify(newClaimed));

    // Grant +1 Bonus Spin
    const updatedSpins = spinsLeft + 1;
    setSpinsLeft(updatedSpins);
    localStorage.setItem("rakhi_spins_count", updatedSpins.toString());

    triggerConfetti();
  };

  // Post to Public Wall
  const handlePostWall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallSender || !wallMsg) return;
    const newPost = {
      sender: wallSender,
      receiver: wallReceiver || "Sibling",
      message: wallMsg,
      time: "Just now",
    };
    setWallPosts([newPost, ...wallPosts]);
    setWallSender("");
    setWallReceiver("");
    setWallMsg("");
  };

  // Scratch / Mystery Box Unlock
  const handleOpenMysteryBox = () => {
    if (boxOpened) return;
    if (soundOn) audioManager.playBoxOpenSound();
    setBoxOpened(true);

    const surpriseCodes = ["RAKHI200", "SIBLING100", "FREEDOM79"];
    const picked = surpriseCodes[Math.floor(Math.random() * surpriseCodes.length)];
    setMysteryCoupon(picked);

    const newClaimed = [
      { code: picked, desc: "Mystery Surprise Gift Voucher", date: new Date().toLocaleDateString("en-IN") },
      ...claimedCoupons.filter((c) => c.code !== picked),
    ];
    setClaimedCoupons(newClaimed);
    localStorage.setItem("rakhi_claimed_coupons", JSON.stringify(newClaimed));

    triggerConfetti();
  };

  // Copy coupon handler
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Grant Bonus Spin via Wish Card
  const handleGenerateCard = (e: React.FormEvent) => {
    e.preventDefault();
    setCardGenerated(true);
    const updatedSpins = spinsLeft + 1;
    setSpinsLeft(updatedSpins);
    localStorage.setItem("rakhi_spins_count", updatedSpins.toString());
  };

  const handleCopyCardText = () => {
    const text = `🪔 Happy Raksha Bandhan ${siblingName || "Dear Sibling"}! 📿\n\n"${customWish}"\n\n🎁 I won a special Rakhi Discount Voucher for you on VPANSAK Shopping:\nUse Code: ${wonSegment?.code || "RAKHI75"} to get instant discount!\n\nShop Rakhi Gift Picks: ${window.location.origin}/event`;
    navigator.clipboard.writeText(text);
    setCardCopied(true);
    setTimeout(() => setCardCopied(false), 2500);
  };

  // Particle Confetti Animation Canvas
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      vr: number;
    }[] = [];

    const colors = ["#FFD700", "#FF1493", "#FF4500", "#00BFFF", "#32CD32", "#FF007F", "#FFA500", "#FFFFFF"];

    for (let i = 0; i < 220; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.8) * 22,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 11 + 4,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 16,
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32;
        p.rotation += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (frame < 135) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
  };

  const filteredQuizProducts = catalogProducts.filter((product) => {
    const priceMatch = product.price <= giftBudget;
    const vibeMatch =
      giftVibe === "All" ||
      (giftVibe === "Tech" && (product.category === "Electronics" || product.category === "Mobile" || product.category === "Computer")) ||
      (giftVibe === "Fashion" && product.category === "Fashion") ||
      (giftVibe === "Beauty" && product.category === "Beauty") ||
      (giftVibe === "Home" && (product.category === "Home" || product.category === "Kitchen" || product.category === "Grocery"));
    return priceMatch && vibeMatch;
  });

  const activeWinner = RECENT_WINNERS[currentWinnerIdx];

  return (
    <div className="rakhi-event-shell min-h-screen bg-[#2D040A] text-white selection:bg-[#FFD700] selection:text-[#2D040A] relative overflow-hidden">
      
      {/* Background Floating Marigold Petals Canvas */}
      <canvas
        ref={petalCanvasRef}
        className="fixed inset-0 pointer-events-none z-[1] opacity-60"
      />

      {/* Confetti Explosion Canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      />

      {/* Top Countdown & Announcement Ribbon */}
      <div className="bg-gradient-to-r from-[#991b1b] via-[#be123c] to-[#f59e0b] text-white py-2 px-4 text-center border-b border-[#FFD700]/50 shadow-lg relative z-50 flex items-center justify-center gap-4 flex-wrap text-xs sm:text-sm">
        <span className="font-extrabold flex items-center gap-1.5 animate-pulse">
          <Flame size={16} className="text-[#FFD700]" /> 🪔 RAKSHA BANDHAN MEGA FESTIVAL EVENT IS LIVE!
        </span>
        <div className="inline-flex items-center gap-2 bg-[#2D040A]/80 px-3 py-1 rounded-full border border-[#FFD700]/40">
          <Clock size={14} className="text-[#FFD700]" />
          <span className="font-mono font-black text-[#FFD700]">
            Ends in: {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#400611]/95 backdrop-blur-md border-b border-[#FFD700]/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FFD700] via-[#FF8C00] to-[#E63946] flex items-center justify-center font-extrabold text-[#2D040A] text-xl shadow-lg group-hover:scale-105 transition-transform border-2 border-[#FFD700]">
              🪔
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#FFD700] font-bold block">
                VPANSAK FESTIVAL EXCLUSIVE
              </span>
              <h1 className="text-base sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
                रक्षाबंधन लकी व्हील <span className="text-[#FFD700] text-xs sm:text-sm font-normal">| Lucky Wheel</span>
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className="px-3 py-1.5 rounded-full bg-[#580816] hover:bg-[#800A20] border border-[#FFD700]/40 text-xs font-semibold flex items-center gap-2 text-[#FFD700] transition-colors"
              title="Toggle Audio Sounds"
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{soundOn ? "Sound On" : "Muted"}</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#2D040A] font-extrabold text-xs flex items-center gap-2 hover:opacity-95 shadow-md transition-all hover:scale-105"
            >
              <Home size={14} /> Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Live Winners Ticker Bar */}
      <div className="bg-[#1f0207] border-b border-[#FFD700]/20 py-2 px-4 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#FFD700] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
            <span>LIVE WINNERS FEED:</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 text-[#FFC482] animate-fade-in">
              <span className="text-base">{activeWinner.icon}</span>
              <strong className="text-white">{activeWinner.name}</strong> from <span>{activeWinner.city}</span> just won{" "}
              <strong className="text-[#FFD700]">{activeWinner.prize}</strong>!
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero & Wheel Stage */}
      <section className="relative pt-6 pb-16 px-4 z-10">
        {/* Festive Background Lighting */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#FFD700]/20 via-[#E63946]/30 to-[#B7094C]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative">
          
          {/* Left Side: Offer Details & Festive Info */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/50 text-[#FFD700] text-xs font-extrabold tracking-wider uppercase backdrop-blur-sm shadow-inner">
              <Sparkles size={14} className="text-[#FFD700]" /> RAKSHA BANDHAN SPECIAL GRAND EVENT 📿
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0BB] via-[#FFD700] to-[#FFA500] leading-tight">
              लकी व्हील घुमाएं और <br />
              <span className="text-white drop-shadow-[0_4px_12px_rgba(255,215,0,0.5)]">
                पाएं 90% तक का डिस्काउंट!
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#FFE8C5] leading-relaxed">
              Celebrate the pure bond of love this Rakshabandhan! Spin the golden wheel to win guaranteed sibling discounts, free designer Silver Rakhis, gift hampers, and instant cashback coupons!
            </p>

            {/* Daily Spin Tracker Counter */}
            <div className="p-4 rounded-2xl bg-[#400611]/90 border border-[#FFD700]/40 backdrop-blur-md shadow-2xl flex items-center justify-between max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#E63946] flex items-center justify-center text-[#2D040A] font-black text-2xl shadow-inner border border-[#FFD700]">
                  🎯
                </div>
                <div>
                  <span className="text-xs text-[#FFC482] font-semibold block">Today&apos;s Daily Spins Left</span>
                  <span className="text-xl font-black text-[#FFD700]">
                    {spinsLeft} / 3 Free Spins
                  </span>
                </div>
              </div>

              {spinsLeft === 0 ? (
                <a
                  href="#virtual-rakhi-section"
                  className="px-3 py-1.5 rounded-lg bg-[#FFD700] text-[#2D040A] text-xs font-extrabold hover:bg-white transition-colors shadow-md"
                >
                  +1 Bonus Spin
                </a>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#1F4E3D] text-[#A3E635] text-xs font-bold border border-[#A3E635]/40">
                  Ready to Spin!
                </span>
              )}
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              <div className="p-3 rounded-xl bg-[#580816]/80 border border-[#FFD700]/30 flex items-center gap-2.5 shadow-md">
                <Gift className="text-[#FFD700] shrink-0" size={18} />
                <span className="text-xs text-white font-semibold">100% Guaranteed Prizes</span>
              </div>
              <div className="p-3 rounded-xl bg-[#580816]/80 border border-[#FFD700]/30 flex items-center gap-2.5 shadow-md">
                <Tag className="text-[#FFD700] shrink-0" size={18} />
                <span className="text-xs text-white font-semibold">Instant Checkout Use</span>
              </div>
              <div className="p-3 rounded-xl bg-[#580816]/80 border border-[#FFD700]/30 flex items-center gap-2.5 shadow-md">
                <Truck className="text-[#FFD700] shrink-0" size={18} />
                <span className="text-xs text-white font-semibold">Free Express Shipping</span>
              </div>
              <div className="p-3 rounded-xl bg-[#580816]/80 border border-[#FFD700]/30 flex items-center gap-2.5 shadow-md">
                <ShieldCheck className="text-[#FFD700] shrink-0" size={18} />
                <span className="text-xs text-white font-semibold">Verified Sibling Coupons</span>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Lucky Wheel Component */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            
            {/* Pointer / Arrow Indicator at Top */}
            <div className="relative z-30 mb-[-26px] filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]">
              <div className="w-10 h-12 bg-gradient-to-b from-[#FFF0BB] via-[#FFD700] to-[#D4AF37] clip-path-pointer flex items-center justify-center border-2 border-[#580816]">
                <span className="text-xl">👇</span>
              </div>
            </div>

            {/* Wheel Outer Gold LED Frame */}
            <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full p-4 bg-gradient-to-tr from-[#FFD700] via-[#800A20] to-[#FF8C00] shadow-[0_0_90px_rgba(255,215,0,0.5)] border-4 border-[#FFD700]/90 flex items-center justify-center">
              
              {/* Decorative Perimeter Lights */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#FFD700]/70 pointer-events-none animate-spin-slow" />

              {/* Wheel SVG Canvas Container */}
              <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner">
                <svg
                  viewBox="0 0 500 500"
                  className="w-full h-full transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0.99,0.35,1.0)] transform-gpu"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {SEGMENTS.map((seg, i) => {
                    const totalSegs = SEGMENTS.length;
                    const angle = 360 / totalSegs;
                    const startAngle = i * angle;
                    const endAngle = (i + 1) * angle;

                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    const x1 = 250 + 250 * Math.cos(startRad);
                    const y1 = 250 + 250 * Math.sin(startRad);
                    const x2 = 250 + 250 * Math.cos(endRad);
                    const y2 = 250 + 250 * Math.sin(endRad);

                    const pathData = `M 250 250 L ${x1} ${y1} A 250 250 0 0 1 ${x2} ${y2} Z`;

                    const textAngle = startAngle + angle / 2;
                    const textRad = (textAngle * Math.PI) / 180;
                    const textX = 250 + 160 * Math.cos(textRad);
                    const textY = 250 + 160 * Math.sin(textRad);

                    return (
                      <g key={seg.id}>
                        <path
                          d={pathData}
                          fill={seg.color}
                          stroke="#FFD700"
                          strokeWidth="2.5"
                        />
                        <g transform={`translate(${textX}, ${textY}) rotate(${textAngle + 90})`}>
                          <text
                            textAnchor="middle"
                            fill={seg.textColor}
                            fontSize="20"
                            fontWeight="900"
                            dy="-6"
                            className="font-sans tracking-wide uppercase filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          >
                            {seg.icon} {seg.label}
                          </text>
                          <text
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="11"
                            fontWeight="700"
                            dy="14"
                            opacity="0.9"
                          >
                            CODE: {seg.code}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Hub SPIN Button */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || spinsLeft <= 0}
                  className="absolute inset-0 m-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#FFD700] via-[#FFA500] to-[#FFF0BB] border-4 border-[#400611] text-[#2D040A] font-black text-sm sm:text-base tracking-wider flex flex-col items-center justify-center shadow-[0_0_35px_rgba(0,0,0,0.9)] hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed transition-transform z-30 group"
                >
                  <span className="text-2xl group-hover:rotate-45 transition-transform">🪔</span>
                  <span className="font-extrabold uppercase text-center leading-tight">
                    {isSpinning ? "घुमाएं..." : "SPIN NOW"}
                  </span>
                  <small className="text-[9px] font-bold text-[#800A20] uppercase">
                    {spinsLeft} Spins Left
                  </small>
                </button>
              </div>
            </div>

            {/* Big Action CTA below wheel */}
            <div className="mt-6 text-center">
              <button
                onClick={handleSpin}
                disabled={isSpinning || spinsLeft <= 0}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#FFD700] via-[#FF8C00] to-[#E63946] text-[#2D040A] font-black text-base sm:text-lg tracking-wide uppercase shadow-[0_10px_35px_rgba(255,215,0,0.5)] hover:shadow-[0_15px_45px_rgba(255,215,0,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto disabled:opacity-50 border-2 border-[#FFD700]"
              >
                <Zap size={22} className="fill-[#2D040A]" />
                {isSpinning ? "LUCKY WHEEL IS SPINNING..." : "SPIN THE LUCKY WHEEL NOW / पहिया घुमाएं"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW FEATURE 1: Interactive Virtual Rakhi Tying Ceremony */}
      <section id="virtual-rakhi-section" className="max-w-5xl mx-auto px-4 py-10 relative z-10">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#400611] via-[#580816] to-[#2D040A] border-2 border-[#FFD700]/50 shadow-2xl text-center space-y-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-xs font-extrabold uppercase">
              📿 DIGITAL RAKHI CEREMONY
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              Perform Virtual Rakhi Tying Ceremony!
            </h3>
            <p className="text-sm text-[#FFC482] max-w-xl mx-auto">
              Select a designer Rakhi below and perform virtual Rakhi tying to receive auspicious blessings & unlock 1 Bonus Spin + 75% OFF Coupon!
            </p>
          </div>

          {/* Rakhi Selection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {VIRTUAL_RAKHIS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRakhi(r)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  selectedRakhi.id === r.id
                    ? "bg-[#FFD700] text-[#2D040A] border-[#FFFFFF] shadow-xl scale-105"
                    : "bg-[#2D040A] text-white border-[#FFD700]/30 hover:border-[#FFD700]"
                }`}
              >
                <span className="text-3xl">{r.icon}</span>
                <strong className="text-xs font-black text-center">{r.name}</strong>
                <small className="text-[10px] opacity-80">{r.desc}</small>
              </button>
            ))}
          </div>

          {/* Virtual Thali Stage */}
          <div className="p-6 rounded-2xl bg-[#2D040A] border border-[#FFD700]/40 max-w-md mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-4xl my-2">
              <span>🪔</span>
              <span className="animate-bounce">{selectedRakhi.icon}</span>
              <span>🍬</span>
            </div>

            {rakhiTied ? (
              <div className="p-4 rounded-xl bg-[#1F4E3D] border border-[#A3E635] text-white space-y-2 animate-scale-up">
                <span className="text-xs font-black text-[#A3E635] uppercase block">🎉 RAKHI TIED SUCCESSFULLY!</span>
                <p className="text-xs text-[#FFC482]">You received Rakhi Blessings + 75% OFF Coupon & +1 Bonus Spin!</p>
                <strong className="text-lg font-mono text-[#FFD700] block">CODE: RAKHI75</strong>
              </div>
            ) : (
              <button
                onClick={handleTieRakhi}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FF8C00] to-[#E63946] text-[#2D040A] font-extrabold text-sm uppercase flex items-center justify-center gap-2 hover:opacity-95 shadow-lg border border-[#FFD700]"
              >
                <Medal size={18} /> Tie {selectedRakhi.name} & Get Coupon + Spin
              </button>
            )}
          </div>
        </div>
      </section>

      {/* NEW FEATURE 2: Public Sibling Wish Wall */}
      <section className="max-w-5xl mx-auto px-4 py-10 relative z-10">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#400611] to-[#580816] border-2 border-[#FFD700]/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-xs font-extrabold uppercase">
              💬 PUBLIC RAKHI WISH WALL
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Share Sibling Wishes On The Live Rakhi Wall!
            </h3>
            <p className="text-xs sm:text-sm text-[#FFC482]">
              Post your sweet message to your brother/sister for everyone to see during this grand festival!
            </p>
          </div>

          {/* Post Form */}
          <form onSubmit={handlePostWall} className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={wallSender}
              onChange={(e) => setWallSender(e.target.value)}
              className="px-4 py-2 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#FFD700]"
            />
            <input
              type="text"
              placeholder="Sibling's Name (e.g. Rahul / Priya)"
              value={wallReceiver}
              onChange={(e) => setWallReceiver(e.target.value)}
              className="px-4 py-2 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#FFD700]"
            />
            <div className="flex gap-2 sm:col-span-3">
              <input
                type="text"
                required
                placeholder="Write your Rakhi wish... (e.g. Happy Rakhi Didi!)"
                value={wallMsg}
                onChange={(e) => setWallMsg(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#FFD700]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#2D040A] font-extrabold text-xs uppercase shrink-0 hover:bg-white transition-colors"
              >
                Post Wish
              </button>
            </div>
          </form>

          {/* Live Posts Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto pt-2">
            {wallPosts.map((post, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#2D040A] border border-[#FFD700]/30 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[#FFD700] font-bold">
                  <span>{post.sender} ➔ {post.receiver}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{post.time}</span>
                </div>
                <p className="text-white text-xs">{post.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mystery Rakhi Surprise Box Section */}
      <section className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#580816] via-[#400611] to-[#580816] border-2 border-[#FFD700]/50 shadow-2xl text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-xs font-extrabold uppercase">
            🎁 BONUS SURPRISE
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Unbox The Mystery Rakhi Surprise Box!
          </h3>
          <p className="text-xs sm:text-sm text-[#FFC482] max-w-xl mx-auto">
            Tap the gift box below to reveal an instant surprise extra cashback code for your Rakhi shopping!
          </p>

          <div className="pt-4 flex flex-col items-center justify-center">
            <button
              onClick={handleOpenMysteryBox}
              disabled={boxOpened}
              className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-[#FFD700] via-[#FF8C00] to-[#E63946] border-4 border-[#2D040A] shadow-2xl flex flex-col items-center justify-center text-5xl transition-all duration-500 transform ${
                boxOpened ? "scale-105 rotate-3 border-[#A3E635]" : "hover:scale-110 animate-bounce cursor-pointer"
              }`}
            >
              {boxOpened ? "🎉" : "🎁"}
              <small className="text-[10px] font-black text-[#2D040A] uppercase mt-2">
                {boxOpened ? "UNBOXED!" : "TAP TO UNBOX"}
              </small>
            </button>

            {boxOpened && mysteryCoupon && (
              <div className="mt-6 p-4 rounded-2xl bg-[#2D040A] border border-[#FFD700] max-w-md w-full animate-scale-up text-center space-y-2">
                <span className="text-xs font-extrabold text-[#A3E635] block">🎉 SURPRISE UNLOCKED!</span>
                <strong className="text-xl font-mono font-black text-[#FFD700]">{mysteryCoupon}</strong>
                <p className="text-xs text-[#FFC482]">Extra Cashback Voucher Added To Your Wallet!</p>
                <button
                  onClick={() => handleCopy(mysteryCoupon)}
                  className="px-4 py-1.5 rounded-lg bg-[#FFD700] text-[#2D040A] text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-white transition-colors mt-2"
                >
                  {copiedCode === mysteryCoupon ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode === mysteryCoupon ? "COPIED!" : "COPY MYSTERY CODE"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Claimed Coupons Wallet Bar */}
      {claimedCoupons.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6 relative z-10">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#400611] to-[#580816] border border-[#FFD700]/40 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-[#FFD700] flex items-center gap-2">
                <Trophy size={20} /> Your Won Coupons Wallet / आपके जीते गए ऑफर्स ({claimedCoupons.length})
              </h3>
              <span className="text-xs text-[#FFC482]">Valid for Raksha Bandhan Orders</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {claimedCoupons.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#2D040A] border border-[#FFD700]/30 relative flex flex-col justify-between hover:border-[#FFD700] transition-colors shadow-md"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#FFD700] block">OFFER VOUCHER</span>
                    <strong className="text-lg font-black text-white font-mono">{c.code}</strong>
                    <p className="text-xs text-[#FFC482] mt-1">{c.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(c.code)}
                      className="px-3 py-1.5 rounded-lg bg-[#FFD700] text-[#2D040A] text-xs font-black flex items-center gap-1.5 hover:bg-white transition-colors"
                    >
                      {copiedCode === c.code ? <Check size={14} /> : <Copy size={14} />}
                      {copiedCode === c.code ? "COPIED" : "COPY CODE"}
                    </button>
                    <Link
                      href="/"
                      className="text-xs text-[#FFD700] underline font-bold hover:text-white"
                    >
                      Shop Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sibling Rakhi Wish Card Generator (Earn Bonus Spin!) */}
      <section id="rakhi-card-generator" className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#400611] via-[#580816] to-[#2D040A] border-2 border-[#FFD700]/50 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
            <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-xs font-extrabold uppercase">
              🎁 SPECIAL SIBLING FEATURE
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Send Raksha Bandhan Greetings & Unlock <span className="text-[#FFD700]">+1 Bonus Spin!</span>
            </h3>
            <p className="text-sm text-[#FFC482]">
              Create a customized festive greeting message for your Brother or Sister and share the won discount coupon code with them!
            </p>
          </div>

          <form onSubmit={handleGenerateCard} className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#FFD700] mb-1">Sibling&apos;s Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya / Rahul"
                  value={siblingName}
                  onChange={(e) => setSiblingName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FFD700] mb-1">Relation</label>
                <select
                  value={siblingRole}
                  onChange={(e) => setSiblingRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white text-sm focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="Sister">Dear Sister (बहन)</option>
                  <option value="Brother">Dear Brother (भाई)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FFD700] mb-1">Personal Message</label>
              <textarea
                rows={3}
                value={customWish}
                onChange={(e) => setCustomWish(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#2D040A] font-extrabold text-sm uppercase tracking-wide hover:opacity-95 shadow-lg transition-all flex items-center justify-center gap-2 border border-[#FFD700]"
            >
              <Send size={16} /> Create Sibling Greeting Card & Get +1 Free Spin
            </button>
          </form>

          {/* Generated Wish Card Preview */}
          {cardGenerated && (
            <div className="mt-8 max-w-lg mx-auto p-6 rounded-3xl bg-gradient-to-tr from-[#FFF0BB] via-[#FFD700] to-[#FFA500] text-[#2D040A] border-4 border-[#800A20] shadow-2xl relative">
              <div className="text-center space-y-3">
                <span className="text-4xl">🪔📿🎁</span>
                <h4 className="text-2xl font-black uppercase text-[#800A20]">
                  Happy Raksha Bandhan {siblingName}!
                </h4>
                <p className="text-xs font-semibold text-[#400611] italic leading-relaxed">
                  &quot;{customWish}&quot;
                </p>

                <div className="p-4 rounded-2xl bg-[#800A20] text-white my-3 border border-[#FFD700]">
                  <small className="text-[10px] text-[#FFD700] uppercase font-bold block">FESTIVE DISCOUNT VOUCHER GIFT</small>
                  <strong className="text-xl font-mono font-black text-[#FFD700]">
                    CODE: {wonSegment ? wonSegment.code : "RAKHI75"}
                  </strong>
                  <p className="text-[11px] opacity-90">Use at checkout on VPANSAK Shopping</p>
                </div>

                <button
                  onClick={handleCopyCardText}
                  className="px-6 py-2.5 rounded-full bg-[#800A20] text-[#FFD700] font-black text-xs uppercase flex items-center gap-2 mx-auto hover:bg-[#400611] transition-colors border border-[#FFD700]"
                >
                  {cardCopied ? <Check size={14} /> : <Share2 size={14} />}
                  {cardCopied ? "GREETING COPIED!" : "COPY & SHARE ON WHATSAPP"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sibling Gift Finder Quiz & Curated Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center space-y-3 mb-8">
          <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-xs font-extrabold uppercase">
            SMART SIBLING GIFT FINDER
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Find The Perfect Gift For Your Brother / Sister!
          </h3>
          <p className="text-sm text-[#FFC482]">
            Select preferences below to discover ideal gifts and apply your Lucky Wheel discount code!
          </p>
        </div>

        {/* Quiz Controls */}
        <div className="p-6 rounded-2xl bg-[#400611]/80 border border-[#FFD700]/30 max-w-3xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#FFD700] mb-1">Shopping For</label>
            <select
              value={giftTarget}
              onChange={(e) => setGiftTarget(e.target.value as "Sister" | "Brother" | "All")}
              className="w-full px-3 py-2 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white text-xs"
            >
              <option value="All">All Siblings</option>
              <option value="Sister">Sister (बहन)</option>
              <option value="Brother">Brother (भाई)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFD700] mb-1">Category Vibe</label>
            <select
              value={giftVibe}
              onChange={(e) => setGiftVibe(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white text-xs"
            >
              <option value="All">All Categories</option>
              <option value="Tech">Tech & Gadgets 🎧</option>
              <option value="Fashion">Festive Fashion 👕</option>
              <option value="Beauty">Beauty & Glow 💄</option>
              <option value="Home">Home & Decor 🏠</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFD700] mb-1">Max Budget</label>
            <select
              value={giftBudget}
              onChange={(e) => setGiftBudget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#2D040A] border border-[#FFD700]/30 text-white text-xs"
            >
              <option value={1000}>Under ₹1,000</option>
              <option value={3000}>Under ₹3,000</option>
              <option value={15000}>Under ₹15,000</option>
              <option value={50000}>All Budgets</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredQuizProducts.slice(0, 8).map((product: CatalogProduct) => {
            const discount = Math.round((1 - product.price / product.mrp) * 100);
            return (
              <div
                key={product.id}
                className="rounded-2xl bg-[#400611]/90 border border-[#FFD700]/30 overflow-hidden flex flex-col justify-between hover:border-[#FFD700] transition-all hover:-translate-y-1 shadow-xl group"
              >
                <div className="relative aspect-square overflow-hidden bg-white/5">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#E63946] text-white text-[10px] font-black uppercase">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FFD700] text-[#2D040A] text-[10px] font-black">
                    {discount}% OFF
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#FFC482] uppercase font-bold">{product.brand}</span>
                    <h4 className="text-sm font-bold text-white line-clamp-2 mt-0.5">{product.name}</h4>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2">
                      <strong className="text-lg font-black text-[#FFD700]">₹{product.price.toLocaleString("en-IN")}</strong>
                      <s className="text-xs text-gray-400">₹{product.mrp.toLocaleString("en-IN")}</s>
                    </div>

                    <Link
                      href={`/checkout?product=${product.id}&qty=1`}
                      className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#2D040A] font-extrabold text-xs uppercase flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag size={14} /> Buy Now With Coupon
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grand Victory Winner Popup Modal */}
      {showWinModal && wonSegment && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-[#FFF0BB] via-[#FFD700] to-[#FFA500] text-[#2D040A] border-4 border-[#800A20] shadow-[0_0_100px_rgba(255,215,0,0.8)] relative text-center space-y-5 animate-scale-up">
            
            <div className="w-20 h-20 rounded-full bg-[#800A20] text-white flex items-center justify-center text-4xl mx-auto shadow-2xl border-4 border-[#FFD700]">
              {wonSegment.icon}
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#800A20] text-[#FFD700] text-xs font-black uppercase">
                🎉 RAKSHABANDHAN WINNER! / बधाई हो!
              </span>
              <h3 className="text-3xl font-black text-[#400611] mt-2">
                You Won {wonSegment.discount}!
              </h3>
              <p className="text-sm font-bold text-[#800A20] mt-1">
                {wonSegment.description}
              </p>
            </div>

            {/* Coupon Box */}
            <div className="p-4 rounded-2xl bg-[#400611] text-white border-2 border-dashed border-[#FFD700]">
              <small className="text-[10px] text-[#FFD700] font-bold uppercase block">YOUR EXCLUSIVE COUPON CODE</small>
              <strong className="text-2xl font-mono font-black text-[#FFD700] tracking-widest block my-1">
                {wonSegment.code}
              </strong>
              <small className="text-[10px] text-[#FFC482]">Apply during checkout for instant discount</small>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleCopy(wonSegment.code)}
                className="w-full py-3 rounded-xl bg-[#800A20] text-[#FFD700] font-extrabold text-sm uppercase flex items-center justify-center gap-2 hover:bg-[#580816] transition-colors border border-[#FFD700]"
              >
                {copiedCode === wonSegment.code ? <Check size={16} /> : <Copy size={16} />}
                {copiedCode === wonSegment.code ? "CODE COPIED TO CLIPBOARD!" : "COPY DISCOUNT CODE"}
              </button>

              <Link
                href="/"
                onClick={() => setShowWinModal(false)}
                className="w-full py-3 rounded-xl bg-[#2D040A] text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                Shop Rakhi Deals Now <ArrowRight size={14} />
              </Link>

              <button
                onClick={() => setShowWinModal(false)}
                className="text-xs font-bold text-[#400611] hover:underline pt-1"
              >
                Close & Spin Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#FFD700]/20 bg-[#230206] py-8 text-center text-xs text-[#FFC482] relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold">🪔 VPANSAK Shopping Raksha Bandhan Festive Celebration 📿</p>
          <p>© 2026 VPANSAK Inc. All Raksha Bandhan offers & discounts subject to terms.</p>
        </div>
      </footer>
    </div>
  );
}
