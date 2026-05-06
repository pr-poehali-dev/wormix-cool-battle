import { useState, useEffect, useCallback } from "react";

const ARENA_BG = "https://cdn.poehali.dev/projects/3aea4d01-2807-40b7-85f8-d2703224cf5a/files/79e38dc9-e876-4a9a-92c2-49440fcef414.jpg";
const PLAYER_IMG = "https://cdn.poehali.dev/projects/3aea4d01-2807-40b7-85f8-d2703224cf5a/files/152f69f5-0a68-4ae3-b43a-24250f6e187a.jpg";
const BOSS_IMG = "https://cdn.poehali.dev/projects/3aea4d01-2807-40b7-85f8-d2703224cf5a/files/e09e3f02-b3b4-4af3-b319-3f24a40ca4de.jpg";

type Tab = "arena" | "equipment" | "stats";
type GameState = "idle" | "playerTurn" | "enemyTurn" | "victory" | "defeat";

const WEAPONS = [
  { id: 1, name: "Огненный меч", icon: "🗡️", damage: [15, 25] as [number,number], type: "fire", rarity: "rare" },
  { id: 2, name: "Ледяной посох", icon: "🪄", damage: [12, 22] as [number,number], type: "ice", rarity: "epic" },
  { id: 3, name: "Гром-молот", icon: "🔨", damage: [20, 35] as [number,number], type: "thunder", rarity: "legendary" },
  { id: 4, name: "Кинжал тени", icon: "🗡️", damage: [8, 18] as [number,number], type: "shadow", rarity: "common" },
];

const ARMORS = [
  { id: 1, name: "Броня дракона", icon: "🐉", defense: 15, hp: 50, rarity: "legendary" },
  { id: 2, name: "Мифриловый нагрудник", icon: "🛡️", defense: 10, hp: 30, rarity: "epic" },
  { id: 3, name: "Кожаный жилет", icon: "👘", defense: 5, hp: 20, rarity: "common" },
  { id: 4, name: "Плащ теней", icon: "🦇", defense: 8, hp: 15, rarity: "rare" },
];

const ABILITIES = [
  { id: 1, name: "Молния", icon: "⚡", damage: 40, mp: 25, cooldown: 2, type: "thunder", color: "#FFD700" },
  { id: 2, name: "Огнешар", icon: "🔥", damage: 35, mp: 20, cooldown: 1, type: "fire", color: "#FF4500" },
  { id: 3, name: "Лёд", icon: "❄️", damage: 30, mp: 15, cooldown: 1, type: "ice", color: "#00BFFF" },
  { id: 4, name: "Тень", icon: "🌑", damage: 45, mp: 30, cooldown: 3, type: "shadow", color: "#9400D3" },
  { id: 5, name: "Лечение", icon: "💚", damage: -30, mp: 20, cooldown: 3, type: "heal", color: "#00FF7F" },
  { id: 6, name: "КОМБО!", icon: "💥", damage: 80, mp: 50, cooldown: 5, type: "combo", color: "#FF1493" },
];

const STATS_UPGRADES = [
  { id: "attack", name: "Атака", icon: "⚔️", value: 10, cost: 50 },
  { id: "defense", name: "Защита", icon: "🛡️", value: 5, cost: 40 },
  { id: "hp", name: "Здоровье", icon: "❤️", value: 25, cost: 30 },
  { id: "mp", name: "Мана", icon: "💎", value: 15, cost: 35 },
  { id: "speed", name: "Скорость", icon: "⚡", value: 3, cost: 45 },
  { id: "crit", name: "Крит. удар", icon: "💢", value: 5, cost: 60 },
];

const rarityColor: Record<string, string> = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};

interface BattleLog { text: string; color: string; id: number }

export default function Index() {
  const [tab, setTab] = useState<Tab>("arena");
  const [gameState, setGameState] = useState<GameState>("idle");

  const [playerHP, setPlayerHP] = useState(200);
  const playerMaxHP = 200;
  const [playerMP, setPlayerMP] = useState(100);
  const playerMaxMP = 100;

  const [bossHP, setBossHP] = useState(500);
  const bossMaxHP = 500;

  const [playerWeapon, setPlayerWeapon] = useState(WEAPONS[0]);
  const [playerArmor, setPlayerArmor] = useState(ARMORS[0]);

  const [comboCount, setComboCount] = useState(0);
  const [level] = useState(7);
  const [xp, setXp] = useState(340);
  const [gold, setGold] = useState(1250);
  const [cooldowns, setCooldowns] = useState<Record<number, number>>({});
  const [logs, setLogs] = useState<BattleLog[]>([
    { text: "⚔️ Босс вызывает тебя на бой! Готовься к сражению!", color: "#FFD700", id: 0 }
  ]);
  const [logId, setLogId] = useState(1);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeBoss, setShakeBoss] = useState(false);
  const [flashEffect, setFlashEffect] = useState<string | null>(null);
  const [statLevels, setStatLevels] = useState<Record<string, number>>({
    attack: 3, defense: 2, hp: 4, mp: 3, speed: 2, crit: 1
  });
  const [bossPhase, setBossPhase] = useState(1);

  useEffect(() => {
    if (bossHP <= bossMaxHP * 0.5 && bossPhase === 1) setBossPhase(2);
    if (bossHP <= bossMaxHP * 0.25 && bossPhase === 2) setBossPhase(3);
  }, [bossHP, bossPhase]);

  const addLog = useCallback((text: string, color: string) => {
    setLogId(prev => {
      const newId = prev + 1;
      setLogs(l => [{ text, color, id: newId }, ...l.slice(0, 5)]);
      return newId;
    });
  }, []);

  const triggerFlash = (color: string) => {
    setFlashEffect(color);
    setTimeout(() => setFlashEffect(null), 400);
  };

  const startBattle = () => {
    setGameState("playerTurn");
    addLog("🔥 Сражение началось! Твой ход!", "#FF4500");
  };

  const resetBattle = () => {
    setPlayerHP(playerMaxHP);
    setPlayerMP(playerMaxMP);
    setBossHP(bossMaxHP);
    setGameState("idle");
    setComboCount(0);
    setCooldowns({});
    setBossPhase(1);
    setLogs([{ text: "⚔️ Новая битва! Покажи боссу на что способен!", color: "#FFD700", id: 0 }]);
  };

  const enemyAttack = useCallback((currentHP: number) => {
    const bossAttacks = [
      { name: "Укус тьмы", dmg: [20, 35] as [number,number], color: "#9400D3", icon: "🌑" },
      { name: "Огненное дыхание", dmg: [25, 45] as [number,number], color: "#FF4500", icon: "🔥" },
      { name: "Ядовитый плевок", dmg: [15, 25] as [number,number], color: "#00FF00", icon: "☠️" },
    ];
    if (bossPhase === 3) bossAttacks.push({ name: "ЯРОСТЬ БОССА", dmg: [40, 65] as [number,number], color: "#FF0000", icon: "💀" });

    const attack = bossAttacks[Math.floor(Math.random() * bossAttacks.length)];
    const raw = Math.floor(Math.random() * (attack.dmg[1] - attack.dmg[0] + 1)) + attack.dmg[0];
    const blocked = Math.max(0, raw - playerArmor.defense);
    const newHP = Math.max(0, currentHP - blocked);

    setPlayerHP(newHP);
    setShakePlayer(true);
    setTimeout(() => setShakePlayer(false), 500);
    triggerFlash("rgba(255,0,0,0.3)");
    addLog(`${attack.icon} Босс: «${attack.name}»! Урон: ${blocked}${raw - blocked > 0 ? ` (заблок. ${raw - blocked})` : ""}`, attack.color);

    if (newHP <= 0) {
      setGameState("defeat");
      addLog("💀 Ты пал в бою... Возродись и отомсти!", "#FF0000");
    } else {
      setGameState("playerTurn");
    }
  }, [playerArmor.defense, bossPhase, addLog]);

  const castAbility = (ability: typeof ABILITIES[0]) => {
    if (gameState !== "playerTurn") return;
    if (playerMP < ability.mp) { addLog("❌ Недостаточно маны!", "#FF6B6B"); return; }
    if ((cooldowns[ability.id] || 0) > 0) { addLog(`⏳ Восстанавливается ещё ${cooldowns[ability.id]} хода`, "#888"); return; }

    setGameState("enemyTurn");
    setPlayerMP(prev => prev - ability.mp);

    let dmg = ability.damage;
    const isCrit = Math.random() < 0.1 + (statLevels.crit || 0) * 0.05;
    if (isCrit && dmg > 0) dmg = Math.floor(dmg * 1.5);
    if (dmg > 0) dmg += (statLevels.attack || 0) * 2;

    const newCombo = ability.type !== "heal" ? comboCount + 1 : 0;
    setComboCount(newCombo);

    if (ability.type === "heal") {
      const healAmt = Math.abs(dmg);
      setPlayerHP(prev => Math.min(playerMaxHP, prev + healAmt));
      addLog(`${ability.icon} Исцеление! +${healAmt} HP`, ability.color);
      triggerFlash("rgba(0,255,127,0.3)");
    } else {
      const newBossHP = Math.max(0, bossHP - dmg);
      setBossHP(newBossHP);
      setShakeBoss(true);
      setTimeout(() => setShakeBoss(false), 500);
      triggerFlash("rgba(255,165,0,0.3)");

      const critText = isCrit ? " 💢 КРИТ!" : "";
      const comboText = newCombo >= 3 ? ` 🔥 КОМБО x${newCombo}!` : "";
      addLog(`${ability.icon} «${ability.name}»: ${dmg} урона!${critText}${comboText}`, ability.color);

      if (newBossHP <= 0) {
        setGameState("victory");
        const earnedXP = 200 + bossPhase * 50;
        const earnedGold = 300 + bossPhase * 100;
        setXp(prev => prev + earnedXP);
        setGold(prev => prev + earnedGold);
        addLog(`🏆 ПОБЕДА! +${earnedXP} XP и +${earnedGold} золота!`, "#FFD700");
        return;
      }
    }

    setCooldowns(prev => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([k, v]) => { if (Number(v) > 1) next[Number(k)] = Number(v) - 1; });
      if (ability.cooldown > 0) next[ability.id] = ability.cooldown;
      return next;
    });

    setTimeout(() => {
      setPlayerHP(prev => { enemyAttack(prev); return prev; });
    }, 800);
  };

  const normalAttack = () => {
    if (gameState !== "playerTurn") return;
    setGameState("enemyTurn");

    const [min, max] = playerWeapon.damage;
    let dmg = Math.floor(Math.random() * (max - min + 1)) + min + (statLevels.attack || 0) * 2;
    const isCrit = Math.random() < 0.1 + (statLevels.crit || 0) * 0.05;
    if (isCrit) dmg = Math.floor(dmg * 1.5);

    const newBossHP = Math.max(0, bossHP - dmg);
    setBossHP(newBossHP);
    setShakeBoss(true);
    setTimeout(() => setShakeBoss(false), 500);
    triggerFlash("rgba(255,165,0,0.3)");

    const newCombo = comboCount + 1;
    setComboCount(newCombo);
    const critText = isCrit ? " 💢 КРИТ!" : "";
    addLog(`${playerWeapon.icon} Удар «${playerWeapon.name}»: ${dmg} урона!${critText}`, "#FF8C00");

    if (newBossHP <= 0) {
      setGameState("victory");
      setXp(p => p + 150);
      setGold(p => p + 200);
      addLog("🏆 ПОБЕДА! Босс повержен!", "#FFD700");
      return;
    }

    setCooldowns(prev => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([k, v]) => { if (Number(v) > 1) next[Number(k)] = Number(v) - 1; });
      return next;
    });

    setTimeout(() => {
      setPlayerHP(prev => { enemyAttack(prev); return prev; });
    }, 700);
  };

  const upgradeStatFn = (statId: string, cost: number) => {
    if (gold < cost) return;
    setGold(p => p - cost);
    setStatLevels(prev => ({ ...prev, [statId]: (prev[statId] || 0) + 1 }));
  };

  const bossHPPercent = (bossHP / bossMaxHP) * 100;
  const playerHPPercent = (playerHP / playerMaxHP) * 100;
  const playerMPPercent = (playerMP / playerMaxMP) * 100;
  const xpPercent = (xp % 500) / 5;

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {flashEffect && (
        <div className="fixed inset-0 pointer-events-none z-50" style={{ backgroundColor: flashEffect, transition: "opacity 0.4s" }} />
      )}

      {/* Header */}
      <div className="border-b border-orange-900/50" style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1a0a0a 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🐍</div>
            <div>
              <div className="text-orange-400 text-lg leading-none font-bold" style={{ fontFamily: "'Russo One', sans-serif" }}>ВОРМИКС</div>
              <div className="text-gray-500 text-xs">Боевая Арена</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
              <span>💰</span><span>{gold.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-purple-300 text-xs font-bold">⭐ Ур. {level}</span>
              <div className="w-20 h-1.5 bg-gray-700 rounded-full mt-0.5">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex border-b border-gray-800">
          {(["arena", "equipment", "stats"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-bold transition-all ${tab === t ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-500 hover:text-gray-300"}`}
              style={{ fontFamily: "'Russo One', sans-serif" }}>
              {t === "arena" ? "⚔️ АРЕНА" : t === "equipment" ? "🛡️ СНАРЯЖЕНИЕ" : "📊 РАЗВИТИЕ"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">

        {/* === ARENA === */}
        {tab === "arena" && (
          <div className="space-y-4">
            {/* Battle field */}
            <div className="relative rounded-2xl overflow-hidden border border-orange-900/40" style={{ minHeight: 240 }}>
              <img src={ARENA_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75))" }} />

              {bossPhase > 1 && gameState !== "idle" && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${bossPhase === 3 ? "bg-red-600 animate-pulse" : "bg-orange-600"}`}
                    style={{ fontFamily: "'Russo One', sans-serif" }}>
                    {bossPhase === 2 ? "⚠️ ФАЗА 2 — ЯРОСТЬ" : "💀 ФАЗА 3 — БЕРСЕРК"}
                  </div>
                </div>
              )}

              <div className="relative z-10 flex items-end justify-between px-6 py-4 h-56">
                {/* Player side */}
                <div className={`flex flex-col items-center gap-2 transition-transform ${shakePlayer ? "translate-x-2" : ""}`}>
                  <div className="relative">
                    <img src={PLAYER_IMG} alt="Player" className="w-20 h-20 object-cover rounded-full border-2 border-green-400 shadow-lg shadow-green-500/30" />
                    {comboCount >= 3 && (
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-xs font-bold px-1.5 py-0.5 animate-pulse">x{comboCount}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-green-300">Твой червяк</div>
                    <div className="text-xs text-gray-400">{playerWeapon.icon} {playerWeapon.name}</div>
                  </div>
                </div>

                {/* Center */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-3xl font-bold text-orange-400" style={{ fontFamily: "'Russo One', sans-serif", textShadow: "0 0 20px #FF4500" }}>VS</div>
                  <div className="text-xs font-bold mt-1">
                    {gameState === "idle" && <span className="text-gray-400">Начни бой!</span>}
                    {gameState === "playerTurn" && <span className="text-green-400 animate-pulse">Твой ход</span>}
                    {gameState === "enemyTurn" && <span className="text-red-400 animate-pulse">Атака...</span>}
                    {gameState === "victory" && <span className="text-yellow-400">🏆 ПОБЕДА!</span>}
                    {gameState === "defeat" && <span className="text-red-400">💀 ПОРАЖЕНИЕ</span>}
                  </div>
                </div>

                {/* Boss side */}
                <div className={`flex flex-col items-center gap-2 transition-transform ${shakeBoss ? "-translate-x-2" : ""}`}>
                  <div className="relative">
                    <img src={BOSS_IMG} alt="Boss" className={`w-20 h-20 object-cover rounded-full border-2 shadow-lg ${bossPhase === 3 ? "border-red-500 shadow-red-500/50 animate-pulse" : bossPhase === 2 ? "border-orange-500 shadow-orange-400/30" : "border-red-800 shadow-red-900/30"}`} />
                    {bossPhase > 1 && <div className="absolute -top-1 -right-1 text-base">{bossPhase === 3 ? "💀" : "⚠️"}</div>}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-red-300">Тёмный Босс</div>
                    <div className="text-xs text-gray-400">Фаза {bossPhase}/3</div>
                  </div>
                </div>
              </div>
            </div>

            {/* HP/MP bars */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-green-400 font-bold">❤️ HP</span>
                    <span className="text-gray-300 text-xs">{playerHP}/{playerMaxHP}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${playerHPPercent}%`, background: playerHPPercent > 50 ? "#22c55e" : playerHPPercent > 25 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-400 font-bold">💎 Мана</span>
                    <span className="text-gray-300 text-xs">{playerMP}/{playerMaxMP}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${playerMPPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400 font-bold">💀 Босс HP</span>
                  <span className="text-gray-300 text-xs">{bossHP}/{bossMaxHP}</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bossHPPercent}%`, background: bossHPPercent > 50 ? "#ef4444" : bossHPPercent > 25 ? "#f97316" : "#dc2626" }} />
                </div>
                {[1, 2, 3].map(phase => (
                  <div key={phase} className={`text-xs flex items-center gap-1 ${bossPhase >= phase ? "text-orange-400" : "text-gray-600"}`}>
                    <span>{bossPhase >= phase ? "●" : "○"}</span>
                    <span>{phase === 1 ? "Нормальный" : phase === 2 ? "Ярость" : "Берсерк"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Combat log */}
            <div className="bg-gray-900/80 rounded-xl border border-gray-800 p-3">
              <div className="text-xs text-gray-500 mb-2 font-bold" style={{ fontFamily: "'Russo One', sans-serif" }}>📜 БОЙ</div>
              <div className="space-y-1 min-h-12">
                {logs.map((log, i) => (
                  <div key={log.id} className="text-xs" style={{ color: log.color, opacity: Math.max(0.2, 1 - i * 0.15) }}>
                    {log.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {gameState === "idle" && (
              <button onClick={startBattle}
                className="w-full py-4 rounded-2xl font-bold text-lg text-black transition-all hover:scale-105 active:scale-95"
                style={{ fontFamily: "'Russo One', sans-serif", background: "linear-gradient(135deg, #FF4500, #FF8C00)", boxShadow: "0 0 30px rgba(255,69,0,0.5)" }}>
                ⚔️ НАЧАТЬ БОЙ
              </button>
            )}

            {(gameState === "victory" || gameState === "defeat") && (
              <button onClick={resetBattle}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105 active:scale-95"
                style={{ fontFamily: "'Russo One', sans-serif", background: gameState === "victory" ? "linear-gradient(135deg, #FFD700, #FF8C00)" : "linear-gradient(135deg, #8B0000, #DC143C)", boxShadow: "0 0 30px rgba(255,165,0,0.3)" }}>
                {gameState === "victory" ? "🏆 СЫГРАТЬ СНОВА" : "💀 ВОЗРОДИТЬСЯ"}
              </button>
            )}

            {(gameState === "playerTurn" || gameState === "enemyTurn") && (
              <div className="space-y-3">
                <button onClick={normalAttack} disabled={gameState !== "playerTurn"}
                  className="w-full py-3 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Russo One', sans-serif", background: "linear-gradient(135deg, #FF6B35, #FF4500)" }}>
                  {playerWeapon.icon} АТАКОВАТЬ — {playerWeapon.name}
                </button>

                <div className="grid grid-cols-3 gap-2">
                  {ABILITIES.map(ab => {
                    const cd = cooldowns[ab.id] || 0;
                    const disabled = gameState !== "playerTurn" || playerMP < ab.mp || cd > 0;
                    return (
                      <button key={ab.id} onClick={() => castAbility(ab)} disabled={disabled}
                        className="relative py-2 px-1 rounded-xl text-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border"
                        style={{ background: disabled ? "#1f2937" : `${ab.color}22`, borderColor: disabled ? "#374151" : ab.color }}>
                        <div className="text-xl">{ab.icon}</div>
                        <div className="text-xs font-bold leading-tight mt-0.5" style={{ color: disabled ? "#6B7280" : ab.color }}>{ab.name}</div>
                        <div className="text-xs text-blue-300 mt-0.5">💎{ab.mp}</div>
                        {cd > 0 && (
                          <div className="absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center">
                            <span className="text-orange-400 font-bold">{cd}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {comboCount >= 3 && (
                  <div className="text-center text-orange-400 font-bold text-sm animate-pulse" style={{ fontFamily: "'Russo One', sans-serif" }}>
                    🔥 КОМБО x{comboCount}! Следующий удар усилен!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* === EQUIPMENT === */}
        {tab === "equipment" && (
          <div className="space-y-5">
            <div>
              <div className="text-sm font-bold text-orange-400 mb-3" style={{ fontFamily: "'Russo One', sans-serif" }}>
                🗡️ ОРУЖИЕ — <span className="text-gray-400 font-normal text-xs">Выбрано: {playerWeapon.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {WEAPONS.map(w => (
                  <button key={w.id} onClick={() => setPlayerWeapon(w)}
                    className="p-3 rounded-xl border text-left transition-all hover:scale-102"
                    style={{
                      background: playerWeapon.id === w.id ? "#1c1917" : "#111827",
                      borderColor: playerWeapon.id === w.id ? rarityColor[w.rarity] : "#374151",
                      boxShadow: playerWeapon.id === w.id ? `0 0 15px ${rarityColor[w.rarity]}40` : "none"
                    }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{w.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-white">{w.name}</div>
                        <div className="text-xs font-bold" style={{ color: rarityColor[w.rarity] }}>{w.rarity.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-red-400">⚔️ {w.damage[0]}-{w.damage[1]}</span>
                      <span className="text-cyan-400">🔮 {w.type}</span>
                    </div>
                    {playerWeapon.id === w.id && <div className="mt-1 text-xs text-green-400 font-bold">✓ ЭКИПИРОВАНО</div>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-blue-400 mb-3" style={{ fontFamily: "'Russo One', sans-serif" }}>
                🛡️ БРОНЯ — <span className="text-gray-400 font-normal text-xs">Выбрана: {playerArmor.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ARMORS.map(a => (
                  <button key={a.id} onClick={() => setPlayerArmor(a)}
                    className="p-3 rounded-xl border text-left transition-all hover:scale-102"
                    style={{
                      background: playerArmor.id === a.id ? "#0c1a2e" : "#111827",
                      borderColor: playerArmor.id === a.id ? rarityColor[a.rarity] : "#374151",
                      boxShadow: playerArmor.id === a.id ? `0 0 15px ${rarityColor[a.rarity]}40` : "none"
                    }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{a.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-white">{a.name}</div>
                        <div className="text-xs font-bold" style={{ color: rarityColor[a.rarity] }}>{a.rarity.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-blue-400">🛡️ -{a.defense}</span>
                      <span className="text-green-400">❤️ +{a.hp}</span>
                    </div>
                    {playerArmor.id === a.id && <div className="mt-1 text-xs text-green-400 font-bold">✓ ЭКИПИРОВАНО</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === STATS === */}
        {tab === "stats" && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="text-sm font-bold text-yellow-400 mb-3" style={{ fontFamily: "'Russo One', sans-serif" }}>⭐ ПЕРСОНАЖ</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Уровень", value: level, icon: "⭐", color: "#A855F7" },
                  { label: "Опыт", value: `${xp % 500}/500`, icon: "📈", color: "#3B82F6" },
                  { label: "Золото", value: gold, icon: "💰", color: "#F59E0B" },
                ].map(s => (
                  <div key={s.label} className="bg-gray-800 rounded-lg p-2">
                    <div className="text-lg">{s.icon}</div>
                    <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>XP до следующего уровня</span>
                  <span>{500 - (xp % 500)}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-orange-400" style={{ fontFamily: "'Russo One', sans-serif" }}>📊 УЛУЧШЕНИЯ</div>
                <span className="text-yellow-400 text-xs font-bold">💰 {gold} золота</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {STATS_UPGRADES.map(s => {
                  const lvl = statLevels[s.id] || 0;
                  const cost = s.cost + lvl * 20;
                  const canAfford = gold >= cost;
                  return (
                    <div key={s.id} className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{s.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-white">{s.name}</div>
                          <div className="text-xs text-gray-400">Ур. {lvl} · +{s.value * (lvl + 1)}</div>
                        </div>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < lvl ? "#F97316" : "#374151" }} />
                        ))}
                      </div>
                      <button onClick={() => upgradeStatFn(s.id, cost)} disabled={!canAfford}
                        className="w-full py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontFamily: "'Russo One', sans-serif", background: canAfford ? "linear-gradient(135deg, #F59E0B, #D97706)" : "#374151", color: canAfford ? "#000" : "#6B7280" }}>
                        💰 {cost} золота
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}