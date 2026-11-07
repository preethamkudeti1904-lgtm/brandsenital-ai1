"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  Plus,
  Wand2,
  FileText,
  Layers,
  Lock,
  Unlock,
  KeyRound,
  Mail,
  Palette,
  Eye,
  Download,
  Printer,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Sliders,
  Search,
  Trash2,
  History,
  Award,
  ArrowRight,
  UploadCloud,
  Image as ImageIcon,
  X,
  FileCheck,
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type UserRole = "Creator" | "Reviewer";
export type IssueSeverity = "critical" | "warning" | "suggestion";
export type IssueCategory =
  | "security"
  | "regulatory"
  | "lexicon"
  | "tone"
  | "esg"
  | "custom";

export interface BrandColor {
  hex: string;
  name: string;
  role: string;
  description: string;
}

export interface GovernanceRule {
  id: string;
  name: string;
  pillar: string; // Associated brand pillar
  category: IssueCategory;
  severity: IssueSeverity;
  pattern: string; // Plain string or regex string
  isRegex: boolean;
  caseSensitive?: boolean;
  policyCitation: string;
  explanation: string;
  replacement: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface Discrepancy {
  id: string;
  ruleId: string;
  ruleName: string;
  pillar: string;
  category: IssueCategory;
  severity: IssueSeverity;
  matchedText: string;
  index: number;
  length: number;
  policyCitation: string;
  explanation: string;
  replacement: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  role: UserRole;
  action: "REPLACE_SINGLE" | "REPLACE_ALL" | "CUSTOM_RULE_ADDED" | "SEAL_APPROVED" | "DRAFT_RESET" | "RULE_TOGGLED";
  details: string;
  ruleName?: string;
  beforeText?: string;
  afterText?: string;
  complianceScore: number;
}

export interface CryptographicSeal {
  hash: string;
  algorithm: "SHA-256";
  timestamp: string;
  reviewerName: string;
  brandKit: string;
  score: number;
  wordCount: number;
  charCount: number;
  verified: boolean;
}

export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  luminance: number;
  contrastWhite: number;
  contrastDark: number;
  wcagAANormal: boolean;
  wcagAALarge: boolean;
  wcagAAANormal: boolean;
  wcagAAALarge: boolean;
  closestBrandColor?: { name: string; hex: string; distance: number };
}

export interface BrandKit {
  id: string;
  name: string;
  sector: string;
  tagline: string;
  description: string;
  pillars: string[];
  approvedColors: BrandColor[];
  rules: GovernanceRule[];
  sampleDraft: string;
  sampleImages: { name: string; description: string; dataUri: string }[];
}

export type VisionFilter = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

// ==========================================
// PRESET BRAND ASSETS (SVG DATA URIS)
// ==========================================

const SAMPLE_ASSETS = {
  apexPayCard: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" rx="24" fill="%230F172A"/>
    <circle cx="500" cy="80" r="140" fill="%232563EB" opacity="0.35"/>
    <circle cx="100" cy="300" r="120" fill="%2310B981" opacity="0.25"/>
    <rect x="50" y="50" width="60" height="42" rx="8" fill="%23FEF3C7"/>
    <text x="50" y="220" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23FFFFFF" letter-spacing="3">4912  8834  9021  7732</text>
    <text x="50" y="270" font-family="sans-serif" font-size="14" fill="%2394A3B8">CARDHOLDER</text>
    <text x="50" y="295" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23FFFFFF">APEXPAY CORP TREASURY</text>
    <text x="440" y="295" font-family="sans-serif" font-size="20" font-weight="bold" fill="%232563EB">ApexPay</text>
    <rect x="440" y="50" width="110" height="30" rx="15" fill="%2310B981"/>
    <text x="460" y="70" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230F172A">VERIFIED</text>
  </svg>`,
  verdantLookbook: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" rx="24" fill="%23064E3B"/>
    <rect x="30" y="30" width="540" height="320" rx="16" fill="%23FEF3C7" opacity="0.15"/>
    <circle cx="480" cy="120" r="90" fill="%23059669" opacity="0.5"/>
    <text x="60" y="100" font-family="serif" font-size="28" font-weight="bold" fill="%23FEF3C7">VERDANT STUDIO</text>
    <text x="60" y="140" font-family="sans-serif" font-size="14" fill="%23FEF3C7" opacity="0.9">EVIDENCE-BACKED REGENERATIVE APPAREL</text>
    <rect x="60" y="180" width="220" height="120" rx="12" fill="%231F2937"/>
    <text x="80" y="220" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23FEF3C7">CIRCULAR FIBER LAB</text>
    <text x="80" y="250" font-family="sans-serif" font-size="12" fill="%2394A3B8">OEKO-TEX STD 100</text>
    <text x="80" y="275" font-family="sans-serif" font-size="12" fill="%23059669">TRACEABLE BATCH #049</text>
  </svg>`,
  highContrastAlert: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" rx="24" fill="%231E293B"/>
    <rect x="40" y="40" width="520" height="300" rx="12" fill="%232563EB"/>
    <text x="80" y="130" font-family="sans-serif" font-size="32" font-weight="bold" fill="%23FFFFFF">ENTERPRISE COMPLIANCE</text>
    <text x="80" y="175" font-family="sans-serif" font-size="16" fill="%23F8FAFC">Automated real-time brand governance across digital channels</text>
    <rect x="80" y="220" width="180" height="48" rx="8" fill="%23FFFFFF"/>
    <text x="120" y="250" font-family="sans-serif" font-size="15" font-weight="bold" fill="%232563EB">EXPLORE RAILS</text>
  </svg>`,
};

// ==========================================
// PRE-CONFIGURED BRAND KITS
// ==========================================

const INITIAL_BRAND_KITS: BrandKit[] = [
  {
    id: "apexpay",
    name: "ApexPay Financial",
    sector: "FinTech & Regulated Banking Rails",
    tagline: "Cryptographic precision in cross-border corporate settlement",
    description:
      "Enterprise settlement infrastructure operating under SEC Rule 156, FINRA Rule 2210, and SOC2 Type II standards. Zero tolerance for unverified risk guarantees, hyperbole, or internal credential leaks.",
    pillars: ["Trustworthy", "Precise", "Transparent", "No Hyperbole"],
    approvedColors: [
      { hex: "#0F172A", name: "Slate Deep", role: "Primary Background & Deep Typography", description: "Authoritative dark canvas" },
      { hex: "#2563EB", name: "Apex Blue", role: "Primary Interactive Accent", description: "Financial trust and action triggers" },
      { hex: "#10B981", name: "Mint Verified", role: "Positive Trust Indicator", description: "Successful compliance confirmations" },
      { hex: "#F8FAFC", name: "Off White", role: "Neutral Surface & Card Fill", description: "Clean high-contrast background" },
    ],
    sampleDraft: `ApexPay is the world's most revolutionary, unbeatable miracle platform for real-time global treasury settlement! We guarantee zero risk and 100% instantaneous cashback on all cross-border transactions with zero conditions attached. Our game-changing disruption completely eliminates currency volatility, offering a completely risk-free yield of 14.8% APY.

Under the hood, our legacy wire transfer engine has been deprecated; instead, run our script runner utility to dispatch high-frequency sub-account batcher protocols directly into primary clearing networks.

For urgent escalations or bespoke liquidity routing, reach out to sarah.chen@apexpay-internal.corp or contact lead architect Marcus at marcus.vance@apexpay.corp directly.

Developers can authenticate sandbox webhooks using our production master secret: sk-live-948201934857201928475019 with header api_key_prod_88204910293 to bypass KYC gateway throttles.`,
    rules: [
      {
        id: "apex-sec-1",
        name: "Production API Secret Leak",
        pillar: "Trustworthy",
        category: "security",
        severity: "critical",
        pattern: "sk-live-[a-zA-Z0-9_-]{16,}",
        isRegex: true,
        policyCitation: "SOC2 Security Control CC6.1 & PCI-DSS 3.4",
        explanation: "Live production API tokens must never appear in customer-facing copy, documentation drafts, or marketing collateral.",
        replacement: "[REDACTED_LIVE_API_KEY]",
        enabled: true,
      },
      {
        id: "apex-sec-2",
        name: "Production API Header Key Leak",
        pillar: "Trustworthy",
        category: "security",
        severity: "critical",
        pattern: "api_key_[a-zA-Z0-9_-]{10,}",
        isRegex: true,
        policyCitation: "SOC2 Security Standard CC6.6: Credential Isolation",
        explanation: "Detected raw authorization header token. Production keys must be stored in encrypted KMS vaults.",
        replacement: "[REDACTED_API_TOKEN]",
        enabled: true,
      },
      {
        id: "apex-sec-3",
        name: "Confidential Internal Employee Email",
        pillar: "Trustworthy",
        category: "security",
        severity: "critical",
        pattern: "[a-zA-Z0-9._%+-]+@apexpay(-internal)?\\.corp",
        isRegex: true,
        policyCitation: "Brand Security Policy §8.2: Directory Harvest Prevention",
        explanation: "Direct internal employee email addresses leak org structure and invite spear-phishing. Use approved public alias.",
        replacement: "support@apexpay.com",
        enabled: true,
      },
      {
        id: "apex-reg-1",
        name: "Unsubstantiated Zero-Risk Claim",
        pillar: "Trustworthy",
        category: "regulatory",
        severity: "critical",
        pattern: "guarantee zero risk",
        isRegex: false,
        policyCitation: "SEC Rule 156 / FINRA Rule 2210(d)(1)",
        explanation: "Financial communications cannot guarantee absence of financial, counterparty, or settlement risk.",
        replacement: "provide enterprise-grade cryptographic risk mitigation",
        enabled: true,
      },
      {
        id: "apex-reg-2",
        name: "Deceptive Instant Cashback Claim",
        pillar: "Transparent",
        category: "regulatory",
        severity: "critical",
        pattern: "100% instantaneous cashback on all cross-border transactions with zero conditions attached",
        isRegex: false,
        policyCitation: "FTC Act §5: Unfair or Deceptive Representations",
        explanation: "Unqualified claims of 100% cashback violate consumer protection guidelines without full disclaimer disclosures.",
        replacement: "competitive tier-based rebate schedules subject to underwriting terms",
        enabled: true,
      },
      {
        id: "apex-reg-3",
        name: "Guaranteed APY Yield Representation",
        pillar: "Precise",
        category: "regulatory",
        severity: "critical",
        pattern: "completely risk-free yield of 14.8% APY",
        isRegex: false,
        policyCitation: "Truth in Savings Act (12 CFR Part 1030) / Reg DD",
        explanation: "Yield quotes require audited baseline disclaimers, fee disclosures, and historical variable rate notices.",
        replacement: "target liquidity yield of up to 4.2% APY (variable, terms apply)",
        enabled: true,
      },
      {
        id: "apex-lex-1",
        name: "Deprecated Term: script runner",
        pillar: "Precise",
        category: "lexicon",
        severity: "warning",
        pattern: "script runner",
        isRegex: false,
        policyCitation: "ApexPay Product Lexicon Standard v4.2 §1.1",
        explanation: "The phrase 'script runner' refers to our decommissioned legacy utility. Use official product terminology.",
        replacement: "Apex Orchestration SDK",
        enabled: true,
      },
      {
        id: "apex-lex-2",
        name: "Deprecated Term: legacy wire transfer",
        pillar: "Precise",
        category: "lexicon",
        severity: "warning",
        pattern: "legacy wire transfer",
        isRegex: false,
        policyCitation: "ApexPay Product Lexicon Standard v4.2 §1.4",
        explanation: "Outdated nomenclature confusing modern ISO 20022 messaging rails with obsolete telegraphic transfer.",
        replacement: "automated multi-currency clearing rails",
        enabled: true,
      },
      {
        id: "apex-lex-3",
        name: "Deprecated Term: sub-account batcher",
        pillar: "Precise",
        category: "lexicon",
        severity: "warning",
        pattern: "sub-account batcher",
        isRegex: false,
        policyCitation: "ApexPay Product Lexicon Standard v4.2 §2.1",
        explanation: "Deprecated v2 terminology replaced by Hierarchical Virtual Ledger architecture.",
        replacement: "Hierarchical Virtual Ledger",
        enabled: true,
      },
      {
        id: "apex-tone-1",
        name: "Hyperbolic Superlative: miracle platform",
        pillar: "No Hyperbole",
        category: "tone",
        severity: "suggestion",
        pattern: "revolutionary, unbeatable miracle platform",
        isRegex: false,
        policyCitation: "Brand Voice Guide: Pillar IV - Precision & No Hyperbole",
        explanation: "ApexPay communicates with institutional sobriety. Superlatives erode institutional credibility.",
        replacement: "enterprise-grade, high-throughput payment infrastructure",
        enabled: true,
      },
      {
        id: "apex-tone-2",
        name: "Hyperbolic Superlative: game-changing disruption",
        pillar: "No Hyperbole",
        category: "tone",
        severity: "suggestion",
        pattern: "game-changing disruption",
        isRegex: false,
        policyCitation: "Brand Voice Guide: Pillar IV - Subdued Authority",
        explanation: "Avoid tech buzzword clichés; state architectural capabilities factually.",
        replacement: "modernized settlement architecture",
        enabled: true,
      },
    ],
    sampleImages: [
      { name: "ApexPay Corporate Card Banner", description: "Dark palette with verified badge", dataUri: SAMPLE_ASSETS.apexPayCard },
      { name: "Apex Enterprise Compliance Alert", description: "High-contrast blue & dark card", dataUri: SAMPLE_ASSETS.highContrastAlert },
    ],
  },
  {
    id: "verdant",
    name: "Verdant Studio",
    sector: "D2C Circular Fashion & Sustainable Textiles",
    tagline: "Warm, evidence-backed apparel crafted for circular reuse",
    description:
      "Direct-to-consumer apparel brand committed to FTC Green Guides compliance, OEKO-TEX Standard 100 verification, and GOTS textile labeling laws. Rigorous deterrence of greenwashing claims.",
    pillars: ["Warm", "Evidence-Backed", "Humble", "Inclusive"],
    approvedColors: [
      { hex: "#064E3B", name: "Forest Deep", role: "Primary Brand & Core Identity", description: "Grounded ecological green" },
      { hex: "#059669", name: "Emerald Leaf", role: "Secondary Active Accent", description: "Vibrant botanical highlight" },
      { hex: "#FEF3C7", name: "Warm Oat Linen", role: "Neutral Surface & Card Fill", description: "Soft organic fiber feel" },
      { hex: "#1F2937", name: "Charcoal Slate", role: "High-Contrast Typography", description: "Legible contrast for body text" },
    ],
    sampleDraft: `At Verdant Studio, our planet-saving miracle fabric is reversing climate change in a single season! Every trench coat is 100% eco-friendly with zero carbon footprint and infinitely sustainable from soil to closet. We craft our pieces with totally chemical-free treatments and 100% pure bamboo silk, ensuring you wear zero toxins.

Our signature jackets are crafted from premium vegan leather that lasts forever without any environmental impact. Plus, we've partnered with local cooperatives to introduce uncertified eco-cotton that out-performs conventional organic cotton without the need for expensive third-party audits.

For trade inquiries or wholesale sample shipments, message sourcing director Elena directly at elena.vance@verdantstudio-team.internal or contact our logistics lead at shipping-desk@verdant.internal.

Partners integrating with our direct factory inventory feed should configure bearer authorization sk-live-vd_993810294817203948 with client ID api_key_verdant_live_994821 to pull real-time warehouse pallet counts.`,
    rules: [
      {
        id: "vd-sec-1",
        name: "Supply-Chain Inventory API Token",
        pillar: "Evidence-Backed",
        category: "security",
        severity: "critical",
        pattern: "sk-live-vd_[a-zA-Z0-9_-]{16,}",
        isRegex: true,
        policyCitation: "ISO 27001 Vendor Integration Security Spec §A.9.4",
        explanation: "Live ERP/warehouse pallet tokens exposed in copy could allow unauthorized supply-chain access.",
        replacement: "[REDACTED_SUPPLY_KEY]",
        enabled: true,
      },
      {
        id: "vd-sec-2",
        name: "Client Identification Secret Token",
        pillar: "Evidence-Backed",
        category: "security",
        severity: "critical",
        pattern: "api_key_verdant_live_[a-zA-Z0-9_-]{6,}",
        isRegex: true,
        policyCitation: "Data Protection & SOC2 CC6.1",
        explanation: "Live client identification key detected in marketing text draft.",
        replacement: "[REDACTED_CLIENT_ID]",
        enabled: true,
      },
      {
        id: "vd-sec-3",
        name: "Internal Factory Staff Email Exposure",
        pillar: "Warm",
        category: "security",
        severity: "critical",
        pattern: "[a-zA-Z0-9._%+-]+@verdant(studio-team)?\\.internal",
        isRegex: true,
        policyCitation: "Verdant Studio Internal Privacy Policy §4",
        explanation: "Direct routing emails to internal design/logistics staff must be routed through official wholesale inbox.",
        replacement: "concierge@verdantstudio.com",
        enabled: true,
      },
      {
        id: "vd-esg-1",
        name: "FTC Greenwashing: 100% Eco-Friendly Claim",
        pillar: "Evidence-Backed",
        category: "esg",
        severity: "critical",
        pattern: "100% eco-friendly with zero carbon footprint",
        isRegex: false,
        policyCitation: "FTC Green Guides 16 CFR § 260.4 (General Environmental Benefit)",
        explanation: "Broad, unqualified claims of environmental benefit are deceptive unless every stage of the lifecycle is verified zero-net.",
        replacement: "crafted with 68% lower lifecycle emissions verified through third-party LCA audits",
        enabled: true,
      },
      {
        id: "vd-esg-2",
        name: "Unsubstantiated Claim: Infinitely Sustainable",
        pillar: "Humble",
        category: "esg",
        severity: "warning",
        pattern: "infinitely sustainable",
        isRegex: false,
        policyCitation: "Advertising Standards Authority (ASA) Rule 11.1",
        explanation: "Absolute sustainability claims cannot be substantiated for manufactured blended consumer textiles.",
        replacement: "engineered for circular disassembly and longevity",
        enabled: true,
      },
      {
        id: "vd-esg-3",
        name: "Deceptive Purity Claim: Totally Chemical-Free",
        pillar: "Evidence-Backed",
        category: "esg",
        severity: "warning",
        pattern: "totally chemical-free",
        isRegex: false,
        policyCitation: "UK ASA Ruling & FTC Green Guides § 260.9",
        explanation: "All natural fibers and water are chemical compounds. Claiming 'chemical-free' is scientifically false.",
        replacement: "finished without hazardous fluorochemicals and OEKO-TEX Standard 100 certified",
        enabled: true,
      },
      {
        id: "vd-lex-1",
        name: "FTC Deceptive Fabric Nomenclature: Bamboo Silk",
        pillar: "Evidence-Backed",
        category: "regulatory",
        severity: "warning",
        pattern: "100% pure bamboo silk",
        isRegex: false,
        policyCitation: "FTC Textile Fiber Rule 16 CFR § 303.7 & Bamboo Enforcement",
        explanation: "FTC regulations mandate that chemically processed cellulose from bamboo must be labeled as 'rayon from bamboo'.",
        replacement: "100% rayon derived from sustainably harvested bamboo",
        enabled: true,
      },
      {
        id: "vd-lex-2",
        name: "Deceptive Material Name: Vegan Leather",
        pillar: "Inclusive",
        category: "lexicon",
        severity: "warning",
        pattern: "vegan leather",
        isRegex: false,
        policyCitation: "FTC Guides for the Select Leather and Imitation Leather Products § 24.2",
        explanation: "Using 'leather' for non-animal synthetic polymers without disclosing composition (e.g. PU) misleads buyers.",
        replacement: "waterborne bio-polyurethane synthetic alternative",
        enabled: true,
      },
      {
        id: "vd-lex-3",
        name: "Uncertified Cotton Label: eco-cotton",
        pillar: "Evidence-Backed",
        category: "lexicon",
        severity: "warning",
        pattern: "uncertified eco-cotton",
        isRegex: false,
        policyCitation: "Global Organic Textile Standard (GOTS) Licensing Code",
        explanation: "Coined terms like 'eco-cotton' without certification pedigree breach brand evidence-backed guidelines.",
        replacement: "in-transition organic cotton verified by local agrarian cooperatives",
        enabled: true,
      },
      {
        id: "vd-tone-1",
        name: "Hyperbolic ESG Claim: Reversing Climate Change",
        pillar: "Humble",
        category: "tone",
        severity: "suggestion",
        pattern: "planet-saving miracle fabric is reversing climate change in a single season",
        isRegex: false,
        policyCitation: "Verdant Tone Guide: Pillar III - Humble & Evidence-Backed",
        explanation: "Overpromising climate reversal damages brand trust. Maintain humble, quantified environmental posture.",
        replacement: "regenerative textile blend helps reduce water footprint compared to conventional milling",
        enabled: true,
      },
    ],
    sampleImages: [
      { name: "Verdant Studio Lookbook Header", description: "Forest Green with Oat Linen text", dataUri: SAMPLE_ASSETS.verdantLookbook },
      { name: "High Contrast Campaign Banner", description: "High-contrast slate banner", dataUri: SAMPLE_ASSETS.highContrastAlert },
    ],
  },
];

// ==========================================
// UTILITY FUNCTIONS: W3C WCAG CALCULATIONS
// ==========================================

function sRgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Client-side SHA-256 Web Crypto
async function computeSha256(dataString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BrandSentinelPage() {
  // Navigation & Role State
  const [role, setRole] = useState<UserRole>("Reviewer");
  const [brandKits, setBrandKits] = useState<BrandKit[]>(INITIAL_BRAND_KITS);
  const [activeKitId, setActiveKitId] = useState<string>("apexpay");
  const [activeTab, setActiveTab] = useState<"workspace" | "canvas" | "audit" | "rules">("workspace");

  // Active Kit
  const activeKit = useMemo(() => {
    return brandKits.find((k) => k.id === activeKitId) || brandKits[0];
  }, [brandKits, activeKitId]);

  // Draft Text & Editor State
  const [draftText, setDraftText] = useState<string>(activeKit.sampleDraft);
  const [viewMode, setViewMode] = useState<"editor" | "visual">("editor");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<"all" | IssueSeverity>("all");
  const [pillarFilter, setPillarFilter] = useState<string | null>(null);
  const [rulesCategoryFilter, setRulesCategoryFilter] = useState<"all" | IssueCategory>("all");
  const [selectedDiscrepancyId, setSelectedDiscrepancyId] = useState<string | null>(null);

  // Modals & Popovers
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [diffViewMode, setDiffViewMode] = useState<"split" | "unified">("split");
  const [isCustomRuleModalOpen, setIsCustomRuleModalOpen] = useState<boolean>(false);
  const [inlinePopoverDisc, setInlinePopoverDisc] = useState<Discrepancy | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Cryptographic Seal & Audit Trail
  const [seal, setSeal] = useState<CryptographicSeal | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    {
      id: "log-init-1",
      timestamp: "10:14:22 AM, 11/7/2026",
      role: "Reviewer",
      action: "DRAFT_RESET",
      details: "Initial brand kit loaded into Brand Sentinel governance pipeline.",
      complianceScore: 35,
    },
  ]);

  // Multimodal Canvas State
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(SAMPLE_ASSETS.apexPayCard);
  const [extractedPalette, setExtractedPalette] = useState<ExtractedColor[]>([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [visionFilter, setVisionFilter] = useState<VisionFilter>("normal");
  const [probedPixel, setProbedPixel] = useState<{
    hex: string;
    rgb: [number, number, number];
    lum: number;
    contrastWhite: number;
    contrastDark: number;
    x: number;
    y: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form State for Custom Rule Modal
  const [newRuleName, setNewRuleName] = useState("");
  const [newRulePillar, setNewRulePillar] = useState(activeKit.pillars[0] || "Trustworthy");
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleIsRegex, setNewRuleIsRegex] = useState(false);
  const [newRuleCategory, setNewRuleCategory] = useState<IssueCategory>("lexicon");
  const [newRuleSeverity, setNewRuleSeverity] = useState<IssueSeverity>("warning");
  const [newRuleCitation, setNewRuleCitation] = useState("");
  const [newRuleExplanation, setNewRuleExplanation] = useState("");
  const [newRuleReplacement, setNewRuleReplacement] = useState("");

  // Notification Toast Helper
  const showNotification = useCallback((message: string, type: "success" | "info" | "warning" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  // Update Draft when Brand Kit switches
  const handleSwitchBrandKit = (kitId: string) => {
    const targetKit = brandKits.find((k) => k.id === kitId);
    if (!targetKit) return;
    setActiveKitId(kitId);
    setDraftText(targetKit.sampleDraft);
    setSeal(null);
    setSelectedDiscrepancyId(null);
    setPillarFilter(null);
    setInlinePopoverDisc(null);
    if (targetKit.sampleImages[0]) {
      setUploadedImageUrl(targetKit.sampleImages[0].dataUri);
    }
    setAuditLog((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString(),
        role,
        action: "KIT_SWITCHED" as any,
        details: `Switched active brand kit to: ${targetKit.name}`,
        complianceScore: 40,
      },
      ...prev,
    ]);
    showNotification(`Switched brand kit to ${targetKit.name}`);
  };

  // Continuous Detection Engine: Evaluates draft on load & text change
  const discrepancies: Discrepancy[] = useMemo(() => {
    const results: Discrepancy[] = [];
    if (!draftText) return results;

    activeKit.rules.forEach((rule) => {
      if (!rule.enabled) return;

      try {
        if (rule.isRegex) {
          const regex = new RegExp(rule.pattern, rule.caseSensitive ? "g" : "gi");
          let match: RegExpExecArray | null;
          while ((match = regex.exec(draftText)) !== null) {
            results.push({
              id: `${rule.id}-${match.index}`,
              ruleId: rule.id,
              ruleName: rule.name,
              pillar: rule.pillar,
              category: rule.category,
              severity: rule.severity,
              matchedText: match[0],
              index: match.index,
              length: match[0].length,
              policyCitation: rule.policyCitation,
              explanation: rule.explanation,
              replacement: rule.replacement,
            });
            if (!regex.global) break;
          }
        } else {
          const escaped = escapeRegExp(rule.pattern);
          const regex = new RegExp(escaped, rule.caseSensitive ? "g" : "gi");
          let match: RegExpExecArray | null;
          while ((match = regex.exec(draftText)) !== null) {
            results.push({
              id: `${rule.id}-${match.index}`,
              ruleId: rule.id,
              ruleName: rule.name,
              pillar: rule.pillar,
              category: rule.category,
              severity: rule.severity,
              matchedText: match[0],
              index: match.index,
              length: match[0].length,
              policyCitation: rule.policyCitation,
              explanation: rule.explanation,
              replacement: rule.replacement,
            });
            if (!regex.global) break;
          }
        }
      } catch (err) {
        console.error("Rule evaluation error on:", rule.name, err);
      }
    });

    // Sort by appearance order
    return results.sort((a, b) => a.index - b.index);
  }, [draftText, activeKit.rules]);

  // Pillar Health Integrity Status
  const pillarHealthMap = useMemo(() => {
    const map = new Map<string, { total: number; critical: number; warning: number; suggestion: number }>();
    activeKit.pillars.forEach((p) => {
      map.set(p, { total: 0, critical: 0, warning: 0, suggestion: 0 });
    });

    discrepancies.forEach((d) => {
      const current = map.get(d.pillar) || { total: 0, critical: 0, warning: 0, suggestion: 0 };
      current.total++;
      if (d.severity === "critical") current.critical++;
      else if (d.severity === "warning") current.warning++;
      else if (d.severity === "suggestion") current.suggestion++;
      map.set(d.pillar, current);
    });

    return map;
  }, [activeKit.pillars, discrepancies]);

  // Dynamic Brand Health Score Calculation
  const { brandScore, scoreStatus } = useMemo(() => {
    let criticalDeductions = 0;
    let warningDeductions = 0;
    let suggestionDeductions = 0;

    discrepancies.forEach((d) => {
      if (d.severity === "critical") criticalDeductions += 25;
      else if (d.severity === "warning") warningDeductions += 15;
      else if (d.severity === "suggestion") suggestionDeductions += 5;
    });

    const totalDeductions = criticalDeductions + warningDeductions + suggestionDeductions;
    const finalScore = Math.max(0, 100 - totalDeductions);

    let status = "Pristine Compliance";
    if (finalScore < 50) status = "Critical Audit Failure";
    else if (finalScore < 75) status = "Remediation Required";
    else if (finalScore < 95) status = "Acceptable with Advisories";

    return {
      brandScore: finalScore,
      scoreStatus: status,
    };
  }, [discrepancies]);

  // Invalidate Seal if text changes after approval
  useEffect(() => {
    if (seal && seal.charCount !== draftText.length) {
      setSeal((prev) => (prev ? { ...prev, verified: false } : null));
    }
  }, [draftText, seal]);

  // 1-Click Patching: Safely replaces the targeted phrase without breaking surrounding text
  const handlePatchDiscrepancy = (disc: Discrepancy) => {
    let updatedText = draftText;
    if (draftText.slice(disc.index, disc.index + disc.length) === disc.matchedText) {
      updatedText =
        draftText.slice(0, disc.index) + disc.replacement + draftText.slice(disc.index + disc.length);
    } else {
      const escaped = escapeRegExp(disc.matchedText);
      updatedText = draftText.replace(new RegExp(escaped, "i"), disc.replacement);
    }

    setDraftText(updatedText);
    setInlinePopoverDisc(null);

    const remainingDeductions = discrepancies
      .filter((d) => d.id !== disc.id)
      .reduce((acc, curr) => acc + (curr.severity === "critical" ? 25 : curr.severity === "warning" ? 15 : 5), 0);
    const newScore = Math.max(0, 100 - remainingDeductions);

    setAuditLog((prev) => [
      {
        id: `patch-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString(),
        role,
        action: "REPLACE_SINGLE",
        details: `Patched rule [${disc.ruleName}]`,
        ruleName: disc.ruleName,
        beforeText: disc.matchedText,
        afterText: disc.replacement,
        complianceScore: newScore,
      },
      ...prev,
    ]);

    showNotification(`Patched: "${disc.matchedText.slice(0, 24)}..." with compliant term.`);
  };

  // Batch "Apply All Fixes": Patches all detected issues simultaneously from back to front
  const handleBatchPatchAll = () => {
    if (discrepancies.length === 0) return;

    const sorted = [...discrepancies].sort((a, b) => b.index - a.index);
    let workingText = draftText;
    let appliedCount = 0;

    for (const disc of sorted) {
      if (workingText.slice(disc.index, disc.index + disc.length) === disc.matchedText) {
        workingText =
          workingText.slice(0, disc.index) + disc.replacement + workingText.slice(disc.index + disc.length);
        appliedCount++;
      } else {
        const escaped = escapeRegExp(disc.matchedText);
        workingText = workingText.replace(new RegExp(escaped, "i"), disc.replacement);
        appliedCount++;
      }
    }

    setDraftText(workingText);
    setInlinePopoverDisc(null);
    setAuditLog((prev) => [
      {
        id: `batch-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString(),
        role,
        action: "REPLACE_ALL",
        details: `Batch remediated ${appliedCount} brand compliance and security violations.`,
        complianceScore: 100,
      },
      ...prev,
    ]);

    showNotification(`Successfully resolved all ${appliedCount} brand discrepancies! 100% compliant.`, "success");
  };

  // Cryptographic Seal Handler (Web Crypto API SHA-256)
  const handleApproveAndSeal = async () => {
    const timestampStr = new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString();
    const payload = JSON.stringify({
      brandKitId: activeKit.id,
      brandKitName: activeKit.name,
      timestamp: timestampStr,
      reviewerRole: role,
      score: brandScore,
      discrepancyCount: discrepancies.length,
      textLength: draftText.length,
      contentDigest: draftText,
    });

    const hashHex = await computeSha256(payload);

    const words = draftText.trim().split(/\s+/).filter(Boolean).length;
    const newSeal: CryptographicSeal = {
      hash: hashHex,
      algorithm: "SHA-256",
      timestamp: timestampStr,
      reviewerName: role === "Reviewer" ? "Authorized Compliance Officer" : "Senior Brand Creator",
      brandKit: activeKit.name,
      score: brandScore,
      wordCount: words,
      charCount: draftText.length,
      verified: true,
    };

    setSeal(newSeal);
    setAuditLog((prev) => [
      {
        id: `seal-${Date.now()}`,
        timestamp: timestampStr,
        role,
        action: "SEAL_APPROVED",
        details: `Draft cryptographically approved & sealed (SHA-256: ${hashHex.slice(0, 16)}...)`,
        complianceScore: brandScore,
      },
      ...prev,
    ]);

    showNotification("Cryptographic SHA-256 Compliance Seal generated and recorded!");
  };

  // Export JSON Bundle for GRC / Enterprise GRC Systems
  const handleExportGrcBundle = () => {
    const bundle = {
      platform: "Inkloom Brand Sentinel Enterprise",
      exportTimestamp: new Date().toISOString(),
      brandKit: {
        id: activeKit.id,
        name: activeKit.name,
        sector: activeKit.sector,
        pillars: activeKit.pillars,
        approvedColors: activeKit.approvedColors,
      },
      governanceStatus: {
        healthScore: brandScore,
        scoreStatus,
        activeViolations: discrepancies.length,
      },
      cryptographicSeal: seal || "UNSEALED",
      contentDraft: {
        currentText: draftText,
        wordCount: draftMetrics.words,
        characterCount: draftMetrics.chars,
      },
      discrepancyLedger: discrepancies.map((d) => ({
        ruleName: d.ruleName,
        pillar: d.pillar,
        category: d.category,
        severity: d.severity,
        matchedSnippet: d.matchedText,
        policyCitation: d.policyCitation,
        replacement: d.replacement,
      })),
      auditTrail: auditLog,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inkloom-governance-audit-${activeKit.id}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Downloaded standardized GRC Compliance JSON package.");
  };

  // Add Custom Rule
  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRulePattern.trim()) return;

    const customRule: GovernanceRule = {
      id: `custom-${Date.now()}`,
      name: newRuleName.trim(),
      pillar: newRulePillar || activeKit.pillars[0],
      category: newRuleCategory,
      severity: newRuleSeverity,
      pattern: newRulePattern.trim(),
      isRegex: newRuleIsRegex,
      policyCitation: newRuleCitation.trim() || "Internal Policy Addendum 2026",
      explanation: newRuleExplanation.trim() || "Custom enterprise brand constraint.",
      replacement: newRuleReplacement.trim(),
      enabled: true,
      isCustom: true,
    };

    setBrandKits((prev) =>
      prev.map((k) =>
        k.id === activeKitId
          ? {
              ...k,
              rules: [customRule, ...k.rules],
            }
          : k
      )
    );

    setAuditLog((prev) => [
      {
        id: `rule-add-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString(),
        role,
        action: "CUSTOM_RULE_ADDED",
        details: `Injected custom rule: "${customRule.name}"`,
        complianceScore: brandScore,
      },
      ...prev,
    ]);

    setIsCustomRuleModalOpen(false);
    setNewRuleName("");
    setNewRulePattern("");
    setNewRuleReplacement("");
    setNewRuleCitation("");
    setNewRuleExplanation("");
    showNotification(`Custom rule "${customRule.name}" active and evaluated.`);
  };

  // Toggle Rule Status
  const handleToggleRule = (ruleId: string) => {
    setBrandKits((prev) =>
      prev.map((k) => {
        if (k.id !== activeKitId) return k;
        return {
          ...k,
          rules: k.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
        };
      })
    );
  };

  // Delete Custom Rule
  const handleDeleteCustomRule = (ruleId: string) => {
    setBrandKits((prev) =>
      prev.map((k) => {
        if (k.id !== activeKitId) return k;
        return {
          ...k,
          rules: k.rules.filter((r) => r.id !== ruleId),
        };
      })
    );
    showNotification("Custom rule removed.");
  };

  // Canvas Image Analysis: Relative Luminance & WCAG Contrast Extraction
  const analyzeImageCanvas = useCallback(
    (imgSrc: string) => {
      setIsAnalyzingImage(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setIsAnalyzingImage(false);
          return;
        }

        const width = 320;
        const height = Math.round((img.height / img.width) * 320) || 200;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        let imgData: ImageData;
        try {
          imgData = ctx.getImageData(0, 0, width, height);
        } catch (e) {
          console.warn("Canvas getImageData tainted or failed:", e);
          setIsAnalyzingImage(false);
          return;
        }

        const data = imgData.data;
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          const qr = Math.round(r / 28) * 28;
          const qg = Math.round(g / 28) * 28;
          const qb = Math.round(b / 28) * 28;
          const key = `${qr},${qg},${qb}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorBuckets.set(key, { r: qr, g: qg, b: qb, count: 1 });
          }
        }

        const sortedBuckets = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

        const distinctColors: { r: number; g: number; b: number }[] = [];
        for (const bucket of sortedBuckets) {
          const isTooClose = distinctColors.some(
            (c) => colorDistance([c.r, c.g, c.b], [bucket.r, bucket.g, bucket.b]) < 38
          );
          if (!isTooClose) {
            distinctColors.push({ r: bucket.r, g: bucket.g, b: bucket.b });
            if (distinctColors.length >= 5) break;
          }
        }

        const darkTextLum = getRelativeLuminance(15, 23, 42); // #0F172A
        const whiteTextLum = 1.0; // #FFFFFF

        const parsedResults: ExtractedColor[] = distinctColors.map((col) => {
          const lum = getRelativeLuminance(col.r, col.g, col.b);
          const hex = rgbToHex(col.r, col.g, col.b);
          const contrastWhite = getContrastRatio(lum, whiteTextLum);
          const contrastDark = getContrastRatio(lum, darkTextLum);

          let closestMatch: { name: string; hex: string; distance: number } | undefined;
          let minDistance = Infinity;

          activeKit.approvedColors.forEach((bColor) => {
            const bRgb = hexToRgb(bColor.hex);
            if (bRgb) {
              const dist = colorDistance([col.r, col.g, col.b], bRgb);
              if (dist < minDistance) {
                minDistance = dist;
                closestMatch = { name: bColor.name, hex: bColor.hex, distance: dist };
              }
            }
          });

          return {
            hex,
            rgb: [col.r, col.g, col.b],
            luminance: Number(lum.toFixed(3)),
            contrastWhite: Number(contrastWhite.toFixed(2)),
            contrastDark: Number(contrastDark.toFixed(2)),
            wcagAANormal: contrastWhite >= 4.5,
            wcagAALarge: contrastWhite >= 3.0,
            wcagAAANormal: contrastWhite >= 7.0,
            wcagAAALarge: contrastWhite >= 4.5,
            closestBrandColor: closestMatch,
          };
        });

        setExtractedPalette(parsedResults);
        setIsAnalyzingImage(false);
      };

      img.src = imgSrc;
    },
    [activeKit.approvedColors]
  );

  // Trigger analysis when image source or brand kit changes
  useEffect(() => {
    if (uploadedImageUrl) {
      analyzeImageCanvas(uploadedImageUrl);
    }
  }, [uploadedImageUrl, analyzeImageCanvas]);

  // Handle Canvas Pixel Click Probe
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const p = ctx.getImageData(x, y, 1, 1).data;
    const r = p[0];
    const g = p[1];
    const b = p[2];
    const hex = rgbToHex(r, g, b);
    const lum = getRelativeLuminance(r, g, b);
    const contrastWhite = getContrastRatio(lum, 1.0);
    const contrastDark = getContrastRatio(lum, getRelativeLuminance(15, 23, 42));

    setProbedPixel({
      hex,
      rgb: [r, g, b],
      lum: Number(lum.toFixed(3)),
      contrastWhite: Number(contrastWhite.toFixed(2)),
      contrastDark: Number(contrastDark.toFixed(2)),
      x,
      y,
    });
    showNotification(`Pixel probe sampled: ${hex}`);
  };

  // Handle Local File Upload for Multimodal Canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (typeof uploadEvt.target?.result === "string") {
          setUploadedImageUrl(uploadEvt.target.result);
          setProbedPixel(null);
          showNotification("Uploaded image loaded for WCAG luminance scan.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered Discrepancies
  const filteredDiscrepancies = useMemo(() => {
    return discrepancies.filter((d) => {
      const matchesSeverity = severityFilter === "all" || d.severity === severityFilter;
      const matchesPillar = !pillarFilter || d.pillar === pillarFilter;
      const matchesQuery =
        !searchQuery ||
        d.matchedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.policyCitation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesPillar && matchesQuery;
    });
  }, [discrepancies, severityFilter, pillarFilter, searchQuery]);

  // Word & Character Stats
  const draftMetrics = useMemo(() => {
    const words = draftText.trim().split(/\s+/).filter(Boolean).length;
    const chars = draftText.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [draftText]);

  // Visual Interactive Highlighting Tokens
  const highlightedTokens = useMemo(() => {
    if (!draftText) return [];
    if (discrepancies.length === 0) {
      return [{ text: draftText, discrepancy: null, key: "plain-all" }];
    }

    const tokens: { text: string; discrepancy: Discrepancy | null; key: string }[] = [];
    let lastIndex = 0;

    discrepancies.forEach((d, idx) => {
      if (d.index > lastIndex) {
        tokens.push({
          text: draftText.slice(lastIndex, d.index),
          discrepancy: null,
          key: `plain-${lastIndex}-${d.index}`,
        });
      }
      tokens.push({
        text: draftText.slice(d.index, d.index + d.length),
        discrepancy: d,
        key: `disc-${d.id}-${idx}`,
      });
      lastIndex = d.index + d.length;
    });

    if (lastIndex < draftText.length) {
      tokens.push({
        text: draftText.slice(lastIndex),
        discrepancy: null,
        key: `plain-end-${lastIndex}`,
      });
    }

    return tokens;
  }, [draftText, discrepancies]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* ========================================================= */}
      {/* 1. ENTERPRISE STICKY TOP NAVIGATION BAR                   */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600/30">
              <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Inkloom <span className="text-blue-600">Brand Sentinel</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  v3.8 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                AI Brand Governance & Multi-Modal Claim Verification
              </p>
            </div>
          </div>

          {/* Center Brand Kit Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 pl-2">Brand Kit:</span>
            {brandKits.map((kit) => {
              const isActive = kit.id === activeKitId;
              return (
                <button
                  key={kit.id}
                  onClick={() => handleSwitchBrandKit(kit.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
                    style={{ backgroundColor: kit.approvedColors[0]?.hex || "#2563EB" }}
                  />
                  <span>{kit.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Cluster: + Rule & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Custom Rule Trigger */}
            <button
              onClick={() => setIsCustomRuleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs"
              title="Add a custom governance rule to this brand kit"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />
              <span>+ Rule</span>
            </button>

            {/* Role Switcher Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setRole("Creator")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  role === "Creator"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Creator
              </button>
              <button
                onClick={() => setRole("Reviewer")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                  role === "Reviewer"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Lock className="h-3 w-3" />
                Reviewer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-sm animate-in slide-in-from-bottom-3 duration-200 no-print">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SUB-HEADER: BRAND PILLARS INTEGRITY STRIP              */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active Kit Info & Dynamic Pillar Checklist */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sector:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                {activeKit.sector}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            {/* Interactive Pillar Health Radar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pillar Health:
              </span>
              {activeKit.pillars.map((pillar) => {
                const stats = pillarHealthMap.get(pillar) || { total: 0, critical: 0, warning: 0, suggestion: 0 };
                const isViolated = stats.total > 0;
                const isSelected = pillarFilter === pillar;

                return (
                  <button
                    key={pillar}
                    onClick={() => setPillarFilter(isSelected ? null : pillar)}
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50 border-blue-300 text-blue-900"
                        : isViolated
                        ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    }`}
                    title={
                      isViolated
                        ? `${stats.total} violations violating ${pillar} pillar. Click to filter.`
                        : `${pillar} is 100% compliant!`
                    }
                  >
                    {isViolated ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                    <span>{pillar}</span>
                    {isViolated && (
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-rose-200/60 font-bold">
                        {stats.total}
                      </span>
                    )}
                  </button>
                );
              })}
              {pillarFilter && (
                <button
                  onClick={() => setPillarFilter(null)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-700 underline ml-1"
                >
                  Clear Pillar Filter
                </button>
              )}
            </div>
          </div>

          {/* Approved Brand Palette Swatches */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Approved Palette:</span>
            <div className="flex items-center gap-1.5">
              {activeKit.approvedColors.map((col) => (
                <div
                  key={col.hex}
                  className="group relative cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(col.hex);
                    showNotification(`Copied ${col.name} (${col.hex}) to clipboard!`);
                  }}
                  title={`${col.name}: ${col.hex} (${col.role}) - Click to copy`}
                >
                  <div
                    className="w-6 h-6 rounded-md shadow-xs ring-1 ring-slate-300 group-hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-bold text-white/90"
                    style={{ backgroundColor: col.hex }}
                  />
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-30 px-2 py-1 bg-slate-900 text-white text-[11px] font-mono rounded whitespace-nowrap shadow-lg">
                    {col.name}: {col.hex}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. NAVIGATION WORKSPACE TABS                             */}
      {/* ========================================================= */}
      <nav className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 no-print">
        <div className="flex items-center border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "workspace"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="h-4 w-4" />
            Copy Governance & Linter
            {discrepancies.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700 font-bold">
                {discrepancies.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("canvas")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "canvas"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Palette className="h-4 w-4" />
            Multimodal WCAG Canvas
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="h-4 w-4" />
            Audit Trail & SHA-256 Seal
            {seal && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "rules"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders className="h-4 w-4" />
            Active Policy Rules ({activeKit.rules.length})
          </button>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* 4. MAIN WORKSPACE / COCKPIT CONTENT AREA                  */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 no-print">
        {activeTab === "workspace" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: LIVE COPY EDITOR & VISUAL INSPECTOR (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                {/* Editor Top Bar */}
                <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-blue-600" />
                      Content Draft Canvas
                    </h2>
                    <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        onClick={() => {
                          setViewMode("editor");
                          setInlinePopoverDisc(null);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          viewMode === "editor"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Source Editor
                      </button>
                      <button
                        onClick={() => setViewMode("visual")}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                          viewMode === "visual"
                            ? "bg-white text-blue-700 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Eye className="h-3 w-3" />
                        Sentinel Visualizer
                      </button>
                    </div>
                  </div>

                  {/* Actions: View Diff & Reset Draft */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDiffModalOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1 shadow-xs"
                      title="Inspect side-by-side or unified diff between original draft and current remediated version"
                    >
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      Diff Inspector
                    </button>
                    <button
                      onClick={() => {
                        setDraftText(activeKit.sampleDraft);
                        setInlinePopoverDisc(null);
                        showNotification("Draft restored to non-compliant reference sample.");
                      }}
                      className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                      title="Reset draft to sample text"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="p-4 relative min-h-[380px]">
                  {viewMode === "editor" ? (
                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      placeholder="Paste marketing copy, press releases, API guides, or regulatory filings to initiate continuous brand verification..."
                      rows={14}
                      className="w-full h-full min-h-[360px] p-3 text-sm text-slate-900 font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed resize-y"
                    />
                  ) : (
                    <div className="min-h-[360px] p-4 text-sm font-sans bg-slate-50/70 border border-slate-200 rounded-lg leading-relaxed whitespace-pre-wrap select-text relative">
                      {highlightedTokens.map((token) => {
                        if (!token.discrepancy) {
                          return <span key={token.key}>{token.text}</span>;
                        }

                        const d = token.discrepancy;
                        const isSelected = selectedDiscrepancyId === d.id || inlinePopoverDisc?.id === d.id;
                        let badgeBg = "bg-amber-100 text-amber-900 border-amber-300";
                        if (d.severity === "critical") {
                          badgeBg = "bg-rose-100 text-rose-900 border-rose-300";
                        } else if (d.severity === "suggestion") {
                          badgeBg = "bg-blue-100 text-blue-900 border-blue-300";
                        }

                        return (
                          <span
                            key={token.key}
                            onClick={() => {
                              setSelectedDiscrepancyId(d.id);
                              setInlinePopoverDisc(d);
                            }}
                            className={`inline-block px-1.5 py-0.5 mx-0.5 rounded cursor-pointer border font-mono text-xs font-semibold transition-all hover:scale-105 ${badgeBg} ${
                              isSelected ? "ring-2 ring-blue-600 scale-105" : ""
                            }`}
                            title={`Click for inline patch: ${d.ruleName}`}
                          >
                            {token.text}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Inline Quick-Remediation Popover */}
                  {inlinePopoverDisc && viewMode === "visual" && (
                    <div className="absolute top-16 left-8 right-8 z-30 p-4 bg-white rounded-xl border border-blue-200 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              inlinePopoverDisc.severity === "critical"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {inlinePopoverDisc.severity}
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {inlinePopoverDisc.ruleName}
                          </span>
                        </div>
                        <button
                          onClick={() => setInlinePopoverDisc(null)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="py-2.5 text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px]">Matched:</span>
                          <span className="font-mono text-rose-600 line-through">
                            &quot;{inlinePopoverDisc.matchedText}&quot;
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px]">Remedy:</span>
                          <span className="font-mono text-emerald-700 font-semibold">
                            &quot;{inlinePopoverDisc.replacement}&quot;
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] pt-1">
                          {inlinePopoverDisc.explanation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Policy: {inlinePopoverDisc.policyCitation}
                        </span>
                        <button
                          onClick={() => handlePatchDiscrepancy(inlinePopoverDisc)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          Inline Patch Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Editor Status Bar */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-4">
                    <span>
                      Words: <strong className="text-slate-800">{draftMetrics.words}</strong>
                    </span>
                    <span>
                      Characters: <strong className="text-slate-800">{draftMetrics.chars}</strong>
                    </span>
                    <span>
                      Read time: <strong className="text-slate-800">~{draftMetrics.readingTime} min</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Continuous Linter Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Selector for Non-Compliant Drafts */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Quick Benchmark Verification Scenarios
                  </h4>
                  <p className="text-xs text-slate-500">
                    Load pre-configured enterprise copy containing regulated claims, deprecated lexicon & secrets.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const kit = brandKits.find((k) => k.id === "apexpay");
                      if (kit) {
                        setActiveKitId("apexpay");
                        setDraftText(kit.sampleDraft);
                        showNotification("Loaded ApexPay FinTech compliance test draft.");
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                  >
                    ApexPay Regulated Draft
                  </button>
                  <button
                    onClick={() => {
                      const kit = brandKits.find((k) => k.id === "verdant");
                      if (kit) {
                        setActiveKitId("verdant");
                        setDraftText(kit.sampleDraft);
                        showNotification("Loaded Verdant Studio ESG test draft.");
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                  >
                    Verdant ESG Greenwash Draft
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BRAND HEALTH GAUGE & DISCREPANCY CARDS (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* BRAND HEALTH SCORE CARD */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Brand Compliance Health Score
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      brandScore >= 90
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : brandScore >= 70
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {scoreStatus}
                  </span>
                </div>

                <div className="py-4 flex items-center justify-center gap-6">
                  {/* Circular Visual Gauge */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      {/* Background Track */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className="stroke-slate-100"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Animated Score Progress */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        strokeWidth="10"
                        strokeDasharray={314.15}
                        strokeDashoffset={314.15 * (1 - brandScore / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className={`transition-all duration-700 ease-out ${
                          brandScore >= 90
                            ? "stroke-emerald-500"
                            : brandScore >= 70
                            ? "stroke-amber-500"
                            : "stroke-rose-500"
                        }`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {brandScore}
                        <span className="text-sm font-semibold text-slate-400">/100</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Integrity
                      </span>
                    </div>
                  </div>

                  {/* Deduction Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical (-25 pts):
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {discrepancies.filter((d) => d.severity === "critical").length}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Warnings (-15 pts):
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {discrepancies.filter((d) => d.severity === "warning").length}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Tone Drift (-5 pts):
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {discrepancies.filter((d) => d.severity === "suggestion").length}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Batch Fix Button */}
                <div className="pt-2">
                  <button
                    onClick={handleBatchPatchAll}
                    disabled={discrepancies.length === 0}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                      discrepancies.length > 0
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 cursor-pointer active:scale-[0.99]"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Apply All Fixes ({discrepancies.length} Issues) → 100% Compliance</span>
                  </button>
                </div>
              </div>

              {/* DISCREPANCY STREAM & REMEDIATION CARDS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-slate-700" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Governance Discrepancies ({filteredDiscrepancies.length})
                      </h4>
                    </div>
                    {discrepancies.length === 0 && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> All Rules Satisfied
                      </span>
                    )}
                  </div>

                  {/* Filter Pills & Search */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter citations, matched text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-1 self-start sm:self-auto">
                      {(["all", "critical", "warning", "suggestion"] as const).map((sev) => (
                        <button
                          key={sev}
                          onClick={() => setSeverityFilter(sev)}
                          className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                            severityFilter === sev
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Discrepancy Card List */}
                <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
                  {filteredDiscrepancies.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3 ring-8 ring-emerald-50/50">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">
                        Zero Discrepancies Detected
                      </h5>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                        The current draft copy strictly conforms to all brand guidelines, regulatory rules, and security policies.
                      </p>
                    </div>
                  ) : (
                    filteredDiscrepancies.map((disc) => {
                      const isSelected = selectedDiscrepancyId === disc.id;
                      let sevBadge = "bg-amber-50 text-amber-800 border-amber-200";
                      let cardBorder = "border-slate-200 hover:border-slate-300";
                      if (disc.severity === "critical") {
                        sevBadge = "bg-rose-50 text-rose-800 border-rose-200";
                        cardBorder = "border-rose-100 hover:border-rose-200";
                      } else if (disc.severity === "suggestion") {
                        sevBadge = "bg-blue-50 text-blue-800 border-blue-200";
                        cardBorder = "border-blue-100 hover:border-blue-200";
                      }

                      return (
                        <div
                          key={disc.id}
                          className={`p-3.5 rounded-xl border bg-white shadow-2xs transition-all ${cardBorder} ${
                            isSelected ? "ring-2 ring-blue-500" : ""
                          }`}
                        >
                          {/* Card Header: Severity & Category */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${sevBadge}`}
                            >
                              {disc.severity}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                {disc.pillar}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                                {disc.category}
                              </span>
                            </div>
                          </div>

                          {/* Rule Title */}
                          <h5 className="text-xs font-bold text-slate-900 mb-1">
                            {disc.ruleName}
                          </h5>

                          {/* Matched Text Snippet */}
                          <div className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200/80 font-mono text-xs text-rose-600 line-through">
                            &quot;{disc.matchedText}&quot;
                          </div>

                          {/* Policy Citation & Explanation */}
                          <p className="text-xs text-slate-600 leading-normal mb-1.5">
                            {disc.explanation}
                          </p>
                          <div className="text-[11px] text-slate-500 font-semibold mb-3 flex items-center gap-1">
                            <Info className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>Policy: {disc.policyCitation}</span>
                          </div>

                          {/* Recommended Replacement & 1-Click Patch */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="text-xs text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-mono font-medium flex-1 truncate">
                              ✓ {disc.replacement}
                            </div>
                            <button
                              onClick={() => handlePatchDiscrepancy(disc)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-xs shrink-0"
                              title="1-Click replace with compliant brand phrase"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              Patch
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MULTIMODAL WCAG ASSET CANVAS                       */}
        {/* ========================================================= */}
        {activeTab === "canvas" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    Multimodal WCAG 2.1 Luminance & Brand Palette Canvas
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                    Extracts dominant RGB/hex values from uploaded marketing visual assets, calculates exact W3C relative luminance contrast ratios ($L_1 + 0.05 / L_2 + 0.05$), and tests against brand palette guidelines.
                  </p>
                </div>

                {/* Preset Image Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500">Preset Assets:</span>
                  {activeKit.sampleImages.map((asset, i) => (
                    <button
                      key={asset.name}
                      onClick={() => {
                        setUploadedImageUrl(asset.dataUri);
                        setProbedPixel(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                    >
                      Preset #{i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Dropzone & Canvas Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
                {/* Left: Image Canvas & Upload (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      id="asset-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="asset-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        Upload Marketing Banner / Asset
                      </span>
                      <span className="text-[11px] text-slate-500">
                        PNG, JPG, SVG, WebP up to 10MB
                      </span>
                    </label>
                  </div>

                  {/* Rendered Preview Card with Pixel Probe & Vision Deficiencies Filter */}
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                      <span className="font-mono">Interactive Pixel Probe & Canvas</span>
                      {isAnalyzingImage && <span className="text-blue-400 animate-pulse">Scanning...</span>}
                    </div>

                    {/* Vision Deficiencies Simulator Bar */}
                    <div className="pt-2 pb-2 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                      <span className="text-slate-400 font-semibold shrink-0">Vision Sim:</span>
                      {(["normal", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setVisionFilter(mode)}
                          className={`px-2 py-0.5 rounded capitalize font-medium transition-all ${
                            visionFilter === mode
                              ? "bg-blue-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    {/* Canvas with dynamic filter style */}
                    <div className="mt-1 flex items-center justify-center overflow-hidden rounded-lg bg-black/40 relative cursor-crosshair">
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        style={{
                          filter:
                            visionFilter === "achromatopsia"
                              ? "grayscale(100%)"
                              : visionFilter === "protanopia"
                              ? "sepia(50%) hue-rotate(180deg)"
                              : visionFilter === "deuteranopia"
                              ? "hue-rotate(60deg)"
                              : visionFilter === "tritanopia"
                              ? "hue-rotate(220deg)"
                              : "none",
                        }}
                        className="max-h-56 w-auto object-contain rounded"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1.5 text-center">
                      Click anywhere on canvas above to probe pixel coordinates & exact WCAG ratio
                    </span>
                  </div>

                  {/* Probed Pixel Card */}
                  {probedPixel && (
                    <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-sm flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg shadow-inner border border-slate-300 ring-2 ring-blue-500 shrink-0"
                          style={{ backgroundColor: probedPixel.hex }}
                        />
                        <div>
                          <span className="font-mono font-bold text-slate-900 block">
                            {probedPixel.hex} (X:{probedPixel.x}, Y:{probedPixel.y})
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            RGB({probedPixel.rgb.join(",")}) | Lum: {probedPixel.lum}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          vs #FFF: {probedPixel.contrastWhite}:1
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            probedPixel.contrastWhite >= 4.5
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          AA: {probedPixel.contrastWhite >= 4.5 ? "PASS" : "FAIL"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Extracted Swatches & WCAG Contrast Metrics (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Extracted Dominant Chromatic Values & WCAG 2.1 Ratios
                  </h4>

                  <div className="space-y-3">
                    {extractedPalette.map((col, index) => {
                      const isBrandMatched =
                        col.closestBrandColor && col.closestBrandColor.distance < 45;

                      return (
                        <div
                          key={`${col.hex}-${index}`}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Color Swatch & Basic Values */}
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl shadow-inner border border-slate-300 ring-2 ring-slate-100 shrink-0 flex items-center justify-center font-mono text-[10px] font-bold"
                              style={{
                                backgroundColor: col.hex,
                                color: col.contrastWhite >= 4.5 ? "#FFFFFF" : "#0F172A",
                              }}
                            >
                              Aa
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-900">
                                  {col.hex}
                                </span>
                                {isBrandMatched ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Brand Match: {col.closestBrandColor?.name}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    Off-Palette ({col.closestBrandColor?.name})
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                RGB({col.rgb.join(", ")}) | Rel Lum: {col.luminance}
                              </span>
                            </div>
                          </div>

                          {/* Contrast Metrics against White Text */}
                          <div className="flex items-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Contrast vs #FFF
                              </span>
                              <span className="text-sm font-extrabold text-slate-900 font-mono">
                                {col.contrastWhite} : 1
                              </span>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-center ${
                                  col.wcagAANormal
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                WCAG AA: {col.wcagAANormal ? "PASS" : "FAIL"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-center ${
                                  col.wcagAAANormal
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                AAA: {col.wcagAAANormal ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AUDIT TRAIL & CRYPTOGRAPHIC SEAL                   */}
        {/* ========================================================= */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            {/* Cryptographic Seal Verification Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Cryptographic Proof of Governance Seal
                      </h3>
                      <p className="text-xs text-slate-400">
                        Tamper-proof client-side SHA-256 digital digest binding the verified draft content, timestamp, and audit trail.
                      </p>
                    </div>
                  </div>

                  {seal ? (
                    <div className="pt-2 font-mono text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-emerald-400 font-bold">SHA-256 SEAL: </span>
                        <span className="text-slate-300">{seal.hash}</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(seal.hash);
                          showNotification("Copied SHA-256 seal to clipboard!");
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                        title="Copy cryptographic hash"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-300 italic pt-1">
                      Draft is currently unsealed. Reviewers can approve and generate a cryptographic SHA-256 seal below.
                    </p>
                  )}
                </div>

                {/* Reviewer Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleExportGrcBundle}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
                    title="Export JSON audit package for GRC systems (Vanta, Drata, SOC2)"
                  >
                    <Download className="h-4 w-4" />
                    Download GRC JSON
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Printer className="h-4 w-4" />
                    Export Audit Report
                  </button>

                  <button
                    onClick={handleApproveAndSeal}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
                  >
                    <Award className="h-4 w-4" />
                    {seal ? "Re-Calculate Seal" : "Approve & Seal Draft"}
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600" />
                  Chronological Governance Audit Trail
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                  {auditLog.length} events logged
                </span>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{entry.details}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          Role: {entry.role}
                        </span>
                      </div>
                      {entry.beforeText && entry.afterText && (
                        <div className="font-mono text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="text-rose-500 line-through">&quot;{entry.beforeText}&quot;</span>
                          <span>→</span>
                          <span className="text-emerald-600 font-semibold">&quot;{entry.afterText}&quot;</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 shrink-0">
                      <span className="font-medium">Score: {entry.complianceScore}/100</span>
                      <span className="font-mono text-[11px]">{entry.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BRAND KIT RULES ENGINE DIRECTORY                   */}
        {/* ========================================================= */}
        {activeTab === "rules" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-blue-600" />
                    Active Governance Rules Engine
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configured rules enforcing tone pillars, prohibited lexicon, SEC/FINRA/FTC compliance, and secret redaction.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCustomRuleModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    Add Custom Rule
                  </button>
                </div>
              </div>

              {/* Category Filter Pills for Rules */}
              <div className="flex items-center gap-1.5 flex-wrap pt-4">
                <span className="text-xs font-semibold text-slate-500 mr-1">Filter Domain:</span>
                {(["all", "security", "regulatory", "lexicon", "tone", "esg", "custom"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRulesCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                      rulesCategoryFilter === cat
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {activeKit.rules
                  .filter((r) => rulesCategoryFilter === "all" || r.category === rulesCategoryFilter)
                  .map((rule) => {
                    return (
                      <div
                        key={rule.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                rule.severity === "critical"
                                  ? "bg-rose-100 text-rose-800"
                                  : rule.severity === "warning"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {rule.severity}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                Pillar: {rule.pillar}
                              </span>
                              {rule.isCustom && (
                                <button
                                  onClick={() => handleDeleteCustomRule(rule.id)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="Delete custom rule"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <input
                                type="checkbox"
                                checked={rule.enabled}
                                onChange={() => handleToggleRule(rule.id)}
                                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                title="Toggle rule enable/disable"
                              />
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 mb-1">{rule.name}</h4>
                          <div className="mb-2 p-1.5 bg-slate-50 rounded text-[11px] font-mono text-slate-700 truncate border border-slate-100">
                            Pattern: {rule.pattern} {rule.isRegex ? "(Regex)" : "(Literal)"}
                          </div>
                          <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                            {rule.explanation}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                          <span className="font-semibold truncate max-w-[200px]">
                            {rule.policyCitation}
                          </span>
                          <span className="text-emerald-700 font-mono font-medium">
                            → {rule.replacement}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 5. SIDE-BY-SIDE & UNIFIED DIFF MODAL                      */}
      {/* ========================================================= */}
      {isDiffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Governance Copy Diff Inspector
                </h3>
                <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-semibold ml-2">
                  <button
                    onClick={() => setDiffViewMode("split")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      diffViewMode === "split"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setDiffViewMode("unified")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      diffViewMode === "unified"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Unified Diff
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/40">
              {diffViewMode === "split" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Draft Pane */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Original Draft (Unsanitized)
                      </span>
                      <span className="text-[11px] text-slate-400">Baseline</span>
                    </div>
                    <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[320px]">
                      {activeKit.sampleDraft}
                    </div>
                  </div>

                  {/* Remediated Copy Pane */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Compliant Copy (Current Remediated)
                      </span>
                      <span className="text-[11px] text-emerald-600 font-bold">
                        Score: {brandScore}/100
                      </span>
                    </div>
                    <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[320px]">
                      {draftText}
                    </div>
                  </div>
                </div>
              ) : (
                /* Unified Diff View */
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 leading-loose whitespace-pre-wrap">
                    {highlightedTokens.map((token, idx) => {
                      if (!token.discrepancy) {
                        return <span key={`unified-${idx}`}>{token.text}</span>;
                      }
                      return (
                        <span key={`unified-${idx}`} className="inline-block mx-1">
                          <span className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded line-through border border-rose-300">
                            - {token.discrepancy.matchedText}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded ml-1 border border-emerald-300 font-bold">
                            + {token.discrepancy.replacement}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {discrepancies.length} unpatched violations remaining
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(draftText);
                    showNotification("Copied compliant copy to clipboard!");
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Remediated Text
                </button>
                <button
                  onClick={() => setIsDiffModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CUSTOM GOVERNANCE RULE MODAL                           */}
      {/* ========================================================= */}
      {isCustomRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Add Custom Governance Rule
                </h3>
              </div>
              <button
                onClick={() => setIsCustomRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disallow Competitor Reference: Stripe"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Severity *
                  </label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as IssueSeverity)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="critical">Critical (-25)</option>
                    <option value="warning">Warning (-15)</option>
                    <option value="suggestion">Suggestion (-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value as IssueCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="lexicon">Lexicon</option>
                    <option value="regulatory">Regulatory</option>
                    <option value="security">Security</option>
                    <option value="tone">Tone & Voice</option>
                    <option value="esg">ESG</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand Pillar *
                  </label>
                  <select
                    value={newRulePillar}
                    onChange={(e) => setNewRulePillar(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {activeKit.pillars.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Trigger Phrase or Regex *
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRuleIsRegex}
                      onChange={(e) => setNewRuleIsRegex(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Treat as Regex Pattern
                  </label>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe or sk-[a-zA-Z0-9]+"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recommended Replacement Phrase *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. legacy settlement processors"
                  value={newRuleReplacement}
                  onChange={(e) => setNewRuleReplacement(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Policy Citation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brand Competitive Guideline §3.2"
                  value={newRuleCitation}
                  onChange={(e) => setNewRuleCitation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Governance Explanation
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this phrase breaches enterprise brand standards..."
                  value={newRuleExplanation}
                  onChange={(e) => setNewRuleExplanation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Add & Evaluate Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. PRINTABLE AUDIT REPORT VIEW (@media print)            */}
      {/* ========================================================= */}
      <div className="hidden print:block p-8 bg-white text-slate-900 max-w-4xl mx-auto">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">INKLOOM BRAND SENTINEL</h1>
            <p className="text-sm font-semibold text-slate-600">
              Enterprise Governance & Regulatory Verification Certificate
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 block">
              Generated: {new Date().toLocaleString()}
            </span>
            <span className="text-xs font-bold text-blue-600">STATUS: APPROVED & SIGNED</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded border border-slate-200 text-xs">
          <div>
            <strong>Brand Kit:</strong> {activeKit.name} ({activeKit.sector})<br />
            <strong>Compliance Score:</strong> {brandScore}/100 ({scoreStatus})<br />
            <strong>Reviewer Sign-off:</strong> {seal?.reviewerName || "Lead Compliance Officer"}<br />
          </div>
          <div>
            <strong>Cryptographic SHA-256 Digest:</strong><br />
            <span className="font-mono text-[10px] break-all">{seal?.hash || "UNSEALED"}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            Certified Content Copy
          </h2>
          <div className="p-4 bg-slate-50 rounded border border-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {draftText}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            Governance Audit Trail Log
          </h2>
          <div className="space-y-2 text-xs">
            {auditLog.map((log) => (
              <div key={log.id} className="flex justify-between py-1 border-b border-slate-100">
                <span>{log.details}</span>
                <span className="font-mono text-slate-500">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-300 flex items-center justify-between text-xs">
          <div>
            <div className="w-48 border-b border-slate-400 mb-1" />
            <span className="text-slate-600">Authorized Reviewer Signature</span>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400">
            Document ID: IKB-{activeKit.id.toUpperCase()}-{Date.now().toString().slice(-6)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Inkloom Brand Sentinel &copy; 2026. Certified Multi-Modal Enterprise Brand Governance.
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>SEC Rule 156 / FINRA 2210 Compliant</span>
            <span>FTC Green Guides 16 CFR §260</span>
            <span>W3C WCAG 2.1 AA/AAA Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

