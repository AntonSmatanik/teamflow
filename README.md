# TeamFlow

A real-time team messaging platform built with Next.js — featuring channels, threaded replies, rich-text editing, file attachments, emoji reactions, and an AI assistant.

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 15 (App Router, Turbopack)  |
| Language     | TypeScript                          |
| Auth         | Kinde                               |
| Database     | PostgreSQL via Prisma (pg adapter)  |
| API          | oRPC + TanStack Query               |
| AI           | Vercel AI SDK (OpenAI / OpenRouter) |
| Rich Text    | Tiptap                              |
| File Uploads | UploadThing                         |
| Security     | Arcjet                              |
| Styling      | Tailwind CSS + shadcn/ui            |

## Features

- **Workspaces & Channels** — create workspaces, invite members, and organise conversations into channels
- **Threaded Replies** — reply to any message in a dedicated sidebar thread
- **Rich Text Editor** — bold, italic, code blocks, alignment, and inline image uploads via Tiptap
- **Emoji Reactions** — react to messages with an emoji picker
- **File Attachments** — upload and preview images directly in messages (UploadThing)
- **AI Assistant** — AI-powered responses protected by Arcjet rate-limiting
- **Auth** — OAuth (Google, GitHub) and email/password via Kinde
- **Dark Mode** — first-class light/dark theme support

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A PostgreSQL database (e.g. Neon)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root. Required variables:

```env
# Kinde
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=

# Database
DATABASE_URL=

# UploadThing
UPLOADTHING_TOKEN=

# Arcjet
ARCJET_KEY=

# AI (OpenAI or OpenRouter)
OPENAI_API_KEY=
```

### Database Setup

```bash
pnpm prisma migrate dev
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
app/
  (marketing)/        # Landing page
  (dashboard)/
    workspace/        # Workspace list & creation
      [workspaceId]/
        channel/
          [channelId]/  # Main channel view, messages, threads
  api/
    auth/             # Kinde auth handler
    uploadthing/      # File upload handler
  middlewares/        # Auth, Arcjet guards
  router/             # oRPC routers (workspace, channel, message, member, AI)
  rpc/                # oRPC HTTP handler
  schemas/            # Zod input schemas
components/           # Shared UI components & rich-text editor
lib/                  # DB client, oRPC setup, utilities
prisma/               # Prisma schema & migrations
providers/            # React context providers
```

## License

MIT
