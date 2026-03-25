\# 🕹️ GAME GUIDE



> \*\*MANDATORY:\*\* All games generated or integrated must follow these rules. High-quality "found" logic is preferred over generic AI-generated templates, but must be refactored to match these "Vibe" standards.



\---



\## 1. Core Logic \& Performance

\- \*\*Snappy Game Loop:\*\* Use `requestAnimationFrame` for all rendering. Logic updates should be decoupled from frame rate where possible.

\- \*\*Single Source of Truth:\*\* Store the entire game state in one object. This ensures easy debugging and state-sharing between agents.

\- \*\*Input Buffer:\*\* Implement a tiny input buffer (coyote time) for platformers or fast-paced games to make controls feel "forgiving" and professional.



\## 2. Visual "Vibe" (Anti-AI Aesthetic)

\- \*\*Opinionated Palettes:\*\* Never use CSS default colors (e.g., "red", "blue"). Use a strictly defined palette like \*\*Nord\*\*, \*\*Dracula\*\*, or \*\*Tokyo Night\*\*.

\- \*\*No Floating UI:\*\* Game info (health, score) should be integrated into the world or use high-quality, high-contrast typography (Geist Mono or Cascadia Code).

\- \*\*Pixel Perfection:\*\* If 2D, use `image-rendering: pixelated;` and ensure sprites move on integer coordinates to avoid AI-style blurriness.



\## 3. The "Juice" Factor (Feel)

\- \*\*Screenshake:\*\* Add subtle camera shakes on impact or explosions.

\- \*\*Tweening:\*\* Use Easing functions (Ease-In-Out) for all UI transitions. AI defaults to linear movement, which feels robotic.

\- \*\*Particles:\*\* Always include a simple particle system for "dust" or "sparks" to add life to the environment.



\## 4. Sourcing Policy

\- \*\*Prefer Proven Logic:\*\* If a specialized algorithm exists (A\*, Perlin Noise, Physics engines), have the \*\*@researcher\*\* find a battle-tested version online.

\- \*\*Refactor Heavy:\*\* Strip all generic comments and boilerplate from found code. If the code looks like a "Hello World" tutorial, it must be refactored to be more idiomatic.

\- \*\*Cleanup:\*\* Every game component must have a `destroy()` or `unmount()` function to prevent memory leaks and ghost loops.

