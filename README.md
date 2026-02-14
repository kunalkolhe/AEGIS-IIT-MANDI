# Aegis Protocol

A safety-first platform designed to keep students connected, informed, and protected. Aegis provides emergency response features, community collaboration tools, and real-time resource access all in one place.

## What's Inside

- **Dashboard** - Your personal hub with quick access to everything
- **SOS Button** - One-tap emergency alerts for immediate assistance
- **Community** - Connect with peers, share experiences, and support each other
- **Academics** - Track assignments, deadlines, and study resources
- **Opportunities** - Discover internships, scholarships, and campus events
- **Grievances** - Report concerns and track resolution progress
- **Map** - Location-based emergency services and campus resources
- **Auth** - Secure login and account management via Supabase

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation

1. Clone the repo and navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase
- **Styling**: (Your CSS solution)

## Contributing

Found a bug or have a feature idea? Feel free to open an issue or submit a pull request.

## License

MIT
