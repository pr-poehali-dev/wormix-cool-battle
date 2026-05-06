import { WEAPONS, ARMORS, rarityColor } from "./constants";

type Weapon = typeof WEAPONS[0];
type Armor = typeof ARMORS[0];

interface EquipmentTabProps {
  playerWeapon: Weapon;
  playerArmor: Armor;
  onSelectWeapon: (w: Weapon) => void;
  onSelectArmor: (a: Armor) => void;
}

export default function EquipmentTab({ playerWeapon, playerArmor, onSelectWeapon, onSelectArmor }: EquipmentTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-bold text-orange-400 mb-3" style={{ fontFamily: "'Russo One', sans-serif" }}>
          🗡️ ОРУЖИЕ — <span className="text-gray-400 font-normal text-xs">Выбрано: {playerWeapon.name}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {WEAPONS.map(w => (
            <button key={w.id} onClick={() => onSelectWeapon(w)}
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
            <button key={a.id} onClick={() => onSelectArmor(a)}
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
  );
}
