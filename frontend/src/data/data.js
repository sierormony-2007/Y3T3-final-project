// src/data/data.js



export const USERS = [
  {
    id: 1,
    name: "Admin",
    email: "admin@staff.com",
    password: "123",
    role: "staff",
    points: 0,
  },
  {
    id: 2,
    name: "kim",
    email: "kim@example.com",
    password: "123",
    role: "user",
    points: 0,
  },
];

// Dashboard
export const ACTIVE_PICKUPS = [
  {
    id: "PU-1002",
    name: "Smartphone / Tablet",
    weight: 2.6,
    date: "2026-06-02",
    status: "processing",
    icon: "⚙️",
    iconClass: "orange",
  },
  {
    id: "PU-1003",
    name: "Printer / Scanner",
    weight: 7.5,
    date: "2026-06-20",
    status: "pending",
    icon: "⏱",
    iconClass: "yellow",
  },
];

export const RECENT_ACTIVITY = [
  {
    text: "Printer / Scanner · 7.5 kg",
    date: "6/10/2026",
    color: "dot-orange",
  },
  {
    text: "Smartphone / Tablet · 2.6 kg",
    date: "5/28/2026",
    color: "dot-orange",
  },
  {
    text: "Laptop / Computer · 8.4 kg — Recycled ✓",
    date: "5/14/2026",
    color: "dot-green",
  },
];

// My Impact
export const MONTHLY = [
  { month: "Jan", pct: 20 },
  { month: "Feb", pct: 35 },
  { month: "Mar", pct: 10 },
  { month: "Apr", pct: 50 },
  { month: "May", pct: 100, highlight: true },
  { month: "Jun", pct: 60 },
];

export const DEVICES = [
  { icon: "💻", name: "Laptop / Computer", kg: 8.4, pct: 31 },
  { icon: "🖨", name: "Printer / Scanner", kg: 7.5, pct: 28 },
  { icon: "📱", name: "Smartphone / Tablet", kg: 2.6, pct: 10 },
];

export const ACHIEVEMENTS = [
  { icon: "🥇", name: "First Pickup", sub: "Completed", locked: false },
  { icon: "⭐", name: "Gold Member", sub: "1,000+ pts", locked: false },
  { icon: "🌳", name: "50 kg Club", sub: "26.9 / 50 kg", locked: false },
  { icon: "💎", name: "Platinum", sub: "2,000 pts needed", locked: true },
];

// Rewards Store
export const REWARD_CATEGORIES = [
  "All",
  "Lifestyle",
  "Bags",
  "Tech",
  "Kitchen",
  "Stationery",
  "Home",
  "Garden",
];

export const REWARD_ITEMS = [
  {
    id: 1,
    name: "Bamboo Water Bottle",
    desc: "BPA-free, keeps drinks cold 24h or hot 12h",
    pts: 200,
    cat: "Lifestyle",
    emoji: "🧴",
  },
  {
    id: 2,
    name: "Organic Cotton Tote Bag",
    desc: "GOTS-certified, reusable",
    pts: 120,
    cat: "Bags",
    emoji: "👜",
  },
];

// Schedule Pickup
export const DEVICE_CATEGORIES = [
  "Laptop / Computer",
  "Smartphone / Tablet",
  "Printer / Scanner",
  "TV / Monitor",
  "Kitchen Appliance",
  "Other Electronics",
];

export const TIME_SLOTS = [
  "08:00 – 10:00",
  "10:00 – 12:00",
  "12:00 – 14:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
  "17:00 – 19:00",
];

// Track Pickup
export const STEPS = [
  "Pending",
  "Scheduled",
  "Picked Up",
  "Processing",
  "Recycled ✓",
];

export const STEP_ICONS = ["⏱", "📅", "🚛", "⚙️", "✅"];

export const PICKUPS = [
  {
    id: "PU-1001",
    name: "Laptop / Computer",
    status: "recycled",
    weight: 8.4,
    items: 2,
    date: "2026-05-14",
    time: "10:00–12:00",
    address: "12 Green Ln, Eco City, 10001",
    stepDone: 5,
    pts: 336,
    icon: "✅",
    iconClass: "green",
  },
];

export const STATUS_BADGE = {
  recycled: "badge badge-recycled",
  processing: "badge badge-processing",
  pending: "badge badge-pending",
};

export const STATUS_LABEL = {
  recycled: "Recycled ✓",
  processing: "Processing",
  pending: "Pending",
};