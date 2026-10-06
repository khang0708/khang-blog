import TechIcon from "./TechIcon";

const names = ["Vue 3", "React", "Next.js", "TypeScript", "Node.js", "NestJS", "Laravel", "PostgreSQL", "MongoDB", "Redis", "Docker", "GitLab", "Claude", "Gemini"];

// Infinite logo strip; the list is doubled so the -50% loop is seamless.
export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[...names, ...names].map((n, i) => (
          <span key={i}><TechIcon name={n} />{n}</span>
        ))}
      </div>
    </div>
  );
}
