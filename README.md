# Budget Buddy — Voice-Activated AI Budget Planner

**Budget Buddy** is a cross-platform, voice-activated personal finance app built with **React Native + Expo** that empowers users to **track income**, **manage expenses**, **lock savings**, and **receive smart budgeting advice** — all via **touch or voice**.

Built for the [Bolt.new Hackathon](https://bolt.new), this project addresses challenges from:
**Voice AI**, **Startup**, **Revenue**, and **Deploy** tracks.



## 🌐 Live Demo

* 🔗 Web: [https://budget-budddy.netlify.app](https://budget-budddy.netlify.app)
* 📱 Mobile: Compatible with **Expo Go** (Android/iOS)
* 🎬 [Watch Demo (2 mins)](https://youtu.be/yTNayKR5Igg)



## ✨ Features

| Category             | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| 🎙️ Voice AI         | Add income or expenses, or show budget with voice using ElevenLabs |
| 📊 Budgeting         | View budget summary, track remaining funds                         |
| 🧠 AI Expert (Pro)   | Gemini-powered insights, predictions, and mini-chat                |
| 💼 Budget Safe (Pro) | Stripe wallet with time-lock savings feature                       |
| 📆 History           | View categorized monthly transaction history                       |
| 🌓 Themes            | Dark/Light mode with persistent settings                           |
| 🔒 Secure Auth       | Supabase RLS and auth for private finance data                     |
| 💎 Pro Features      | Unlock exclusive tools via RevenueCat                              |
| 🧩 Modular UI        | Reusable components and cards throughout the app                   |

> ⚠️ Note: Voice command actions is currently free for app-testing, mind usage to avoid voice service interruption (I didn't get the Get 3 months of ElevenLabs Creator Tier free which includes 100k credits/month, pro voice cloning due IP address issues).

---

## Tech Stack

| Layer                   | Tools                                                                   |
| ----------------------- | ----------------------------------------------------------------------- |
| **Frontend**            | `React Native`, `Expo`, `TypeScript`, `lucide-react-native`             |
| **Routing**             | `expo-router`, `react-navigation`                                       |
| **AI & Voice**          | `ElevenLabs` (TTS), `Google Gemini` (Insights), Supabase Edge Functions |
| **Authentication & DB** | `Supabase` (Auth, SQL, RLS, Edge Functions)                             |
| **Payments**            | `RevenueCat` for mobile subscriptions, `Stripe` for web wallet          |
| **Media**               | `Unsplash API`, `expo-vector-icons`, responsive carousel                |
| **Deployment**          | `Netlify` (web), `EAS` for mobile builds                                |



## 📁 Project Structure

```
├── app/                   # Expo Router screens and tabs
│   ├── (tabs)/            # Budget views, wallet, insights
│   ├── auth/              # Auth screens
│   └── _layout.tsx        # Shared root layout
├── components/            # UI components (cards, modals, buttons)
├── contexts/              # Theme, Auth providers
├── services/              # Supabase, Voice, Gemini, Wallet services
├── supabase/              # SQL schema, Edge Functions
├── types/                 # Shared TypeScript interfaces
└── assets/                # Static files, icons
```



## 🔊 Voice AI Examples

| Intent      | Voice Prompt                                                  |
| ----------- | ------------------------------------------------------------- |
| Add Income  | "Add \$2000 from salary to my income"                         |
| Add Expense | "Spend \$50 on groceries" or "Deduct \$25 for transportation" |
| Show Budget | "Show my budget"                                              |

➡️ Voice processed using `parse-voice` (Supabase Edge Function) → triggers action.

---

## 💎 Pro Features (RevenueCat)

Upgrade to unlock:

* **AI Budget Expert**
  Get personalized Gemini-powered insights, predictions, and mini-chat.

* **Budget Safe**
  Add money via Stripe wallet, withdraw or lock funds for specific savings goals.

* **Advanced Analytics**
  Visual forecasting, categorized breakdowns, and saving patterns.

* **Priority Support**
  Faster responses and dedicated help for Pro users.

---

## 🛠️ Setup & Installation

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/budget-buddy.git
cd budget-buddy
npm install
```

### 2. Add `.env` File

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ELEVENLABS_API_KEY=your-elevenlabs-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
EXPO_PUBLIC_UNSPLASH_KEY=your-unsplash-key
EXPO_PUBLIC_REVENUECAT_KEY=your-revenuecat-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-pk
```

### 3. Supabase Setup

* Create a Supabase project.
* Run SQL schema in `/supabase/migrations/`.
* Deploy Edge Functions: `parse-voice`, `stripe-create-checkout-session`.

### 4. Start App

```bash
# Start dev server
npx expo start

# Or run platform-specific
npm run web
npm run ios
npm run android
```

---

## ⚙️ Deployment

### Web (Netlify)

```bash
npx expo export:web
```

Then upload the `/dist` folder to Netlify.

### Mobile (EAS Build)

```bash
eas build --platform all
eas submit --platform all
```

---

## 🔒 Security Highlights

* **Supabase RLS** for secure user-level data access
* JWT Auth and session tokens
* All payments via PCI-compliant Stripe
* No sensitive data stored on-device

---

## 🧩 Key Components

| Component                 | Purpose                                |
| ------------------------- | -------------------------------------- |
| `VoiceService.ts`         | Processes speech commands (web/mobile) |
| `EnhancedVoiceButton.tsx` | TTS + AI-driven interaction            |
| `InsightDetailModal.tsx`  | Gemini AI prediction results           |
| `StripePaymentModal.tsx`  | Budget Safe wallet integration         |
| `WalletHistoryModal.tsx`  | Past wallet transactions               |



## 🤝 Contributing

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 📄 License

MIT License – see [LICENSE](LICENSE)



## 🙋 Support

* Email: [support@budgetbudddy.app](mailto:support@budgetbudddy.app)
* Docs: [https://docs.budgetbuddy.app](https://docs.budgetbudddy.app)
* Issues: [GitHub Issues](https://github.com/PhunkyGeek/budget-buddy/issues)



## 🏷️ Tags

`#VoiceAI` `#GeminiAI` `#ReactNative` `#Supabase` `#StripeWallet` `#FinanceApp` `#BoltNew` `#RevenueCat` `#TTS` `#AIChat`

---

## 🛡️ Badge

Proudly built with ❤️ using ⚡ [Bolt.new](https://bolt.new)
