# Project rules (apply to every task)
1. Use semantic HTML5 elements for accessibility and SEO.
2. Keep spacing on an 8 px grid.
3. Every animation must respect prefers-reduced-motion through useMotionPolicy().
4. All colours are CSS variables; no hex or rgb values in components.
5. Dependency direction: components -> hooks -> services -> lib. Domain logic stays pure.
6. Naming: kebab-case files, PascalCase components, useX hooks, SCREAMING_SNAKE constants.
7. Typed errors everywhere; every async UI path has loading, error and empty states.
8. Config comes from validated env only; never commit secrets; update .env.example.
9. No dead or duplicate code. Run `npm run check` before declaring any task done.
10. Domain logic ships with tests. Comments explain why, not what.
11. Justify every new dependency in one line; prefer what is already installed.
12. /reference is read-only. Small conventional commits. If blocked, ask instead of guessing.
