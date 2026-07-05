# 📚 Bharat Docs

> A modern, high-performance documentation and notes platform built with **Next.js 16**, **Drizzle ORM**, and **Neon PostgreSQL**.

---

## 🌟 About

**Bharat Docs** is a powerful, free-tier optimized platform designed for organizing, reading, and exploring documents and notes. It features a clean, modern UI with dark/light theme support, nested folder navigation, and seamless GitHub content integration.

### Key Features

- 📁 **Hierarchical Content Management** – Support for nested folders with unlimited depth
- 🔍 **Real-time Search** – Filter documents and notes instantly
- 🌙 **Dark/Light Theme** – Beautiful UI with smooth theme transitions
- 📄 **Multiple File Types** – Support for MDX, PDF, and DOCX files
- 🚀 **Edge-Optimized** – Fast loading with TanStack Query caching
- 📱 **Responsive Design** – Works seamlessly on all devices
- 🔗 **GitHub Integration** – Fetch and display content directly from private GitHub repos

---

## 🏗️ Architectural Design

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  React Components │ TanStack Query │ Theme Provider │ Framer    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                      │
├─────────────────────────────────────────────────────────────────┤
│   (public) Routes    │   Admin Routes   │      API Routes       │
│   ├── /              │   └── /admin     │   ├── /api/docs       │
│   ├── /docs          │                  │   ├── /api/notes      │
│   ├── /docs/[...slug]│                  │   ├── /api/admin/nodes│
│   ├── /notes         │                  │   └── /api/github/    │
│   └── /notes/[...path]                  │        content        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Request Coalescer & Caching Layer                  │
├─────────────────────────────────────────────────────────────────┤
│   LRU Memory Cache  ◄──►  Redis (Pub/Sub + Locks)  ◄──► Queue   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│           Drizzle ORM  ──────►  Neon PostgreSQL                 │
│                                                                 │
│   Tables:                                                       │
│   ├── collections (root categories)                             │
│   ├── nodes (files/folders with self-referencing tree)          │
│   ├── visitors (anonymous user tracking)                        │
│   ├── admins (admin users)                                      │
│   ├── access_logs (content access tracking)                     │
│   └── audit_logs (admin action tracking)                        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
├─────────────────────────────────────────────────────────────────┤
│                 GitHub API (Content Proxy)                      │
└─────────────────────────────────────────────────────────────────┘
```

### 🌪️ Request Coalescing Flow

To prevent database overload during high-traffic spikes (e.g., thousands of users requesting the same document simultaneously), Bharat Docs uses a **Distributed Request Coalescing** system. 

```mermaid
sequenceDiagram
    participant Clients
    participant API as Next.js API
    participant LRU as Memory Cache
    participant Redis as Redis (Locks)
    participant DB as Database

    Clients->>API: 10,000 Concurrent Requests for /api/docs
    
    API->>LRU: Check Cache
    alt Cache Hit
        LRU-->>API: Return instant result
        API-->>Clients: 10,000 Responses
    else Cache Miss
        API->>Redis: Attempt to acquire Lock (SETNX)
        
        alt Lock Acquired (Worker)
            Redis-->>API: Lock Granted
            API->>DB: Execute EXACTLY ONE Database Query
            DB-->>API: Return Data
            API->>LRU: Save to Memory Cache
            API->>Redis: Publish Result (Pub/Sub) & Release Lock
            API-->>Clients: Return Response to waiting queue
        else Lock Denied (Waiters)
            Redis-->>API: Lock Denied
            API->>Redis: Subscribe to Pub/Sub Channel
            Note over API,Redis: Wait for Worker to finish...
            Redis-->>API: Receive Result via Channel
            API-->>Clients: Return Response to waiting queue
        end
    end
```


### Project Structure

```
docs/
├── app/
│   ├── (public)/           # Public routes (grouped)
│   │   ├── docs/           # Documentation viewer
│   │   ├── notes/          # Notes viewer with nested paths
│   │   └── page.js         # Home page
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   │   ├── docs/           # GET documents
│   │   ├── notes/          # GET notes with subfolder count
│   │   ├── admin/nodes/    # CRUD for nodes
│   │   └── github/content/ # GitHub content proxy
│   ├── layout.js           # Root layout with providers
│   └── globals.css         # Global styles
├── components/
│   ├── DocsPage/           # Document page components
│   ├── HomePage/           # Landing page components
│   ├── NotesPage/          # Notes page components
│   ├── ui/                 # Shadcn UI components
│   └── *.jsx               # Shared components
├── lib/
│   ├── db/
│   │   ├── schema.js       # Drizzle schema definitions
│   │   ├── index.js        # Database connection
│   │   └── seed.js         # Database seeding script
│   ├── cache.js            # Caching utilities
│   └── utils.js            # Utility functions
├── drizzle/
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

---

## ⚙️ Setup

### Prerequisites

- **Node.js** 18.17+
- **pnpm** or **npm**
- **Neon PostgreSQL** account (or any PostgreSQL database)
- **GitHub Personal Access Token** (optional, for GitHub content integration)

### Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd docs
```

2. **Install dependencies**:

```bash
npm install
```

3. **Configure environment variables**:

Create a `.env` file in the `docs/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# GitHub Integration (Optional)
github_AT="ghp_your_personal_access_token"
```

4. **Run database migrations**:

```bash
npm run migrate:push
```

5. **Seed the database** (optional):

```bash
npm run seed
```

6. **Start the development server**:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

| Script                   | Description                         |
| ------------------------ | ----------------------------------- |
| `npm run dev`            | Start development server            |
| `npm run build`          | Build for production                |
| `npm run start`          | Start production server             |
| `npm run lint`           | Run ESLint                          |
| `npm run migrate:push`   | Push schema changes to database     |
| `npm run seed`           | Seed the database with initial data |
| `npm run generate:types` | Generate Drizzle types              |

---

## 🔌 API Design

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### `GET /api/docs`

Fetch published documents from a collection.

**Query Parameters:**

| Parameter    | Type     | Default  | Description                       |
| ------------ | -------- | -------- | --------------------------------- |
| `collection` | `string` | `"Docs"` | Collection name to fetch from     |
| `parentSlug` | `string` | `null`   | Parent slug for nested navigation |

**Response:**

```json
[
  {
    "nodeId": "uuid",
    "collectionId": "uuid",
    "parentId": "uuid | null",
    "parentSlug": "string | null",
    "name": "Getting Started",
    "slug": "getting-started",
    "nodeType": "folder | doc",
    "fileType": "mdx | pdf | docx | null",
    "filePath": "string | null",
    "isPublished": true,
    "orderIndex": 1,
    "updatedAt": "2026-01-26T00:00:00.000Z",
    "collectionName": "Docs"
  }
]
```

---

#### `GET /api/notes`

Fetch notes with subfolder counts for hierarchical navigation.

**Query Parameters:**

| Parameter    | Type     | Default   | Description                       |
| ------------ | -------- | --------- | --------------------------------- |
| `collection` | `string` | `"Notes"` | Collection name to fetch from     |
| `parentSlug` | `string` | `null`    | Parent slug for nested navigation |

**Response:**

```json
[
  {
    "nodeId": "uuid",
    "parentId": "uuid | null",
    "parentSlug": "string | null",
    "name": "JavaScript Notes",
    "slug": "javascript-notes",
    "nodeType": "folder | note",
    "fileType": "mdx | pdf | docx | null",
    "filePath": "string | null",
    "isPublished": true,
    "updatedAt": "2026-01-26T00:00:00.000Z",
    "subFolderCount": 5
  }
]
```

---

#### `GET /api/admin/nodes`

Fetch all published folder nodes (admin use).

**Response:**

```json
[
  {
    "id": "uuid",
    "collectionId": "uuid",
    "name": "Folder Name",
    "slug": "folder-name",
    "nodeType": "folder",
    "filePath": null,
    "orderIndex": 1
  }
]
```

---

#### `POST /api/admin/nodes`

Create a new node (folder or document).

**Request Body:**

```json
{
  "collectionId": "uuid",
  "parentId": "uuid | null",
  "parentName": "string | null",
  "name": "New Document",
  "slug": "new-document",
  "nodeType": "doc",
  "filePath": "path/to/file.mdx",
  "fileType": "mdx",
  "orderIndex": 1,
  "isPublished": true
}
```

**Response:**

```json
{
  "id": "uuid",
  "collectionId": "uuid",
  "parentId": "uuid | null",
  "name": "New Document",
  "slug": "new-document",
  "nodeType": "doc",
  "filePath": "path/to/file.mdx",
  "fileType": "mdx",
  "orderIndex": 1,
  "isPublished": true,
  "createdAt": "2026-01-26T00:00:00.000Z",
  "updatedAt": "2026-01-26T00:00:00.000Z"
}
```

---

#### `GET /api/github/content`

Proxy endpoint to fetch file content from private GitHub repositories.

**Query Parameters:**

| Parameter | Type     | Required | Description                                                      |
| --------- | -------- | -------- | ---------------------------------------------------------------- |
| `url`     | `string` | Yes      | GitHub API URL (must start with `https://api.github.com/repos/`) |

**Response:**

```json
{
  "content": "# File Content\n\nThis is the decoded file content...",
  "meta": {
    "path": "docs/example.md",
    "sha": "abc123...",
    "size": 1234,
    "fetchedAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

## 🛠️ Tech Stack

### Frontend

| Technology         | Version | Purpose                                     |
| ------------------ | ------- | ------------------------------------------- |
| **Next.js**        | 16.1.4  | React framework with App Router             |
| **React**          | 19.2.3  | UI library                                  |
| **TanStack Query** | 5.90.20 | Data fetching, caching, and synchronization |
| **Framer Motion**  | 12.29.2 | Animations and transitions                  |
| **Tailwind CSS**   | 4.1.18  | Utility-first CSS framework                 |
| **Radix UI**       | Various | Accessible UI primitives                    |
| **Lucide React**   | 0.563.0 | Icon library                                |

### Backend & Database

| Technology          | Version | Purpose                                   |
| ------------------- | ------- | ----------------------------------------- |
| **Drizzle ORM**     | 0.45.1  | Type-safe ORM for PostgreSQL              |
| **Neon PostgreSQL** | -       | Serverless PostgreSQL database            |
| **postgres**        | 3.4.8   | PostgreSQL driver                         |
| **Drizzle Kit**     | 0.31.8  | Database migrations and schema management |

### Content

| Technology           | Version | Purpose                   |
| -------------------- | ------- | ------------------------- |
| **MDX**              | 3.1.1   | Markdown with JSX support |
| **react-markdown**   | 10.1.0  | Markdown rendering        |
| **rehype-highlight** | 7.0.2   | Syntax highlighting       |
| **remark-gfm**       | 4.0.1   | GitHub Flavored Markdown  |
| **highlight.js**     | 11.11.1 | Code syntax highlighting  |

### Dev Tools

| Technology     | Version | Purpose         |
| -------------- | ------- | --------------- |
| **TypeScript** | 5.9.3   | Type checking   |
| **ESLint**     | 9.x     | Code linting    |
| **Prettier**   | -       | Code formatting |

---

## 📊 Database Schema

### Collections

Stores root-level categories for organizing content.

| Column        | Type      | Description            |
| ------------- | --------- | ---------------------- |
| `id`          | `UUID`    | Primary key            |
| `name`        | `TEXT`    | Unique collection name |
| `order_index` | `INTEGER` | Display order          |

### Nodes

Hierarchical tree structure for folders and documents.

| Column          | Type        | Description                       |
| --------------- | ----------- | --------------------------------- |
| `id`            | `UUID`      | Primary key                       |
| `collection_id` | `UUID`      | FK to collections                 |
| `parent_id`     | `UUID`      | Self-reference for tree structure |
| `name`          | `TEXT`      | Display name                      |
| `slug`          | `TEXT`      | URL-friendly identifier           |
| `node_type`     | `ENUM`      | `folder`, `doc`, or `note`        |
| `file_path`     | `TEXT`      | Path to content file              |
| `file_type`     | `ENUM`      | `mdx`, `pdf`, or `docx`           |
| `file_size`     | `INTEGER`   | File size (max 30MB)              |
| `order_index`   | `INTEGER`   | Display order within parent       |
| `is_published`  | `BOOLEAN`   | Visibility flag                   |
| `created_at`    | `TIMESTAMP` | Creation timestamp                |
| `updated_at`    | `TIMESTAMP` | Last update timestamp             |

---

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

---
