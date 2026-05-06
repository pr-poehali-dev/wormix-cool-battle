export const ARENA_BG = "https://cdn.poehali.dev/projects/3aea4d01-2807-40b7-85f8-d2703224cf5a/files/79e38dc9-e876-4a9a-92c2-49440fcef414.jpg";
export const PLAYER_IMG = "https://cdn.poehali.dev/projects/3aea4d01-2807-40b7-85f8-d2703224cf5a/files/152f69f5-0a68-4ae3-b43a-24250f6e187a.jpg";
export const BOSS_IMG = "https://cdn.poehali.dev/projects/3aea4d01-2807-40b7-85f8-d2703224cf5a/files/e09e3f02-b3b4-4af3-b319-3f24a40ca4de.jpg";

export type Tab = "arena" | "equipment" | "stats";
export type GameState = "idle" | "playerTurn" | "enemyTurn" | "victory" | "defeat";

export interface BattleLog { text: string; color: string; id: number }

export const WEAPONS = [
  { id: 1, name: "Огненный меч", icon: "🗡️", damage: [15, 25] as [number, number], type: "fire", rarity: "rare" },
  { id: 2, name: "Ледяной посох", icon: "🪄", damage: [12, 22] as [number, number], type: "ice", rarity: "epic" },
  { id: 3, name: "Гром-молот", icon: "🔨", damage: [20, 35] as [number, number], type: "thunder", rarity: "legendary" },
  { id: 4, name: "Кинжал тени", icon: "🗡️", damage: [8, 18] as [number, number], type: "shadow", rarity: "common" },
];

export const ARMORS = [
  { id: 1, name: "Броня дракона", icon: "🐉", defense: 15, hp: 50, rarity: "legendary" },
  { id: 2, name: "Мифриловый нагрудник", icon: "🛡️", defense: 10, hp: 30, rarity: "epic" },
  { id: 3, name: "Кожаный жилет", icon: "👘", defense: 5, hp: 20, rarity: "common" },
  { id: 4, name: "Плащ теней", icon: "🦇", defense: 8, hp: 15, rarity: "rare" },
];

export const ABILITIES = [
  { id: 1, name: "Молния", icon: "⚡", damage: 40, mp: 25, cooldown: 2, type: "thunder", color: "#FFD700" },
  { id: 2, name: "Огнешар", icon: "🔥", damage: 35, mp: 20, cooldown: 1, type: "fire", color: "#FF4500" },
  { id: 3, name: "Лёд", icon: "❄️", damage: 30, mp: 15, cooldown: 1, type: "ice", color: "#00BFFF" },
  { id: 4, name: "Тень", icon: "🌑", damage: 45, mp: 30, cooldown: 3, type: "shadow", color: "#9400D3" },
  { id: 5, name: "Лечение", icon: "💚", damage: -30, mp: 20, cooldown: 3, type: "heal", color: "#00FF7F" },
  { id: 6, name: "КОМБО!", icon: "💥", damage: 80, mp: 50, cooldown: 5, type: "combo", color: "#FF1493" },
];

export const STATS_UPGRADES = [
  { id: "attack", name: "Атака", icon: "⚔️", value: 10, cost: 50 },
  { id: "defense", name: "Защита", icon: "🛡️", value: 5, cost: 40 },
  { id: "hp", name: "Здоровье", icon: "❤️", value: 25, cost: 30 },
  { id: "mp", name: "Мана", icon: "💎", value: 15, cost: 35 },
  { id: "speed", name: "Скорость", icon: "⚡", value: 3, cost: 45 },
  { id: "crit", name: "Крит. удар", icon: "💢", value: 5, cost: 60 },
];

export const rarityColor: Record<string, string> = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};
