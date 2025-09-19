# Agent Guidelines for Perplexica

## Build/Lint/Test Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes database push)
- `npm run lint` - Run ESLint checks
- `npm run format:write` - Format code with Prettier
- `npm run db:push` - Push database schema changes
- No test framework configured - verify changes manually

## Code Style Guidelines

- Use TypeScript with strict mode enabled
- Import paths: Use `@/*` alias for src directory imports
- Formatting: Prettier with 80 char width, single quotes, trailing commas
- Components: PascalCase, functional components with hooks
- Files: camelCase for utilities, PascalCase for components
- Types: Define interfaces in TypeScript, use `type` for unions
- Error handling: Use try-catch blocks, proper error propagation
- Database: Use Drizzle ORM with SQLite, run `db:push` after schema changes
- Next.js: App router structure, server/client components as needed
- Styling: Tailwind CSS classes, responsive design patterns
- Dependencies: LangChain for AI, React 18, Next.js 15

## Architecture Notes

- Next.js app with API routes for backend functionality
- LangChain integration for AI search agents and chat
- Database migrations via Drizzle kit
