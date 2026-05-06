import { ARENA_BG, PLAYER_IMG, BOSS_IMG, ABILITIES, GameState, BattleLog } from "./constants";

type Weapon = { id: number; name: string; icon: string; damage: [number, number]; type: string; rarity: string };

interface ArenaTabProps {
  gameState: GameState;
  playerHP: number;
  playerMaxHP: number;
  playerMP: number;
  playerMaxMP: number;
  bossHP: number;
  bossMaxHP: number;
  bossPhase: number;
  comboCount: number;
  shakePlayer: boolean;
  shakeBoss: boolean;
  logs: BattleLog[];
  cooldowns: Record<number, number>;
  playerWeapon: Weapon;
  onStartBattle: () => void;
  onResetBattle: () => void;
  onNormalAttack: () => void;
  onCastAbility: (ability: typeof ABILITIES[0]) => void;
}

export default function ArenaTab({
  gameState,
  playerHP, playerMaxHP,
  playerMP, playerMaxMP,
  bossHP, bossMaxHP,
  bossPhase,
  comboCount,
  shakePlayer,
  shakeBoss,
  logs,
  cooldowns,
  playerWeapon,
  onStartBattle,
  onResetBattle,
  onNormalAttack,
  onCastAbility,
}: ArenaTabProps) {
  const bossHPPercent = (bossHP / bossMaxHP) * 100;
  const playerHPPercent = (playerHP / playerMaxHP) * 100;
  const playerMPPercent = (playerMP / playerMaxMP) * 100;

  return (
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
        <button onClick={onStartBattle}
          className="w-full py-4 rounded-2xl font-bold text-lg text-black transition-all hover:scale-105 active:scale-95"
          style={{ fontFamily: "'Russo One', sans-serif", background: "linear-gradient(135deg, #FF4500, #FF8C00)", boxShadow: "0 0 30px rgba(255,69,0,0.5)" }}>
          ⚔️ НАЧАТЬ БОЙ
        </button>
      )}

      {(gameState === "victory" || gameState === "defeat") && (
        <button onClick={onResetBattle}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105 active:scale-95"
          style={{ fontFamily: "'Russo One', sans-serif", background: gameState === "victory" ? "linear-gradient(135deg, #FFD700, #FF8C00)" : "linear-gradient(135deg, #8B0000, #DC143C)", boxShadow: "0 0 30px rgba(255,165,0,0.3)" }}>
          {gameState === "victory" ? "🏆 СЫГРАТЬ СНОВА" : "💀 ВОЗРОДИТЬСЯ"}
        </button>
      )}

      {(gameState === "playerTurn" || gameState === "enemyTurn") && (
        <div className="space-y-3">
          <button onClick={onNormalAttack} disabled={gameState !== "playerTurn"}
            className="w-full py-3 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Russo One', sans-serif", background: "linear-gradient(135deg, #FF6B35, #FF4500)" }}>
            {playerWeapon.icon} АТАКОВАТЬ — {playerWeapon.name}
          </button>

          <div className="grid grid-cols-3 gap-2">
            {ABILITIES.map(ab => {
              const cd = cooldowns[ab.id] || 0;
              const disabled = gameState !== "playerTurn" || playerMP < ab.mp || cd > 0;
              return (
                <button key={ab.id} onClick={() => onCastAbility(ab)} disabled={disabled}
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
  );
}
