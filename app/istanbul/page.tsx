import styles from "./istanbul.module.css";

export const metadata = {
  title: "Istanbul",
  description: "A moment in Istanbul"
};

export default function IstanbulPage() {
  const particles = Array.from({ length: 24 });

  return (
    <main className={styles.stage}>
      <div className={styles.frame}>
        <div className={styles.photoWrap}>
          <img
            src="/istanbul.jpg"
            alt="Family sitting in front of an old building in Istanbul"
            className={styles.photo}
          />
          <div className={styles.sunlight} aria-hidden="true" />
          <div className={styles.haze} aria-hidden="true" />
          <div className={styles.particles} aria-hidden="true">
            {particles.map((_, i) => (
              <span
                key={i}
                className={styles.particle}
                style={{
                  left: `${(i * 37) % 100}%`,
                  animationDelay: `${(i % 8) * 0.7}s`,
                  animationDuration: `${8 + (i % 5) * 2}s`,
                  opacity: 0.35 + ((i % 4) * 0.15)
                }}
              />
            ))}
          </div>
          <div className={styles.vignette} aria-hidden="true" />
        </div>

        <div className={styles.caption}>
          <span className={styles.kicker}>Nisan · April</span>
          <h1 className={styles.title}>
            <span>I</span><span>s</span><span>t</span><span>a</span>
            <span>n</span><span>b</span><span>u</span><span>l</span>
          </h1>
          <p className={styles.subtitle}>İyi ki buradayız.</p>
        </div>
      </div>
    </main>
  );
}
