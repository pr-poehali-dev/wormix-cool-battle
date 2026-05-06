import { STATS_UPGRADES } from "./constants";

interface StatsTabProps {
  level: number;
  xp: number;
  gold: number;
  statLevels: Record<string, number>;
  onUpgradeStat: (statId: string, cost: number) => void;
}

export default function StatsTab({ level, xp, gold, statLevels, onUpgradeStat }: StatsTabProps) {
  const xpPercent = (xp % 500) / 5;

  return (
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
                <button onClick={() => onUpgradeStat(s.id, cost)} disabled={!canAfford}
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
  );
}
