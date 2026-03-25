# Agent Guidelines for UNBLOCKMATH Arcade

This document provides coding guidelines and instructions for agents working on this repository.

## Project Overview

UNBLOCKMATH Arcade is a static HTML game launcher website. The main file is `index.html` which contains:
- Embedded CSS styling with CSS custom properties
- Vanilla JavaScript for game filtering, search, and modal functionality
- Game data defined in the `GAMES` constant array

## UI/UX Vibe Standards (Anti-AI Visuals)
- **No "SaaS-Standard" Blue:** Avoid the default #3b82f6 blue unless specifically requested. Use a more intentional palette (e.g., Zinc, Slate, or high-contrast Monochrome).
- **Functional Typography:** Use tight tracking for headings and generous line-height for body text. No generic "Inter" for everything; suggest high-quality system fonts (SF Pro, Geist, or Cascadia).
- **The "Bento" Ban:** Don't default to the overused "Bento Box" grid layout unless it's the best functional choice. Try asymmetrical or minimal "Swiss" layouts.
- **Micro-Interactions:** Focus on "Snap" rather than "Bounce." Use fast, linear-out or ease-in-out transitions (150ms max). AI likes 300ms+ which feels sluggish.
- **Empty State Logic:** Never use a generic "No data found" illustration. Use subtle empty-state typography or a "skeleton" that matches the actual UI structure.
- **Intentional Contrast:** Use borders sparingly. Use subtle background shifts (e.g., $bg-canvas$ vs $bg-subtle$) to define areas instead of heavy strokes.


Agent Orchestration Rules
You have access to the following subagents. Use them automatically based on the task:

1. **@researcher**: Call this immediately if the user asks about a library, API, or documentation you are unsure of.
2. **@reviewer**: After writing more than 50 lines of code, trigger a self-review using this agent.
3. **@vibe-checker**: Before declaring a task "done," run a vibe check to ensure the code isn't over-engineered.

**Protocol:** If a task is complex, document the plan first, then call the relevant subagent to execute or verify.

#

## Build & Development Commands

This is a **static website** with no build system. There are no npm packages, build scripts, or test frameworks.

- **Development**: Open `index.html` directly in a browser, or serve with a local server:
  ```bash
  npx serve .        # Serve current directory
  python -m http.server 8000  # Python alternative
  ```
- **Linting**: No formal linter configured. Manual code review required.
- **Testing**: No test framework exists. Test manually by opening in browser.

## Code Style Guidelines

### HTML
- Use semantic HTML5 elements (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`)
- Include appropriate ARIA attributes for accessibility (`aria-label`, `role`, `aria-modal`)
- Always include `lang` attribute on `<html>` element
- Use lowercase for HTML tags and attributes
- Double quotes for attribute values

### CSS
- Use CSS custom properties (CSS variables) for colors and reusable values
- Follow the existing pattern: define variables in `:root` at the top of `<style>`
- Use 2-space indentation
- Group related styles together with section comments (e.g., `/* ── HEADER ── */`)
- Use `var(--name)` for referencing custom properties
- Prefer flexbox and grid for layout
- Mobile-first responsive design with `@media` queries

### JavaScript
- Use ES6+ syntax (const/let, arrow functions, template literals)
- Use `const` by default, `let` only when reassignment is needed
- Prefer `forEach` over traditional `for` loops
- Use template literals for string interpolation
- Add JSDoc comments for functions explaining purpose and parameters
- Use meaningful variable names (avoid single letters except for loop indices)
- Use semantic variable naming: `activeCat`, `gameFrame`, `closeBtn` (camelCase)

### Naming Conventions
- **CSS classes**: kebab-case (e.g., `.card-title`, `.cat-btn`)
- **JavaScript variables**: camelCase (e.g., `activeCat`, `gameFrame`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `GAMES`)
- **Files**: kebab-case for new files (e.g., `game-list.html`)

### Game Data Structure
Games are defined in the `GAMES` array in `index.html`. Each game object follows this schema:

```javascript
{
  id: number,           // Unique identifier
  title: string,        // Display name
  cat: string,          // Category: "action" | "puzzle" | "strategy" | "classic" | "riddle"
  icon: string,        // Emoji or image filename
  desc: string,        // Short description
  url: string          // Path or full URL to game
}
```

When adding new games:
1. Add entry to `GAMES` array with appropriate id
2. Ensure game folder exists in `Games/` directory
3. Verify game loads correctly in modal iframe

### Error Handling
- Use try-catch for potentially failing operations (e.g., image loading)
- Provide fallback content for missing images
- Ensure graceful degradation if JavaScript fails

### Accessibility
- Always include `aria-label` on interactive elements
- Use semantic elements for proper screen reader support
- Ensure keyboard navigation works (tab index, focus management)
- Include `alt` text for images

### File Organization
- Main application: `index.html`
- Game files: `Games/<GameName>/index.html`
- Assets (images): Store in same location as index.html or appropriate game folder

## Common Tasks

### Adding a New Game
1. Create game folder in `Games/<GameName>/`
2. Add `index.html` (or appropriate entry point) to game folder
3. Add entry to `GAMES` array in main `index.html`
4. Test by opening main index.html and clicking the game card

### Modifying Styles
- Edit CSS in the `<style>` block in `index.html`
- Follow existing CSS variable naming pattern
- Test across different screen sizes

### Modifying Game Logic
- JavaScript is embedded in `<script>` tag at bottom of `index.html`
- Main functions: `render()`, `openGame()`, `closeGame()`
- Event listeners setup at bottom of script

## Git Conventions

- Make commits atomic and descriptive
- Write commit messages in present tense (e.g., "Add new game" not "Added")
- Do not commit sensitive data (API keys, credentials)
- Push changes only when explicitly requested by user