# 🍽️ RestoDash: Advanced Restaurant Management System

![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-DB-green?style=for-the-badge&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![EmailJS](https://img.shields.io/badge/EmailJS-Notifications-orange?style=for-the-badge)

**RestoDash** is a fully digitized, real-time localized point-of-sale (POS) and operational management system specifically tailored for fast-paced modern restaurants. Built entirely with React and powered by a live PostgreSQL database via Supabase, RestoDash provides instantly synchronized state between front-of-house Waiters, back-of-house Kitchen Display Systems (KDS), and Administration hubs.

## ✨ Core Features & Platform Modules

RestoDash operates on a highly integrated role-based system, separating application logic into three distinct but deeply synchronized portals:

### 📱 1. Waiter Portal (Front-of-House)
The Waiter Portal features an interactive **Floor Plan Manager** to command tables dynamically.
- **Smart Cart Integration**: Instantly pull up table logs to create multi-item orders complete with custom preparation notes (e.g., *"Less Spicy"*).
- **Grace Period Buffers**: Features an innovative built-in "Buffer Window" when "Sending to Kitchen", allowing last-minute customer edits and cancellations without wasting kitchen prep resources. 
- **Live Handoff Mechanics**: Watch cooking timers visually count down live. Receive an amber warning pulse when orders are nearly done, and explicitly confirm serving delivery.

### 👨‍🍳 2. Kitchen Display System (KDS)
The KDS drastically streamlines the back-of-house operation by intelligently sorting order queues.
- **Strict Progression States**: Tickets natively render as greyed out whilst Waiters are actively building or editing carts during their Grace Time.
- **Chef Time Prompts**: Intercept starting orders with an interactive manual pop-up asking the cooking line an exact estimate for their Prep Time (MM:SS), triggering a synchronized digital countdown across all associated tablets natively.
- **Inter-system Pager**: Broadcast instant typed messages straight back out to active Waiter panels from the prep station.

### 📊 3. Admin Console (Point-Of-Sale)
The Admin hub serves as the control center where completed orders queue up flawlessly for final checkout processing.
- **Automated E-Billing**: Generates professional, fully itemized PDF Receipts natively utilizing `jsPDF` completely in-memory upon confirmation.
- **Digital Email Invoicing**: Connects to the `EmailJS` backend to scrape active checkout orders, converting them instantly into a premium HTML Email Invoice dispatched flawlessly to the dine-in customer's digital pockets, saving receipt paper and generating brand presence.
- **Takeaway Integrations**: Seamlessly handles walk-ins and external integrations by spoofing rapid pseudo-tables in the background to sustain schema rules.

## 🚀 Tech Stack

- **Frontend**: React 19, TailwindCSS 4, React Router v7
- **Database**: Supabase (PostgreSQL Realtime Subscriptions)
- **Document Rendering**: jsPDF & jsPDF-AutoTable
- **Comms Interface**: EmailJS (v4.4 SDK)
- **Icons**: Lucide React
- **Packaging**: Vite bundler deployed efficiently to GH Pages

## 📐 Order Lifecycle Architecture

RestoDash uses a rigorous status mapping state machine:

1. **`buffer`** - 10-Second grace window protecting against misclicks. Edit/Cancel completely accessible. 
2. **`pending`** - Officially locked into the KDS queue waiting for Chef acceptance.
3. **`cooking`** - Actively prepping. Emits live MM:SS countdowns across all WebSockets. Waiters locked to read-only views.
4. **`ready`** - Chef marks plate ready. Appears as a high-visibility CTA to Waiters.
5. **`served`** - Waiter confirms physical delivery. Table goes to 'Eating' or 'Paying' state, sliding bill down to Admin queue.
6. **`paid`** - Invoice remitted via E-Mail. Table aggressively scrubbed, dropping completely off the memory stack!

## 🛠️ Setting up Locally

1. Clone the repository and run standard installations:
   ```bash
   npm install
   ```

2. Generate a `.env` file containing your valid Supabase project details to sustain internal hooks:
   ```env
   VITE_SUPABASE_URL=https://[YOUR_KEY].supabase.co
   VITE_SUPABASE_ANON_KEY=[YOUR_JWT]
   ```
   *Note: Database architecture assumes `orders`, `tables`, and `messages` tables are strictly mapped and subscribe-ready.*

3. In Supabase, enable email/password auth and set these redirect URLs:
   - Local dev: `http://localhost:5173/restaurant-management-mpr/login`
   - GitHub Pages: `https://ameybarbade.github.io/restaurant-management-mpr/login`

4. If you want new users to sign up from the app, keep email confirmations on or off as you prefer. The login page now supports sign in, create account, and password reset.

5. Spin up the development server:
   ```bash
   npm run dev
   ```
