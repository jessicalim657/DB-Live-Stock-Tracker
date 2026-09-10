import React, { useState, useEffect, useMemo, useCallback } from "react";
import { doc, onSnapshot, setDoc, updateDoc, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase.js";
import {
  LayoutDashboard,
  Building2,
  ClipboardEdit,
  TrendingUp,
  BookOpen,
  Search,
  RotateCcw,
  Loader2,
  CircleCheck,
  Info,
  Flag,
  Undo2,
  AlertTriangle,
  Package,
  Target,
  PlusCircle,
  ShoppingCart,
  MessageSquare,
  X,
  Trash2,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ============================================================================
   SEED DATA -- your real June purchase log, cleaned to your renamed/trimmed
   67-item catalogue. "par" is left over from an earlier quantity-based
   version and isn't used by this beta -- harmless to ignore.
============================================================================ */
const SEED_ITEMS = [
  {"code": "", "name": "Xylocaine", "brand": "", "category": "Local Anaesthetic", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Q-tips", "brand": "", "category": "Local Anaesthetic", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Short needles", "brand": "", "category": "Local Anaesthetic", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Long needles", "brand": "", "category": "Local Anaesthetic", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Gold LA", "brand": "", "category": "Local Anaesthetic", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Blue LA", "brand": "", "category": "Local Anaesthetic", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Green LA", "brand": "", "category": "Local Anaesthetic", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Extra Small Latex Gloves", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Small Latex Gloves", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Medium Latex Gloves", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Extra Small Nitrile Gloves", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Small Nitrile Gloves", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Medium Nitrile Gloves", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Masks", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Hand Sanitiser", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Yellow Try In", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "White Try In", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "White Opaque Try In", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Clear Try In", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bleach Try In", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Yellow Cement", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "White Cement", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "White Opaque Cement", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Clear Cement", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bleach Cement", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Yellow Dual-Cure", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "White Dual Cure", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "White Opaque Dual Cure", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Clear Dual Cure", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bleach Dual Cure", "brand": "", "category": "Try-In and Cements", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "B1 Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A1 Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A2 Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A3 Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "AO1 Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "AO2 Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "BW Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "XBW Flow", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Asteria BL composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Luna XB composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Luna 2XB composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bleach White composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A1 Enamel composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A2 Enamel composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A1 Dentine composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A2 Dentine composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "B1 composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Retraction Cord Size 1", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Retraction Cord Size 0", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Retraction Cord Size 00", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Retraction Cord Size 000", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Hemodent", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Sectional 5.5", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Sectional 6.5", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Sectional 7.5", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Teflon Tape (pink)", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Teflon Tape (white)", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Molar tofflemire band", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Premolar tofflemire band", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Articulating paper (blue)", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Articulating paper (red)", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A1 Protemp material", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "A2 Protemp material", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "BL Protemp material", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Lightbody capsule", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Heavybody capsule", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cotton rolls", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Gauze (small)", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Gauze (large)", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Optragate (small)", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Optragate (medium)", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cheekguard (small)", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cheekguard (large)", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Etch", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Porcelain Etch", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bond", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Microprime", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Monobond", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Ivoclean", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Viscostat", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Duraphat", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "AH plus", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cavit", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Pulpdent", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Endo Syringe", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "K-files", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "H-files", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Rotary files .04 taper", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Rotary files .06 taper", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "EDTA", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Hypochlorite", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Rubber dam", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Paper points", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "GP Points", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Etch tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Flow tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Viscostat tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Gemini tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Tissues", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Paper towels", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cups", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Alcohol Swabs", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Vitamin E Q-tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Floss", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bibs", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Suction tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Dark blue microbrush", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Light blue microbrush", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Dark green microbrush", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Light green microbrush", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Dappen dish", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Vaseline", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Neutral Detergent Wipes", "brand": "", "category": "Infection Control", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Black Discs (large)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Dark Red Discs (large)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Light Red Discs (large)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Orange Discs (large)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Yellow Discs (large)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Black Discs (small)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Dark Red Discs (small)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Light Red Discs (small)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Orange Discs (small)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Yellow Discs (small)", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Ice packs", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Monoject Syringes", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Surgery suction tips", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "3D printer resin", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cerec scanner tips", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "iTero tips", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Retainer material (1mm x 76mm)", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Retainer material (1mm x 125mm)", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Retainer cases", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Chewies", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5, "tracked": true, "lowThreshold": 5},
  {"code": "", "name": "Ortho buttons (metal)", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Ortho buttons (clear)", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "E-max LT B1", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "E-max LT A1", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "E-max LT A2", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "E-max HT B1", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "E-max HT A1", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "E-max HT A2", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Zirconia mono BL2", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Zirconia medi A1", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Zirconia mono B2", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cerasmart BL 12", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cerasmart BL 14", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cerasmart A1 HT 14", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cerasmart A1 HT 12", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cerasmart A2 HT 12", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cerasmart A2 HT 14", "brand": "", "category": "Cerec Blocks (Lab)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "XLE comp", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Gingival Barrier", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Mixing pads", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Theracal", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Alveogyl", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Subgingival molar band", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Dolphin elastics", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Fox elastics", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Penguin elastics", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Kangaroo elastics", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bear elastics", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "AH plus tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bulk EZ tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Prophy cup", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Prophy polishing brush", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Heavy body tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bite reg tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Light body tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Protemp tips", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Small wedges", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Medium wedges", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Large wedges", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Wooden wedges", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Glycerin", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Fuji 2 A3", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Fuji 4", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Fuji Plus", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Fuji 7", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Endo irrigation tip", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "12 Scalpel", "brand": "", "category": "Sharps", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "15 Scalpel", "brand": "", "category": "Sharps", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bonding resin", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Clip Flo", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Medium composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Light composite", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Clear strips", "brand": "", "category": "Isolation", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Pontic paint", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Ortho wax", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Triple tray (quadrant)", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Triple tray (full arch)", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Sutures (4.0 glycon)", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Saline bags", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Saline bottle", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Endovit (cold spray)", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Aluminium oxide powder", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Handicare hand and body cleanser", "brand": "", "category": "PPE", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Microshield moisturising lotion", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "X-ray barrier sleeves", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Ziplock bags", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Monet putty base (green)", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Monet putty base (white)", "brand": "", "category": "Lab", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "S-strip", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Diamond strip", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Cheese grater strip", "brand": "", "category": "Polishing", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Red IPR strip", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Yellow IPR strip", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Blue IPR strip", "brand": "", "category": "Orthodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Prophy paste", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Small microbrushes", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5}
];

/* 17 treatment rooms plus the two shared stock locations. Edit freely. */
const ROOMS = [
  ...Array.from({ length: 18 }, (_, i) => `Room ${i + 1}`),
  "Sterilisation",
  "Lab",
];

const WHITENING_PRODUCTS = ["Pola Rapid Whitening", "Zoom Whitening"];
const ORDER_TYPES = ["Take-Home Gels", "In Chair"];

// The room-audit checklist is grouped into named sections rather than one
// flat list. IDs are derived the same way seedItems() derives them (via
// slugify), so these line up with the real catalogue items without needing
// to know their generated IDs ahead of time. Some names below intentionally
// match existing catalogue items exactly -- those are reused, not
// duplicated, so ticking/crossing them here affects the same real item.
// The room-audit checklist is entirely self-contained -- these are simple
// named presence checks ("is this actually sitting in the room"), not tied
// to the stock catalogue or the flagging system in any way. Crossing an
// item here only ever changes this room's own audit record; it never
// creates a stock flag or touches inventory data.
const mkChecklistItem = (name) => ({ id: slugify(name), name });
const DEFAULT_AUDIT_CHECKLIST = {
  "Room Items": [
    "SD card reader", "Microetcher", "Headphones", "Web cam", "Bib chain",
    "Curing lights x2", "Retractors", "Occlusal mirror", "Contrasters - black",
    "Shade tabs", "DB mirror", "Light shield", "1x Dark glasses", "1x DA glasses",
    "Composite gun", "Light/heavy body gun",
    "Discovery sheets", "TCA + bicarb", "Pens", "DB pricing packs",
  ].map(mkChecklistItem),
};

const ITEMS_KEY = "dental-inv-items-v2";
const FLAGS_KEY = "dental-inv-active-flags-v1";
const HISTORY_KEY = "dental-inv-flag-history-v1";
const MY_ROOM_KEY = "dental-inv-my-room-v1"; // personal (per device), not shared

const AUD = (n) =>
  (n ?? 0).toLocaleString("en-AU", { style: "currency", currency: "AUD" });

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Turns any string into a URL/ID-safe slug: lowercase, letters/numbers only,
// words joined with hyphens. Used to build stable item IDs from names.
function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function seedItems() {
  const usedIds = new Set();
  return SEED_ITEMS.map((it) => {
    // ID is based on the item's code (if it has one) or its name, not its
    // position in the list. That way, reordering, inserting, or removing
    // items elsewhere in the catalogue can't cause an existing flag to
    // silently reattach to the wrong item after a "Reload catalogue."
    // Renaming an item still changes its ID (there's no way around that
    // without a separate stable key), so a rename will still detach any
    // flags already logged against the old name.
    const base = slugify(it.code) !== "item" ? slugify(it.code) : slugify(it.name);
    let id = `itm_${base}`;
    let n = 2;
    while (usedIds.has(id)) {
      id = `itm_${base}-${n}`;
      n++;
    }
    usedIds.add(id);
    return {
      id,
      code: it.code,
      name: it.name,
      brand: it.brand,
      category: it.category,
      supplier: it.supplier,
      unitCost: it.unitCost,
      // -- central stock tracking (opt-in, per item) --
      // Most items default to untracked. A handful can ship pre-tracked by
      // setting "tracked": true and "lowThreshold": N directly on the entry
      // in SEED_ITEMS -- currentCount stays null until someone does a real
      // count, so a pre-tracked item never shows as falsely low on day one.
      tracked: it.tracked || false,
      lowThreshold: it.tracked ? it.lowThreshold : null,
      currentCount: null,
      lastCountedAt: null,
      lastCountedBy: "",
    };
  });
}

/* Fills in tracking fields on items saved before this feature existed,
   without touching anything the person already set (name, cost, etc). */
function withTrackingDefaults(item) {
  return {
    tracked: false,
    lowThreshold: null,
    currentCount: null,
    lastCountedAt: null,
    lastCountedBy: "",
    ...item,
  };
}

const flagKey = (itemId, room) => `${itemId}::${room}`;

/* ============================================================================
   FREQUENCY HELPERS
   ----------------------------------------------------------------------------
   No quantities in this beta, so "fastest depleting" becomes "flagged low
   most often." For each item: how many times it's been flagged in the last
   30 days, and on average how many days pass between flags. Both are
   computed straight from timestamps in flagHistory -- transparent, and easy
   to sanity-check by eye against the activity list.
============================================================================ */
function flagEventsFor(itemId, history) {
  return history
    .filter((h) => h.itemId === itemId && h.action === "flagged")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function flagCountLast30Days(itemId, history) {
  const cutoff = Date.now() - 30 * 86400000;
  return history.filter(
    (h) => h.itemId === itemId && h.action === "flagged" && new Date(h.date).getTime() >= cutoff
  ).length;
}

function avgDaysBetweenFlags(itemId, history) {
  const events = flagEventsFor(itemId, history);
  if (events.length < 2) return null;
  const spanDays =
    (new Date(events[events.length - 1].date) - new Date(events[0].date)) / 86400000;
  return spanDays / (events.length - 1);
}

/* ============================================================================
   MAIN APP
============================================================================ */
export default function DentalInventoryApp() {
  const [items, setItems] = useState(null);
  const [activeFlags, setActiveFlags] = useState(null); // [{itemId, room, flaggedAt, staff, note}]
  const [history, setHistory] = useState(null); // append-only [{id, itemId, room, action, staff, date}]
  const [orderRequests, setOrderRequests] = useState(null); // [{id, room, dentistName, product, type, dayQty, nightQty, status, date, ...}]
  const [feedback, setFeedback] = useState(null); // [{id, message, name, role, date, status}]
  const [auditChecklist, setAuditChecklist] = useState(null); // [itemId, ...] -- shared base list, same for every treatment room
  const [roomCustomAuditItems, setRoomCustomAuditItems] = useState(null); // { [room]: [{id, text, status, updatedAt, updatedBy}] }
  const [roomAuditStatus, setRoomAuditStatus] = useState(null); // { [room]: { [checklistItemId]: {status, updatedAt, updatedBy} } }
  const [auditRoom, setAuditRoom] = useState(null); // which room's audit page is open right now
  const [myRoom, setMyRoomState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [view, setView] = useState("dashboard");

  // ---- load from Firestore, and stay live-synced ------------------------
  // onSnapshot means every phone gets pushed the update the instant any
  // other phone changes something -- no refresh button needed.
  useEffect(() => {
    const itemsRef = doc(db, "dentalBoutique", "items");
    const flagsRef = doc(db, "dentalBoutique", "activeFlags");
    const auditChecklistRef = doc(db, "dentalBoutique", "auditChecklist");
    const roomCustomAuditItemsRef = doc(db, "dentalBoutique", "roomCustomAuditItems");
    const roomAuditStatusRef = doc(db, "dentalBoutique", "roomAuditStatus");
    // History and order requests are each stored as ONE FIRESTORE DOCUMENT
    // PER EVENT, inside their own collections -- not as one big array
    // inside a single document. A single document has a hard 1MB size
    // ceiling; a collection can hold an unlimited number of documents.
    // Since both of these are meant to be kept forever and grow without
    // bound, this is the structure that scales indefinitely. "items" and
    // "activeFlags" stay as single documents above, since they're
    // naturally bounded -- a fixed catalogue, and only currently-open
    // flags (resolved ones are removed, not accumulated).
    //
    // The history query is capped to the most recent 2000 events for
    // performance -- every event ever written stays in the database
    // forever regardless, this cap only limits what the live app loads
    // into memory for its 30-day trend calculations. Order requests
    // aren't capped, since "show every currently open request" needs to
    // never silently drop an old one, and order volume is low enough
    // that this won't be a performance concern for a very long time.
    const historyQuery = query(collection(db, "flagHistoryEvents"), orderBy("date", "desc"), limit(2000));
    const ordersQuery = query(collection(db, "orderRequests"), orderBy("date", "desc"));
    const feedbackQuery = query(collection(db, "feedback"), orderBy("date", "desc"));

    let itemsLoaded = false;
    let flagsLoaded = false;
    let historyLoaded = false;
    let ordersLoaded = false;
    let feedbackLoaded = false;
    let auditChecklistLoaded = false;
    let roomCustomAuditItemsLoaded = false;
    let roomAuditStatusLoaded = false;
    const maybeStopLoading = () => {
      if (
        itemsLoaded &&
        flagsLoaded &&
        historyLoaded &&
        ordersLoaded &&
        feedbackLoaded &&
        auditChecklistLoaded &&
        roomCustomAuditItemsLoaded &&
        roomAuditStatusLoaded
      )
        setLoading(false);
    };

    const unsubItems = onSnapshot(
      itemsRef,
      async (snap) => {
        if (snap.exists()) {
          setItems(snap.data().list.map(withTrackingDefaults));
        } else {
          const fresh = seedItems();
          setItems(fresh);
          try {
            await setDoc(itemsRef, { list: fresh });
          } catch (e) {
            setSaveError("Couldn't reach the database -- check firebase.js is filled in.");
          }
        }
        itemsLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubFlags = onSnapshot(
      flagsRef,
      (snap) => {
        setActiveFlags(snap.exists() ? snap.data().list : []);
        flagsLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubHistory = onSnapshot(
      historyQuery,
      (snap) => {
        // Query returns newest-first; reversed so the array is oldest-first,
        // matching what it looked like under the old single-document model.
        setHistory(snap.docs.map((d) => d.data()).reverse());
        historyLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        setOrderRequests(snap.docs.map((d) => d.data()).reverse());
        ordersLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubFeedback = onSnapshot(
      feedbackQuery,
      (snap) => {
        setFeedback(snap.docs.map((d) => d.data()).reverse());
        feedbackLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubAuditChecklist = onSnapshot(
      auditChecklistRef,
      async (snap) => {
        // This structure changed shape twice while being built out. Rather
        // than write a migration for each prior shape, just detect whether
        // what's stored matches the CURRENT self-contained shape (sections
        // of {id, name} objects) and reseed with the default if not --
        // nothing real was ever recorded against the older shapes.
        const raw = snap.exists() ? snap.data().list : null;
        const isCurrentShape =
          raw &&
          !Array.isArray(raw) &&
          "Room Items" in raw &&
          Object.values(raw).every(
            (arr) => Array.isArray(arr) && arr.every((item) => item && typeof item === "object" && "name" in item)
          );
        if (isCurrentShape) {
          setAuditChecklist(raw);
        } else {
          setAuditChecklist(DEFAULT_AUDIT_CHECKLIST);
          try {
            await setDoc(auditChecklistRef, { list: DEFAULT_AUDIT_CHECKLIST });
          } catch (e) {
            setSaveError("Couldn't reach the database -- check firebase.js is filled in.");
          }
        }
        auditChecklistLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubRoomAuditStatus = onSnapshot(
      roomAuditStatusRef,
      async (snap) => {
        if (snap.exists()) {
          setRoomAuditStatus(snap.data().byRoom || {});
        } else {
          setRoomAuditStatus({});
          try {
            await setDoc(roomAuditStatusRef, { byRoom: {} });
          } catch (e) {
            setSaveError("Couldn't reach the database -- check firebase.js is filled in.");
          }
        }
        roomAuditStatusLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubRoomCustomAuditItems = onSnapshot(
      roomCustomAuditItemsRef,
      async (snap) => {
        if (snap.exists()) {
          setRoomCustomAuditItems(snap.data().byRoom || {});
        } else {
          setRoomCustomAuditItems({});
          try {
            await setDoc(roomCustomAuditItemsRef, { byRoom: {} });
          } catch (e) {
            setSaveError("Couldn't reach the database -- check firebase.js is filled in.");
          }
        }
        roomCustomAuditItemsLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    // "My room" is genuinely local to this one phone, so plain browser
    // storage is the right tool -- no need to involve the shared database.
    try {
      setMyRoomState(localStorage.getItem(MY_ROOM_KEY));
    } catch (e) {}

    return () => {
      unsubItems();
      unsubFlags();
      unsubHistory();
      unsubOrders();
      unsubFeedback();
      unsubAuditChecklist();
      unsubRoomCustomAuditItems();
      unsubRoomAuditStatus();
    };
  }, []);

  const persistFlags = useCallback(async (next) => {
    setActiveFlags(next);
    try {
      await setDoc(doc(db, "dentalBoutique", "activeFlags"), { list: next });
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  // Adds ONE history event as its own new document inside the
  // flagHistoryEvents collection, instead of rewriting one big shared
  // array every time. This is what lets history grow forever without ever
  // hitting Firestore's 1MB-per-document ceiling. No local setHistory call
  // needed here -- the onSnapshot listener above picks up the new document
  // and updates state automatically, usually within a fraction of a second.
  const addHistoryEvent = useCallback(async (entry) => {
    try {
      await setDoc(doc(collection(db, "flagHistoryEvents"), entry.id), entry);
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  // Same idea for order requests: one document per request, not one
  // document holding every request ever made.
  const addOrderRequest = useCallback(async (entry) => {
    try {
      await setDoc(doc(collection(db, "orderRequests"), entry.id), entry);
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  // Fulfilling a request only needs to change that ONE request's own
  // document -- no need to touch any other request's data at all.
  const updateOrderRequestDoc = useCallback(async (id, patch) => {
    try {
      await updateDoc(doc(db, "orderRequests", id), patch);
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  const submitOrderRequest = useCallback(
    ({ room, dentistName, product, type, dayQty, nightQty }) => {
      const entry = {
        id: `ord_${Date.now()}_${Math.round(Math.random() * 9999)}`,
        room,
        dentistName,
        product,
        type,
        dayQty: Math.max(0, dayQty || 0),
        nightQty: Math.max(0, nightQty || 0),
        status: "open",
        date: new Date().toISOString(),
      };
      addOrderRequest(entry);
    },
    [addOrderRequest]
  );

  const fulfillOrderRequest = useCallback(
    (id) => {
      const now = new Date().toISOString();
      updateOrderRequestDoc(id, { status: "fulfilled", fulfilledAt: now });
    },
    [updateOrderRequestDoc]
  );

  // One document per piece of feedback, same collection-of-documents
  // pattern as history and orders -- feedback is exactly the kind of
  // thing that only ever accumulates, never shrinks.
  const submitFeedback = useCallback(async ({ message, name, role }) => {
    const entry = {
      id: `fb_${Date.now()}_${Math.round(Math.random() * 9999)}`,
      message,
      name: name || "",
      role: role || "",
      status: "new",
      date: new Date().toISOString(),
    };
    try {
      await setDoc(doc(collection(db, "feedback"), entry.id), entry);
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  const markFeedbackReviewed = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, "feedback", id), { status: "reviewed", reviewedAt: new Date().toISOString() });
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  // ---- room auditing: base checklist (shared, real catalogue items) ------
  const persistAuditChecklist = useCallback(async (next) => {
    setAuditChecklist(next);
    try {
      await setDoc(doc(db, "dentalBoutique", "auditChecklist"), { list: next });
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  const addChecklistItem = useCallback(
    (section, name) => {
      const current = auditChecklist[section] || [];
      let id = slugify(name);
      let n = 2;
      const existingIds = new Set(current.map((i) => i.id));
      while (existingIds.has(id)) {
        id = `${slugify(name)}-${n}`;
        n++;
      }
      persistAuditChecklist({ ...auditChecklist, [section]: [...current, { id, name }] });
    },
    [auditChecklist, persistAuditChecklist]
  );

  // Per-room presence status for the shared checklist items -- entirely
  // separate from stock, flags, or the catalogue. This is purely "was this
  // physically confirmed present in this specific room."
  const persistRoomAuditStatus = useCallback(async (next) => {
    setRoomAuditStatus(next);
    try {
      await setDoc(doc(db, "dentalBoutique", "roomAuditStatus"), { byRoom: next });
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  const setRoomAuditItemStatus = useCallback(
    (room, itemId, status, staff) => {
      const existing = roomAuditStatus[room] || {};
      const updated = { ...existing, [itemId]: { status, updatedAt: new Date().toISOString(), updatedBy: staff || "" } };
      persistRoomAuditStatus({ ...roomAuditStatus, [room]: updated });
    },
    [roomAuditStatus, persistRoomAuditStatus]
  );

  // Removing a checklist item also wipes any per-room status recorded
  // against it, everywhere -- so it can never linger as an orphaned
  // "missing" entry with no name to show, the way earlier test data did.
  const removeChecklistItem = useCallback(
    (section, itemId) => {
      const current = auditChecklist[section] || [];
      persistAuditChecklist({ ...auditChecklist, [section]: current.filter((i) => i.id !== itemId) });

      const cleanedRoomStatus = {};
      Object.entries(roomAuditStatus).forEach(([room, statuses]) => {
        const rest = { ...statuses };
        delete rest[itemId];
        cleanedRoomStatus[room] = rest;
      });
      persistRoomAuditStatus(cleanedRoomStatus);
    },
    [auditChecklist, persistAuditChecklist, roomAuditStatus, persistRoomAuditStatus]
  );

  // ---- room auditing: personalised free-text items, per room, permanent --
  const persistRoomCustomAuditItems = useCallback(async (next) => {
    setRoomCustomAuditItems(next);
    try {
      await setDoc(doc(db, "dentalBoutique", "roomCustomAuditItems"), { byRoom: next });
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  const addCustomAuditItem = useCallback(
    (room, text) => {
      const entry = {
        id: `custom_${Date.now()}_${Math.round(Math.random() * 9999)}`,
        text,
        status: null, // null | "ok" | "attention"
        updatedAt: null,
        updatedBy: "",
      };
      const existing = roomCustomAuditItems[room] || [];
      persistRoomCustomAuditItems({ ...roomCustomAuditItems, [room]: [...existing, entry] });
    },
    [roomCustomAuditItems, persistRoomCustomAuditItems]
  );

  const removeCustomAuditItem = useCallback(
    (room, itemId) => {
      const existing = roomCustomAuditItems[room] || [];
      persistRoomCustomAuditItems({ ...roomCustomAuditItems, [room]: existing.filter((i) => i.id !== itemId) });
    },
    [roomCustomAuditItems, persistRoomCustomAuditItems]
  );

  const setCustomAuditItemStatus = useCallback(
    (room, itemId, status, staff) => {
      const existing = roomCustomAuditItems[room] || [];
      const updated = existing.map((i) =>
        i.id === itemId ? { ...i, status, updatedAt: new Date().toISOString(), updatedBy: staff || "" } : i
      );
      persistRoomCustomAuditItems({ ...roomCustomAuditItems, [room]: updated });
    },
    [roomCustomAuditItems, persistRoomCustomAuditItems]
  );

  // A finished audit leaves a permanent record -- who audited which room,
  // and how many items needed flagging -- without needing a whole separate
  // history mechanism. Reuses the same permanent flagHistoryEvents log as
  // everything else.
  const logAuditCompleted = useCallback((room, staff, reviewedCount, flaggedCount) => {
    const entry = {
      id: `h_${Date.now()}_${Math.round(Math.random() * 9999)}`,
      itemId: null,
      room,
      action: "audited",
      staff: staff || "",
      reviewedCount,
      flaggedCount,
      date: new Date().toISOString(),
    };
    setDoc(doc(collection(db, "flagHistoryEvents"), entry.id), entry).catch(() =>
      setSaveError("Couldn't save -- check your connection.")
    );
  }, []);

  const setMyRoom = useCallback(async (room) => {
    setMyRoomState(room);
    try {
      localStorage.setItem(MY_ROOM_KEY, room);
    } catch (e) {}
  }, []);

  const persistItems = useCallback(async (next) => {
    setItems(next);
    try {
      await setDoc(doc(db, "dentalBoutique", "items"), { list: next });
      setSaveError("");
    } catch (e) {
      setSaveError("Couldn't save -- check your connection.");
    }
  }, []);

  // ---- central stock tracking (option 2: occasional counts, auto-flag) ----
  const enableTracking = useCallback(
    (itemId, threshold) => {
      persistItems(
        items.map((i) =>
          i.id === itemId ? { ...i, tracked: true, lowThreshold: Math.max(0, threshold) } : i
        )
      );
    },
    [items, persistItems]
  );

  const disableTracking = useCallback(
    (itemId) => {
      persistItems(items.map((i) => (i.id === itemId ? { ...i, tracked: false } : i)));
    },
    [items, persistItems]
  );

  const setThreshold = useCallback(
    (itemId, threshold) => {
      persistItems(
        items.map((i) => (i.id === itemId ? { ...i, lowThreshold: Math.max(0, threshold) } : i))
      );
    },
    [items, persistItems]
  );

  const updateCount = useCallback(
    (itemId, count, staff) => {
      const now = new Date().toISOString();
      persistItems(
        items.map((i) =>
          i.id === itemId
            ? { ...i, currentCount: Math.max(0, count), lastCountedAt: now, lastCountedBy: staff || "" }
            : i
        )
      );
      addHistoryEvent({
        id: `h_${Date.now()}_${Math.round(Math.random() * 9999)}`,
        itemId,
        room: "Critical stock",
        action: "counted",
        staff: staff || "",
        qty: count,
        date: now,
      });
    },
    [items, persistItems, addHistoryEvent]
  );

  // ---- the whole app boils down to this one toggle ------------------------
  const toggleFlag = useCallback(
    ({ itemId, room, staff, note }) => {
      const key = flagKey(itemId, room);
      const isFlagged = activeFlags.some((f) => flagKey(f.itemId, f.room) === key);
      const now = new Date().toISOString();

      if (isFlagged) {
        persistFlags(activeFlags.filter((f) => flagKey(f.itemId, f.room) !== key));
        addHistoryEvent({
          id: `h_${Date.now()}_${Math.round(Math.random() * 9999)}`,
          itemId,
          room,
          action: "resolved",
          staff: staff || "",
          date: now,
        });
      } else {
        persistFlags([...activeFlags, { itemId, room, flaggedAt: now, staff: staff || "", note: note || "" }]);
        addHistoryEvent({
          id: `h_${Date.now()}_${Math.round(Math.random() * 9999)}`,
          itemId,
          room,
          action: "flagged",
          staff: staff || "",
          date: now,
        });
      }
    },
    [activeFlags, persistFlags, addHistoryEvent]
  );

  // Reconstructs "what's currently flagged" purely from the permanent
  // history log -- for each item+room pair, finds whichever happened most
  // recently, a flag or a resolve. If the most recent thing was a flag
  // with no resolve after it, that flag is still active. This works even
  // after activeFlags itself gets wiped or corrupted, since flagging
  // never deletes its own history record -- only resolving adds a second
  // one. Note: this only sees whatever's in the loaded `history` array,
  // which is capped to the most recent 2000 events -- fine for any
  // realistic amount of usage so far, but worth knowing if this is ever
  // run after truly heavy long-term use.
  const rebuildFlagsFromHistory = useCallback(() => {
    const relevant = history.filter((h) => h.action === "flagged" || h.action === "resolved");
    const latestByKey = {};
    for (const h of relevant) {
      const key = flagKey(h.itemId, h.room);
      if (!latestByKey[key] || new Date(h.date) > new Date(latestByKey[key].date)) {
        latestByKey[key] = h;
      }
    }
    const rebuilt = Object.values(latestByKey)
      .filter((h) => h.action === "flagged")
      .map((h) => ({ itemId: h.itemId, room: h.room, flaggedAt: h.date, staff: h.staff || "", note: "" }));
    persistFlags(rebuilt);
    return rebuilt.length;
  }, [history, persistFlags]);

  // Pulls the catalogue in App.jsx's SEED_ITEMS back into the live database
  // -- for when the item list itself changes (renames, new items, category
  // changes) after the app is already live. This leaves room flags and
  // flag history completely untouched. The one
  // tradeoff: it resets every item's tracking/threshold/count fields back
  // to whatever SEED_ITEMS says, so any central-stock tracking set up by
  // hand since going live would need to be re-added afterwards.
  const reloadCatalogue = useCallback(async () => {
    await persistItems(seedItems());
  }, [persistItems]);

  // ---- derived --------------------------------------------------------
  const itemsById = useMemo(() => {
    if (!items) return {};
    const map = {};
    items.forEach((i) => (map[i.id] = i));
    return map;
  }, [items]);

  const roomsAffected = useMemo(() => {
    if (!activeFlags) return 0;
    return new Set(activeFlags.map((f) => f.room)).size;
  }, [activeFlags]);

  const trackedItems = useMemo(() => (items ? items.filter((i) => i.tracked) : []), [items]);

  const autoLowItems = useMemo(
    () =>
      trackedItems.filter(
        (i) => i.currentCount !== null && i.lowThreshold !== null && i.currentCount <= i.lowThreshold
      ),
    [trackedItems]
  );

  const openOrders = useMemo(
    () => (orderRequests ? orderRequests.filter((r) => r.status === "open") : []),
    [orderRequests]
  );

  // Every checklist item or personalised item currently crossed as missing,
  // across every room -- purely derived from the audit data, completely
  // separate from stock flags.
  const missingAuditItems = useMemo(() => {
    if (!roomAuditStatus || !roomCustomAuditItems || !auditChecklist) return [];
    const nameById = {};
    Object.values(auditChecklist).forEach((arr) => {
      (arr || []).forEach((item) => {
        nameById[item.id] = item.name;
      });
    });
    const results = [];
    Object.entries(roomAuditStatus).forEach(([room, statuses]) => {
      Object.entries(statuses || {}).forEach(([itemId, info]) => {
        // If this item no longer exists on the checklist (removed since
        // this status was set), there's nothing meaningful to show --
        // skip it rather than display a confusing "Unknown item."
        if (info.status === "attention" && nameById[itemId]) {
          results.push({
            room,
            name: nameById[itemId],
            updatedAt: info.updatedAt,
            updatedBy: info.updatedBy,
          });
        }
      });
    });
    Object.entries(roomCustomAuditItems).forEach(([room, list]) => {
      (list || []).forEach((c) => {
        if (c.status === "attention") {
          results.push({ room, name: c.text, updatedAt: c.updatedAt, updatedBy: c.updatedBy });
        }
      });
    });
    return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [roomAuditStatus, roomCustomAuditItems, auditChecklist]);

  if (loading) {
    return (
      <Shell view={view} setView={setView}>
        <div className="di-loading">
          <Loader2 className="di-spin" size={22} />
          <span>Loading…</span>
        </div>
      </Shell>
    );
  }

  return (
    <Shell view={view} setView={setView} saveError={saveError}>
      {view === "dashboard" && (
        <Dashboard
          items={items}
          itemsById={itemsById}
          activeFlags={activeFlags}
          autoLowItems={autoLowItems}
          openOrders={openOrders}
          missingAuditItems={missingAuditItems}
          roomsAffected={roomsAffected}
          myRoom={myRoom}
          setView={setView}
          onRebuildFlags={rebuildFlagsFromHistory}
        />
      )}
      {view === "report" && (
        <ReportLowStock
          items={items}
          activeFlags={activeFlags}
          myRoom={myRoom}
          setMyRoom={setMyRoom}
          onToggle={toggleFlag}
        />
      )}
      {view === "rooms" && (
        <RoomsOverview
          items={itemsById}
          activeFlags={activeFlags}
          missingAuditItems={missingAuditItems}
          onToggle={toggleFlag}
          onOpenAudit={(room) => {
            setAuditRoom(room);
            setView("audit-room");
          }}
        />
      )}
      {view === "audit-room" && (
        <AuditRoom
          room={auditRoom}
          auditChecklist={auditChecklist}
          roomStatus={roomAuditStatus[auditRoom] || {}}
          customItems={roomCustomAuditItems[auditRoom] || []}
          myRoom={myRoom}
          onSetItemStatus={setRoomAuditItemStatus}
          onRemoveChecklistItem={removeChecklistItem}
          onAddCustomItem={addCustomAuditItem}
          onRemoveCustomItem={removeCustomAuditItem}
          onSetCustomStatus={setCustomAuditItemStatus}
          onLogCompleted={logAuditCompleted}
          onBack={() => setView("rooms")}
        />
      )}
      {view === "stock" && (
        <CentralStock
          items={items}
          trackedItems={trackedItems}
          onEnableTracking={enableTracking}
          onDisableTracking={disableTracking}
          onSetThreshold={setThreshold}
          onUpdateCount={updateCount}
        />
      )}
      {view === "trends" && (
        <Trends items={items} history={history} onEnableTracking={enableTracking} setView={setView} />
      )}
      {view === "catalogue" && <Catalogue items={items} onReloadCatalogue={reloadCatalogue} />}
      {view === "orders" && (
        <OrderRequests
          orderRequests={orderRequests}
          myRoom={myRoom}
          onSubmit={submitOrderRequest}
          onFulfill={fulfillOrderRequest}
        />
      )}
      {view === "feedback" && (
        <Feedback feedback={feedback} onSubmit={submitFeedback} onReview={markFeedbackReviewed} />
      )}
    </Shell>
  );
}

/* ============================================================================
   SHELL / NAV
============================================================================ */
function Shell({ view, setView, saveError, children }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "report", label: "Report low stock", icon: Flag },
    { id: "rooms", label: "By room", icon: Building2 },
    { id: "stock", label: "Critical stock", icon: Package },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "catalogue", label: "Catalogue", icon: BookOpen },
    { id: "orders", label: "Order Requests", icon: ShoppingCart },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];
  return (
    <div className="di-root">
      <style>{CSS}</style>
      <aside className="di-rail">
        <div className="di-brand">
          <div className="di-brand-mark">DB</div>
          <div className="di-brand-text">
            <div className="di-brand-name">Dental Boutique</div>
            <div className="di-brand-sub">Stock alerts · beta</div>
          </div>
        </div>
        <nav className="di-nav">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                className={`di-nav-btn ${active ? "is-active" : ""}`}
                onClick={() => setView(n.id)}
              >
                <Icon size={17} strokeWidth={2} />
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="di-rail-footer">One tap when something's low. That's the whole job.</div>
      </aside>
      <main className="di-main">
        {saveError && (
          <div className="di-save-error">
            <AlertTriangle size={14} /> {saveError}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

/* ============================================================================
   DASHBOARD
============================================================================ */
// A collapsible group of items for one room -- closed by default, so a
// long list of flags/missing items across many rooms doesn't read as one
// overwhelming wall of text. A DA can open just the room they're
// physically standing in and work through it, then move on.
function RoomGroup({ room, count, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="di-room-group">
      <button className="di-room-group-header" onClick={() => setOpen(!open)}>
        <span className="di-room-group-name">{room}</span>
        <span className="di-room-group-right">
          <span className="di-room-group-count">{count}</span>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {open && <ul className="di-activity-list di-room-group-body">{children}</ul>}
    </div>
  );
}

function Dashboard({ items, itemsById, activeFlags, autoLowItems, openOrders, missingAuditItems, roomsAffected, myRoom, setView, onRebuildFlags }) {
  const [confirmingRebuild, setConfirmingRebuild] = useState(false);
  const [rebuildResult, setRebuildResult] = useState(null); // null | { count: number }

  const sorted = [...activeFlags].sort((a, b) => new Date(a.flaggedAt) - new Date(b.flaggedAt));

  const roomOrder = (room) => {
    const idx = ROOMS.indexOf(room);
    return idx === -1 ? ROOMS.length : idx;
  };

  const flagsByRoom = {};
  sorted.forEach((f) => {
    (flagsByRoom[f.room] = flagsByRoom[f.room] || []).push(f);
  });
  const flagRoomEntries = Object.entries(flagsByRoom).sort((a, b) => roomOrder(a[0]) - roomOrder(b[0]));

  const missingByRoom = {};
  missingAuditItems.forEach((m) => {
    (missingByRoom[m.room] = missingByRoom[m.room] || []).push(m);
  });
  const missingRoomEntries = Object.entries(missingByRoom).sort((a, b) => roomOrder(a[0]) - roomOrder(b[0]));

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="Right now"
        title="What's flagged low"
        sub="Rooms flag items by hand. A handful of high-burn items are tracked with real counts and flag themselves."
      />

      {!myRoom && (
        <div className="di-banner">
          <Info size={16} />
          <div>
            <strong>This device hasn't been assigned a room yet.</strong> Go to{" "}
            <button className="di-linklike" onClick={() => setView("report")}>Report low stock</button>{" "}
            and set it once -- it'll remember from then on.
          </div>
        </div>
      )}

      <div className="di-stats">
        <StatCard label="Items in catalogue" value={items.length} />
        <StatCard label="Room flags" value={activeFlags.length} tone={activeFlags.length > 0 ? "critical" : "default"} />
        <StatCard label="Central items low" value={autoLowItems.length} tone={autoLowItems.length > 0 ? "critical" : "default"} />
        <StatCard label="Open orders" value={openOrders.length} tone={openOrders.length > 0 ? "watch" : "default"} />
        <StatCard
          label="Total items Missing"
          value={missingAuditItems.length}
          tone={missingAuditItems.length > 0 ? "critical" : "default"}
        />
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Critical stock running low</h3>
          <span className="di-panel-count">{autoLowItems.length}</span>
        </div>
        {autoLowItems.length === 0 ? (
          <EmptyState
            icon={CircleCheck}
            text="Nothing tracked is below its threshold. Set this up on the Critical stock page."
          />
        ) : (
          <ul className="di-alert-list">
            {autoLowItems.map((item) => (
              <li key={item.id} className="di-alert-row">
                <span className="di-status-dot" style={{ background: "var(--red)" }} />
                <div className="di-alert-main">
                  <div className="di-alert-name">{item.name}</div>
                  <div className="di-alert-meta">
                    {item.category} · counted {item.lastCountedAt ? timeAgo(item.lastCountedAt) : "recently"}
                    {item.lastCountedBy ? ` by ${item.lastCountedBy}` : ""}
                  </div>
                </div>
                <div className="di-alert-figures">
                  <div className="di-alert-stock">
                    {item.currentCount} on hand
                    <span className="di-alert-par"> · threshold {item.lowThreshold}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Rooms reporting low stock</h3>
          <span className="di-panel-count">{sorted.length}</span>
        </div>
        {flagRoomEntries.length === 0 ? (
          <EmptyState icon={CircleCheck} text="Nothing flagged right now." />
        ) : (
          flagRoomEntries.map(([room, flags]) => (
            <RoomGroup key={room} room={room} count={flags.length}>
              {flags.map((f) => {
                const item = itemsById[f.itemId];
                if (!item) return null;
                return (
                  <li key={flagKeyReact(f)} className="di-alert-row">
                    <span className="di-status-dot" style={{ background: "var(--red)" }} />
                    <div className="di-alert-main">
                      <div className="di-alert-name">{item.name}</div>
                      <div className="di-alert-meta">{item.category}</div>
                    </div>
                    <div className="di-alert-figures">
                      <div className="di-alert-stock">{timeAgo(f.flaggedAt)}</div>
                      {f.staff && <div className="di-alert-days">flagged by {f.staff}</div>}
                    </div>
                  </li>
                );
              })}
            </RoomGroup>
          ))
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Missing items from rooms</h3>
          <span className="di-panel-count">{missingAuditItems.length}</span>
        </div>
        {missingRoomEntries.length === 0 ? (
          <EmptyState icon={CircleCheck} text="Nothing crossed as missing in any room audit." />
        ) : (
          missingRoomEntries.map(([room, missingItems]) => (
            <RoomGroup key={room} room={room} count={missingItems.length}>
              {missingItems.map((m, idx) => (
                <li key={idx} className="di-alert-row">
                  <span className="di-status-dot" style={{ background: "var(--red)" }} />
                  <div className="di-alert-main">
                    <div className="di-alert-name">{m.name}</div>
                  </div>
                  <div className="di-alert-figures">
                    <div className="di-alert-stock">{m.updatedAt ? timeAgo(m.updatedAt) : ""}</div>
                    {m.updatedBy && <div className="di-alert-days">by {m.updatedBy}</div>}
                  </div>
                </li>
              ))}
            </RoomGroup>
          ))
        )}
      </div>

      <div className="di-reset-row">
        {rebuildResult && (
          <div className="di-toast" style={{ marginBottom: 10 }}>
            <CircleCheck size={14} />
            {rebuildResult.count === 0
              ? " No flags found in history to restore."
              : ` Restored ${rebuildResult.count} flag${rebuildResult.count === 1 ? "" : "s"} from history.`}
          </div>
        )}
        {confirmingRebuild ? (
          <div className="di-banner" style={{ borderLeftColor: "var(--red)" }}>
            <AlertTriangle size={16} />
            <div>
              <strong>This replaces whatever's currently flagged</strong> with what history says was
              actually flagged and never resolved. Use this to recover from an accidental wipe -- not as a
              routine action.
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  className="di-small-btn"
                  onClick={() => {
                    const count = onRebuildFlags();
                    setRebuildResult({ count });
                    setConfirmingRebuild(false);
                  }}
                >
                  Yes, rebuild from history
                </button>
                <button className="di-ghost-btn" onClick={() => setConfirmingRebuild(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="di-ghost-btn"
            onClick={() => {
              setRebuildResult(null);
              setConfirmingRebuild(true);
            }}
          >
            <RotateCcw size={13} /> Rebuild flags from history
          </button>
        )}
      </div>
    </div>
  );
}

function flagKeyReact(f) {
  return `${f.itemId}::${f.room}`;
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`di-stat di-stat-${tone || "default"}`}>
      <div className="di-stat-value">{value}</div>
      <div className="di-stat-label">{label}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="di-empty">
      <Icon size={20} />
      <span>{text}</span>
    </div>
  );
}

function PageHeader({ eyebrow, title, sub }) {
  return (
    <div className="di-page-head">
      <div className="di-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/* ============================================================================
   REPORT LOW STOCK -- the screen every room actually uses
============================================================================ */
function ReportLowStock({ items, activeFlags, myRoom, setMyRoom, onToggle }) {
  const [room, setRoom] = useState(myRoom || ROOMS[0]);
  const [query, setQuery] = useState("");
  const [staff, setStaff] = useState("");
  const [editingRoom, setEditingRoom] = useState(!myRoom);

  useEffect(() => {
    if (myRoom) setRoom(myRoom);
  }, [myRoom]);

  const flagsForRoom = activeFlags.filter((f) => f.room === room);
  const flaggedIds = new Set(flagsForRoom.map((f) => f.itemId));

  const matches =
    query.length > 0
      ? items
          .filter(
            (i) =>
              !flaggedIds.has(i.id) &&
              (i.name.toLowerCase().includes(query.toLowerCase()) ||
                i.code.toLowerCase().includes(query.toLowerCase()))
          )
          .slice(0, 8)
      : [];

  const confirmRoom = () => {
    setMyRoom(room);
    setEditingRoom(false);
  };

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="One tap"
        title="Report low stock"
        sub="Find the item, tap the flag. That's it -- no counting needed."
      />

      <div className="di-panel di-room-panel">
        <div className="di-field">
          <label>This device's room</label>
          {editingRoom ? (
            <div className="di-field-row">
              <select value={room} onChange={(e) => setRoom(e.target.value)}>
                {ROOMS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button className="di-small-btn" onClick={confirmRoom}>
                Remember this room
              </button>
            </div>
          ) : (
            <div className="di-selected-item">
              <div className="di-cell-name">{room}</div>
              <button className="di-linklike" onClick={() => setEditingRoom(true)}>
                Not this room? Change
              </button>
            </div>
          )}
        </div>
        <div className="di-field" style={{ maxWidth: 220 }}>
          <label>Your name (optional)</label>
          <input placeholder="e.g. Jess" value={staff} onChange={(e) => setStaff(e.target.value)} />
        </div>
      </div>

      {flagsForRoom.length > 0 && (
        <div className="di-panel">
          <div className="di-panel-head">
            <h3>Currently flagged in {room}</h3>
            <span className="di-panel-count">{flagsForRoom.length}</span>
          </div>
          <ul className="di-activity-list">
            {flagsForRoom.map((f) => {
              const item = items.find((i) => i.id === f.itemId);
              if (!item) return null;
              return (
                <li key={flagKeyReact(f)} className="di-activity-row">
                  <span className="di-activity-icon di-activity-used">
                    <Flag size={15} />
                  </span>
                  <div className="di-activity-main">
                    <div className="di-cell-name">{item.name}</div>
                    <div className="di-cell-sub">Flagged {timeAgo(f.flaggedAt)}</div>
                  </div>
                  <button
                    className="di-small-btn"
                    onClick={() => onToggle({ itemId: item.id, room, staff })}
                  >
                    <Undo2 size={13} /> Restocked
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Flag something new</h3>
        </div>
        <div className="di-search di-search-wide">
          <Search size={15} />
          <input
            placeholder="Search item name or code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query.length > 0 && matches.length === 0 && (
          <div className="di-empty">
            <Info size={16} />
            <span>No matching items.</span>
          </div>
        )}
        {matches.length > 0 && (
          <ul className="di-activity-list" style={{ marginTop: 10 }}>
            {matches.map((m) => (
              <li key={m.id} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">{m.name}</div>
                  <div className="di-cell-sub">{m.category}</div>
                </div>
                <button
                  className="di-small-btn di-flag-btn"
                  onClick={() => {
                    onToggle({ itemId: m.id, room, staff });
                    setQuery("");
                  }}
                >
                  <Flag size={13} /> Flag as low
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   ROOMS OVERVIEW
============================================================================ */
function RoomsOverview({ items, activeFlags, missingAuditItems, onToggle, onOpenAudit }) {
  const byRoom = ROOMS.map((room) => ({
    room,
    flags: activeFlags.filter((f) => f.room === room),
    missing: missingAuditItems.filter((m) => m.room === room),
  })).sort((a, b) => b.flags.length + b.missing.length - (a.flags.length + a.missing.length));

  const isTreatmentRoom = (room) => room !== "Sterilisation" && room !== "Lab";

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="All 19 locations"
        title="By room"
        sub="See which rooms need restocking or are missing equipment, without walking over to check. Project Audit, but make it digital 😎."
      />
      <div className="di-rooms-grid">
        {byRoom.map(({ room, flags, missing }) => (
          <div key={room} className={`di-panel di-room-card ${flags.length > 0 ? "has-flags" : ""}`}>
            <div className="di-panel-head">
              <h3>{room}</h3>
              <span
                className="di-badge"
                style={{
                  color: flags.length > 0 ? "var(--red)" : "var(--green)",
                  background: flags.length > 0 ? "var(--red-bg)" : "var(--green-bg)",
                }}
              >
                {flags.length > 0 ? `${flags.length} low` : "All good"}
              </span>
            </div>
            {flags.length === 0 ? (
              <div className="di-empty" style={{ padding: "6px 2px" }}>
                <CircleCheck size={16} />
                <span>Nothing flagged</span>
              </div>
            ) : (
              <ul className="di-activity-list">
                {flags.map((f) => {
                  const item = items[f.itemId];
                  if (!item) return null;
                  return (
                    <li key={flagKeyReact(f)} className="di-activity-row">
                      <div className="di-activity-main">
                        <div className="di-cell-name">{item.name}</div>
                        <div className="di-cell-sub">{timeAgo(f.flaggedAt)}</div>
                      </div>
                      <button
                        className="di-small-btn di-small-btn-ghost"
                        onClick={() => onToggle({ itemId: item.id, room })}
                      >
                        <Undo2 size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {missing.length > 0 && (
              <div className="di-room-missing">
                <div className="di-room-missing-head">
                  <X size={12} />
                  <span>Missing items</span>
                  <span className="di-room-missing-count">{missing.length}</span>
                </div>
                <ul className="di-activity-list">
                  {missing.map((m, idx) => (
                    <li key={idx} className="di-activity-row">
                      <div className="di-activity-main">
                        <div className="di-cell-name">{m.name}</div>
                        <div className="di-cell-sub">{m.updatedAt ? timeAgo(m.updatedAt) : ""}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isTreatmentRoom(room) && (
              <button className="di-ghost-btn di-audit-btn" onClick={() => onOpenAudit(room)}>
                <ClipboardList size={13} /> Audit
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   AUDIT ROOM -- a fast, structured tick/cross walkthrough for one treatment
   room. Base checklist items are real catalogue items and plug straight
   into the existing flag system (cross = flag, tick-on-a-flagged-item =
   resolve). Personalised items are free text specific to this one room,
   have their own small persistent status, and never reset -- they're not
   tied to the catalogue at all, since a room's own quirks often aren't
   stock items in the usual sense.
============================================================================ */
function AuditRoom({
  room,
  auditChecklist,
  roomStatus,
  customItems,
  myRoom,
  onSetItemStatus,
  onRemoveChecklistItem,
  onAddCustomItem,
  onRemoveCustomItem,
  onSetCustomStatus,
  onLogCompleted,
  onBack,
}) {
  const [staff, setStaff] = useState("");
  const [customText, setCustomText] = useState("");

  if (!room) {
    return (
      <div className="di-page">
        <EmptyState icon={Info} text="No room selected." />
      </div>
    );
  }

  const sections = Object.keys(auditChecklist);
  const allChecklistItems = sections.flatMap((s) => auditChecklist[s] || []);

  const addCustom = () => {
    if (!customText.trim()) return;
    onAddCustomItem(room, customText.trim());
    setCustomText("");
  };

  const finishAudit = () => {
    const statuses = allChecklistItems.map((i) => roomStatus[i.id]?.status).filter(Boolean);
    const customStatuses = customItems.map((c) => c.status).filter(Boolean);
    const allStatuses = [...statuses, ...customStatuses];
    const reviewedCount = allStatuses.length;
    const flaggedCount = allStatuses.filter((s) => s === "attention").length;
    onLogCompleted(room, staff, reviewedCount, flaggedCount);
    onBack();
  };

  return (
    <div className="di-page">
      <button className="di-linklike di-back-link" onClick={onBack}>
        &larr; Back to By room
      </button>
      <PageHeader
        eyebrow="Room audit"
        title={`Auditing ${room}`}
        sub="A simple presence check -- tick what's actually in the room, cross what isn't. Nothing here touches stock levels or flags."
      />

      <div className="di-panel">
        <div className="di-field" style={{ maxWidth: 220 }}>
          <label>Your name (optional)</label>
          <input placeholder="e.g. Jess" value={staff} onChange={(e) => setStaff(e.target.value)} />
        </div>
      </div>

      {sections.map((section) => (
        <AuditSection
          key={section}
          section={section}
          sectionItems={auditChecklist[section] || []}
          roomStatus={roomStatus}
          onSetStatus={(itemId, status) => onSetItemStatus(room, itemId, status, staff)}
          onRemove={(itemId) => onRemoveChecklistItem(section, itemId)}
        />
      ))}

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Personalised for {room}</h3>
          <span className="di-panel-count">{customItems.length}</span>
        </div>
        {customItems.length === 0 ? (
          <EmptyState icon={Info} text="Nothing personalised yet for this room." />
        ) : (
          <ul className="di-activity-list">
            {customItems.map((c) => (
              <li key={c.id} className="di-audit-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">{c.text}</div>
                  <div className="di-cell-sub">
                    {c.updatedAt
                      ? `Last checked ${timeAgo(c.updatedAt)}${c.updatedBy ? ` by ${c.updatedBy}` : ""}`
                      : "Never checked yet"}
                  </div>
                </div>
                <div className="di-audit-actions">
                  <button
                    className={`di-audit-btn-tick ${c.status === "ok" ? "is-active" : ""}`}
                    onClick={() => onSetCustomStatus(room, c.id, "ok", staff)}
                    title="Present"
                  >
                    <CircleCheck size={16} />
                  </button>
                  <button
                    className={`di-audit-btn-cross ${c.status === "attention" ? "is-active" : ""}`}
                    onClick={() => onSetCustomStatus(room, c.id, "attention", staff)}
                    title="Needs attention"
                  >
                    <X size={16} />
                  </button>
                  <button
                    className="di-audit-btn-remove"
                    onClick={() => onRemoveCustomItem(room, c.id)}
                    title="Remove permanently"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="di-field-row" style={{ marginTop: 12 }}>
          <input
            placeholder="e.g. Composite heater, stressball…"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            style={{ flex: 1 }}
          />
          <button className="di-small-btn" onClick={addCustom}>
            <PlusCircle size={13} /> Add
          </button>
        </div>
      </div>

      <button className="di-primary-btn" onClick={finishAudit}>
        Finish audit
      </button>
    </div>
  );
}

// One named section of the shared checklist (e.g. "Equipment"). Items here
// are plain named entries, not catalogue items -- adding one is just typing
// a name, not searching stock. Status is tracked per room, since whether
// something is actually sitting in Room 3 is a different question from
// whether it's sitting in Room 12.
function AuditSection({ section, sectionItems, roomStatus, onSetStatus, onRemove }) {
  return (
    <div className="di-panel">
      <div className="di-panel-head">
        <h3>{section}</h3>
        <span className="di-panel-count">{sectionItems.length}</span>
      </div>
      {sectionItems.length === 0 ? (
        <EmptyState icon={Info} text="No items in this section." />
      ) : (
        <ul className="di-activity-list">
          {sectionItems.map((item) => {
            const status = roomStatus[item.id]?.status;
            return (
              <li key={item.id} className="di-audit-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">{item.name}</div>
                </div>
                <div className="di-audit-actions">
                  <button
                    className={`di-audit-btn-tick ${status === "ok" ? "is-active" : ""}`}
                    onClick={() => onSetStatus(item.id, "ok")}
                    title="Present"
                  >
                    <CircleCheck size={16} />
                  </button>
                  <button
                    className={`di-audit-btn-cross ${status === "attention" ? "is-active" : ""}`}
                    onClick={() => onSetStatus(item.id, "attention")}
                    title="Missing"
                  >
                    <X size={16} />
                  </button>
                  <button className="di-audit-btn-remove" onClick={() => onRemove(item.id)} title="Remove from checklist">
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


/* ============================================================================
   CENTRAL STOCK -- option 2: occasional real counts, per-item threshold,
   auto-flags itself. This is deliberately separate from the per-room manual
   flags: it represents one shared, central number (e.g. the steri /
   storeroom shelf), not what's sitting in each of the 17 treatment rooms.
============================================================================ */
function CentralStock({ items, trackedItems, onEnableTracking, onDisableTracking, onSetThreshold, onUpdateCount }) {
  const [query, setQuery] = useState("");
  const [staff, setStaff] = useState("");
  const [editingCountId, setEditingCountId] = useState(null);
  const [countDraft, setCountDraft] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [thresholdDraft, setThresholdDraft] = useState("");

  const untracked = items.filter((i) => !i.tracked);
  const matches =
    query.length > 0
      ? untracked
          .filter(
            (i) =>
              i.name.toLowerCase().includes(query.toLowerCase()) ||
              i.code.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8)
      : [];

  const startCount = (item) => {
    setEditingCountId(item.id);
    setCountDraft(item.currentCount !== null ? String(item.currentCount) : "");
  };
  const saveCount = (itemId) => {
    const val = parseInt(countDraft, 10);
    if (!Number.isNaN(val) && val >= 0) onUpdateCount(itemId, val, staff);
    setEditingCountId(null);
  };

  const confirmAdd = (itemId) => {
    const val = parseInt(thresholdDraft, 10);
    if (!Number.isNaN(val) && val >= 0) {
      onEnableTracking(itemId, val);
      setAddingId(null);
      setThresholdDraft("");
      setQuery("");
    }
  };

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="Precision tracking"
        title="Real counts for critical items"
        sub="For your highest-burn items only. Type in the real count when it's convenient -- not every use -- and the item flags itself once it hits its threshold."
      />

      <div className="di-panel">
        <div className="di-field" style={{ maxWidth: 220, marginBottom: 14 }}>
          <label>Your name (optional, saved with each count)</label>
          <input placeholder="e.g. Jess" value={staff} onChange={(e) => setStaff(e.target.value)} />
        </div>

        {trackedItems.length === 0 ? (
          <EmptyState icon={Info} text="No items tracked yet -- add one below to get started." />
        ) : (
          <ul className="di-activity-list">
            {trackedItems.map((item) => {
              const isLow =
                item.currentCount !== null && item.lowThreshold !== null && item.currentCount <= item.lowThreshold;
              return (
                <li key={item.id} className="di-activity-row di-stock-row">
                  <div className="di-activity-main">
                    <div className="di-cell-name">{item.name}</div>
                    <div className="di-cell-sub">
                      {item.lastCountedAt
                        ? `Last counted ${timeAgo(item.lastCountedAt)}${item.lastCountedBy ? ` by ${item.lastCountedBy}` : ""}`
                        : "Never counted yet"}
                    </div>
                  </div>

                  <div className="di-stock-figures">
                    {editingCountId === item.id ? (
                      <>
                        <input
                          className="di-inline-input"
                          type="number"
                          min="0"
                          autoFocus
                          value={countDraft}
                          onChange={(e) => setCountDraft(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveCount(item.id)}
                        />
                        <button className="di-small-btn" onClick={() => saveCount(item.id)}>Save</button>
                      </>
                    ) : (
                      <>
                        <span className={`di-badge ${isLow ? "" : ""}`} style={{
                          color: isLow ? "var(--red)" : "var(--green)",
                          background: isLow ? "var(--red-bg)" : "var(--green-bg)",
                        }}>
                          {item.currentCount === null ? "Not counted" : `${item.currentCount} on hand`}
                        </span>
                        <button className="di-small-btn di-small-btn-ghost" onClick={() => startCount(item)}>
                          Update count
                        </button>
                      </>
                    )}
                  </div>

                  <div className="di-stock-threshold">
                    <label>Threshold</label>
                    <input
                      className="di-inline-input di-inline-input-sm"
                      type="number"
                      min="0"
                      value={item.lowThreshold ?? ""}
                      onChange={(e) => onSetThreshold(item.id, parseInt(e.target.value || "0", 10))}
                    />
                  </div>

                  <button className="di-ghost-btn" onClick={() => onDisableTracking(item.id)}>
                    Stop tracking
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Add an item to central tracking</h3>
        </div>
        <div className="di-search di-search-wide">
          <Search size={15} />
          <input
            placeholder="Search item name or code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {matches.length > 0 && (
          <ul className="di-activity-list" style={{ marginTop: 10 }}>
            {matches.map((m) => (
              <li key={m.id} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">{m.name}</div>
                  <div className="di-cell-sub">{m.category}</div>
                </div>
                {addingId === m.id ? (
                  <div className="di-field-row">
                    <input
                      className="di-inline-input"
                      type="number"
                      min="0"
                      placeholder="Threshold"
                      autoFocus
                      value={thresholdDraft}
                      onChange={(e) => setThresholdDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmAdd(m.id)}
                    />
                    <button className="di-small-btn" onClick={() => confirmAdd(m.id)}>
                      <Target size={13} /> Set
                    </button>
                  </div>
                ) : (
                  <button className="di-small-btn" onClick={() => setAddingId(m.id)}>
                    <PlusCircle size={13} /> Track this item
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   TRENDS -- flag frequency stands in for burn rate in this beta
============================================================================ */
function Trends({ items, history, onEnableTracking, setView }) {
  const ranked = items
    .map((item) => ({
      item,
      count30: flagCountLast30Days(item.id, history),
      avgGap: avgDaysBetweenFlags(item.id, history),
    }))
    .filter((r) => r.count30 > 0)
    .sort((a, b) => b.count30 - a.count30)
    .slice(0, 10);

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="Patterns"
        title="Most frequently flagged"
        sub="This counts how often each item gets flagged low. Dark red discs are culprit #1 🤣."
      />

      <div className="di-panel">
        {ranked.length === 0 ? (
          <EmptyState icon={Info} text="Flag a few items over the next week or two to see patterns here." />
        ) : (
          <>
            <div className="di-chart-wrap">
              <ResponsiveContainer width="100%" height={Math.max(180, ranked.length * 34)}>
                <BarChart
                  data={ranked.map((r) => ({
                    name: r.item.name.length > 28 ? r.item.name.slice(0, 26) + "…" : r.item.name,
                    count: r.count30,
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                  <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: "var(--ink)" }} />
                  <Tooltip
                    formatter={(v) => [`${v} times`, "Flagged in last 30 days"]}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--line)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {ranked.map((r, idx) => (
                      <Cell key={idx} fill={r.count30 >= 4 ? "var(--red)" : r.count30 >= 2 ? "var(--amber)" : "var(--clay)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="di-activity-list" style={{ marginTop: 14 }}>
              {ranked.map((r) => (
                <li key={r.item.id} className="di-activity-row">
                  <div className="di-activity-main">
                    <div className="di-cell-name">{r.item.name}</div>
                    <div className="di-cell-sub">
                      {r.avgGap !== null
                        ? `Flagged roughly every ${r.avgGap.toFixed(1)} days`
                        : "Not enough history to estimate a pattern yet"}
                    </div>
                  </div>
                  {r.item.tracked ? (
                    <span className="di-badge" style={{ color: "var(--clay)", background: "var(--paper)" }}>
                      Tracked centrally
                    </span>
                  ) : (
                    <button
                      className="di-small-btn"
                      onClick={() => {
                        onEnableTracking(r.item.id, 5);
                        setView("stock");
                      }}
                    >
                      <Target size={13} /> Track this item
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   CATALOGUE -- simple read-only browse (names, cost, supplier)
============================================================================ */
function Catalogue({ items, onReloadCatalogue }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [confirmingReload, setConfirmingReload] = useState(false);
  const [reloadStatus, setReloadStatus] = useState(null); // null | "working" | "done" | "error"

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = items.filter((item) => {
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.code.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === "All" || item.category === category;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="di-page">
      <PageHeader eyebrow="Reference" title="Catalogue" sub="Every item that DB stocks, searchable by name!" />
      <div className="di-toolbar">
        <div className="di-search">
          <Search size={15} />
          <input placeholder="Search by name or code…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="di-toolbar-count">{filtered.length} items</div>
      </div>
      <div className="di-table-wrap">
        <table className="di-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="di-cell-name">{item.name}</div>
                  <div className="di-cell-sub">{item.code || "no code"}</div>
                </td>
                <td>{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="di-reset-row">
        {reloadStatus === "done" && (
          <div className="di-toast" style={{ marginBottom: 10 }}>
            <CircleCheck size={14} /> Catalogue reloaded from code -- every device will update within a
            couple of seconds.
          </div>
        )}
        {reloadStatus === "error" && (
          <div className="di-save-error" style={{ marginBottom: 10, maxWidth: "none" }}>
            <AlertTriangle size={14} /> Something went wrong saving the reload -- check your connection and
            try again.
          </div>
        )}
        {confirmingReload ? (
          <div className="di-banner" style={{ borderLeftColor: "var(--red)" }}>
            <AlertTriangle size={16} />
            <div>
              <strong>This replaces every item's name, category and central-stock tracking</strong> with
              whatever is currently in the app's code. Room flags and flag history are untouched. Any
              tracking/thresholds set by hand on the Critical Stock page will be reset. This step actually
              performs the reload -- clicking below is what writes it, not the button before it.
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="di-small-btn"
                  disabled={reloadStatus === "working"}
                  onClick={async () => {
                    setReloadStatus("working");
                    try {
                      await onReloadCatalogue();
                      setReloadStatus("done");
                    } catch (e) {
                      setReloadStatus("error");
                    }
                    setConfirmingReload(false);
                  }}
                >
                  {reloadStatus === "working" ? "Reloading…" : "Yes, reload catalogue now"}
                </button>
                <button className="di-ghost-btn" onClick={() => setConfirmingReload(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="di-ghost-btn"
            onClick={() => {
              setReloadStatus(null);
              setConfirmingReload(true);
            }}
          >
            <RotateCcw size={13} /> Reload catalogue from latest code
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   ORDER REQUESTS -- DAs/dentists request whitening product live; requests
   list here for whoever's ordering to action and mark done.
============================================================================ */
function OrderRequests({ orderRequests, myRoom, onSubmit, onFulfill }) {
  const [room, setRoom] = useState(myRoom || ROOMS[0]);
  const [dentistName, setDentistName] = useState("");
  const [product, setProduct] = useState(WHITENING_PRODUCTS[0]);
  const [type, setType] = useState(ORDER_TYPES[0]);
  const [dayQty, setDayQty] = useState("");
  const [nightQty, setNightQty] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (myRoom) setRoom(myRoom);
  }, [myRoom]);

  const canSubmit =
    room && dentistName.trim().length > 0 && (Number(dayQty) > 0 || Number(nightQty) > 0);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      room,
      dentistName: dentistName.trim(),
      product,
      type,
      dayQty: Number(dayQty) || 0,
      nightQty: Number(nightQty) || 0,
    });
    setDayQty("");
    setNightQty("");
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 2200);
  };

  const open = [...orderRequests]
    .filter((r) => r.status === "open")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const recentlyFulfilled = [...orderRequests]
    .filter((r) => r.status === "fulfilled")
    .sort((a, b) => new Date(b.fulfilledAt) - new Date(a.fulfilledAt))
    .slice(0, 5);

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="Whitening supplies"
        title="Order Requests"
        sub="Submit a live request for whitening product -- it lands here for whoever orders supplies to see and action."
      />

      <div className="di-panel di-log-form">
        <div className="di-field-row">
          <div className="di-field">
            <label>Room</label>
            <select value={room} onChange={(e) => setRoom(e.target.value)}>
              {ROOMS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="di-field">
            <label>Dentist name</label>
            <input
              placeholder="e.g. RZ"
              value={dentistName}
              onChange={(e) => setDentistName(e.target.value)}
            />
          </div>
        </div>

        <div className="di-field">
          <label>What product would you like to order?</label>
          <select value={product} onChange={(e) => setProduct(e.target.value)}>
            {WHITENING_PRODUCTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="di-field">
          <label>Take-home or in-chair?</label>
          <div className="di-toggle">
            {ORDER_TYPES.map((t) => (
              <button
                key={t}
                className={`di-toggle-btn ${type === t ? "is-active" : ""}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="di-field-row">
          <div className="di-field">
            <label>Day gel -- quantity</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={dayQty}
              onChange={(e) => setDayQty(e.target.value)}
            />
          </div>
          <div className="di-field">
            <label>Night gel -- quantity</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={nightQty}
              onChange={(e) => setNightQty(e.target.value)}
            />
          </div>
        </div>

        <button className="di-primary-btn" disabled={!canSubmit} onClick={submit}>
          Submit order request
        </button>
        {justSubmitted && (
          <div className="di-toast">
            <CircleCheck size={14} /> Request submitted
          </div>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Open requests</h3>
          <span className="di-panel-count">{open.length}</span>
        </div>
        {open.length === 0 ? (
          <EmptyState icon={CircleCheck} text="No open order requests." />
        ) : (
          <ul className="di-activity-list">
            {open.map((r) => (
              <li key={r.id} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">
                    {r.product} -- {r.type}
                  </div>
                  <div className="di-cell-sub">
                    {r.room} · {r.dentistName} · Day {r.dayQty} / Night {r.nightQty} · {timeAgo(r.date)}
                  </div>
                </div>
                <button className="di-small-btn" onClick={() => onFulfill(r.id)}>
                  Mark as ordered
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {recentlyFulfilled.length > 0 && (
        <div className="di-panel">
          <div className="di-panel-head">
            <h3>Recently ordered</h3>
          </div>
          <ul className="di-activity-list">
            {recentlyFulfilled.map((r) => (
              <li key={r.id} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">
                    {r.product} -- {r.type}
                  </div>
                  <div className="di-cell-sub">
                    {r.room} · {r.dentistName} · Day {r.dayQty} / Night {r.nightQty} · ordered{" "}
                    {timeAgo(r.fulfilledAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   FEEDBACK -- anyone can submit, but there's no login system in this app,
   so "private to the owner" isn't something this can technically enforce --
   it's a shared channel everyone can see, same as every other page here.
============================================================================ */
function Feedback({ feedback, onSubmit, onReview }) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const canSubmit = message.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ message: message.trim(), name: name.trim(), role: role.trim() });
    setMessage("");
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 2200);
  };

  const fresh = [...feedback].filter((f) => f.status !== "reviewed");
  const reviewed = [...feedback]
    .filter((f) => f.status === "reviewed")
    .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
    .slice(0, 10);

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="Give me your feedback!! Tell me what could be improved 🔥"
        title="Feedback"
        sub="Bugs, ideas, or anything that's annoying about the app -- this goes straight into one place for it to actually get read and acted on."
      />

      <div className="di-panel di-log-form">
        <div className="di-field">
          <label>What's on your mind?</label>
          <textarea
            className="di-textarea"
            placeholder="e.g. the flag button is hard to tap on my phone, or: could we add..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>
        <div className="di-field-row">
          <div className="di-field">
            <label>Your name (optional)</label>
            <input placeholder="e.g. Jess" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="di-field">
            <label>Role (optional)</label>
            <input placeholder="e.g. DA, Dentist" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>
        <button className="di-primary-btn" disabled={!canSubmit} onClick={submit}>
          Send feedback
        </button>
        {justSubmitted && (
          <div className="di-toast">
            <CircleCheck size={14} /> Sent -- thank you!
          </div>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Unread</h3>
          <span className="di-panel-count">{fresh.length}</span>
        </div>
        {fresh.length === 0 ? (
          <EmptyState icon={CircleCheck} text="Nothing new." />
        ) : (
          <ul className="di-activity-list">
            {fresh.map((f) => (
              <li key={f.id} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">{f.message}</div>
                  <div className="di-cell-sub">
                    {f.name || "Anonymous"}
                    {f.role ? ` · ${f.role}` : ""} · {timeAgo(f.date)}
                  </div>
                </div>
                <button className="di-small-btn" onClick={() => onReview(f.id)}>
                  Mark reviewed
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reviewed.length > 0 && (
        <div className="di-panel">
          <div className="di-panel-head">
            <h3>Recently reviewed</h3>
          </div>
          <ul className="di-activity-list">
            {reviewed.map((f) => (
              <li key={f.id} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">{f.message}</div>
                  <div className="di-cell-sub">
                    {f.name || "Anonymous"}
                    {f.role ? ` · ${f.role}` : ""} · reviewed {timeAgo(f.reviewedAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   STYLES
============================================================================ */
const CSS = `
:root {
  --paper: #F1ECE1;
  --panel: #FFFFFF;
  --ink: #18160F;
  --ink-soft: #7A7364;
  --line: #DED5C1;
  --sand: #CDBFA5;
  --sand-dark: #B7A582;
  --clay: #8B6F4E;
  --charcoal: #17160F;
  --charcoal-2: #24221A;
  --red: #A24B36;
  --red-bg: #F0DDD3;
  --amber: #A17B34;
  --amber-bg: #F1E5C9;
  --green: #62705A;
  --green-bg: #E4E5D9;
}
.di-root {
  display: flex;
  min-height: 100%;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.di-rail {
  width: 208px;
  flex-shrink: 0;
  background: var(--charcoal);
  color: #ECE7DA;
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
  gap: 24px;
}
.di-brand { display: flex; align-items: center; gap: 10px; }
.di-brand-mark {
  width: 34px; height: 34px; border-radius: 8px;
  background: var(--sand); color: var(--charcoal);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px;
  flex-shrink: 0;
}
.di-brand-name {
  font-size: 12.5px; font-weight: 700; line-height: 1.2;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.di-brand-sub { font-size: 11px; color: #A79E8B; }
.di-nav { display: flex; flex-direction: column; gap: 3px; }
.di-nav-btn {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 10px; border-radius: 7px; border: none;
  background: transparent; color: #C9C1AF;
  font-size: 13.5px; font-family: inherit; text-align: left; cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.di-nav-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
.di-nav-btn.is-active { background: var(--sand); color: var(--charcoal); font-weight: 600; }
.di-rail-footer { margin-top: auto; font-size: 11px; color: #8A8272; line-height: 1.5; }
.di-main { flex: 1; padding: 32px 40px 60px; overflow-y: auto; }
.di-page { max-width: 920px; }
.di-page-head { margin-bottom: 22px; }
.di-eyebrow {
  font-size: 11.5px; color: var(--ink-soft); margin-bottom: 6px;
  text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;
}
.di-page-head h1 {
  font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 500;
  font-size: 30px; margin: 0 0 6px; letter-spacing: -0.01em; color: var(--ink);
}
.di-page-head p { margin: 0; color: var(--ink-soft); font-size: 13.5px; max-width: 62ch; }
.di-loading {
  display: flex; align-items: center; gap: 10px; color: var(--ink-soft);
  font-size: 14px; padding: 60px 0;
}
.di-spin { animation: di-spin 0.9s linear infinite; }
@keyframes di-spin { to { transform: rotate(360deg); } }
.di-save-error {
  display: flex; align-items: center; gap: 7px; background: var(--red-bg);
  color: var(--red); padding: 8px 12px; border-radius: 7px; font-size: 12.5px;
  margin-bottom: 16px; max-width: 920px;
}
.di-banner {
  display: flex; gap: 10px; align-items: flex-start;
  background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--clay);
  padding: 12px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 20px;
  color: var(--ink); line-height: 1.5;
}
.di-banner svg { flex-shrink: 0; margin-top: 2px; color: var(--clay); }
.di-linklike {
  background: none; border: none; padding: 0; color: var(--clay); font-weight: 600;
  cursor: pointer; text-decoration: underline; font-size: inherit; font-family: inherit;
}
.di-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 22px; }
.di-stat {
  background: var(--panel); border: 1px solid var(--line); border-radius: 9px;
  padding: 14px 16px;
}
.di-stat-value { font-family: 'Fraunces', Georgia, serif; font-style: normal; font-size: 24px; font-weight: 600; }
.di-stat-label { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
.di-stat-critical .di-stat-value { color: var(--red); }
.di-stat-watch .di-stat-value { color: var(--amber); }
.di-panel {
  background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
  padding: 18px 20px; margin-bottom: 18px;
}
.di-room-panel { display: flex; gap: 22px; flex-wrap: wrap; align-items: flex-end; }
.di-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.di-panel-head h3 { margin: 0; font-size: 14.5px; font-weight: 600; }
.di-panel-count {
  font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums; font-size: 12px; color: var(--ink-soft);
  background: var(--paper); padding: 2px 8px; border-radius: 20px;
}
.di-empty {
  display: flex; align-items: center; gap: 9px; color: var(--ink-soft);
  font-size: 13px; padding: 18px 4px;
}
.di-alert-list { list-style: none; margin: 0; padding: 0; }
.di-room-group { border-bottom: 1px solid var(--line); }
.di-room-group:last-child { border-bottom: none; }
.di-room-group-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: none; border: none; cursor: pointer; padding: 10px 2px; font-family: inherit;
  color: var(--ink); text-align: left;
}
.di-room-group-header:hover { background: var(--paper); }
.di-room-group-name { font-size: 13.5px; font-weight: 600; }
.di-room-group-right { display: flex; align-items: center; gap: 8px; color: var(--ink-soft); }
.di-room-group-count {
  font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums; font-size: 11.5px;
  background: var(--red-bg); color: var(--red); padding: 2px 8px; border-radius: 20px; font-weight: 600;
}
.di-room-group-body { padding: 0 2px 8px 14px; }
.di-room-group-body .di-alert-row:last-child { border-bottom: none; }
.di-alert-row {
  display: flex; align-items: center; gap: 12px; padding: 10px 2px;
  border-bottom: 1px solid var(--line);
}
.di-alert-row:last-child { border-bottom: none; }
.di-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.di-alert-main { flex: 1; min-width: 0; }
.di-alert-name { font-size: 13.5px; font-weight: 500; }
.di-alert-meta { font-size: 11.5px; color: var(--ink-soft); margin-top: 1px; }
.di-alert-figures { text-align: right; flex-shrink: 0; }
.di-alert-stock { font-size: 12.5px; font-weight: 600; }
.di-alert-days { font-size: 11.5px; color: var(--ink-soft); margin-top: 1px; }
.di-reset-row { margin-top: 26px; opacity: 0.6; }
.di-ghost-btn {
  display: inline-flex; align-items: center; gap: 6px; background: none;
  border: 1px solid var(--line); border-radius: 6px; padding: 6px 10px;
  font-size: 11.5px; color: var(--ink-soft); cursor: pointer; font-family: inherit;
}
.di-ghost-btn:hover { background: var(--panel); }
.di-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.di-search {
  display: flex; align-items: center; gap: 7px; background: var(--panel);
  border: 1px solid var(--line); border-radius: 7px; padding: 7px 10px; flex: 1;
  color: var(--ink-soft);
}
.di-search input { border: none; outline: none; background: none; font-size: 13px; flex: 1; color: var(--ink); font-family: inherit; }
.di-search-wide { max-width: none; }
.di-toolbar select {
  border: 1px solid var(--line); border-radius: 7px; padding: 7px 10px;
  font-size: 13px; background: var(--panel); color: var(--ink); font-family: inherit;
}
.di-toolbar-count { font-size: 12px; color: var(--ink-soft); white-space: nowrap; }
.di-table-wrap { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.di-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.di-table thead th {
  text-align: left; font-size: 11px; color: var(--ink-soft);
  font-weight: 600; padding: 10px 12px; border-bottom: 1px solid var(--line); background: var(--paper);
}
.di-table td { padding: 9px 12px; border-bottom: 1px solid var(--line); vertical-align: middle; }
.di-table tbody tr:last-child td { border-bottom: none; }
.di-num { text-align: right; }
.di-cell-name { font-weight: 500; }
.di-cell-sub { font-size: 11px; color: var(--ink-soft); margin-top: 1px; }
.di-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
.di-small-btn {
  display: inline-flex; align-items: center; gap: 5px;
  border: 1px solid var(--clay); background: var(--clay); color: #fff;
  border-radius: 6px; padding: 5px 10px; font-size: 11.5px; cursor: pointer; font-family: inherit;
  white-space: nowrap;
}
.di-small-btn-ghost { background: none; color: var(--clay); }
.di-flag-btn { background: var(--red); border-color: var(--red); }
.di-field { display: flex; flex-direction: column; gap: 5px; position: relative; }
.di-field label { font-size: 11.5px; color: var(--ink-soft); font-weight: 600; }
.di-log-form { display: flex; flex-direction: column; gap: 14px; }
.di-toggle { display: flex; gap: 6px; }
.di-toggle-btn {
  flex: 1; text-align: center; border: 1px solid var(--line); background: var(--panel);
  border-radius: 7px; padding: 8px 10px; font-size: 12.5px; cursor: pointer;
  font-family: inherit; color: var(--ink-soft);
}
.di-toggle-btn.is-active { background: var(--sand); border-color: var(--sand-dark); color: var(--charcoal); font-weight: 600; }
.di-primary-btn {
  background: var(--clay); color: #fff; border: none; border-radius: 8px;
  padding: 11px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 4px;
}
.di-primary-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.di-toast { display: flex; align-items: center; gap: 6px; color: var(--green); font-size: 12.5px; font-weight: 600; margin-top: 8px; }
.di-field input, .di-field select {
  border: 1px solid var(--line); border-radius: 7px; padding: 8px 10px;
  font-size: 13px; font-family: inherit; background: var(--panel); color: var(--ink);
}
.di-textarea {
  border: 1px solid var(--line); border-radius: 7px; padding: 9px 10px;
  font-size: 13px; font-family: inherit; background: var(--panel); color: var(--ink);
  resize: vertical; min-height: 70px;
}
.di-field-row { display: flex; gap: 10px; align-items: center; }
.di-selected-item {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  border: 1px solid var(--line); border-radius: 7px; padding: 9px 11px; background: var(--paper);
  min-width: 220px;
}
.di-activity-list { list-style: none; margin: 0; padding: 0; }
.di-activity-row {
  display: flex; align-items: center; gap: 10px; padding: 9px 2px; border-bottom: 1px solid var(--line);
}
.di-activity-row:last-child { border-bottom: none; }
.di-activity-icon { flex-shrink: 0; display: flex; }
.di-activity-used { color: var(--red); }
.di-activity-main { flex: 1; min-width: 0; }
.di-chart-wrap { margin-top: 6px; }
.di-stock-row { gap: 14px; flex-wrap: wrap; }
.di-stock-figures { display: flex; align-items: center; gap: 8px; }
.di-stock-threshold { display: flex; align-items: center; gap: 6px; }
.di-stock-threshold label { font-size: 11px; color: var(--ink-soft); white-space: nowrap; }
.di-inline-input {
  width: 60px; border: 1px solid var(--line); border-radius: 5px; padding: 4px 6px;
  font-size: 12.5px; text-align: right; font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums;
}
.di-inline-input-sm { width: 48px; }
.di-rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.di-room-card { margin-bottom: 0; }
.di-room-card.has-flags { border-left: 3px solid var(--red); }
.di-audit-btn { width: 100%; justify-content: center; margin-top: 10px; }
.di-room-missing { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--line); }
.di-room-missing-head {
  display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600;
  color: var(--red); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px;
}
.di-room-missing-count {
  margin-left: auto; font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums;
  background: var(--red-bg); color: var(--red); padding: 1px 7px; border-radius: 20px; font-weight: 600;
  text-transform: none; letter-spacing: normal;
}
.di-back-link { display: inline-block; margin-bottom: 10px; font-size: 12.5px; }
.di-audit-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 9px 2px; border-bottom: 1px solid var(--line);
}
.di-audit-row:last-child { border-bottom: none; }
.di-audit-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.di-audit-btn-tick, .di-audit-btn-cross, .di-audit-btn-remove {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--line);
  background: var(--panel); cursor: pointer; color: var(--ink-soft);
}
.di-audit-btn-tick.is-active { background: var(--green-bg); border-color: var(--green); color: var(--green); }
.di-audit-btn-cross.is-active { background: var(--red-bg); border-color: var(--red); color: var(--red); }
.di-audit-btn-remove { border: none; background: none; color: var(--ink-soft); width: 24px; height: 24px; }
.di-audit-btn-remove:hover { color: var(--red); }
@media (max-width: 760px) {
  .di-root { flex-direction: column; }
  .di-rail { width: 100%; flex-direction: row; align-items: center; padding: 12px 16px; gap: 16px; }
  .di-rail-footer { display: none; }
  .di-nav { flex-direction: row; flex-wrap: wrap; }
  .di-main { padding: 20px; }
  .di-stats { grid-template-columns: repeat(2, 1fr); }
  .di-rooms-grid { grid-template-columns: 1fr; }
}
`;
