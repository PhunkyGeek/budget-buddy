## Budget Buddy — Voice-Activated AI Budget Planner

**Budget Buddy** is a mobile-first, cross-platform, voice-activated personal finance app built with **React Native + Expo**. It leverages AI, voice interfaces, and beautiful UI to help users **track income, manage expenses, receive smart budgeting insights**, and even lock savings — all with voice or touch.

Built for the [Bolt.new Hackathon](https://bolt.new) — covers the **Voice AI**, **Startup**, **Revenuecat** and **Deploy** challenges.

---

## Live Demo

🌐 Web URL: [https://budget-buddy.netlify.app](https://budget-buddy.netlify.app)  
📱 Compatible with **Expo Go** for Android/iOS  
🎥 [Watch Demo Video (2 mins)](https://youtu.be/your-demo-video)

---

## Features

| Category | Details |
|---------|---------|
| **Voice AI** | Add income/expenses by voice (ElevenLabs) |
| **Budgeting** | View income, expenses, remaining budget |
| **AI Expert** | Gemini-powered insights, predictions & chat |
| **Budget Safe** | Wallet & fund-locking with Stripe |
| **Cross-platform** | Mobile-first (Expo) & web-ready (Netlify) |
| **History** | View monthly transaction history |
| **Themes** | Light & dark modes with saved preferences |
| **Free & Pro** | RevenueCat paywall for Pro-only features |

---

## Tech Stack

- **Frontend**: `React Native`, `Expo`, `TypeScript`, `lucide-react-native`
- **Navigation**: `react-navigation`, `expo-router`
- **Voice AI**: `ElevenLabs TTS`, voice command parsing (Supabase Edge Function)  
  ⚠️ *Note: Currently using simulated voice responses due to ElevenLabs free-tier account limitation.*
- **AI Expert**: `Google Gemini API` (Budget Expert page)
- **Authentication & Data**: `Supabase` (Auth, RLS, Realtime)
- **Payments**: `RevenueCat` (Pro Subscriptions), `Stripe` (Budget Safe Wallet)
- **Media & UI**: `Unsplash API`, `expo-vector-icons`, responsive carousel, modals
- **Deployment**: `Netlify` (Expo for Web)

---

## Folder Structure

/app              → Screens and Routes
/components       → Reusable UI (modals, cards, etc.)
/contexts         → Theme and auth contexts
/services         → Supabase, Voice, Gemini, Wallet integrations
/supabase         → SQL setup & RLS policies
/types            → Shared TS interfaces
.env              → API Keys (ElevenLabs, Gemini, Stripe, Supabase, Unsplash)

---

## 🛠️ Installation & Setup

### 1. Clone the repo

git clone https://github.com/yourusername/budget-buddy.git
cd budget-buddy


### 2. Install dependencies

npm install


### 3. Add your `.env` file

EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ELEVENLABS_API_KEY=your-elevenlabs-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
EXPO_PUBLIC_REVENUECAT_KEY=your-revenuecat-key
EXPO_PUBLIC_UNSPLASH_KEY=your-unsplash-key
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=your-stripe-pk


### 4. Start app in development

npx expo start

Test via Expo Go or web browser.


## Voice AI Command Examples

"Add $2000 from salary to my income"
"Deduct $50 for groceries"
"Show my budget"

Voice processed via `parse-voice` edge function → updates Supabase → returns TTS from ElevenLabs.
⚠️ *Note: Voice commands are currently simulated for demo purposes due to ElevenLabs free-tier API.*


## Pro Features

Powered by RevenueCat — upgrade to unlock:

* **Budget Expert**:

  * Gemini AI-powered budget insights, predictions & mini-chat
* **Budget Safe**:

  * Stripe-powered wallet to add, withdraw & time-lock funds
* Pro-only quick actions are visually marked with “Pro” badges

---

## Testing & Deployment

### Test on Web

npx expo start --web


### Deploy to Netlify

npx expo export:web

# then upload the dist folder to Netlify


### Accessibility

* Voice-enabled (Not fully function because of free tier)
* ARIA labels
* Contrast-friendly dark/light themes

---

## 🔒 Security Notes

* Uses Supabase RLS to ensure data privacy
* Only authenticated users can access their data
* Environment variables managed securely via `.env`

---

## Contribution

Pull requests are welcome! Please open issues first to discuss major changes.

---

## License

[MIT License](LICENSE)

---

## Tags

`#VoiceAI` `#FinanceApp` `#GeminiAI` `#ReactNative` `#Bolt.newHackathon` `#StripeWallet` `#Supabase` `#RevenueCat` `#AIChat` `#ElevenLabs` `#Unsplash`

---

## 🛡️ Badge

Proudly built with ⚡ [Bolt.new](https://bolt.new)

