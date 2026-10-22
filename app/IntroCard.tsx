import Image from "next/image";

// Career started January 2022; shown as whole years, e.g. "4+".
const yearsExp = Math.floor((Date.now() - Date.UTC(2022, 0, 1)) / (365.25 * 24 * 60 * 60 * 1000));

const links = [
  { href: "https://agam-portfolio.web.app/", label: "Portfolio", primary: true },
  { href: "https://github.com/vns-agm", label: "GitHub" },
  { href: "https://www.linkedin.com/in/agam-srivastava-33456b212/", label: "LinkedIn" },
  { href: "https://ratings.fide.com/profile/25662210", label: "FIDE" },
];

export default function IntroCard() {
  return (
    <section className="intro card" aria-label="About me">
      <Image
        src="/images/agam.jpg"
        alt="Agam Srivastava holding a medal at The Chess Conquerors' Cup 2025"
        width={132}
        height={132}
        className="intro-photo"
        priority
      />
      <div className="intro-body">
        <h1>Hi, I&apos;m Agam Srivastava</h1>
        <p className="intro-role">Senior Software Engineer @ Sopra Steria</p>
        <ul className="intro-tags">
          <li>💻 Engineer</li>
          <li>🏅 Chess player</li>
          <li>🚀 Coding enthusiast</li>
        </ul>
        <p>
          I&apos;ve spent {yearsExp}+ years building web apps with React, Next.js, Node.js and AWS. Away from
          the keyboard I&apos;m a national-level chess player (FIDE 1525).
          This blog is where I share what I learn.
        </p>
        <div className="intro-links">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={l.primary ? "button" : "chip"}>
              {l.label}
              {l.primary && " →"}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
