# Perfect Drive - Next.js Migration

This project is a migration of the original Perfect Drive website to a modern, high-performance Next.js application.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: TypeScript

## Project Structure
- `src/app/page.tsx`: Main entry point (Home Page).
- `src/app/layout.tsx`: Root layout with custom fonts (Oswald/Montserrat).
- `src/components/`: Reusable components.
  - `booking/`: Components related to the booking flow (Calendar, Form, Pricing).
  - `home/`: Components for the home page (Hero).
  - `layout/`: Global layout components (Header, Footer).
  - `ui/`: Generic UI components (Button).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## deployed site
Visit [http://localhost:3000](http://localhost:3000) to view the application.
