import {FONTS} from '../../data/fonts';

export default function FontSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Font Style</label>
      <select className="w-full input" value={value} onChange={(e) => onChange(e.target.value)}>
        {FONTS.map(f => (
          <option key={f.label} value={f.value} style={{fontFamily: f.value}}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
}
