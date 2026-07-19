"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Flame,
  Cloud,
  Zap,
  Bomb,
  Map,
  Play,
  Eye,
  RotateCcw,
  Star,
  Clock,
  Target,
  Crosshair,
  Box,
  Maximize2,
  BookOpen,
  Download,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

type GrenadeType = "smokes" | "molotovs" | "flashes" | "he";
type MapName = "dust2" | "mirage" | "inferno" | "anubis" | "nuke" | "overpass";

interface GrenadeLineup {
  id: string;
  name: string;
  type: GrenadeType;
  from: string;
  to: string;
  difficulty: "Fácil" | "Media" | "Difícil";
  description: string;
  keybind?: string;
  tickrate: "64" | "128" | "Ambos";
  uses: number;
  rating: number;
  positions: { x: number; y: number }[];
}

const maps: { id: MapName; name: string; image: string }[] = [
  { id: "dust2", name: "Dust II", image: "🗺️" },
  { id: "mirage", name: "Mirage", image: "🗺️" },
  { id: "inferno", name: "Inferno", image: "🗺️" },
  { id: "anubis", name: "Anubis", image: "🗺️" },
  { id: "nuke", name: "Nuke", image: "🗺️" },
  { id: "overpass", name: "Overpass", image: "🗺️" },
];

const grenadeTypes = [
  { id: "smokes" as GrenadeType, label: "Smokes", icon: Cloud, color: "#94a3b8", bgColor: "rgba(148,163,184,0.1)" },
  { id: "molotovs" as GrenadeType, label: "Molotovs", icon: Flame, color: "#f97316", bgColor: "rgba(249,115,22,0.1)" },
  { id: "flashes" as GrenadeType, label: "Flashbangs", icon: Zap, color: "#facc15", bgColor: "rgba(250,204,21,0.1)" },
  { id: "he" as GrenadeType, label: "HE Grenades", icon: Bomb, color: "#ef4444", bgColor: "rgba(239,68,68,0.1)" },
];

const allLineups: Record<MapName, Record<GrenadeType, GrenadeLineup[]>> = {
  dust2: {
    smokes: [
      { id: "d2-s1", name: "Smoke Xbox", type: "smokes", from: "T Spawn", to: "Xbox/Mid", difficulty: "Fácil", description: "Smoke que cubre Xbox desde T Spawn. Usa el borde del techo como referencia.", tickrate: "Ambos", uses: 847, rating: 4.8, positions: [{ x: 25, y: 60 }, { x: 45, y: 35 }] },
      { id: "d2-s2", name: "Smoke CT", type: "smokes", from: "Long Doors", to: "CT Spawn", difficulty: "Media", description: "Smoke para cruzar Long sin ser visto desde CT. Alinea con la esquina del edificio.", tickrate: "128", uses: 623, rating: 4.6, positions: [{ x: 15, y: 40 }, { x: 35, y: 20 }] },
      { id: "d2-s3", name: "Smoke Short", type: "smokes", from: "Top Mid", to: "Short A", difficulty: "Media", description: "Smoke para push de Short. Bloquea la vista de CT y AWPers.", tickrate: "Ambos", uses: 512, rating: 4.5, positions: [{ x: 50, y: 45 }, { x: 55, y: 25 }] },
      { id: "d2-s4", name: "Smoke B Doors", type: "smokes", from: "T Spawn", to: "B Doors", difficulty: "Difícil", description: "Smoke larga para B doors. Requiere alineación precisa con el techo.", tickrate: "128", uses: 389, rating: 4.3, positions: [{ x: 30, y: 65 }, { x: 75, y: 25 }] },
      { id: "d2-s5", name: "Smoke Car", type: "smokes", from: "Long A", to: "Car", difficulty: "Fácil", description: "Smoke simple para cubrir el auto en Long A durante el execute.", tickrate: "Ambos", uses: 734, rating: 4.7, positions: [{ x: 10, y: 35 }, { x: 25, y: 15 }] },
    ],
    molotovs: [
      { id: "d2-m1", name: "Molly Goose", type: "molotovs", from: "Long Doors", to: "Goose", difficulty: "Media", description: "Molotov para limpiar Goose en A Site. Alinea con la antena.", tickrate: "Ambos", uses: 456, rating: 4.5, positions: [{ x: 15, y: 42 }, { x: 20, y: 12 }] },
      { id: "d2-m2", name: "Molly Default A", type: "molotovs", from: "Short", to: "Default A", difficulty: "Fácil", description: "Molotov para sacar al CT de default en A. Bounce en el muro.", tickrate: "Ambos", uses: 389, rating: 4.4, positions: [{ x: 52, y: 28 }, { x: 22, y: 15 }] },
      { id: "d2-m3", name: "Molly B Window", type: "molotovs", from: "Upper Tuns", to: "B Window", difficulty: "Difícil", description: "Molotov para B Window desde Tunnels. Timing perfecto.", tickrate: "128", uses: 234, rating: 4.2, positions: [{ x: 65, y: 55 }, { x: 72, y: 30 }] },
      { id: "d2-m4", name: "Molly Pit", type: "molotovs", from: "Long A", to: "Pit", difficulty: "Media", description: "Molotov para limpiar Pit antes de entrar a Long.", tickrate: "Ambos", uses: 567, rating: 4.6, positions: [{ x: 8, y: 38 }, { x: 15, y: 22 }] },
    ],
    flashes: [
      { id: "d2-f1", name: "Flash Long", type: "flashes", from: "Long Doors", to: "Long A", difficulty: "Fácil", description: "Pop flash para entrar a Long. Se lanza sobre el edificio.", tickrate: "Ambos", uses: 923, rating: 4.9, positions: [{ x: 14, y: 41 }, { x: 8, y: 20 }] },
      { id: "d2-f2", name: "Flash B Site", type: "flashes", from: "Upper Tuns", to: "B Site", difficulty: "Media", description: "Flash para rush de B. Ciega a todos en el sitio.", tickrate: "Ambos", uses: 678, rating: 4.7, positions: [{ x: 62, y: 52 }, { x: 78, y: 28 }] },
      { id: "d2-f3", name: "Flash Mid", type: "flashes", from: "T Spawn", to: "Mid", difficulty: "Media", description: "Flash para control de Mid. Pop flash instantánea.", tickrate: "128", uses: 445, rating: 4.5, positions: [{ x: 40, y: 55 }, { x: 50, y: 35 }] },
    ],
    he: [
      { id: "d2-h1", name: "HE Short Stack", type: "he", from: "Mid", to: "Short A", difficulty: "Fácil", description: "HE grenade para dañar a quienes apilan Short.", tickrate: "Ambos", uses: 334, rating: 4.3, positions: [{ x: 48, y: 40 }, { x: 55, y: 22 }] },
      { id: "d2-h2", name: "HE B Doors", type: "he", from: "Upper Tuns", to: "B Doors", difficulty: "Media", description: "HE para dañar a CTs en B Doors antes del execute.", tickrate: "Ambos", uses: 289, rating: 4.2, positions: [{ x: 63, y: 53 }, { x: 74, y: 32 }] },
    ],
  },
  mirage: {
    smokes: [
      { id: "mi-s1", name: "Smoke A Site", type: "smokes", from: "T Spawn", to: "A Site", difficulty: "Media", description: "Smoke que cubre A Site completo desde T Spawn. Básico para executes de A.", tickrate: "Ambos", uses: 1203, rating: 4.9, positions: [{ x: 30, y: 65 }, { x: 20, y: 20 }] },
      { id: "mi-s2", name: "Smoke Jungle", type: "smokes", from: "T Spawn", to: "Jungle", difficulty: "Fácil", description: "Smoke para Jungle/Connector. Evita rotaciones de Mid.", tickrate: "Ambos", uses: 987, rating: 4.8, positions: [{ x: 35, y: 60 }, { x: 35, y: 25 }] },
      { id: "mi-s3", name: "Smoke Stairs", type: "smokes", from: "T Spawn", to: "Stairs", difficulty: "Media", description: "Smoke que bloquea Stairs. Esencial para A execute.", tickrate: "128", uses: 876, rating: 4.7, positions: [{ x: 28, y: 62 }, { x: 18, y: 22 }] },
      { id: "mi-s4", name: "Smoke Window", type: "smokes", from: "T Spawn", to: "Window", difficulty: "Difícil", description: "Smoke para Window en Mid. Timing y ángulo críticos.", tickrate: "Ambos", uses: 756, rating: 4.6, positions: [{ x: 45, y: 58 }, { x: 48, y: 30 }] },
      { id: "mi-s5", name: "Smoke B Apps", type: "smokes", from: "B Apps", to: "B Site", difficulty: "Fácil", description: "Smoke para entrar a B desde Apartments.", tickrate: "Ambos", uses: 645, rating: 4.5, positions: [{ x: 72, y: 55 }, { x: 80, y: 30 }] },
    ],
    molotovs: [
      { id: "mi-m1", name: "Molly Triple", type: "molotovs", from: "T Spawn", to: "Triple Box", difficulty: "Media", description: "Molotov para Triple Box en A Site.", tickrate: "Ambos", uses: 567, rating: 4.6, positions: [{ x: 25, y: 58 }, { x: 15, y: 18 }] },
      { id: "mi-m2", name: "Molly Bench", type: "molotovs", from: "B Apps", to: "Bench", difficulty: "Fácil", description: "Molotov para limpiar Bench en B.", tickrate: "Ambos", uses: 445, rating: 4.5, positions: [{ x: 70, y: 52 }, { x: 85, y: 35 }] },
      { id: "mi-m3", name: "Molly Connector", type: "molotovs", from: "Top Mid", to: "Connector", difficulty: "Difícil", description: "Molotov para Connector desde Mid. Bounce complicado.", tickrate: "128", uses: 334, rating: 4.3, positions: [{ x: 50, y: 42 }, { x: 42, y: 28 }] },
    ],
    flashes: [
      { id: "mi-f1", name: "Flash A Ramp", type: "flashes", from: "A Ramp", to: "A Site", difficulty: "Fácil", description: "Pop flash para entrar a A desde Ramp.", tickrate: "Ambos", uses: 856, rating: 4.8, positions: [{ x: 15, y: 50 }, { x: 22, y: 20 }] },
      { id: "mi-f2", name: "Flash Mid Window", type: "flashes", from: "Top Mid", to: "Window", difficulty: "Media", description: "Flash para sacar al AWPer de Window.", tickrate: "Ambos", uses: 678, rating: 4.7, positions: [{ x: 48, y: 45 }, { x: 50, y: 28 }] },
      { id: "mi-f3", name: "Flash B Apps", type: "flashes", from: "B Apps", to: "B Site", difficulty: "Media", description: "Flash para push de B desde Apartments.", tickrate: "Ambos", uses: 567, rating: 4.6, positions: [{ x: 73, y: 53 }, { x: 82, y: 32 }] },
    ],
    he: [
      { id: "mi-h1", name: "HE A Palace", type: "he", from: "A Ramp", to: "Palace", difficulty: "Fácil", description: "HE para dañar a CTs en Palace.", tickrate: "Ambos", uses: 345, rating: 4.3, positions: [{ x: 12, y: 48 }, { x: 8, y: 15 }] },
      { id: "mi-h2", name: "HE B Van", type: "he", from: "B Apps", to: "Van", difficulty: "Media", description: "HE para sacar al CT de Van en B.", tickrate: "Ambos", uses: 289, rating: 4.2, positions: [{ x: 71, y: 51 }, { x: 88, y: 38 }] },
    ],
  },
  inferno: {
    smokes: [
      { id: "in-s1", name: "Smoke CT", type: "smokes", from: "B Site", to: "CT Spawn", difficulty: "Media", description: "Smoke para cubrir el cross de B a CT.", tickrate: "Ambos", uses: 934, rating: 4.8, positions: [{ x: 75, y: 35 }, { x: 85, y: 15 }] },
      { id: "in-s2", name: "Smoke Coffins", type: "smokes", from: "Banana", to: "Coffins", difficulty: "Fácil", description: "Smoke para Coffins en B. Esencial para B execute.", tickrate: "Ambos", uses: 856, rating: 4.7, positions: [{ x: 55, y: 55 }, { x: 68, y: 28 }] },
      { id: "in-s3", name: "Smoke A Site", type: "smokes", from: "A Long", to: "A Site", difficulty: "Media", description: "Smoke para A Site desde Long.", tickrate: "128", uses: 723, rating: 4.6, positions: [{ x: 20, y: 40 }, { x: 30, y: 15 }] },
      { id: "in-s4", name: "Smoke Library", type: "smokes", from: "A Short", to: "Library", difficulty: "Difícil", description: "Smoke para Library. Bloquea rotaciones.", tickrate: "Ambos", uses: 567, rating: 4.5, positions: [{ x: 35, y: 35 }, { x: 25, y: 12 }] },
    ],
    molotovs: [
      { id: "in-m1", name: "Molly New Box", type: "molotovs", from: "Banana", to: "New Box", difficulty: "Fácil", description: "Molotov para New Box en B.", tickrate: "Ambos", uses: 678, rating: 4.7, positions: [{ x: 52, y: 52 }, { x: 65, y: 25 }] },
      { id: "in-m2", name: "Molly Dark", type: "molotovs", from: "Banana", to: "Dark", difficulty: "Media", description: "Molotov para Dark/Dig en B.", tickrate: "Ambos", uses: 534, rating: 4.5, positions: [{ x: 50, y: 50 }, { x: 72, y: 22 }] },
      { id: "in-m3", name: "Molly Pit", type: "molotovs", from: "A Long", to: "Pit", difficulty: "Media", description: "Molotov para Pit en A.", tickrate: "128", uses: 423, rating: 4.4, positions: [{ x: 18, y: 38 }, { x: 12, y: 18 }] },
    ],
    flashes: [
      { id: "in-f1", name: "Flash Banana", type: "flashes", from: "T Ramp", to: "Banana", difficulty: "Fácil", description: "Flash para control de Banana.", tickrate: "Ambos", uses: 945, rating: 4.9, positions: [{ x: 45, y: 58 }, { x: 55, y: 45 }] },
      { id: "in-f2", name: "Flash B Site", type: "flashes", from: "Banana", to: "B Site", difficulty: "Media", description: "Flash para entrar a B.", tickrate: "Ambos", uses: 789, rating: 4.8, positions: [{ x: 53, y: 53 }, { x: 70, y: 28 }] },
    ],
    he: [
      { id: "in-h1", name: "HE Sandbags", type: "he", from: "Banana", to: "Sandbags", difficulty: "Fácil", description: "HE para sacar a CT de Sandbags.", tickrate: "Ambos", uses: 456, rating: 4.4, positions: [{ x: 48, y: 48 }, { x: 58, y: 35 }] },
    ],
  },
  anubis: {
    smokes: [
      { id: "an-s1", name: "Smoke A Main", type: "smokes", from: "T Spawn", to: "A Main", difficulty: "Fácil", description: "Smoke para A Main en Anubis.", tickrate: "Ambos", uses: 567, rating: 4.5, positions: [{ x: 30, y: 60 }, { x: 25, y: 25 }] },
      { id: "an-s2", name: "Smoke Connector", type: "smokes", from: "Mid", to: "Connector", difficulty: "Media", description: "Smoke para Connector.", tickrate: "Ambos", uses: 456, rating: 4.4, positions: [{ x: 50, y: 45 }, { x: 45, y: 20 }] },
      { id: "an-s3", name: "Smoke B Site", type: "smokes", from: "B Main", to: "B Site", difficulty: "Media", description: "Smoke para B Site.", tickrate: "128", uses: 389, rating: 4.3, positions: [{ x: 72, y: 50 }, { x: 80, y: 22 }] },
    ],
    molotovs: [
      { id: "an-m1", name: "Molly Triple", type: "molotovs", from: "A Main", to: "Triple", difficulty: "Fácil", description: "Molotov para Triple en A.", tickrate: "Ambos", uses: 345, rating: 4.3, positions: [{ x: 28, y: 55 }, { x: 20, y: 18 }] },
      { id: "an-m2", name: "Molly Back Site", type: "molotovs", from: "B Main", to: "Back Site", difficulty: "Media", description: "Molotov para Back Site en B.", tickrate: "Ambos", uses: 278, rating: 4.2, positions: [{ x: 70, y: 48 }, { x: 82, y: 20 }] },
    ],
    flashes: [
      { id: "an-f1", name: "Flash A Site", type: "flashes", from: "A Main", to: "A Site", difficulty: "Fácil", description: "Flash para entrar a A.", tickrate: "Ambos", uses: 534, rating: 4.5, positions: [{ x: 26, y: 52 }, { x: 22, y: 20 }] },
      { id: "an-f2", name: "Flash Mid", type: "flashes", from: "T Spawn", to: "Mid", difficulty: "Media", description: "Flash para control de Mid.", tickrate: "Ambos", uses: 423, rating: 4.4, positions: [{ x: 40, y: 55 }, { x: 50, y: 30 }] },
    ],
    he: [
      { id: "an-h1", name: "HE A Main", type: "he", from: "A Long", to: "A Main", difficulty: "Fácil", description: "HE para A Main.", tickrate: "Ambos", uses: 234, rating: 4.1, positions: [{ x: 15, y: 45 }, { x: 22, y: 22 }] },
    ],
  },
  nuke: {
    smokes: [
      { id: "nu-s1", name: "Smoke Ramp", type: "smokes", from: "T Roof", to: "Ramp", difficulty: "Media", description: "Smoke para Ramp desde el techo.", tickrate: "Ambos", uses: 678, rating: 4.6, positions: [{ x: 45, y: 15 }, { x: 35, y: 55 }] },
      { id: "nu-s2", name: "Smoke Heaven", type: "smokes", from: "A Site", to: "Heaven", difficulty: "Difícil", description: "Smoke para Heaven. Ángulo complicado.", tickrate: "128", uses: 456, rating: 4.4, positions: [{ x: 55, y: 30 }, { x: 65, y: 12 }] },
      { id: "nu-s3", name: "Smoke Hut", type: "smokes", from: "T Roof", to: "Hut", difficulty: "Fácil", description: "Smoke para Hut en A.", tickrate: "Ambos", uses: 567, rating: 4.5, positions: [{ x: 48, y: 12 }, { x: 50, y: 28 }] },
    ],
    molotovs: [
      { id: "nu-m1", name: "Molly Turnpike", type: "molotovs", from: "Ramp", to: "Turnpike", difficulty: "Media", description: "Molotov para Turnpike.", tickrate: "Ambos", uses: 345, rating: 4.3, positions: [{ x: 30, y: 50 }, { x: 25, y: 35 }] },
      { id: "nu-m2", name: "Molly Back of A", type: "molotovs", from: "A Site", to: "Back of A", difficulty: "Fácil", description: "Molotov para Back of A.", tickrate: "Ambos", uses: 289, rating: 4.2, positions: [{ x: 52, y: 32 }, { x: 60, y: 15 }] },
    ],
    flashes: [
      { id: "nu-f1", name: "Flash A Site", type: "flashes", from: "T Roof", to: "A Site", difficulty: "Media", description: "Flash para A Site.", tickrate: "Ambos", uses: 567, rating: 4.5, positions: [{ x: 46, y: 14 }, { x: 52, y: 25 }] },
      { id: "nu-f2", name: "Flash B Site", type: "flashes", from: "B Lower", to: "B Site", difficulty: "Fácil", description: "Flash para B Site.", tickrate: "Ambos", uses: 456, rating: 4.4, positions: [{ x: 50, y: 70 }, { x: 55, y: 50 }] },
    ],
    he: [
      { id: "nu-h1", name: "HE Ramp Room", type: "he", from: "Ramp", to: "Room", difficulty: "Fácil", description: "HE para Ramp Room.", tickrate: "Ambos", uses: 234, rating: 4.1, positions: [{ x: 32, y: 52 }, { x: 28, y: 38 }] },
    ],
  },
  overpass: {
    smokes: [
      { id: "ov-s1", name: "Smoke Long A", type: "smokes", from: "T Spawn", to: "Long A", difficulty: "Fácil", description: "Smoke para Long A.", tickrate: "Ambos", uses: 756, rating: 4.7, positions: [{ x: 20, y: 60 }, { x: 15, y: 25 }] },
      { id: "ov-s2", name: "Smoke Bank", type: "smokes", from: "A Site", to: "Bank", difficulty: "Media", description: "Smoke para Bank en A.", tickrate: "Ambos", uses: 567, rating: 4.5, positions: [{ x: 25, y: 35 }, { x: 18, y: 12 }] },
      { id: "ov-s3", name: "Smoke Heaven", type: "smokes", from: "B Site", to: "Heaven", difficulty: "Difícil", description: "Smoke para Heaven en B.", tickrate: "128", uses: 423, rating: 4.4, positions: [{ x: 75, y: 40 }, { x: 82, y: 15 }] },
    ],
    molotovs: [
      { id: "ov-m1", name: "Molly Toilets", type: "molotovs", from: "Long A", to: "Toilets", difficulty: "Media", description: "Molotov para Toilets.", tickrate: "Ambos", uses: 456, rating: 4.4, positions: [{ x: 18, y: 42 }, { x: 12, y: 20 }] },
      { id: "ov-m2", name: "Molly Water", type: "molotovs", from: "B Short", to: "Water", difficulty: "Fácil", description: "Molotov para Water.", tickrate: "Ambos", uses: 389, rating: 4.3, positions: [{ x: 60, y: 45 }, { x: 55, y: 30 }] },
    ],
    flashes: [
      { id: "ov-f1", name: "Flash A Long", type: "flashes", from: "T Spawn", to: "A Long", difficulty: "Fácil", description: "Flash para Long A.", tickrate: "Ambos", uses: 678, rating: 4.6, positions: [{ x: 22, y: 58 }, { x: 16, y: 28 }] },
      { id: "ov-f2", name: "Flash B Site", type: "flashes", from: "Monster", to: "B Site", difficulty: "Media", description: "Flash para B Site desde Monster.", tickrate: "Ambos", uses: 534, rating: 4.5, positions: [{ x: 72, y: 52 }, { x: 78, y: 32 }] },
    ],
    he: [
      { id: "ov-h1", name: "HE Pillar", type: "he", from: "B Short", to: "Pillar", difficulty: "Fácil", description: "HE para Pillar en B.", tickrate: "Ambos", uses: 267, rating: 4.2, positions: [{ x: 58, y: 42 }, { x: 62, y: 28 }] },
    ],
  },
};

function MapOverview({ selectedMap, grenadeType }: { selectedMap: MapName; grenadeType: GrenadeType }) {
  const lineups = allLineups[selectedMap][grenadeType];
  const typeInfo = grenadeTypes.find((t) => t.id === grenadeType)!;

  const mapLayouts: Record<MapName, { zones: { name: string; x: number; y: number; w: number; h: number }[] }> = {
    dust2: { zones: [
      { name: "A Site", x: 10, y: 8, w: 25, h: 18 },
      { name: "B Site", x: 65, y: 8, w: 25, h: 18 },
      { name: "Mid", x: 38, y: 25, w: 24, h: 15 },
      { name: "Long", x: 5, y: 30, w: 15, h: 25 },
      { name: "CT", x: 15, y: 55, w: 20, h: 15 },
      { name: "T Spawn", x: 60, y: 55, w: 25, h: 15 },
    ]},
    mirage: { zones: [
      { name: "A Site", x: 10, y: 8, w: 25, h: 20 },
      { name: "B Site", x: 68, y: 8, w: 25, h: 20 },
      { name: "Mid", x: 40, y: 30, w: 20, h: 20 },
      { name: "Jungle", x: 30, y: 25, w: 12, h: 12 },
      { name: "Connector", x: 35, y: 38, w: 10, h: 15 },
      { name: "T Spawn", x: 45, y: 60, w: 20, h: 12 },
    ]},
    inferno: { zones: [
      { name: "A Site", x: 10, y: 10, w: 22, h: 18 },
      { name: "B Site", x: 65, y: 10, w: 28, h: 18 },
      { name: "Banana", x: 45, y: 35, w: 18, h: 25 },
      { name: "Mid", x: 30, y: 30, w: 15, h: 20 },
      { name: "Arch", x: 20, y: 40, w: 12, h: 15 },
      { name: "T Spawn", x: 50, y: 60, w: 18, h: 12 },
    ]},
    anubis: { zones: [
      { name: "A Site", x: 10, y: 10, w: 25, h: 20 },
      { name: "B Site", x: 65, y: 10, w: 28, h: 20 },
      { name: "Mid", x: 38, y: 30, w: 24, h: 15 },
      { name: "Connector", x: 42, y: 38, w: 12, h: 12 },
      { name: "T Spawn", x: 35, y: 55, w: 20, h: 12 },
    ]},
    nuke: { zones: [
      { name: "A Site", x: 35, y: 10, w: 30, h: 20 },
      { name: "B Site", x: 35, y: 45, w: 30, h: 20 },
      { name: "Ramp", x: 10, y: 35, w: 18, h: 15 },
      { name: "Heaven", x: 60, y: 15, w: 15, h: 10 },
      { name: "T Roof", x: 35, y: 0, w: 30, h: 8 },
    ]},
    overpass: { zones: [
      { name: "A Site", x: 8, y: 8, w: 22, h: 20 },
      { name: "B Site", x: 65, y: 8, w: 28, h: 20 },
      { name: "Long A", x: 5, y: 30, w: 15, h: 25 },
      { name: "Monster", x: 70, y: 35, w: 20, h: 20 },
      { name: "T Spawn", x: 35, y: 55, w: 20, h: 12 },
    ]},
  };

  const layout = mapLayouts[selectedMap];

  return (
    <div className="relative">
      <div className="aspect-[16/10] glass rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-white/[0.02]" />

        <svg viewBox="0 0 100 62.5" className="absolute inset-0 w-full h-full">
          {/* Map zones */}
          {layout.zones.map((zone) => (
            <g key={zone.name}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx="1"
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.3"
              />
              <text
                x={zone.x + zone.w / 2}
                y={zone.y + zone.h / 2 + 1}
                textAnchor="middle"
                fill="rgba(255,255,255,0.2)"
                fontSize="2.2"
                fontFamily="monospace"
              >
                {zone.name}
              </text>
            </g>
          ))}

          {/* Grenade trajectories */}
          {lineups.map((lineup, i) => (
            <g key={lineup.id}>
              {/* Path line */}
              <motion.line
                x1={lineup.positions[0].x}
                y1={lineup.positions[0].y}
                x2={lineup.positions[1].x}
                y2={lineup.positions[1].y}
                stroke={typeInfo.color}
                strokeWidth="0.5"
                strokeDasharray="2,2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1, delay: i * 0.15 }}
              />
              {/* Start point */}
              <motion.circle
                cx={lineup.positions[0].x}
                cy={lineup.positions[0].y}
                r="1.5"
                fill={typeInfo.color}
                opacity="0.8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 }}
              />
              {/* End point */}
              <motion.circle
                cx={lineup.positions[1].x}
                cy={lineup.positions[1].y}
                r="2.5"
                fill="none"
                stroke={typeInfo.color}
                strokeWidth="0.5"
                opacity="0.6"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
              />
              <motion.circle
                cx={lineup.positions[1].x}
                cy={lineup.positions[1].y}
                r="1"
                fill={typeInfo.color}
                opacity="0.9"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 }}
              />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 glass rounded-lg px-3 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeInfo.color }} />
              <span className="text-[10px] text-muted">{lineups.length} lineups</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateCFG(mapName: string, lineupName: string): string {
  return `// CS2Pilot Practice Config - ${lineupName} (${mapName})
// Generado automáticamente por CS2Pilot

// Infinitas grenades
mp_buytime 60
mp_buy_anywhere 1
sv_infinite_ammo 1
sv_cheats 1

// Sin restricciones de tiempo
mp_roundtime_defuse 60
mp_roundtime_hostage 60
mp_maxrounds 0
mp_freezetime 0

// Noclip para practicar posiciones
sv_noclip 1

// Bots vacíos
bot_kick

// Mostrar trayectoria de granadas
sv_grenade_trajectory 1
sv_grenade_trajectory_thickness 0.1
sv_grenade_trajectory_time 10
sv_grenade_trajectory_dash 1

// Cámara de granadas
cl_sim_grenade_trajectory 1

// Crosshair grande para practicar
cl_crosshairsize 5
cl_crosshairthickness 1
cl_crosshairgap 0
cl_crosshairdot 0

// Info de daño
developer 1
con_filter_enable 2
con_filter_text "Damage Given"

// Mostrar impactos
sv_showimpacts 1

// Sonido de práctica
sv_showimpacts_time 5

echo "=========================================="
echo "  CS2Pilot Practice Config cargado"
echo "  Mapa: ${mapName}"
echo "  Lineup: ${lineupName}"
echo "=========================================="
`;
}

function generateLaunchURL(mapName: string): string {
  const mapConsoleName = `de_${mapName.toLowerCase()}`;
  return `steam://rungameid/730//+map+${mapConsoleName}`;
}

function LineupCard({ lineup, index }: { lineup: GrenadeLineup; index: number }) {
  const typeInfo = grenadeTypes.find((t) => t.id === lineup.type)!;

  const handleDownloadCFG = () => {
    const cfg = generateCFG(lineup.name.split(" ")[1] || lineup.name, lineup.name);
    const blob = new Blob([cfg], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cs2pilot_${lineup.name.toLowerCase().replace(/\s+/g, "_")}.cfg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLaunchCS2 = () => {
    const mapId = lineup.name.split(" ")[1] || lineup.name;
    const url = generateLaunchURL(mapId);
    window.location.href = url;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-all group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: typeInfo.bgColor }}>
              <typeInfo.icon className="h-4 w-4" style={{ color: typeInfo.color }} />
            </div>
            <div>
              <h4 className="text-sm font-semibold">{lineup.name}</h4>
              <p className="text-[11px] text-muted">{lineup.from} → {lineup.to}</p>
            </div>
          </div>
          <Badge variant={lineup.difficulty === "Fácil" ? "success" : lineup.difficulty === "Media" ? "accent" : "danger"} size="sm">
            {lineup.difficulty}
          </Badge>
        </div>

        <p className="text-xs text-muted mb-3 leading-relaxed">{lineup.description}</p>

        <div className="flex items-center gap-3 text-[11px] text-muted">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{lineup.tickrate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{lineup.uses.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-accent fill-accent" />
            <span>{lineup.rating}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <button
            onClick={handleDownloadCFG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Download className="h-3 w-3" />
            Descargar CFG
          </button>
          <button
            onClick={handleLaunchCS2}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-success/10 text-success hover:bg-success/20 transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3 w-3" />
            Probar en CS2
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function UtilityPage() {
  const [selectedMap, setSelectedMap] = useState<MapName>("dust2");
  const [selectedType, setSelectedType] = useState<GrenadeType>("smokes");

  const currentLineups = allLineups[selectedMap][selectedType];
  const currentTypeInfo = grenadeTypes.find((t) => t.id === selectedType)!;

  const totalLineups = Object.values(allLineups[selectedMap]).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Flame className="h-6 w-6 text-accent" />
            Utilidades
          </h1>
          <p className="text-sm text-muted mt-1">
            Lineups de granadas para todos los mapas competitivos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="steam://rungameid/730//+map+de_dust2"
            onClick={(e) => {
              const confirmed = window.confirm("Esto abrirá CS2 y cargará Dust II en modo práctica con config de entrenamiento. ¿Continuar?");
              if (!confirmed) e.preventDefault();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
          >
            <Play className="h-4 w-4" />
            Abrir CS2
          </a>
        </div>
      </motion.div>

      {/* Map Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-2 overflow-x-auto pb-2">
          {maps.map((map) => (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedMap === map.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "glass text-muted hover:text-foreground hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Map className="h-4 w-4" />
              {map.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grenade Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex gap-2">
          {grenadeTypes.map((type) => {
            const count = allLineups[selectedMap][type.id].length;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedType === type.id
                    ? "border"
                    : "glass text-muted hover:text-foreground hover:bg-white/[0.04]"
                }`}
                style={
                  selectedType === type.id
                    ? { backgroundColor: type.bgColor, color: type.color, borderColor: `${type.color}40` }
                    : undefined
                }
              >
                <type.icon className="h-4 w-4" />
                {type.label}
                <span className="text-[11px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {grenadeTypes.map((type) => {
          const count = allLineups[selectedMap][type.id].length;
          const isActive = selectedType === type.id;
          return (
            <GlassCard
              key={type.id}
              padding="sm"
              className={`cursor-pointer transition-all ${isActive ? "ring-1" : ""}`}
              glow={isActive}
            >
              <div onClick={() => setSelectedType(type.id)}>
                <div className="flex items-center gap-2 mb-1">
                  <type.icon className="h-4 w-4" style={{ color: type.color }} />
                  <span className="text-xs text-muted">{type.label}</span>
                </div>
                <div className="text-xl font-bold font-mono">{count}</div>
                <div className="text-[10px] text-muted">lineups</div>
              </div>
            </GlassCard>
          );
        })}
      </motion.div>

      {/* Map Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: currentTypeInfo.bgColor }}>
                <currentTypeInfo.icon className="h-5 w-5" style={{ color: currentTypeInfo.color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  {currentTypeInfo.label} - {maps.find((m) => m.id === selectedMap)?.name}
                </h3>
                <p className="text-xs text-muted">{currentLineups.length} lineups disponibles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium glass text-muted hover:text-foreground transition-colors cursor-pointer">
                <Maximize2 className="h-3 w-3" />
                Expandir
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium glass text-muted hover:text-foreground transition-colors cursor-pointer">
                <BookOpen className="h-3 w-3" />
                Guía
              </button>
            </div>
          </div>
          <MapOverview selectedMap={selectedMap} grenadeType={selectedType} />
        </GlassCard>
      </motion.div>

      {/* Lineups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="wait">
          {currentLineups.map((lineup, i) => (
            <LineupCard key={lineup.id} lineup={lineup} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Practice Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard padding="lg" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Play className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Modo Práctica</h3>
                <p className="text-xs text-muted">Configura CS2 automáticamente para practicar lineups</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Descarga CFG</span>
                </div>
                <p className="text-xs text-muted">Cada lineup tiene un botón para descargar un .cfg con comandos de entrenamiento (infinite ammo, noclip, trajectory, etc.)</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Abre CS2</span>
                </div>
                <p className="text-xs text-muted">Haz clic en "Probar en CS2" para abrir Steam directamente en el mapa correspondiente. Ejecuta el CFG en la consola con <code className="text-primary">exec</code>.</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Practica</span>
                </div>
                <p className="text-xs text-muted">Con el CFG cargado tendrás: grenades infinitas, noclip, trayectoria visible, bots eliminados y más.</p>
              </div>
            </div>
            <div className="text-xs text-muted">
              <strong>Tip:</strong> Después de descargar el CFG, abre la consola de CS2 (<code className="text-primary">~</code>) y escribe{" "}
              <code className="text-primary">exec cs2pilot_[nombre_del_lineup]</code> para cargar la configuración.
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
