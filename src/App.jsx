import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, collection, query, orderBy, limit } from "firebase/firestore";
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
  Pencil,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
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
  {"code": "", "name": "Temp Bond", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bulk EZ A2", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Curasept Gel", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Gorilla Floss", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Polident retainer tablets", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Piksters", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Super Floss", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Brushy brush", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "15C Scalpel", "brand": "", "category": "Sharps", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Sutures (5.0 glycon)", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Gelatamp", "brand": "", "category": "Surgery", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Micro microbrushes", "brand": "", "category": "Disposables", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Bite Reg material", "brand": "", "category": "Restorative (fillings, crowns, veneers)", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Odontopaste", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Endo post", "brand": "", "category": "Endodontics", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Caries detector", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5},
  {"code": "", "name": "Diamond polishing paste", "brand": "", "category": "Others", "supplier": "", "unitCost": 0.0, "par": 5}
];

/* 17 treatment rooms plus the two shared stock locations. Edit freely. */
// Rooms that physically exist but can't be used. They're blocked out on the
// floor map and left out of everything else (audits, flags, trends).
const UNUSABLE_ROOMS = ["Room 10"];
const ROOMS = [
  ...Array.from({ length: 18 }, (_, i) => `Room ${i + 1}`).filter((r) => !UNUSABLE_ROOMS.includes(r)),
  "Sterilisation",
  "Lab",
];

// Colours a DA can pick for their room.
const ROOM_COLORS = [
  { id: "coral", label: "Coral", hex: "#E76F51" },
  { id: "red", label: "Red", hex: "#D64545" },
  { id: "crimson", label: "Crimson", hex: "#A4243B" },
  { id: "orange", label: "Orange", hex: "#F29E4C" },
  { id: "amber", label: "Amber", hex: "#E8A317" },
  { id: "yellow", label: "Yellow", hex: "#F2D45C" },
  { id: "lime", label: "Lime", hex: "#B5CC4A" },
  { id: "green", label: "Green", hex: "#5BAA6E" },
  { id: "forest", label: "Forest", hex: "#2F7D4F" },
  { id: "mint", label: "Mint", hex: "#8FD6B0" },
  { id: "teal", label: "Teal", hex: "#2A9D8F" },
  { id: "cyan", label: "Cyan", hex: "#3CBFD9" },
  { id: "sky", label: "Sky", hex: "#7CB9F0" },
  { id: "blue", label: "Blue", hex: "#4A90D9" },
  { id: "navy", label: "Navy", hex: "#2F4B8A" },
  { id: "indigo", label: "Indigo", hex: "#5B5BD6" },
  { id: "purple", label: "Purple", hex: "#8E6BBF" },
  { id: "violet", label: "Violet", hex: "#B18AE0" },
  { id: "magenta", label: "Magenta", hex: "#C2409F" },
  { id: "pink", label: "Pink", hex: "#E58CAF" },
  { id: "rose", label: "Rose", hex: "#F4A6B8" },
  { id: "brown", label: "Brown", hex: "#8B5E3C" },
  { id: "tan", label: "Tan", hex: "#C9A27A" },
  { id: "slate", label: "Slate", hex: "#6B7A8F" },
];
const NO_COLOR_HEX = "#9A968C";

// The endo trolley in the Lab: two trays, each a 6 x 2 grid of file-size
// sections. Section ids come from tray + position, so renaming a section
// later never loses its saved status. Replace the placeholder names below
// with the real file sizes, left to right, top row first.
const ENDO_TROLLEY = [
  {
    id: "tray-a",
    name: "0.04 taper",
    rowLabels: ["25mm", "29mm"],
    sections: [
      "17.04", "20.04", "25.04", "30.04", "35.04", "40.04",
      "17.04", "20.04", "25.04", "30.04", "35.04", "40.04",
    ],
  },
  {
    id: "tray-b",
    name: "0.06 taper",
    rowLabels: ["25mm", "21mm"],
    sections: [
      "17.06", "20.06", "25.06", "30.06", "35.06", "40.06/45.06",
      "17.06", "20.06", "25.06", "30.06", "35.06", "40.06/45.06",
    ],
  },
];
const ENDO_STATUSES = [
  { value: "full", label: "Full", color: "var(--green)", bg: "var(--green-bg)" },
  { value: "low", label: "Low", color: "var(--amber)", bg: "var(--amber-bg)" },
  { value: "out", label: "Out", color: "var(--red)", bg: "var(--red-bg)" },
];
const endoSectionId = (trayId, idx) => `${trayId}-${idx}`;
// Human-readable name for a section id, e.g. "0.04 taper · 25".
const endoSectionLabel = (sid) => {
  for (const tray of ENDO_TROLLEY) {
    const idx = tray.sections.findIndex((_, i) => endoSectionId(tray.id, i) === sid);
    if (idx !== -1) return `${tray.name} · ${tray.rowLabels[Math.floor(idx / 6)]} · ${tray.sections[idx]}`;
  }
  return sid;
};
const ENDO_PREFIX = "endo:";

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
const MY_NAME_KEY = "dental-inv-my-name-v1"; // personal (per device), not shared

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

// A short, synthesized double-beep for new urgent alerts -- no audio file
// needed. Browsers can block audio before the user has interacted with the
// page at all; this fails silently in that case rather than throwing, since
// a missing beep shouldn't stop the banner itself from showing.
function playAlertBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    [0, 0.18].forEach((delay) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.16);
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.18);
    });
  } catch (e) {}
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
      status: "in_stock",
      statusUpdatedAt: null,
      statusUpdatedBy: "",
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
    // Overall clinic-level supply status -- separate from room flags (which
    // are "is this missing from THIS room right now") and Central Stock
    // (real counts vs threshold). This answers "can we even get more of
    // this at all," set deliberately by whoever's ordering, not per-room.
    status: "in_stock", // "in_stock" | "low" | "out" | "backorder"
    statusUpdatedAt: null,
    statusUpdatedBy: "",
    ...item,
  };
}

const ITEM_STATUSES = [
  { value: "in_stock", label: "In stock", color: "var(--green)", bg: "var(--green-bg)" },
  { value: "backorder", label: "On backorder", color: "var(--clay)", bg: "var(--paper)" },
];
const itemStatusMeta = (status) => ITEM_STATUSES.find((s) => s.value === status) || ITEM_STATUSES[0];

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

// Which items get flagged low the most, optionally scoped to one room (or
// every room). This is the same "steri flags" ranking generalised -- any
// room can be selected, not just Sterilisation.
function itemDepletionRanking(items, history, room) {
  const flags = history.filter((h) => h.action === "flagged" && (room === "All rooms" || h.room === room));
  const counts = {};
  flags.forEach((h) => {
    counts[h.itemId] = (counts[h.itemId] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([itemId, count]) => {
      const item = items.find((i) => i.id === itemId);
      return item ? { item, count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// How often each audit instrument/room item has been marked missing.
// Counts one per "marked missing" action (instrument_missing events).
function instrumentMissingRanking(history, room) {
  const counts = {};
  history
    .filter((h) => h.action === "instrument_missing" && (room === "All rooms" || h.room === room))
    .forEach((h) => {
      const key = h.instrumentName || h.instrumentId;
      counts[key] = (counts[key] || 0) + 1;
    });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Which endo trolley files get marked Low or Out most often. Each time a
// section changes to Low or Out counts once (endo_low events).
function endoRunOutRanking(history) {
  const byId = {};
  history
    .filter((h) => h.action === "endo_low")
    .forEach((h) => {
      const e = (byId[h.sectionId] = byId[h.sectionId] || { id: h.sectionId, low: 0, out: 0, fallback: h.sectionName });
      if (h.level === "out") e.out += 1;
      else e.low += 1;
    });
  return Object.values(byId)
    .map((e) => {
      const label = endoSectionLabel(e.id);
      return { name: label === e.id && e.fallback ? e.fallback : label, low: e.low, out: e.out, total: e.low + e.out };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);
}

// Which rooms raise the most flags overall, regardless of item.
function roomDemandRanking(history) {
  const flags = history.filter((h) => h.action === "flagged");
  const counts = {};
  flags.forEach((h) => {
    counts[h.room] = (counts[h.room] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([room, count]) => ({ room, count }))
    .sort((a, b) => b.count - a.count);
}

// There's no real quantity data (that's exactly why Central Stock was
// retired), so this can't measure true waste. What it CAN measure
// honestly: for a given item, does one room need it noticeably more often
// than the clinic average for that same item. A genuine, defensible
// signal worth investigating -- not a verdict on why.
// Weekly totals of flags raised vs resolved -- answers "is this getting
// better or worse over time," which nothing else on Trends does. Everything
// else here is a snapshot of right now; this is the only one that shows
// direction. A rising "Resolved" line tracking close behind "Flagged" means
// the team is keeping pace; a widening gap means things are falling behind.
function weeklyFlagTrend(history) {
  const events = history.filter((h) => h.action === "flagged" || h.action === "resolved");
  if (events.length === 0) return [];

  const WEEK_MS = 7 * 86400000;
  const minDate = Math.min(...events.map((e) => new Date(e.date).getTime()));
  const buckets = {};

  events.forEach((e) => {
    const t = new Date(e.date).getTime();
    const weekIndex = Math.floor((t - minDate) / WEEK_MS);
    const bucketStart = new Date(minDate + weekIndex * WEEK_MS);
    const key = bucketStart.toISOString().slice(0, 10);
    if (!buckets[key]) buckets[key] = { flagged: 0, resolved: 0, weekStart: bucketStart };
    if (e.action === "flagged") buckets[key].flagged += 1;
    else buckets[key].resolved += 1;
  });

  return Object.values(buckets)
    .sort((a, b) => a.weekStart - b.weekStart)
    .map((b) => ({
      label: b.weekStart.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
      flagged: b.flagged,
      resolved: b.resolved,
    }));
}

function overconsumptionOutliers(items, history) {
  const flags = history.filter((h) => h.action === "flagged");
  const byItem = {};
  flags.forEach((h) => {
    (byItem[h.itemId] = byItem[h.itemId] || []).push(h);
  });

  const results = [];
  Object.entries(byItem).forEach(([itemId, events]) => {
    const byRoom = {};
    events.forEach((h) => {
      (byRoom[h.room] = byRoom[h.room] || []).push(h);
    });

    const roomGaps = {};
    Object.entries(byRoom).forEach(([room, roomEvents]) => {
      if (roomEvents.length < 2) return;
      const sorted = [...roomEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
      const spanDays = (new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / 86400000;
      roomGaps[room] = spanDays / (sorted.length - 1);
    });

    const roomsWithGaps = Object.keys(roomGaps);
    if (roomsWithGaps.length < 2) return; // need at least 2 rooms to compare fairly

    const gapValues = Object.values(roomGaps);
    const clinicAvgGap = gapValues.reduce((a, b) => a + b, 0) / gapValues.length;

    roomsWithGaps.forEach((room) => {
      const gap = roomGaps[room];
      const ratio = clinicAvgGap / gap; // > 1 means this room needs it MORE often than average
      if (ratio >= 1.5) {
        const item = items.find((i) => i.id === itemId);
        if (item) results.push({ item, room, gap, clinicAvgGap, ratio });
      }
    });
  });

  return results.sort((a, b) => b.ratio - a.ratio).slice(0, 10);
}

function formatDuration(ms) {
  const hours = ms / 3600000;
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60000))}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

// Pairs every "flagged" event with the "resolved" event that closed it
// (per item+room, matched chronologically), then reports the median time
// between them -- clinic-wide and broken down by room. Median rather than
// average, since one flag left open for a week shouldn't distort a number
// that's otherwise mostly fast, everyday restocks.
function computeResolutionStats(history) {
  const relevant = history.filter((h) => h.action === "flagged" || h.action === "resolved");
  const byKey = {};
  relevant.forEach((h) => {
    const key = `${h.itemId}::${h.room}`;
    (byKey[key] = byKey[key] || []).push(h);
  });

  const durationsMs = [];
  const byRoomDurations = {};
  Object.values(byKey).forEach((events) => {
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    let openAt = null;
    sorted.forEach((e) => {
      if (e.action === "flagged") {
        openAt = e.date;
      } else if (e.action === "resolved" && openAt) {
        const ms = new Date(e.date) - new Date(openAt);
        durationsMs.push(ms);
        (byRoomDurations[e.room] = byRoomDurations[e.room] || []).push(ms);
        openAt = null;
      }
    });
  });

  const median = (arr) => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const overallMedian = median(durationsMs);
  const roomMedians = Object.entries(byRoomDurations)
    .map(([room, durations]) => ({ room, medianMs: median(durations), count: durations.length }))
    .sort((a, b) => b.medianMs - a.medianMs);

  return { overallMedian, count: durationsMs.length, roomMedians };
}

// The Dashboard's suggested to-do widget, in the priority order a DA asked
// for directly: urgent alerts first, then missing items, then low stock,
// then overdue audits last. Only sections with something to actually do
// are included, so the widget can just not render at all when there's
// nothing pending.
function buildDashboardTodos({ openAlerts, missingAuditItems, activeFlags, itemsById, roomAudits, setView }) {
  const sections = [];

  if (openAlerts.length > 0) {
    sections.push({
      key: "urgent",
      label: "Urgent alerts",
      icon: Bell,
      color: "var(--red)",
      items: openAlerts.map((a) => `${a.room}: ${a.message}`),
    });
  }

  if (missingAuditItems.length > 0) {
    sections.push({
      key: "missing",
      label: "Missing items to restore",
      icon: X,
      color: "var(--red)",
      items: missingAuditItems.map((m) => `${m.name} — ${m.room}`),
    });
  }

  if (activeFlags.length > 0) {
    const lowStockItems = activeFlags
      .map((f) => {
        const item = itemsById[f.itemId];
        return item ? `${item.name} — ${f.room}` : null;
      })
      .filter(Boolean);
    if (lowStockItems.length > 0) {
      sections.push({
        key: "lowstock",
        label: "Low stock to resolve",
        icon: Flag,
        color: "var(--amber)",
        items: lowStockItems,
      });
    }
  }

  const cutoff = Date.now() - 3 * 86400000;
  const overdueAudits = roomAudits.filter(({ audit }) => !audit || new Date(audit.date).getTime() < cutoff);
  if (overdueAudits.length > 0) {
    sections.push({
      key: "audits",
      label: "Audits overdue (3+ days)",
      icon: ClipboardList,
      color: "var(--clay)",
      onClickSection: () => setView("rooms"),
      items: overdueAudits.map(({ room, audit }) =>
        audit ? `${room} — last audited ${timeAgo(audit.date)}` : `${room} — never audited`
      ),
    });
  }

  return sections;
}

// A small, dismissible floating widget -- collapsed by default to a badge
// showing the total count, expanding to the prioritised list on tap.
function DashboardTodoWidget({ sections }) {
  const [open, setOpen] = useState(false);
  const total = sections.reduce((sum, s) => sum + s.items.length, 0);
  if (total === 0) return null;

  const ITEM_CAP = 4;

  return (
    <div className="di-todo-widget">
      {open && (
        <div className="di-todo-panel">
          <div className="di-todo-panel-head">
            <span>Suggested next steps</span>
            <button className="di-todo-close" onClick={() => setOpen(false)}>
              <X size={15} />
            </button>
          </div>
          <div className="di-todo-panel-body">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="di-todo-section">
                  <div
                    className={`di-todo-section-head ${s.onClickSection ? "is-clickable" : ""}`}
                    onClick={s.onClickSection}
                  >
                    <Icon size={13} style={{ color: s.color }} />
                    <span>{s.label}</span>
                    <span className="di-todo-count">{s.items.length}</span>
                  </div>
                  <ul className="di-todo-items">
                    {s.items.slice(0, ITEM_CAP).map((text, idx) => (
                      <li key={idx}>{text}</li>
                    ))}
                  </ul>
                  {s.items.length > ITEM_CAP && (
                    <div className="di-todo-more">+{s.items.length - ITEM_CAP} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <button className="di-todo-bubble" onClick={() => setOpen(!open)}>
        <ClipboardList size={18} />
        <span className="di-todo-badge">{total}</span>
      </button>
    </div>
  );
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
  const [urgentAlerts, setUrgentAlerts] = useState(null); // [{id, room, message, staff, status, createdAt, resolvedBy, resolvedAt}]
  const [auditChecklist, setAuditChecklist] = useState(null); // [itemId, ...] -- shared base list, same for every treatment room
  const [roomCustomAuditItems, setRoomCustomAuditItems] = useState(null); // { [room]: [{id, text, status, updatedAt, updatedBy}] }
  const [roomExclusions, setRoomExclusions] = useState({}); // { [room]: [checklistItemId, ...] } -- items this room doesn't have
  const [endoStatus, setEndoStatus] = useState({}); // { [sectionId]: { status, updatedAt, updatedBy } }
  const [roomSettings, setRoomSettings] = useState({}); // { [room]: { color, name } }
  const [roomAuditStatus, setRoomAuditStatus] = useState(null); // { [room]: { [checklistItemId]: {status, updatedAt, updatedBy} } }
  const [auditRoom, setAuditRoom] = useState(null); // which room's audit page is open right now
  const [myRoom, setMyRoomState] = useState(null);
  const [myName, setMyNameState] = useState(null);
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
    // These two used to be one shared document each, holding every room's
    // data together, rewritten whole on every single edit. With 18+ rooms
    // potentially editing close together, two devices could each build
    // their update from a slightly-stale copy of that shared blob, and
    // whichever wrote last would silently clobber the other's change --
    // which is exactly why personalised items looked like they "only saved
    // locally." Real per-record documents (like history/orders/feedback
    // already use) make that structurally impossible: different rooms, or
    // different items, can never collide, because they're never the same
    // document.
    const roomCustomAuditItemsQuery = query(collection(db, "roomCustomAuditItems"));
    const roomAuditStatusQuery = query(collection(db, "roomAuditStatus"));
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
    const urgentAlertsQuery = query(collection(db, "urgentAlerts"), orderBy("createdAt", "desc"));

    let itemsLoaded = false;
    let flagsLoaded = false;
    let historyLoaded = false;
    let ordersLoaded = false;
    let feedbackLoaded = false;
    let urgentAlertsLoaded = false;
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
        urgentAlertsLoaded &&
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

    const unsubUrgentAlerts = onSnapshot(
      urgentAlertsQuery,
      (snap) => {
        setUrgentAlerts(snap.docs.map((d) => d.data()).reverse());
        urgentAlertsLoaded = true;
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
      roomAuditStatusQuery,
      (snap) => {
        const byRoom = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          byRoom[data.room] = byRoom[data.room] || {};
          byRoom[data.room][data.itemId] = {
            status: data.status,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          };
        });
        setRoomAuditStatus(byRoom);
        roomAuditStatusLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    const unsubExclusions = onSnapshot(
      query(collection(db, "roomAuditExclusions")),
      (snap) => {
        const byRoom = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          byRoom[data.room] = Array.isArray(data.excluded) ? data.excluded : [];
        });
        setRoomExclusions(byRoom);
      },
      () => {}
    );

    const unsubEndo = onSnapshot(
      query(collection(db, "endoTrolley")),
      (snap) => {
        const bySection = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          bySection[data.id] = { status: data.status, updatedAt: data.updatedAt, updatedBy: data.updatedBy };
        });
        setEndoStatus(bySection);
      },
      () => {}
    );

    const unsubRoomSettings = onSnapshot(
      query(collection(db, "roomSettings")),
      (snap) => {
        const byRoom = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          byRoom[data.room] = { color: data.color || "", name: data.name || "" };
        });
        setRoomSettings(byRoom);
      },
      () => {}
    );

    const unsubRoomCustomAuditItems = onSnapshot(
      roomCustomAuditItemsQuery,
      (snap) => {
        const byRoom = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          byRoom[data.room] = byRoom[data.room] || [];
          byRoom[data.room].push({
            id: data.id,
            text: data.text,
            status: data.status,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          });
        });
        setRoomCustomAuditItems(byRoom);
        roomCustomAuditItemsLoaded = true;
        maybeStopLoading();
      },
      () => setSaveError("Couldn't reach the database -- check firebase.js is filled in.")
    );

    // "My room" is genuinely local to this one phone, so plain browser
    // storage is the right tool -- no need to involve the shared database.
    try {
      setMyRoomState(localStorage.getItem(MY_ROOM_KEY));
      setMyNameState(localStorage.getItem(MY_NAME_KEY));
    } catch (e) {}

    return () => {
      unsubItems();
      unsubFlags();
      unsubHistory();
      unsubOrders();
      unsubFeedback();
      unsubUrgentAlerts();
      unsubAuditChecklist();
      unsubRoomCustomAuditItems();
      unsubRoomSettings();
      unsubEndo();
      unsubExclusions();
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

  // A live, urgent, clinic-wide alert -- shows as a banner on every device
  // that has the app open, on every page, the instant it's sent. Separate
  // collection so it never touches stock, flags, or audits.
  const sendUrgentAlert = useCallback(({ room, message, staff }) => {
    const entry = {
      id: `urg_${Date.now()}_${Math.round(Math.random() * 9999)}`,
      room,
      message,
      staff: staff || "",
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(collection(db, "urgentAlerts"), entry.id), entry).catch(() =>
      setSaveError("Couldn't send -- check your connection.")
    );
  }, []);

  const resolveUrgentAlert = useCallback((id, staff) => {
    updateDoc(doc(db, "urgentAlerts", id), {
      status: "resolved",
      resolvedBy: staff || "",
      resolvedAt: new Date().toISOString(),
    }).catch(() => setSaveError("Couldn't save -- check your connection."));
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
  // One document per room+item combination -- setting Room 4's status for
  // "Web cam" can never collide with Room 9 setting its own status for a
  // different item, because they're never the same document.
  const setRoomAuditItemStatus = useCallback((room, itemId, status, staff) => {
    const now = new Date().toISOString();
    // Count every time someone marks an instrument missing (frequency
    // tracker on Trends). No staff name is stored on this event on purpose.
    if (status === "attention") {
      const ci = ((auditChecklist && auditChecklist["Room Items"]) || []).find((i) => i.id === itemId);
      const evt = {
        id: `h_${Date.now()}_${Math.round(Math.random() * 9999)}`,
        itemId: null,
        instrumentId: itemId,
        instrumentName: ci ? ci.name : itemId,
        room,
        action: "instrument_missing",
        date: now,
      };
      setDoc(doc(collection(db, "flagHistoryEvents"), evt.id), evt).catch(() => {});
    }
    setDoc(doc(db, "roomAuditStatus", `${room}::${itemId}`), {
      room,
      itemId,
      status,
      updatedAt: now,
      updatedBy: staff || "",
    }).catch(() => setSaveError("Couldn't save -- check your connection."));
  }, [auditChecklist]);

  // Removing a checklist item also wipes any per-room status recorded
  // against it, everywhere -- so it can never linger as an orphaned
  // "missing" entry with no name to show, the way earlier test data did.
  // Each room's status lives in its own document now, so this is just a
  // direct delete per room rather than a read-modify-write of anything.
  const removeChecklistItem = useCallback(
    (section, itemId) => {
      const current = auditChecklist[section] || [];
      persistAuditChecklist({ ...auditChecklist, [section]: current.filter((i) => i.id !== itemId) });
      ROOMS.forEach((room) => {
        deleteDoc(doc(db, "roomAuditStatus", `${room}::${itemId}`)).catch(() => {});
      });
    },
    [auditChecklist, persistAuditChecklist]
  );

  // ---- room auditing: personalised free-text items, per room, permanent --
  // One document per custom item -- adding an item to Room 6 can never
  // collide with someone adding a different item to Room 11 at the same
  // moment, because they're always separate documents.
  const addCustomAuditItem = useCallback((room, text) => {
    const id = `custom_${Date.now()}_${Math.round(Math.random() * 9999)}`;
    setDoc(doc(db, "roomCustomAuditItems", id), {
      id,
      room,
      text,
      status: null, // null | "ok" | "attention"
      updatedAt: null,
      updatedBy: "",
    }).catch(() => setSaveError("Couldn't save -- check your connection."));
  }, []);

  const removeCustomAuditItem = useCallback((room, itemId) => {
    deleteDoc(doc(db, "roomCustomAuditItems", itemId)).catch(() =>
      setSaveError("Couldn't save -- check your connection.")
    );
  }, []);

  const endoStatusRef = useRef(endoStatus);
  endoStatusRef.current = endoStatus;
  // Per-room audit list: items this room simply doesn't have by default.
  // Excluded items disappear from that room's audit (and from "missing"), and
  // any status already recorded for them in that room is cleared.
  const saveRoomExclusions = useCallback(
    async (room, excludedIds) => {
      try {
        await setDoc(doc(db, "roomAuditExclusions", room), {
          room,
          excluded: excludedIds,
          updatedAt: new Date().toISOString(),
        });
        const before = new Set(roomExclusions[room] || []);
        excludedIds
          .filter((id) => !before.has(id))
          .forEach((id) => {
            deleteDoc(doc(db, "roomAuditStatus", `${room}::${id}`)).catch(() => {});
          });
        return { ok: true };
      } catch (e) {
        const denied = e && e.code === "permission-denied";
        setSaveError(
          denied
            ? "Room audit lists need the updated Firestore rules -- publish firestore.rules in the Firebase console."
            : "Couldn't save -- check your connection."
        );
        return { ok: false, denied };
      }
    },
    [roomExclusions]
  );

  const setEndoSectionStatus = useCallback(async (sectionId, status, staff) => {
    const prev = (endoStatusRef.current[sectionId] || {}).status || "full";
    if ((status === "low" || status === "out") && status !== prev) {
      const evt = {
        id: `h_${Date.now()}_${Math.round(Math.random() * 9999)}`,
        itemId: null,
        room: "Lab",
        action: "endo_low",
        sectionId,
        sectionName: endoSectionLabel(sectionId),
        level: status,
        date: new Date().toISOString(),
      };
      setDoc(doc(collection(db, "flagHistoryEvents"), evt.id), evt).catch(() => {});
    }
    try {
      await setDoc(doc(db, "endoTrolley", sectionId), {
        id: sectionId,
        status,
        updatedAt: new Date().toISOString(),
        updatedBy: staff || "",
      });
      return { ok: true };
    } catch (e) {
      const denied = e && e.code === "permission-denied";
      setSaveError(
        denied
          ? "Endo trolley needs the updated Firestore rules -- publish firestore.rules in the Firebase console."
          : "Couldn't save -- check your connection."
      );
      return { ok: false, denied };
    }
  }, []);

  // A room's colour and/or display name (e.g. "Jess & Richard"). One
  // document per room, merged, so changing the colour never wipes the name.
  const setRoomSetting = useCallback(async (room, patch) => {
    try {
      await setDoc(doc(db, "roomSettings", room), { room, ...patch, updatedAt: new Date().toISOString() }, { merge: true });
      return { ok: true };
    } catch (e) {
      const denied = e && e.code === "permission-denied";
      setSaveError(
        denied
          ? "Room details need the updated Firestore rules -- publish firestore.rules in the Firebase console."
          : "Couldn't save -- check your connection."
      );
      return { ok: false, denied };
    }
  }, []);

  const setCustomAuditItemStatus = useCallback((room, itemId, status, staff, itemText) => {
    const now = new Date().toISOString();
    if (status === "attention") {
      const evt = {
        id: `h_${Date.now()}_${Math.round(Math.random() * 9999)}`,
        itemId: null,
        instrumentId: itemId,
        instrumentName: itemText || "Personalised item",
        room,
        action: "instrument_missing",
        date: now,
      };
      setDoc(doc(collection(db, "flagHistoryEvents"), evt.id), evt).catch(() => {});
    }
    updateDoc(doc(db, "roomCustomAuditItems", itemId), {
      status,
      updatedAt: now,
      updatedBy: staff || "",
    }).catch(() => setSaveError("Couldn't save -- check your connection."));
  }, []);

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

  const setMyName = useCallback(async (name) => {
    setMyNameState(name);
    try {
      localStorage.setItem(MY_NAME_KEY, name);
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

  // Overall clinic-level supply status, set deliberately by whoever's
  // ordering -- separate from room flags and Central Stock. This never
  // touches activeFlags or currentCount, just the item's own status field.
  const setItemStatus = useCallback(
    (itemId, status, staff) => {
      const now = new Date().toISOString();
      persistItems(
        items.map((i) => (i.id === itemId ? { ...i, status, statusUpdatedAt: now, statusUpdatedBy: staff || "" } : i))
      );
    },
    [items, persistItems]
  );

  // A real, deliberate way to remove an item from the catalogue entirely --
  // for cleaning up mistakes (leftover test items, duplicates) that
  // "Reload catalogue" can no longer touch now that reload never deletes.
  const removeItem = useCallback(
    (itemId) => {
      persistItems(items.filter((i) => i.id !== itemId));
    },
    [items, persistItems]
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
  // Catalogue info (name, category, cost, etc.) always comes from the code.
  // Live data that only exists because someone used the app -- Central
  // Stock counts, thresholds, and now item status -- is preserved for any
  // item that already existed, and only defaults to the code's values for
  // items that are genuinely new. This is what actually makes "Reload
  // catalogue" safe to use routinely instead of a once-off risky action.
  const reloadCatalogue = useCallback(async () => {
    const fresh = seedItems();
    const freshIds = new Set(fresh.map((i) => i.id));
    const existingById = {};
    items.forEach((i) => {
      existingById[i.id] = i;
    });
    const merged = fresh.map((newItem) => {
      const existing = existingById[newItem.id];
      if (!existing) return newItem;
      return {
        ...newItem,
        tracked: existing.tracked,
        lowThreshold: existing.lowThreshold,
        currentCount: existing.currentCount,
        lastCountedAt: existing.lastCountedAt,
        lastCountedBy: existing.lastCountedBy,
        status: existing.status,
        statusUpdatedAt: existing.statusUpdatedAt,
        statusUpdatedBy: existing.statusUpdatedBy,
      };
    });
    // Anything that exists live but was never added to SEED_ITEMS -- e.g.
    // an item added straight in the Firebase console -- is kept as-is
    // rather than silently dropped. This makes reload purely additive: it
    // can update/add from the code, but it can never delete something
    // that only exists live.
    const liveOnlyItems = items.filter((i) => !freshIds.has(i.id));
    await persistItems([...merged, ...liveOnlyItems]);
  }, [persistItems, items]);

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

  // Items management has flagged as on backorder -- shown clinic-wide on
  // the Dashboard regardless of room, since it's not a room-level concept.
  const backorderedItems = useMemo(() => (items ? items.filter((i) => i.status === "backorder") : []), [items]);

  // The most recent completed audits, straight from the permanent history
  // log -- every "Finish audit" click writes one of these, so this needs
  // no separate tracking of its own.
  // One entry per treatment room, not per audit event -- shows whether
  // each of the 18 rooms has ever been audited, and if so, only the most
  // recent one, so a room audited five times doesn't crowd out a room
  // that's never been checked at all.
  const roomAudits = useMemo(() => {
    if (!history) return [];
    const treatmentRooms = ROOMS.filter((r) => r !== "Sterilisation" && r !== "Lab");
    const latestByRoom = {};
    history
      .filter((h) => h.action === "audited")
      .forEach((h) => {
        if (!latestByRoom[h.room] || new Date(h.date) > new Date(latestByRoom[h.room].date)) {
          latestByRoom[h.room] = h;
        }
      });
    return treatmentRooms.map((room) => ({ room, audit: latestByRoom[room] || null }));
  }, [history]);

  const openOrders = useMemo(
    () => (orderRequests ? orderRequests.filter((r) => r.status === "open") : []),
    [orderRequests]
  );

  const openAlerts = useMemo(
    () => (urgentAlerts ? urgentAlerts.filter((a) => a.status === "open") : []),
    [urgentAlerts]
  );

  // Play the beep only for alerts that are genuinely new since this device
  // last checked -- never on first load (which would otherwise blast sound
  // for every alert already open when the app starts), and never twice for
  // the same alert.
  const seenAlertIdsRef = useRef(null);
  useEffect(() => {
    if (!urgentAlerts) return;
    const currentIds = new Set(urgentAlerts.filter((a) => a.status === "open").map((a) => a.id));
    if (seenAlertIdsRef.current === null) {
      seenAlertIdsRef.current = currentIds;
      return;
    }
    const hasNew = [...currentIds].some((id) => !seenAlertIdsRef.current.has(id));
    if (hasNew) playAlertBeep();
    seenAlertIdsRef.current = currentIds;
  }, [urgentAlerts]);

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
      if (UNUSABLE_ROOMS.includes(room)) return;
      const excludedHere = new Set(roomExclusions[room] || []);
      Object.entries(statuses || {}).forEach(([itemId, info]) => {
        if (excludedHere.has(itemId)) return;
        // If this item no longer exists on the checklist (removed since
        // this status was set), there's nothing meaningful to show --
        // skip it rather than display a confusing "Unknown item."
        if (info.status === "attention" && nameById[itemId]) {
          results.push({
            type: "checklist",
            itemId,
            room,
            name: nameById[itemId],
            updatedAt: info.updatedAt,
            updatedBy: info.updatedBy,
          });
        }
      });
    });
    Object.entries(roomCustomAuditItems).forEach(([room, list]) => {
      if (UNUSABLE_ROOMS.includes(room)) return;
      (list || []).forEach((c) => {
        if (c.status === "attention") {
          results.push({
            type: "custom",
            itemId: c.id,
            room,
            name: c.text,
            updatedAt: c.updatedAt,
            updatedBy: c.updatedBy,
          });
        }
      });
    });
    return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [roomAuditStatus, roomCustomAuditItems, auditChecklist, roomExclusions]);

  // Endo trolley sections marked Low or Out show up as low-stock flags in the
  // Lab, so they flow into the dashboard, floor map and to-do list like any
  // other low item. Restocking one just sets it back to Full.
  const { endoFlags, endoItemsById } = useMemo(() => {
    const flags = [];
    const itemsMap = {};
    ENDO_TROLLEY.forEach((tray) => {
      tray.sections.forEach((name, idx) => {
        const sid = endoSectionId(tray.id, idx);
        const st = endoStatus[sid];
        if (!st || (st.status !== "low" && st.status !== "out")) return;
        const id = `${ENDO_PREFIX}${sid}`;
        itemsMap[id] = {
          id,
          name: `Endo trolley · ${endoSectionLabel(sid)}`,
          category: `Endo trolley · ${st.status === "out" ? "Out" : "Low"}`,
        };
        flags.push({ itemId: id, room: "Lab", flaggedAt: st.updatedAt, staff: st.updatedBy || "", note: "" });
      });
    });
    return { endoFlags: flags, endoItemsById: itemsMap };
  }, [endoStatus]);

  const flagsWithEndo = useMemo(() => [...(activeFlags || []).filter((f) => !UNUSABLE_ROOMS.includes(f.room)), ...endoFlags], [activeFlags, endoFlags]);
  const itemsByIdWithEndo = useMemo(() => ({ ...itemsById, ...endoItemsById }), [itemsById, endoItemsById]);

  const toggleFlagOrEndo = useCallback(
    (args) => {
      if (args.itemId && args.itemId.startsWith(ENDO_PREFIX)) {
        return setEndoSectionStatus(args.itemId.slice(ENDO_PREFIX.length), "full", args.staff);
      }
      return toggleFlag(args);
    },
    [toggleFlag, setEndoSectionStatus]
  );

  // Blocked-out rooms are invisible everywhere except the floor map.
  const usableFlags = useMemo(
    () => (activeFlags || []).filter((f) => !UNUSABLE_ROOMS.includes(f.room)),
    [activeFlags]
  );
  const usableHistory = useMemo(
    () => (history || []).filter((h) => !UNUSABLE_ROOMS.includes(h.room)),
    [history]
  );

  // One-off tidy-up: clear any audit data still stored against a blocked-out
  // room so nothing lingers as "missing" there.
  useEffect(() => {
    if (loading || !roomAuditStatus || !roomCustomAuditItems) return;
    UNUSABLE_ROOMS.forEach((room) => {
      Object.keys(roomAuditStatus[room] || {}).forEach((itemId) => {
        deleteDoc(doc(db, "roomAuditStatus", `${room}::${itemId}`)).catch(() => {});
      });
      (roomCustomAuditItems[room] || []).forEach((c) => {
        deleteDoc(doc(db, "roomCustomAuditItems", c.id)).catch(() => {});
      });
    });
  }, [loading, roomAuditStatus, roomCustomAuditItems]);

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
    <Shell view={view} setView={setView} saveError={saveError} openAlerts={openAlerts} onResolveAlert={resolveUrgentAlert} myName={myName}>
      {view === "dashboard" && (
        <Dashboard
          items={items}
          itemsById={itemsByIdWithEndo}
          history={usableHistory}
          roomSettings={roomSettings}
          onSetRoomSetting={setRoomSetting}
          onOpenAudit={(room) => {
            setAuditRoom(room);
            setView("audit-room");
          }}
          activeFlags={flagsWithEndo}
          backorderedItems={backorderedItems}
          roomAudits={roomAudits}
          openOrders={openOrders}
          missingAuditItems={missingAuditItems}
          openAlerts={openAlerts}
          roomsAffected={roomsAffected}
          myRoom={myRoom}
          myName={myName}
          setView={setView}
          onToggle={toggleFlagOrEndo}
          onSetItemStatus={setRoomAuditItemStatus}
          onSetCustomStatus={setCustomAuditItemStatus}
          onRebuildFlags={rebuildFlagsFromHistory}
        />
      )}
      {view === "report" && (
        <ReportOrAlert
          items={items}
          activeFlags={usableFlags}
          myRoom={myRoom}
          setMyRoom={setMyRoom}
          myName={myName}
          setMyName={setMyName}
          onToggle={toggleFlag}
          onSendAlert={sendUrgentAlert}
        />
      )}
      {view === "rooms" && (
        <RoomsOverview
          items={itemsByIdWithEndo}
          activeFlags={flagsWithEndo}
          missingAuditItems={missingAuditItems}
          onToggle={toggleFlagOrEndo}
          onOpenAudit={(room) => {
            setAuditRoom(room);
            setView("audit-room");
          }}
        />
      )}
      {view === "endo-trolley" && (
        <EndoTrolley
          endoStatus={endoStatus}
          myName={myName}
          setMyName={setMyName}
          onSetStatus={setEndoSectionStatus}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "audit-room" && (
        <AuditRoom
          room={auditRoom}
          auditChecklist={auditChecklist}
          roomStatus={roomAuditStatus[auditRoom] || {}}
          customItems={roomCustomAuditItems[auditRoom] || []}
          roomExcluded={roomExclusions[auditRoom] || []}
          onSaveExcluded={saveRoomExclusions}
          myRoom={myRoom}
          myName={myName}
          setMyName={setMyName}
          onSetItemStatus={setRoomAuditItemStatus}
          onRemoveChecklistItem={removeChecklistItem}
          onAddCustomItem={addCustomAuditItem}
          onRemoveCustomItem={removeCustomAuditItem}
          onSetCustomStatus={setCustomAuditItemStatus}
          onLogCompleted={logAuditCompleted}
          onBack={() => setView("rooms")}
        />
      )}
      {view === "trends" && (
        <Trends items={items} history={usableHistory} setView={setView} />
      )}
      {view === "catalogue" && (
        <Catalogue
          items={items}
          onReloadCatalogue={reloadCatalogue}
          onSetStatus={setItemStatus}
          onRemoveItem={removeItem}
          myName={myName}
          setMyName={setMyName}
        />
      )}
      {view === "orders" && (
        <OrderRequests
          orderRequests={orderRequests}
          myRoom={myRoom}
          onSubmit={submitOrderRequest}
          onFulfill={fulfillOrderRequest}
        />
      )}
      {view === "feedback" && (
        <Feedback feedback={feedback} onSubmit={submitFeedback} onReview={markFeedbackReviewed} myName={myName} setMyName={setMyName} />
      )}
    </Shell>
  );
}

/* ============================================================================
   SHELL / NAV
============================================================================ */
function Shell({ view, setView, saveError, openAlerts, onResolveAlert, myName, children }) {
  const todayNav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "report", label: "Report / alert", icon: Flag },
    { id: "rooms", label: "By room", icon: Building2 },
  ];
  const moreNav = [
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "catalogue", label: "Catalogue", icon: BookOpen },
    { id: "orders", label: "Order Requests", icon: ShoppingCart },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];
  // Auto-expand "More" if the current page lives there, so navigating within
  // that group doesn't require re-opening it every time.
  const [moreOpen, setMoreOpen] = useState(() => moreNav.some((n) => n.id === view));

  return (
    <div className="di-root">
      <style>{CSS}</style>
      {openAlerts && openAlerts.length > 0 && (
        <div className="di-urgent-stack">
          {openAlerts.map((a) => (
            <div key={a.id} className="di-urgent-banner">
              <Bell size={18} className="di-urgent-banner-icon" />
              <div className="di-urgent-banner-main">
                <div className="di-urgent-banner-title">{a.room} needs help</div>
                <div className="di-urgent-banner-message">
                  {a.message}
                  {a.staff ? ` — ${a.staff}` : ""}
                </div>
              </div>
              <button className="di-urgent-banner-btn" onClick={() => onResolveAlert(a.id, myName || "")}>
                Mark handled
              </button>
            </div>
          ))}
        </div>
      )}
      <aside className="di-rail">
        <div className="di-brand">
          <div className="di-brand-mark">DB</div>
          <div className="di-brand-text">
            <div className="di-brand-name">Dental Boutique</div>
            <div className="di-brand-sub">Stock alerts · beta</div>
          </div>
        </div>
        <nav className="di-nav">
          <div className="di-nav-label">Today</div>
          {todayNav.map((n) => {
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

          <button className="di-nav-more-toggle" onClick={() => setMoreOpen(!moreOpen)}>
            {moreOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <span>More</span>
          </button>
          {moreOpen &&
            moreNav.map((n) => {
              const Icon = n.icon;
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  className={`di-nav-btn di-nav-btn-sub ${active ? "is-active" : ""}`}
                  onClick={() => setView(n.id)}
                >
                  <Icon size={15} strokeWidth={2} />
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


/* ============================================================================
   CLINIC FLOOR MAP + ROOM SHEET + LOST & FOUND
============================================================================ */
const TREATMENT_ROOMS = ROOMS.filter((r) => r !== "Sterilisation" && r !== "Lab");

function ToothIcon({ color, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.2 2.8c-2.3 0-4.2 1.8-4.2 4.6 0 2.1.8 3.4 1.4 5.2.6 1.9.6 4.9 1.7 7 .6 1.1 1.9 1.1 2.3-.1.4-1.1.6-3.1 1.3-3.9.4-.5 1-.5 1.4 0 .7.8.9 2.8 1.3 3.9.4 1.2 1.7 1.2 2.3.1 1.1-2.1 1.1-5.1 1.7-7 .6-1.8 1.4-3.1 1.4-5.2 0-2.8-1.9-4.6-4.2-4.6-1.5 0-2.4.7-3.8.7s-2.3-.7-3.8-.7z"
        fill={color}
        stroke="rgba(0,0,0,.35)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const colorHexFor = (roomSettings, room) => {
  const id = roomSettings && roomSettings[room] ? roomSettings[room].color : "";
  const found = ROOM_COLORS.find((c) => c.id === id);
  return found ? found.hex : "";
};

// One tile per room, coloured by what's going on in it right now. Tapping a
// tile opens that room's full picture (RoomSheet below).
function FloorMap({ flagsByRoom, missingByRoom, alertRooms, roomAudits, myRoom, roomSettings, onOpenRoom }) {
  const auditByRoom = {};
  roomAudits.forEach(({ room, audit }) => (auditByRoom[room] = audit));

  const stateFor = (room) => {
    if (alertRooms.has(room)) return "urgent";
    if ((flagsByRoom[room] || 0) > 0) return "flag";
    if ((missingByRoom[room] || 0) > 0) return "missing";
    return "ok";
  };

  // variant: "room" (compact U tile), "steri" (big centre tile), "lab" (wide strip)
  const renderTile = (room, variant, area) => {
    const st = stateFor(room);
    const flags = flagsByRoom[room] || 0;
    const missing = missingByRoom[room] || 0;
    const label = room.startsWith("Room ") ? room.slice(5) : room;
    return (
      <button
        key={room}
        className={`di-tile is-${st} is-${variant}${myRoom === room ? " is-mine" : ""}`}
        style={area}
        onClick={() => onOpenRoom(room)}
        aria-label={`${room}: ${st === "ok" ? "all good" : st}`}
      >
        {colorHexFor(roomSettings, room) && (
          <span className="di-tile-tooth">
            <ToothIcon color={colorHexFor(roomSettings, room)} size={15} />
          </span>
        )}
        <span className="di-tile-label">{label}</span>
        <span className="di-tile-badges">
          {st === "urgent" && (
            <span className="di-tile-badge di-tile-badge-urgent">
              <AlertTriangle size={11} />
            </span>
          )}
          {flags > 0 && <span className="di-tile-badge di-tile-badge-flag">{flags}</span>}
          {missing > 0 && <span className="di-tile-badge di-tile-badge-missing">{missing}</span>}
          {st === "ok" && variant !== "room" && <CircleCheck size={16} className="di-tile-ok" />}
        </span>
        {myRoom === room && <span className="di-tile-here">you're here</span>}
      </button>
    );
  };

  // The U, to match the real floor: Room 1 starts at the top of the left
  // arm and runs down (Rooms 1-5), along the bottom (Rooms 6-10), then up
  // the right arm (Rooms 11-18, with 11 at the bottom corner). The arms hold
  // different numbers of rooms, so both are drawn on a 35-unit-tall grid:
  // each left room spans 7 units, each right room spans 5, which keeps the
  // two arms exactly the same length.
  const uPlacements = {};
  for (let i = 1; i <= 5; i++) uPlacements[i] = { gridColumn: 1, gridRow: `${(i - 1) * 7 + 1} / span 7` };
  for (let i = 6; i <= 10; i++) uPlacements[i] = { gridColumn: i - 5, gridRow: 36 };
  uPlacements[11] = { gridColumn: 6, gridRow: 36 };
  for (let i = 12; i <= 18; i++) uPlacements[i] = { gridColumn: 6, gridRow: `${(18 - i) * 5 + 1} / span 5` };

  return (
    <div className="di-panel">
      <div className="di-panel-head">
        <h3>Clinic floor</h3>
        <span className="di-hint-inline">Tap a room</span>
      </div>
      <div className="di-u">
        {renderTile("Sterilisation", "steri", { gridColumn: "2 / 6", gridRow: "14 / 36" })}
        {TREATMENT_ROOMS.map((r) => renderTile(r, "room", uPlacements[parseInt(r.slice(5), 10)]))}
        {UNUSABLE_ROOMS.map((r) => (
          <div
            key={r}
            className="di-tile is-room is-blocked"
            style={uPlacements[parseInt(r.slice(5), 10)]}
            aria-label={`${r}: not a usable room`}
            title="Not a usable room"
          >
            <span className="di-tile-label">{r.slice(5)}</span>
          </div>
        ))}
        {renderTile("Lab", "lab", { gridColumn: "2 / 6", gridRow: 38 })}
      </div>
      <div className="di-legend">
        <span><i className="di-legend-dot" style={{ background: "var(--green)" }} /> All good</span>
        <span><i className="di-legend-dot" style={{ background: "var(--red)" }} /> Low stock</span>
        <span><i className="di-legend-dot" style={{ background: "var(--clay)" }} /> Item missing</span>
        <span><i className="di-legend-dot" style={{ background: "#B3261E" }} /> Urgent alert</span>
      </div>
    </div>
  );
}

// Everything about one room, in a sheet that slides up over the dashboard.
function RoomSheet({
  room,
  items,
  itemsById,
  history,
  activeFlags,
  missingAuditItems,
  openAlerts,
  roomAudits,
  myName,
  roomSettings,
  onSetRoomSetting,
  onToggle,
  onResolveMissing,
  onOpenAudit,
  onOpenEndo,
  onClose,
}) {
  const settings = (roomSettings && roomSettings[room]) || { color: "", name: "" };
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const startEdit = () => {
    setDraftName(settings.name || "");
    setDraftColor(settings.color || "");
    setSaveMsg("");
    setEditing(true);
  };
  const saveDetails = async () => {
    setSaving(true);
    setSaveMsg("");
    const res = await onSetRoomSetting(room, { name: draftName.trim(), color: draftColor });
    setSaving(false);
    if (res && res.ok === false) {
      setSaveMsg(
        res.denied
          ? "Couldn't save: the Firestore rules need updating to include roomSettings (publish firestore.rules in the Firebase console)."
          : "Couldn't save -- check your connection and try again."
      );
    } else {
      setEditing(false);
    }
  };
  // Colours already chosen by other rooms are blocked out.
  const takenColors = {};
  Object.entries(roomSettings || {}).forEach(([r, v]) => {
    if (r !== room && v && v.color && !UNUSABLE_ROOMS.includes(r)) takenColors[v.color] = r;
  });
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const flags = activeFlags
    .filter((f) => f.room === room && itemsById[f.itemId])
    .sort((a, b) => new Date(a.flaggedAt) - new Date(b.flaggedAt));
  const missing = missingAuditItems.filter((m) => m.room === room);
  const alerts = openAlerts.filter((a) => a.room === room);
  const audit = (roomAudits.find((r) => r.room === room) || {}).audit || null;
  const isTreatment = TREATMENT_ROOMS.includes(room);

  const cutoff = Date.now() - 30 * 86400000;
  const flags30 = history.filter(
    (h) => h.action === "flagged" && h.room === room && new Date(h.date).getTime() >= cutoff
  ).length;
  const medianRow = computeResolutionStats(history).roomMedians.find((r) => r.room === room);
  const topItems = itemDepletionRanking(items, history, room).slice(0, 3);
  const topMissing = instrumentMissingRanking(history, room).slice(0, 3);

  const activity = history
    .filter(
      (h) =>
        h.room === room &&
        (h.action === "flagged" || h.action === "resolved" || h.action === "audited" || h.action === "instrument_missing")
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)
    .map((h) => {
      const name = h.itemId && itemsById[h.itemId] ? itemsById[h.itemId].name : "An item";
      let text = "";
      if (h.action === "flagged") text = `${name} flagged low`;
      else if (h.action === "resolved") text = `${name} restocked`;
      else if (h.action === "audited") text = `Audit completed · ${h.reviewedCount ?? 0} reviewed`;
      else text = `${h.instrumentName || "An item"} marked missing`;
      return { id: h.id, text, date: h.date };
    });

  const allGood = flags.length === 0 && missing.length === 0 && alerts.length === 0;

  return (
    <div className="di-sheet-backdrop" onClick={onClose}>
      <div className="di-sheet" role="dialog" aria-label={room} onClick={(e) => e.stopPropagation()}>
        <div className="di-sheet-head">
          <div>
            <div className="di-sheet-eyebrow">{isTreatment ? "Treatment room" : "Shared space"}</div>
            <h2 className="di-sheet-title">{room}</h2>
            {settings.name && <div className="di-sheet-roomname">{settings.name}</div>}
            <div className="di-sheet-status">
              {allGood ? (
                <span style={{ color: "var(--green)" }}>
                  <CircleCheck size={14} /> All good right now
                </span>
              ) : (
                <span style={{ color: "var(--red)" }}>
                  {flags.length + missing.length + alerts.length} thing
                  {flags.length + missing.length + alerts.length === 1 ? "" : "s"} need attention
                </span>
              )}
            </div>
          </div>
          <button className="di-sheet-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {isTreatment && (
          <div className="di-sheet-details">
            {!editing ? (
              <div className="di-details-view">
                <div className="di-details-summary">
                  {colorHexFor(roomSettings, room) ? (
                    <ToothIcon color={colorHexFor(roomSettings, room)} size={20} />
                  ) : (
                    <ToothIcon color={NO_COLOR_HEX} size={20} />
                  )}
                  <span>
                    {settings.name || settings.color
                      ? `${settings.name || "No name"}${
                          settings.color ? ` · ${(ROOM_COLORS.find((c) => c.id === settings.color) || {}).label || ""}` : ""
                        }`
                      : "No name or colour set"}
                  </span>
                </div>
                <button className="di-small-btn di-small-btn-ghost" onClick={startEdit}>
                  <Pencil size={13} /> Edit
                </button>
              </div>
            ) : (
              <>
                <input
                  className="di-sheet-name-input"
                  placeholder="Add a name, e.g. Jess & Richard"
                  value={draftName}
                  maxLength={40}
                  onChange={(e) => setDraftName(e.target.value)}
                />
                <div className="di-swatches" role="group" aria-label="Room colour">
                  {ROOM_COLORS.map((c) => {
                    const takenBy = takenColors[c.id];
                    return (
                      <button
                        key={c.id}
                        className={`di-swatch${draftColor === c.id ? " is-active" : ""}${takenBy ? " is-taken" : ""}`}
                        style={{ background: c.hex }}
                        title={takenBy ? `${c.label} · taken by ${takenBy}` : c.label}
                        aria-label={takenBy ? `${c.label}, taken by ${takenBy}` : c.label}
                        disabled={!!takenBy}
                        onClick={() => setDraftColor(draftColor === c.id ? "" : c.id)}
                      />
                    );
                  })}
                </div>
                {saveMsg && <div className="di-details-error">{saveMsg}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="di-small-btn" onClick={saveDetails} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button className="di-ghost-btn" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="di-sheet-stats">
          <div className="di-sheet-stat">
            <div className="di-sheet-stat-num">{flags.length}</div>
            <div className="di-sheet-stat-label">Low now</div>
          </div>
          <div className="di-sheet-stat">
            <div className="di-sheet-stat-num">{missing.length}</div>
            <div className="di-sheet-stat-label">Missing</div>
          </div>
          <div className="di-sheet-stat">
            <div className="di-sheet-stat-num">{flags30}</div>
            <div className="di-sheet-stat-label">Flags, 30 days</div>
          </div>
          <div className="di-sheet-stat">
            <div className="di-sheet-stat-num">{medianRow ? formatDuration(medianRow.medianMs) : "—"}</div>
            <div className="di-sheet-stat-label">Typical restock</div>
          </div>
        </div>

        {alerts.map((a) => (
          <div key={a.id} className="di-sheet-alert">
            <AlertTriangle size={15} />
            <div>
              <strong>Urgent alert</strong> · {a.message}
              <div className="di-cell-sub">{timeAgo(a.createdAt || a.date)}</div>
            </div>
          </div>
        ))}

        <div className="di-sheet-section">
          <div className="di-sheet-section-title">Low stock</div>
          {flags.length === 0 ? (
            <div className="di-sheet-empty">Nothing flagged low.</div>
          ) : (
            <ul className="di-activity-list">
              {flags.map((f) => (
                <li key={flagKeyReact(f)} className="di-alert-row">
                  <span className="di-status-dot" style={{ background: "var(--red)" }} />
                  <div className="di-alert-main">
                    <div className="di-alert-name">{itemsById[f.itemId].name}</div>
                    <div className="di-alert-meta">
                      {itemsById[f.itemId].category} · {timeAgo(f.flaggedAt)}
                    </div>
                  </div>
                  <button
                    className="di-small-btn di-small-btn-ghost"
                    onClick={() => onToggle({ itemId: f.itemId, room, staff: myName || "" })}
                  >
                    <Undo2 size={13} /> Restock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="di-sheet-section">
          <div className="di-sheet-section-title">Missing from this room</div>
          {missing.length === 0 ? (
            <div className="di-sheet-empty">Nothing missing.</div>
          ) : (
            <ul className="di-activity-list">
              {missing.map((m, idx) => (
                <li key={`${m.itemId}-${idx}`} className="di-alert-row">
                  <span className="di-status-dot" style={{ background: "var(--clay)" }} />
                  <div className="di-alert-main">
                    <div className="di-alert-name">{m.name}</div>
                    <div className="di-alert-meta">{m.updatedAt ? timeAgo(m.updatedAt) : ""}</div>
                  </div>
                  <button className="di-small-btn di-small-btn-ghost" onClick={() => onResolveMissing(m)}>
                    <CircleCheck size={13} /> Found it
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isTreatment && (
          <div className="di-sheet-section">
            <div className="di-sheet-section-title">Last audit</div>
            <div className="di-sheet-line">
              {audit
                ? `${timeAgo(audit.date)} · ${audit.reviewedCount} reviewed${
                    audit.flaggedCount > 0 ? ` · ${audit.flaggedCount} flagged` : ""
                  }${audit.staff ? ` · by ${audit.staff}` : ""}`
                : "This room hasn't been audited yet."}
            </div>
          </div>
        )}

        {(topItems.length > 0 || topMissing.length > 0) && (
          <div className="di-sheet-section">
            <div className="di-sheet-section-title">Patterns in this room</div>
            {topItems.length > 0 && (
              <div className="di-sheet-line">
                <strong>Runs low most:</strong> {topItems.map((t) => `${t.item.name} (${t.count}×)`).join(", ")}
              </div>
            )}
            {topMissing.length > 0 && (
              <div className="di-sheet-line">
                <strong>Goes missing most:</strong> {topMissing.map((t) => `${t.name} (${t.count}×)`).join(", ")}
              </div>
            )}
          </div>
        )}

        <div className="di-sheet-section">
          <div className="di-sheet-section-title">Recent activity</div>
          {activity.length === 0 ? (
            <div className="di-sheet-empty">No activity logged for this room yet.</div>
          ) : (
            <ul className="di-sheet-activity">
              {activity.map((a) => (
                <li key={a.id}>
                  <span>{a.text}</span>
                  <span className="di-cell-sub">{timeAgo(a.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>


        {room === "Lab" && (
          <div className="di-sheet-cta-wrap">
            <button className="di-small-btn di-sheet-cta" onClick={onOpenEndo}>
              <Package size={14} /> Endo trolley
            </button>
          </div>
        )}
        {isTreatment && (
          <div className="di-sheet-cta-wrap">
            <button className="di-small-btn di-sheet-cta" onClick={() => onOpenAudit(room)}>
              <ClipboardList size={14} /> Audit this room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing room items as sticky notes. Tapping "Found it" plays a short
// pop-away animation, then marks the item as back in the room.
function LostAndFound({ missingAuditItems, roomSettings, onResolveMissing }) {
  const [leaving, setLeaving] = useState({});
  const [filterName, setFilterName] = useState("All instruments");
  const noteKey = (m) => `${m.room}::${m.itemId}`;

  const names = Array.from(new Set(missingAuditItems.map((m) => m.name))).sort((a, b) => a.localeCompare(b));
  const activeFilter = names.includes(filterName) ? filterName : "All instruments";
  const shown = activeFilter === "All instruments" ? missingAuditItems : missingAuditItems.filter((m) => m.name === activeFilter);

  const found = (m) => {
    setLeaving((l) => ({ ...l, [noteKey(m)]: true }));
    setTimeout(() => {
      onResolveMissing(m);
      setLeaving((l) => {
        const next = { ...l };
        delete next[noteKey(m)];
        return next;
      });
    }, 450);
  };

  return (
    <div className="di-panel">
      <div className="di-panel-head">
        <h3>Lost &amp; found</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {names.length > 1 && (
            <select value={activeFilter} onChange={(e) => setFilterName(e.target.value)} aria-label="Filter by instrument">
              <option value="All instruments">All instruments</option>
              {names.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
          <span className="di-panel-count">{shown.length}</span>
        </div>
      </div>
      {missingAuditItems.length === 0 ? (
        <EmptyState icon={CircleCheck} text="Nothing's gone missing. Everything's where it should be ✨" />
      ) : (
        <div className="di-notes">
          {shown.map((m, idx) => {
            const hex = colorHexFor(roomSettings, m.room) || NO_COLOR_HEX;
            const roomName = roomSettings && roomSettings[m.room] ? roomSettings[m.room].name : "";
            return (
              <div
                key={noteKey(m)}
                className={`di-note${leaving[noteKey(m)] ? " is-leaving" : ""}`}
                style={{
                  background: `${hex}40`,
                  borderTop: `5px solid ${hex}`,
                  transform: `rotate(${[-1.6, 1.2, -0.8, 1.8][idx % 4]}deg)`,
                }}
              >
                <div className="di-note-name">{m.name}</div>
                <div className="di-note-room">
                  {m.room}
                  {roomName ? ` · ${roomName}` : ""}
                </div>
                <div className="di-note-foot">
                  <span>{m.updatedAt ? `missing ${timeAgo(m.updatedAt)}` : ""}</span>
                  <button className="di-note-btn" onClick={() => found(m)}>
                    Found it!
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Dashboard({ items, itemsById, history, activeFlags, backorderedItems, roomAudits, openOrders, missingAuditItems, openAlerts, roomsAffected, myRoom, myName, setView, onToggle, onSetItemStatus, onSetCustomStatus, onRebuildFlags, onOpenAudit, roomSettings, onSetRoomSetting }) {
  const [openRoom, setOpenRoom] = useState(null);
  const [listOpen, setListOpen] = useState(false);
  const [confirmingRebuild, setConfirmingRebuild] = useState(false);
  const [rebuildResult, setRebuildResult] = useState(null); // null | { count: number }
  const [auditsOpen, setAuditsOpen] = useState(false);

  const todoSections = buildDashboardTodos({ openAlerts, missingAuditItems, activeFlags, itemsById, roomAudits, setView });

  const sorted = [...activeFlags].sort((a, b) => new Date(a.flaggedAt) - new Date(b.flaggedAt));

  const roomOrder = (room) => {
    const idx = ROOMS.indexOf(room);
    return idx === -1 ? ROOMS.length : idx;
  };

  // Flags and missing items are still two separate underlying systems (one
  // is real stock, the other is a room's own presence check) -- but from a
  // "what needs doing in this room" view, showing them as two separate
  // panels was just visual duplication. One combined, room-grouped list.
  const combinedByRoom = {};
  sorted.forEach((f) => {
    const item = itemsById[f.itemId];
    if (!item) return;
    (combinedByRoom[f.room] = combinedByRoom[f.room] || []).push({ kind: "flag", item, data: f });
  });
  // Missing items now live on the Lost & found board, so this list is flags only.
  const combinedRoomEntries = Object.entries(combinedByRoom).sort((a, b) => roomOrder(a[0]) - roomOrder(b[0]));
  const combinedTotal = sorted.length + missingAuditItems.length;
  const listTotal = sorted.length;

  const neverAuditedCount = roomAudits.filter((r) => !r.audit).length;

  const resolveMissing = (m) => {
    if (m.type === "checklist") {
      onSetItemStatus(m.room, m.itemId, "ok", myName || "");
    } else {
      onSetCustomStatus(m.room, m.itemId, "ok", myName || "");
    }
  };

  const flagsByRoom = {};
  sorted.forEach((f) => {
    if (itemsById[f.itemId]) flagsByRoom[f.room] = (flagsByRoom[f.room] || 0) + 1;
  });
  const missingByRoom = {};
  missingAuditItems.forEach((m) => {
    missingByRoom[m.room] = (missingByRoom[m.room] || 0) + 1;
  });
  const alertRooms = new Set(openAlerts.map((a) => a.room));

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="Right now"
        title="What's flagged low"
        sub="Rooms flag items by hand -- restock and mark items resolved right here, no need to go elsewhere."
      />

      {!myRoom && (
        <div className="di-banner">
          <Info size={16} />
          <div>
            <strong>This device hasn't been assigned a room yet.</strong> Go to{" "}
            <button className="di-linklike" onClick={() => setView("report")}>Report or alert</button>{" "}
            and set it once -- it'll remember from then on.
          </div>
        </div>
      )}

      <div className="di-stats">
        <StatCard
          label="Needs attention"
          value={combinedTotal}
          tone={combinedTotal > 0 ? "critical" : "default"}
        />
        <StatCard label="Open orders" value={openOrders.length} tone={openOrders.length > 0 ? "watch" : "default"} />
      </div>

      <FloorMap
        flagsByRoom={flagsByRoom}
        missingByRoom={missingByRoom}
        alertRooms={alertRooms}
        roomAudits={roomAudits}
        myRoom={myRoom}
        roomSettings={roomSettings}
        onOpenRoom={setOpenRoom}
      />

      <LostAndFound missingAuditItems={missingAuditItems} roomSettings={roomSettings} onResolveMissing={resolveMissing} />

      {openRoom && (
        <RoomSheet
          room={openRoom}
          items={items}
          itemsById={itemsById}
          history={history}
          activeFlags={activeFlags}
          missingAuditItems={missingAuditItems}
          openAlerts={openAlerts}
          roomAudits={roomAudits}
          myName={myName}
          roomSettings={roomSettings}
          onSetRoomSetting={onSetRoomSetting}
          onToggle={onToggle}
          onResolveMissing={resolveMissing}
          onOpenAudit={(r) => {
            setOpenRoom(null);
            onOpenAudit(r);
          }}
          onOpenEndo={() => {
            setOpenRoom(null);
            setView("endo-trolley");
          }}
          onClose={() => setOpenRoom(null)}
        />
      )}

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>On backorder</h3>
          <span className="di-panel-count">{backorderedItems.length}</span>
        </div>
        {backorderedItems.length === 0 ? (
          <EmptyState icon={CircleCheck} text="Nothing currently on backorder." />
        ) : (
          <ul className="di-alert-list">
            {backorderedItems.map((item) => (
              <li key={item.id} className="di-alert-row">
                <span className="di-status-dot" style={{ background: "var(--clay)" }} />
                <div className="di-alert-main">
                  <div className="di-alert-name">{item.name}</div>
                  <div className="di-alert-meta">{item.category}</div>
                </div>
                <div className="di-alert-figures">
                  <div className="di-alert-stock">{item.statusUpdatedAt ? timeAgo(item.statusUpdatedAt) : ""}</div>
                  {item.statusUpdatedBy && <div className="di-alert-days">by {item.statusUpdatedBy}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Low stock, as a list</h3>
          <button className="di-audits-collapse-btn" onClick={() => setListOpen(!listOpen)}>
            <span className="di-panel-count">{listTotal}</span>
            {listOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
        {!listOpen ? null : combinedRoomEntries.length === 0 ? (
          <EmptyState icon={CircleCheck} text="Nothing flagged low right now." />
        ) : (
          combinedRoomEntries.map(([room, roomItems]) => (
            <RoomGroup key={room} room={room} count={roomItems.length}>
              {roomItems.map((entry, idx) =>
                entry.kind === "flag" ? (
                  <li key={`flag-${flagKeyReact(entry.data)}`} className="di-alert-row">
                    <span className="di-status-dot" style={{ background: "var(--red)" }} />
                    <div className="di-alert-main">
                      <div className="di-alert-name">{entry.item.name}</div>
                      <div className="di-alert-meta">Low stock · {entry.item.category}</div>
                    </div>
                    <div className="di-alert-figures">
                      <div className="di-alert-stock">{timeAgo(entry.data.flaggedAt)}</div>
                      {entry.data.staff && <div className="di-alert-days">flagged by {entry.data.staff}</div>}
                    </div>
                    <button
                      className="di-small-btn di-small-btn-ghost"
                      style={{ marginLeft: 8 }}
                      onClick={() => onToggle({ itemId: entry.item.id, room, staff: myName || "" })}
                    >
                      <Undo2 size={13} /> Restock
                    </button>
                  </li>
                ) : (
                  <li key={`missing-${idx}`} className="di-alert-row">
                    <span className="di-status-dot" style={{ background: "var(--clay)" }} />
                    <div className="di-alert-main">
                      <div className="di-alert-name">{entry.data.name}</div>
                      <div className="di-alert-meta">Missing</div>
                    </div>
                    <div className="di-alert-figures">
                      <div className="di-alert-stock">{entry.data.updatedAt ? timeAgo(entry.data.updatedAt) : ""}</div>
                      {entry.data.updatedBy && <div className="di-alert-days">by {entry.data.updatedBy}</div>}
                    </div>
                    <button
                      className="di-small-btn di-small-btn-ghost"
                      style={{ marginLeft: 8 }}
                      onClick={() => resolveMissing(entry.data)}
                    >
                      <CircleCheck size={13} /> Restored
                    </button>
                  </li>
                )
              )}
            </RoomGroup>
          ))
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Audits</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="di-ghost-btn" onClick={() => setView("rooms")}>
              <ClipboardList size={13} /> Go to audits
            </button>
            <button className="di-audits-collapse-btn" onClick={() => setAuditsOpen(!auditsOpen)}>
              {!auditsOpen && neverAuditedCount > 0 && (
                <span className="di-panel-count">{neverAuditedCount} never audited</span>
              )}
              {auditsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        </div>
        {auditsOpen && (
          <ul className="di-alert-list">
            {roomAudits.map(({ room, audit }) => (
              <li key={room} className="di-alert-row">
                <span className="di-status-dot" style={{ background: audit ? "var(--green)" : "var(--amber)" }} />
                <div className="di-alert-main">
                  <div className="di-alert-name">{room}</div>
                  {audit && (
                    <div className="di-alert-meta">
                      {audit.reviewedCount} reviewed{audit.flaggedCount > 0 ? ` · ${audit.flaggedCount} flagged` : ""}
                    </div>
                  )}
                </div>
                <div className="di-alert-figures">
                  <div className="di-alert-stock">{audit ? timeAgo(audit.date) : "Not yet audited"}</div>
                  {audit && audit.staff && <div className="di-alert-days">by {audit.staff}</div>}
                </div>
              </li>
            ))}
          </ul>
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

      <DashboardTodoWidget sections={todoSections} />
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
function ReportOrAlert({ items, activeFlags, myRoom, setMyRoom, myName, setMyName, onToggle, onSendAlert }) {
  const [mode, setMode] = useState("stock"); // "stock" | "urgent"
  const [room, setRoom] = useState(myRoom || ROOMS[0]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [staff, setStaff] = useState("");
  const [editingRoom, setEditingRoom] = useState(!myRoom);
  const [justSent, setJustSent] = useState(false);

  useEffect(() => {
    if (myRoom) setRoom(myRoom);
  }, [myRoom]);

  useEffect(() => {
    if (myName) setStaff(myName);
  }, [myName]);

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

  const sendAlert = () => {
    if (!message.trim()) return;
    onSendAlert({ room, message: message.trim(), staff });
    setMessage("");
    setJustSent(true);
    setTimeout(() => setJustSent(false), 2500);
  };

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="One tap"
        title="Report or alert"
        sub="Flag something low for the usual flow, or send an urgent alert straight to every screen right now."
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
          <input
            placeholder="e.g. Jess"
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            onBlur={() => staff && setMyName(staff)}
          />
        </div>
      </div>

      <div className="di-mode-toggle">
        <button className={mode === "stock" ? "is-active" : ""} onClick={() => setMode("stock")}>
          <Flag size={14} /> Low stock
        </button>
        <button className={mode === "urgent" ? "is-active" : ""} onClick={() => setMode("urgent")}>
          <Bell size={14} /> Urgent alert
        </button>
      </div>

      {mode === "stock" ? (
        <>
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
        </>
      ) : (
        <div className="di-panel">
          <div className="di-hint-text" style={{ padding: "0 2px 10px" }}>
            For genuine emergencies -- this shows up instantly, on every screen, on every device that has
            the app open right now.
          </div>
          <div className="di-field">
            <label>What do you need?</label>
            <input
              placeholder="e.g. Need composite ASAP, need another pair of hands…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAlert()}
            />
          </div>
          <button className="di-urgent-send-btn" disabled={!message.trim()} onClick={sendAlert}>
            <Bell size={16} /> Send urgent alert
          </button>
          {justSent && (
            <div className="di-toast" style={{ marginTop: 10 }}>
              <CircleCheck size={14} /> Sent to every device right now
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   ROOMS OVERVIEW
============================================================================ */
function RoomsOverview({ items, activeFlags, missingAuditItems, onToggle, onOpenAudit }) {
  // Deliberately NOT sorted by how many items are flagged/missing -- a
  // fixed order (matching the physical rooms) means a card never jumps
  // somewhere else on screen the moment you restock it, which is exactly
  // what made this list hard to work through during a real restock.
  const byRoom = ROOMS.map((room) => ({
    room,
    flags: activeFlags.filter((f) => f.room === room),
    missing: missingAuditItems.filter((m) => m.room === room),
  }));

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
  roomExcluded = [],
  onSaveExcluded,
  myRoom,
  myName,
  setMyName,
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
  const [editingList, setEditingList] = useState(false);
  const [draftExcluded, setDraftExcluded] = useState([]);
  const [listSaving, setListSaving] = useState(false);
  const [listMsg, setListMsg] = useState("");

  useEffect(() => {
    if (myName) setStaff(myName);
  }, [myName]);

  if (!room) {
    return (
      <div className="di-page">
        <EmptyState icon={Info} text="No room selected." />
      </div>
    );
  }

  const sections = Object.keys(auditChecklist);
  const allChecklistItems = sections.flatMap((s) => auditChecklist[s] || []);
  const excludedSet = new Set(roomExcluded);
  const activeChecklistItems = allChecklistItems.filter((i) => !excludedSet.has(i.id));

  const startEditList = () => {
    setDraftExcluded(roomExcluded.filter((id) => allChecklistItems.some((i) => i.id === id)));
    setListMsg("");
    setEditingList(true);
  };
  const toggleDraft = (id) =>
    setDraftExcluded((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const saveList = async () => {
    setListSaving(true);
    setListMsg("");
    const res = await onSaveExcluded(room, draftExcluded);
    setListSaving(false);
    if (res && res.ok === false) {
      setListMsg(
        res.denied
          ? "Couldn't save: the Firestore rules need updating to include roomAuditExclusions (publish firestore.rules in the Firebase console)."
          : "Couldn't save -- check your connection and try again."
      );
    } else {
      setEditingList(false);
    }
  };

  const addCustom = () => {
    if (!customText.trim()) return;
    onAddCustomItem(room, customText.trim());
    setCustomText("");
  };

  // Finishing an audit counts everything that wasn't crossed as present:
  // any item still unmarked is ticked "ok" here, so nobody has to tap every
  // single check. Items already crossed as missing stay missing.
  const finishAudit = () => {
    activeChecklistItems.forEach((i) => {
      if (!roomStatus[i.id]?.status) onSetItemStatus(room, i.id, "ok", staff);
    });
    customItems.forEach((c) => {
      if (!c.status) onSetCustomStatus(room, c.id, "ok", staff, c.text);
    });
    const statuses = activeChecklistItems.map((i) => roomStatus[i.id]?.status || "ok");
    const customStatuses = customItems.map((c) => c.status || "ok");
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
          <input
            placeholder="e.g. Jess"
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            onBlur={() => staff && setMyName(staff)}
          />
        </div>
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>This room's list</h3>
          {!editingList && (
            <button className="di-small-btn di-small-btn-ghost" onClick={startEditList}>
              <Pencil size={13} /> Edit list
            </button>
          )}
        </div>
        {!editingList ? (
          <div className="di-hint-text">
            {excludedSet.size === 0
              ? `Every item is checked in ${room}. Use Edit list to remove anything this room doesn't have.`
              : `${excludedSet.size} item${excludedSet.size === 1 ? " is" : "s are"} hidden for ${room} because it doesn't have ${
                  excludedSet.size === 1 ? "it" : "them"
                }.`}
          </div>
        ) : (
          <>
            <div className="di-hint-text">
              Untick anything {room} doesn't have. This only changes {room} -- other rooms keep the full list.
            </div>
            {sections.map((section) => (
              <div key={section} style={{ marginTop: 10 }}>
                <ul className="di-edit-list">
                  {(auditChecklist[section] || []).map((item) => (
                    <li key={item.id}>
                      <label className="di-edit-row">
                        <input
                          type="checkbox"
                          checked={!draftExcluded.includes(item.id)}
                          onChange={() => toggleDraft(item.id)}
                        />
                        <span>{item.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {listMsg && <div className="di-details-error" style={{ marginTop: 10 }}>{listMsg}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="di-small-btn" onClick={saveList} disabled={listSaving}>
                {listSaving ? "Saving…" : "Save list"}
              </button>
              <button className="di-ghost-btn" onClick={() => setEditingList(false)} disabled={listSaving}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {sections.map((section) => (
        <AuditSection
          key={section}
          section={section}
          sectionItems={(auditChecklist[section] || []).filter((i) => !excludedSet.has(i.id))}
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
                    onClick={() => onSetCustomStatus(room, c.id, "attention", staff, c.text)}
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

      <div className="di-hint-text" style={{ marginBottom: 8 }}>
        Finishing marks anything you haven't crossed as present.
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
                  <button className="di-audit-btn-remove" onClick={() => onRemove(item.id)} title="Remove from every room's checklist">
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
   ENDO TROLLEY -- two trays of file-size sections, each Full / Low / Out
============================================================================ */
function EndoTrolley({ endoStatus, myName, setMyName, onSetStatus, onBack }) {
  const [picking, setPicking] = useState(null); // { id, name, tray } | null
  const [staff, setStaff] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (myName) setStaff(myName);
  }, [myName]);

  const statusOf = (sid) => (endoStatus[sid] && endoStatus[sid].status) || "full";

  const choose = async (status) => {
    setBusy(true);
    if (staff && staff !== myName) setMyName(staff);
    await onSetStatus(picking.id, status, staff);
    setBusy(false);
    setPicking(null);
  };

  const pickedInfo = picking ? endoStatus[picking.id] : null;

  return (
    <div className="di-page">
      <button className="di-linklike di-back-link" onClick={onBack}>
        &larr; Back to dashboard
      </button>
      <PageHeader
        eyebrow="Lab"
        title="Endo trolley"
        sub="Tap a section to set it to Full, Low or Out. Low and Out go straight onto the dashboard's low stock."
      />

      <div className="di-panel">
        <div className="di-field" style={{ maxWidth: 220 }}>
          <label>Your name (optional)</label>
          <input placeholder="e.g. Jess" value={staff} onChange={(e) => setStaff(e.target.value)} />
        </div>
      </div>

      {ENDO_TROLLEY.map((tray) => (
        <div className="di-panel" key={tray.id}>
          <div className="di-panel-head">
            <h3>{tray.name}</h3>
          </div>
          {tray.rowLabels.map((rowLabel, r) => (
            <div key={`${tray.id}-row-${r}`} className="di-endo-row">
              <div className="di-endo-rowlabel">{rowLabel}</div>
              <div className="di-endo-tray">
                {tray.sections.slice(r * 6, r * 6 + 6).map((name, j) => {
                  const idx = r * 6 + j;
                  const sid = endoSectionId(tray.id, idx);
                  const st = statusOf(sid);
                  return (
                    <button
                      key={sid}
                      className={`di-endo-cell is-${st}`}
                      onClick={() => setPicking({ id: sid, name, tray: `${tray.name} · ${rowLabel}` })}
                    >
                      <span className="di-endo-name">{name}</span>
                      <span className="di-endo-status">{ENDO_STATUSES.find((x) => x.value === st).label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="di-legend">
        {ENDO_STATUSES.map((x) => (
          <span key={x.value}>
            <i className="di-legend-dot" style={{ background: x.color }} /> {x.label}
          </span>
        ))}
      </div>

      {picking && (
        <div className="di-sheet-backdrop" onClick={() => !busy && setPicking(null)}>
          <div className="di-sheet" role="dialog" aria-label={picking.name} onClick={(e) => e.stopPropagation()}>
            <div className="di-sheet-head">
              <div>
                <div className="di-sheet-eyebrow">{picking.tray}</div>
                <h2 className="di-sheet-title">{picking.name}</h2>
                {pickedInfo && pickedInfo.updatedAt && (
                  <div className="di-cell-sub">
                    Last set {timeAgo(pickedInfo.updatedAt)}
                    {pickedInfo.updatedBy ? ` by ${pickedInfo.updatedBy}` : ""}
                  </div>
                )}
              </div>
              <button className="di-sheet-close" onClick={() => setPicking(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="di-endo-choices">
              {ENDO_STATUSES.map((x) => (
                <button
                  key={x.value}
                  className={`di-endo-choice${statusOf(picking.id) === x.value ? " is-current" : ""}`}
                  style={{ color: x.color, background: x.bg, borderColor: x.color }}
                  disabled={busy}
                  onClick={() => choose(x.value)}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Trends({ items, history, setView }) {
  const [missingRoom, setMissingRoom] = useState("All rooms");

  // Depletion chart is Sterilisation-only: that's the room where stock
  // running out actually matters.
  const depletionRanking = itemDepletionRanking(items, history, "Sterilisation");
  const missingRanking = instrumentMissingRanking(history, missingRoom);
  const missingTotal = history.filter((h) => h.action === "instrument_missing").length;
  const roomDemand = roomDemandRanking(history);
  const overconsumption = overconsumptionOutliers(items, history);
  const resolutionStats = computeResolutionStats(history);
  const weeklyTrend = weeklyFlagTrend(history);
  const endoRanking = endoRunOutRanking(history);

  return (
    <div className="di-page">
      <PageHeader
        eyebrow="Patterns"
        title="Trends"
        sub="Real numbers from every flag and resolve logged since day one -- Dark red discs are still culprit #1 🤣."
      />

      <div className="di-stats">
        <StatCard
          label="Median time to restock"
          value={resolutionStats.overallMedian !== null ? formatDuration(resolutionStats.overallMedian) : "—"}
        />
        <StatCard label="Flags resolved (all time)" value={resolutionStats.count} />
        <StatCard label="Rooms with flag history" value={roomDemand.length} />
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Flag volume over time</h3>
        </div>
        <div className="di-hint-text">
          Weekly totals. A "Resolved" line tracking close behind "Flagged" means the team's keeping pace --
          a widening gap means things are falling behind. Everything else on this page is a snapshot of
          right now; this is the one that shows whether things are actually improving.
        </div>
        {weeklyTrend.length < 2 ? (
          <EmptyState icon={Info} text="Needs a couple of weeks of history before a trend line means much." />
        ) : (
          <div className="di-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--line)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="flagged" name="Flagged" stroke="var(--red)" strokeWidth={2} dot={{ r: 3 }} />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="var(--green)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Most frequently depleted items · Sterilisation</h3>
        </div>
        {depletionRanking.length === 0 ? (
          <EmptyState icon={Info} text="No Sterilisation flags recorded yet." />
        ) : (
          <div className="di-chart-wrap">
            <ResponsiveContainer width="100%" height={Math.max(180, depletionRanking.length * 34)}>
              <BarChart
                data={depletionRanking.map((r) => ({
                  name: r.item.name.length > 28 ? r.item.name.slice(0, 26) + "…" : r.item.name,
                  count: r.count,
                }))}
                layout="vertical"
                margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: "var(--ink)" }} />
                <Tooltip
                  formatter={(v) => [`${v} times`, "Flagged in Sterilisation"]}
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--line)" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--clay)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Most frequently missing instruments</h3>
          <select value={missingRoom} onChange={(e) => setMissingRoom(e.target.value)}>
            <option value="All rooms">All rooms</option>
            {ROOMS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="di-hint-text">
          Counts each time someone marks a room item as missing during an audit. Tracking started when this
          feature went live, so earlier audits aren't included.
        </div>
        {missingRanking.length === 0 ? (
          <EmptyState
            icon={Info}
            text={missingTotal === 0 ? "Nothing marked missing yet -- counts build up from here." : "No missing items recorded for this room yet."}
          />
        ) : (
          <div className="di-chart-wrap">
            <ResponsiveContainer width="100%" height={Math.max(180, missingRanking.length * 34)}>
              <BarChart data={missingRanking} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: "var(--ink)" }} />
                <Tooltip
                  formatter={(v) => [`${v} times`, "Marked missing"]}
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--line)" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--red)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Endo files that run out most</h3>
        </div>
        <div className="di-hint-text">
          Counts each time a file section on the endo trolley is set to Low or Out. Tracking started when this
          feature went live.
        </div>
        {endoRanking.length === 0 ? (
          <EmptyState icon={Info} text="No endo files marked low or out yet -- counts build up from here." />
        ) : (
          <div className="di-chart-wrap">
            <ResponsiveContainer width="100%" height={Math.max(180, endoRanking.length * 34)}>
              <BarChart data={endoRanking} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: "var(--ink)" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--line)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="low" name="Low" stackId="endo" fill="var(--amber)" />
                <Bar dataKey="out" name="Out" stackId="endo" fill="var(--red)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Rooms with highest replenishment demand</h3>
        </div>
        {roomDemand.length === 0 ? (
          <EmptyState icon={Info} text="No flags recorded yet." />
        ) : (
          <div className="di-chart-wrap">
            <ResponsiveContainer width="100%" height={Math.max(180, roomDemand.length * 28)}>
              <BarChart data={roomDemand} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
                <YAxis type="category" dataKey="room" width={110} tick={{ fontSize: 11, fill: "var(--ink)" }} />
                <Tooltip
                  formatter={(v) => [`${v} flags`, "Total raised"]}
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--line)" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--red)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Potential overconsumption</h3>
        </div>
        <div className="di-hint-text">
          Rooms needing an item noticeably more often than the clinic average for that same item --
          worth a look, not a verdict. Could be genuinely higher demand, could be waste.
        </div>
        {overconsumption.length === 0 ? (
          <EmptyState icon={Info} text="Not enough flag history across multiple rooms yet to compare fairly." />
        ) : (
          <ul className="di-activity-list">
            {overconsumption.map((o, idx) => (
              <li key={idx} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">
                    {o.item.name} · {o.room}
                  </div>
                  <div className="di-cell-sub">
                    Needed every {o.gap.toFixed(1)} days here, vs {o.clinicAvgGap.toFixed(1)} days clinic-wide
                  </div>
                </div>
                <span className="di-badge" style={{ color: "var(--red)", background: "var(--red-bg)" }}>
                  {o.ratio.toFixed(1)}x
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="di-panel">
        <div className="di-panel-head">
          <h3>Operational performance by room</h3>
        </div>
        {resolutionStats.roomMedians.length === 0 ? (
          <EmptyState icon={Info} text="Resolve a few flags to see how quickly each room gets restocked." />
        ) : (
          <ul className="di-activity-list">
            {resolutionStats.roomMedians.map((r) => (
              <li key={r.room} className="di-activity-row">
                <div className="di-activity-main">
                  <div className="di-cell-name">{r.room}</div>
                  <div className="di-cell-sub">{r.count} flags resolved</div>
                </div>
                <div className="di-alert-stock">{formatDuration(r.medianMs)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   CATALOGUE -- simple read-only browse (names, cost, supplier)
============================================================================ */
function Catalogue({ items, onReloadCatalogue, onSetStatus, onRemoveItem, myName, setMyName }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [staff, setStaff] = useState("");
  const [confirmingReload, setConfirmingReload] = useState(false);
  const [reloadStatus, setReloadStatus] = useState(null); // null | "working" | "done" | "error"
  const [confirmingRemoveId, setConfirmingRemoveId] = useState(null);

  useEffect(() => {
    if (myName) setStaff(myName);
  }, [myName]);

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
      <PageHeader
        eyebrow="Reference"
        title="Catalogue"
        sub="Every item you stock, searchable by name or code. Flip an item to backorder once it's actually been ordered from a supplier."
      />
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
      <div className="di-field" style={{ maxWidth: 220, marginBottom: 12 }}>
        <label>Your name (saved with status changes)</label>
        <input
          placeholder="e.g. Jess"
          value={staff}
          onChange={(e) => setStaff(e.target.value)}
          onBlur={() => staff && setMyName(staff)}
        />
      </div>
      <div className="di-table-wrap">
        <table className="di-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const meta = itemStatusMeta(item.status);
              return (
                <tr key={item.id}>
                  <td>
                    <div className="di-cell-name">{item.name}</div>
                    <div className="di-cell-sub">{item.code || "no code"}</div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <select
                      className="di-status-select"
                      value={item.status || "in_stock"}
                      style={{ color: meta.color, background: meta.bg, borderColor: meta.color }}
                      onChange={(e) => onSetStatus(item.id, e.target.value, staff)}
                    >
                      {ITEM_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {item.status === "backorder" && item.statusUpdatedAt && (
                      <div className="di-cell-sub" style={{ marginTop: 3 }}>
                        {timeAgo(item.statusUpdatedAt)}
                        {item.statusUpdatedBy ? ` by ${item.statusUpdatedBy}` : ""}
                      </div>
                    )}
                  </td>
                  <td>
                    {confirmingRemoveId === item.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="di-small-btn"
                          style={{ background: "var(--red)", borderColor: "var(--red)" }}
                          onClick={() => {
                            onRemoveItem(item.id);
                            setConfirmingRemoveId(null);
                          }}
                        >
                          Remove
                        </button>
                        <button className="di-ghost-btn" onClick={() => setConfirmingRemoveId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="di-audit-btn-remove"
                        onClick={() => setConfirmingRemoveId(item.id)}
                        title="Remove from catalogue"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
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
              <strong>This updates every item's name, category, and other catalogue details</strong> from
              whatever is currently in the app's code. Room flags, flag history, Central Stock tracking, and
              item status are all preserved for items that already exist -- and any item that only exists
              live (e.g. one added directly in Firebase) is left untouched too. This step actually
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

function Feedback({ feedback, onSubmit, onReview, myName, setMyName }) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (myName) setName(myName);
  }, [myName]);

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
            <input
              placeholder="e.g. Jess"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name && setMyName(name)}
            />
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
.di-nav-label {
  font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; color: #8A8272;
  padding: 8px 10px 2px; text-transform: uppercase;
}
.di-nav-btn {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 10px; border-radius: 7px; border: none;
  background: transparent; color: #C9C1AF;
  font-size: 13.5px; font-family: inherit; text-align: left; cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.di-nav-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
.di-nav-btn.is-active { background: var(--sand); color: var(--charcoal); font-weight: 600; }
.di-nav-btn-sub { padding-left: 20px; font-size: 12.5px; color: #A9A190; }
.di-nav-more-toggle {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; color: #8A8272;
  font-size: 11px; font-family: inherit; padding: 10px 10px 2px; text-align: left;
}
.di-nav-more-toggle:hover { color: #C9C1AF; }
.di-mode-toggle { display: flex; gap: 4px; background: var(--paper); border-radius: 8px; padding: 4px; margin-bottom: 16px; }
.di-mode-toggle button {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: none; border: none; border-radius: 6px; padding: 9px 12px;
  font-size: 13px; font-family: inherit; color: var(--ink-soft); cursor: pointer;
}
.di-mode-toggle button.is-active { background: var(--panel); color: var(--ink); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
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
.di-urgent-stack {
  position: fixed; top: 0; left: 208px; right: 0; z-index: 9999;
  display: flex; flex-direction: column; gap: 2px;
}
.di-urgent-banner {
  display: flex; align-items: center; gap: 12px;
  background: var(--red); color: #fff; padding: 12px 20px;
  animation: di-urgent-pulse 1.4s ease-in-out infinite;
}
@keyframes di-urgent-pulse {
  0%, 100% { background: var(--red); }
  50% { background: #c24632; }
}
.di-urgent-banner-icon { flex-shrink: 0; }
.di-urgent-banner-main { flex: 1; min-width: 0; }
.di-urgent-banner-title { font-weight: 700; font-size: 14px; }
.di-urgent-banner-message { font-size: 12.5px; opacity: 0.92; }
.di-urgent-banner-btn {
  flex-shrink: 0; background: #fff; color: var(--red); border: none;
  border-radius: 7px; padding: 8px 14px; font-size: 12.5px; font-weight: 700;
  cursor: pointer; font-family: inherit; white-space: nowrap;
}
.di-urgent-send-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; background: var(--red); color: #fff; border: none; border-radius: 8px;
  padding: 13px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
  margin-top: 14px;
}
.di-urgent-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.di-todo-widget { position: fixed; bottom: 22px; right: 22px; z-index: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.di-todo-bubble {
  position: relative; width: 52px; height: 52px; border-radius: 50%;
  background: var(--charcoal); color: #ECE7DA; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
}
.di-todo-badge {
  position: absolute; top: -4px; right: -4px; background: var(--red); color: #fff;
  font-size: 11px; font-weight: 700; min-width: 20px; height: 20px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; padding: 0 5px;
  font-family: 'Inter', sans-serif;
}
.di-todo-panel {
  width: 300px; max-height: 60vh; overflow-y: auto; background: var(--panel);
  border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,0.18);
}
.di-todo-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; font-weight: 700; font-size: 13px; color: var(--ink);
  border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--panel);
}
.di-todo-close { background: none; border: none; cursor: pointer; color: var(--ink-soft); padding: 2px; }
.di-todo-panel-body { padding: 6px 14px 12px; }
.di-todo-section { padding: 10px 0; border-bottom: 1px solid var(--line); }
.di-todo-section:last-child { border-bottom: none; }
.di-todo-section-head { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--ink); }
.di-todo-section-head.is-clickable { cursor: pointer; }
.di-todo-section-head.is-clickable:hover { text-decoration: underline; }
.di-todo-count { margin-left: auto; color: var(--ink-soft); font-family: 'Inter', sans-serif; font-weight: 600; }
.di-todo-items { list-style: none; margin: 6px 0 0; padding: 0; }
.di-todo-items li { font-size: 12px; color: var(--ink-soft); padding: 3px 0 3px 19px; line-height: 1.4; }
.di-todo-more { font-size: 11.5px; color: var(--ink-soft); padding: 2px 0 0 19px; font-style: italic; }
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
.di-hint-text { color: var(--ink-soft); font-size: 12.5px; padding: 0 2px 12px; line-height: 1.5; }
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
.di-status-select {
  font-size: 12px; font-weight: 600; font-family: inherit; border-radius: 20px;
  padding: 4px 10px; border-width: 1.5px; border-style: solid; cursor: pointer;
}
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
.di-audits-collapse-btn {
  display: flex; align-items: center; gap: 8px; background: none; border: none;
  cursor: pointer; color: var(--ink-soft); padding: 4px;
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
  .di-urgent-stack { left: 0; }
}

/* ---- floor map ---- */
.di-hint-inline { font-size: 12px; color: var(--ink-soft); }
.di-u { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-template-rows: repeat(35, 9px) minmax(46px, auto) 14px minmax(52px, auto); column-gap: 6px; row-gap: 0; }
.di-u > .di-tile { margin: 3px 0; }
.di-tile {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; padding: 4px; border-radius: 12px; border: 2px solid transparent; min-width: 0;
  background: var(--green-bg); color: var(--green); cursor: pointer; font-family: inherit;
  transition: transform .15s ease, box-shadow .15s ease;
}
.di-tile:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,.08); }
.di-tile:active { transform: scale(.97); }
.di-tile.is-flag { background: var(--red-bg); color: var(--red); }
.di-tile.is-missing { background: var(--amber-bg); color: var(--clay); }
.di-tile.is-urgent { background: #B3261E; color: #fff; animation: di-pulse 1.8s ease-in-out infinite; }
.di-tile.is-mine { border-color: var(--ink); }
.di-tile-label { font-size: 17px; font-weight: 700; line-height: 1; }
.di-tile.is-steri { border-radius: 18px; background-image: repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,.35) 14px 16px); }
.di-tile.is-steri .di-tile-label { font-size: 18px; letter-spacing: .04em; }
.di-tile.is-lab { flex-direction: row; gap: 10px; }
.di-tile.is-lab .di-tile-label { font-size: 15px; }
.di-tile-badges { display: flex; align-items: center; gap: 4px; }
.di-tile.is-room .di-tile-badges { position: absolute; top: -6px; right: -4px; gap: 2px; }
.di-tile-badge { font-size: 10px; font-weight: 700; border-radius: 20px; padding: 1px 6px; color: #fff; display: inline-flex; align-items: center; box-shadow: 0 0 0 2px #fff; }
.di-tile-badge-flag { background: var(--red); }
.di-tile-badge-missing { background: var(--clay); }
.di-tile-badge-urgent { background: #fff; color: #B3261E; }
.di-tile.is-urgent .di-tile-badge-flag { background: #7A1B16; }
.di-tile-here { position: absolute; bottom: -7px; font-size: 8.5px; background: var(--ink); color: #fff; padding: 1px 5px; border-radius: 10px; white-space: nowrap; }
@media (min-width: 560px) { .di-tile-label { font-size: 22px; }  }
.di-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 14px; font-size: 11.5px; color: var(--ink-soft); }
.di-legend span { display: inline-flex; align-items: center; gap: 5px; }
.di-legend-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
@keyframes di-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(179,38,30,.45); } 50% { box-shadow: 0 0 0 8px rgba(179,38,30,0); } }

/* ---- room sheet ---- */
.di-sheet-backdrop {
  position: fixed; inset: 0; background: rgba(20,16,10,.45); z-index: 60;
  display: flex; align-items: flex-end; justify-content: center; animation: di-fade .18s ease;
}
.di-sheet {
  background: #fff; width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto;
  border-radius: 20px 20px 0 0; padding: 20px 18px 24px; animation: di-slide .22s ease;
}
@media (min-width: 700px) { .di-sheet-backdrop { align-items: center; } .di-sheet { border-radius: 20px; } }
.di-sheet-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.di-sheet-eyebrow { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-soft); }
.di-sheet-title { margin: 2px 0 4px; font-size: 24px; }
.di-sheet-status { font-size: 13px; display: flex; align-items: center; gap: 5px; }
.di-sheet-close { background: var(--paper); border: none; border-radius: 50%; width: 34px; height: 34px; display: grid; place-items: center; cursor: pointer; }
.di-sheet-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
.di-sheet-stat { background: var(--paper); border-radius: 12px; padding: 10px 6px; text-align: center; }
.di-sheet-stat-num { font-size: 18px; font-weight: 700; }
.di-sheet-stat-label { font-size: 10.5px; color: var(--ink-soft); margin-top: 2px; }
.di-sheet-alert { display: flex; gap: 10px; background: #FBE3E0; color: #B3261E; border-radius: 12px; padding: 10px 12px; margin-bottom: 14px; font-size: 13px; }
.di-sheet-section { margin-top: 16px; }
.di-sheet-section-title { font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 6px; }
.di-sheet-empty { font-size: 13px; color: var(--ink-soft); }
.di-sheet-line { font-size: 13px; margin-bottom: 4px; line-height: 1.45; }
.di-sheet-activity { list-style: none; margin: 0; padding: 0; }
.di-sheet-activity li { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; padding: 6px 0; border-bottom: 1px solid var(--line); }
.di-sheet-cta-wrap { position: sticky; bottom: -24px; margin: 18px -18px -24px; padding: 12px 18px 24px; background: linear-gradient(to top, #fff 75%, rgba(255,255,255,0)); }
.di-sheet-cta { width: 100%; justify-content: center; padding: 12px; }
@keyframes di-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes di-slide { from { transform: translateY(30px); opacity: 0; } to { transform: none; opacity: 1; } }

/* ---- lost & found notes ---- */
.di-notes { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; padding: 6px 4px 4px; }
.di-note {
  border-radius: 4px 4px 14px 4px; padding: 12px 12px 10px; min-height: 110px; display: flex; flex-direction: column;
  box-shadow: 0 3px 8px rgba(0,0,0,.12); transition: transform .45s ease, opacity .45s ease;
}
.di-note.is-leaving { opacity: 0; transform: scale(.6) rotate(8deg) translateY(-20px) !important; }
.di-note-name { font-weight: 700; font-size: 14px; line-height: 1.25; }
.di-note-room { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
.di-note-foot { margin-top: auto; padding-top: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: var(--ink-soft); }
.di-note-btn { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 5px 10px; font-weight: 600; font-size: 12px; cursor: pointer; font-family: inherit; }
.di-note-btn:hover { background: var(--green-bg); color: var(--green); }

/* ---- room colours / names / blocked ---- */
.di-tile-tooth { position: absolute; top: -7px; left: -6px; width: 22px; height: 22px; border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 1px 3px rgba(0,0,0,.25); }
.di-tile.is-blocked { background: #D8D5CD; color: #8E8A80; cursor: not-allowed; opacity: .75; background-image: repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,.09) 6px 8px); }
.di-tile.is-blocked .di-tile-label { text-decoration: line-through; }
.di-tile.is-blocked:hover { transform: none; box-shadow: none; }
.di-sheet-roomname { font-size: 14px; color: var(--ink-soft); margin: -2px 0 4px; }
.di-sheet-details { background: var(--paper); border-radius: 12px; padding: 10px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; }
.di-details-view { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.di-details-summary { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.di-details-error { font-size: 12.5px; color: var(--red); background: var(--red-bg); border-radius: 8px; padding: 8px 10px; }
.di-sheet-name-input { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 9px 10px; font-family: inherit; font-size: 14px; background: #fff; }
.di-swatches { display: flex; flex-wrap: wrap; gap: 8px; }
.di-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px var(--line); cursor: pointer; padding: 0; }
.di-swatch.is-active { box-shadow: 0 0 0 2px var(--ink); }
.di-swatch.is-taken { opacity: .28; cursor: not-allowed; position: relative; }
.di-swatch.is-taken::after { content: ""; position: absolute; left: 3px; right: 3px; top: 50%; height: 2px; background: var(--ink); transform: rotate(-45deg); }

/* ---- endo trolley ---- */
.di-endo-tray { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
@media (max-width: 520px) { .di-endo-tray { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.di-edit-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 2px 12px; }
.di-edit-row { display: flex; align-items: center; gap: 8px; padding: 7px 4px; font-size: 14px; cursor: pointer; }
.di-edit-row input { width: 18px; height: 18px; }
.di-endo-row + .di-endo-row { margin-top: 14px; }
.di-endo-rowlabel { font-size: 12px; font-weight: 700; letter-spacing: .04em; color: var(--ink-soft); margin-bottom: 6px; }
.di-endo-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 64px; padding: 6px 4px; border-radius: 12px; border: 2px solid transparent; font-family: inherit; cursor: pointer; transition: transform .12s ease; }
.di-endo-cell:active { transform: scale(.96); }
.di-endo-cell.is-full { background: var(--green-bg); color: var(--green); }
.di-endo-cell.is-low { background: var(--amber-bg); color: var(--amber); border-color: var(--amber); }
.di-endo-cell.is-out { background: var(--red-bg); color: var(--red); border-color: var(--red); }
.di-endo-name { font-weight: 700; font-size: 13px; text-align: center; line-height: 1.15; word-break: break-word; }
.di-endo-status { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; opacity: .85; }
.di-endo-choices { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
.di-endo-choice { padding: 18px 8px; border-radius: 14px; border: 2px solid; font-family: inherit; font-weight: 700; font-size: 16px; cursor: pointer; opacity: .8; }
.di-endo-choice.is-current { opacity: 1; box-shadow: 0 0 0 3px rgba(0,0,0,.15); }
`;
