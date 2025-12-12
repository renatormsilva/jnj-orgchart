# J&J OrgChart Frontend

Modern, responsive web application for visualizing Johnson & Johnson's organizational structure.

## Features

- **People Directory**: Searchable, filterable list of all employees and partners
- **Organizational Hierarchy**: Interactive tree visualization with CEO highlight
- **Person Details**: Comprehensive view of employee information, manager, and direct reports
- **Real-time Search**: Debounced search with instant filtering
- **Advanced Filters**: Filter by department, manager, type, and status
- **Responsive Design**: Mobile-first design that works on all devices
- **J&J Branding**: Authentic Johnson & Johnson colors and design language

## Tech Stack

### Core
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router v6** - Client-side routing

### UI & Styling
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons
- **Framer Motion** - Smooth animations

### State Management & Data
- **TanStack Query (React Query)** - Server state management with caching
- **Zustand** - Lightweight client state management
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at \`http://localhost:3000\`

### Installation

1. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

2. **Configure environment:**
\`\`\`bash
cp .env.example .env
# Edit .env if your backend runs on a different port
\`\`\`

3. **Start development server:**
\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:5173\`

## Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
\`\`\`

## License

MIT
