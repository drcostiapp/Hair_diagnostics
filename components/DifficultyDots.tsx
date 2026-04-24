export default function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1" aria-label={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= level ? "bg-gold" : "bg-anchor/15"
          }`}
        />
      ))}
    </div>
  );
}
