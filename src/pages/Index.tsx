import { useState, useEffect, useCallback } from "react";
import { Tab, GameState, BattleLog, WEAPONS, ARMORS, ABILITIES } from "@/components/game/constants";
import ArenaTab from "@/components/game/ArenaTab";
import EquipmentTab from "@/components/game/EquipmentTab";
import StatsTab from "@/components/game/StatsTab";

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
      { name: "Укус тьмы", dmg: [20, 35] as [number, number], color: "#9400D3", icon: "🌑" },
      { name: "Огненное дыхание", dmg: [25, 45] as [number, number], color: "#FF4500", icon: "🔥" },
      { name: "Ядовитый плевок", dmg: [15, 25] as [number, number], color: "#00FF00", icon: "☠️" },
    ];
    if (bossPhase === 3) bossAttacks.push({ name: "ЯРОСТЬ БОССА", dmg: [40, 65] as [number, number], color: "#FF0000", icon: "💀" });

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
        {tab === "arena" && (
          <ArenaTab
            gameState={gameState}
            playerHP={playerHP}
            playerMaxHP={playerMaxHP}
            playerMP={playerMP}
            playerMaxMP={playerMaxMP}
            bossHP={bossHP}
            bossMaxHP={bossMaxHP}
            bossPhase={bossPhase}
            comboCount={comboCount}
            shakePlayer={shakePlayer}
            shakeBoss={shakeBoss}
            logs={logs}
            cooldowns={cooldowns}
            playerWeapon={playerWeapon}
            onStartBattle={startBattle}
            onResetBattle={resetBattle}
            onNormalAttack={normalAttack}
            onCastAbility={castAbility}
          />
        )}

        {tab === "equipment" && (
          <EquipmentTab
            playerWeapon={playerWeapon}
            playerArmor={playerArmor}
            onSelectWeapon={setPlayerWeapon}
            onSelectArmor={setPlayerArmor}
          />
        )}

        {tab === "stats" && (
          <StatsTab
            level={level}
            xp={xp}
            gold={gold}
            statLevels={statLevels}
            onUpgradeStat={upgradeStatFn}
          />
        )}
      </div>
    </div>
  );
}
