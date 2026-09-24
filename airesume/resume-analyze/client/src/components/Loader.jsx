import { FaFileAlt } from "react-icons/fa";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#1b120f]">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-28 h-28 rounded-full border-2 border-rose-500/30 loader-ring" />
        <div className="absolute w-28 h-28 rounded-full border-2 border-amber-400/30 loader-ring loader-ring-reverse" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2e1c16] to-[#241814] border border-white/10 shadow-[0_0_40px_rgba(225,29,72,0.25)] flex items-center justify-center loader-breathe">
          <FaFileAlt className="text-3xl text-rose-400" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-semibold text-stone-200 loader-text">
          {message}
        </p>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 loader-dot"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Spinner({ size = "w-4 h-4" }) {
  return (
    <span className={`${size} rounded-full border-2 border-white/30 border-t-white animate-spin inline-block`} />
  );
}