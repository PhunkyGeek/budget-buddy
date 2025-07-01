# Budget Buddy - AI-Powered Personal Finance App

A comprehensive personal finance management app built with Expo and React Native, featuring AI-powered voice commands, budget tracking, and secure savings management.

## Features

### Core Features
- **Income & Expense Tracking**: Log and categorize your financial transactions
- **Budget Management**: Set and monitor monthly budgets by category
- **Transaction History**: View detailed history with filtering and search
- **Voice Commands**: AI-powered voice interface for hands-free expense logging
- **Dark/Light Theme**: Automatic theme switching based on system preferences

### Pro Features
- **AI Budget Expert**: Personalized financial insights powered by Gemini AI
- **Budget Safe**: Secure digital wallet with savings goals and fund locking
- **Advanced Analytics**: Detailed spending patterns and forecasting
- **Priority Support**: Enhanced customer support for Pro subscribers

## Technology Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Services**: 
  - Google Gemini AI for budget insights
  - ElevenLabs Conversational AI for voice commands
- **Payments**: Stripe for secure transactions
- **Subscriptions**: RevenueCat for in-app purchases
- **Images**: Unsplash API for category images

## Voice Commands

The app supports natural language voice commands:

- **Add Income**: "Add $2000 from salary to my income"
- **Add Expense**: "Spend $50 on groceries" or "Deduct $25 for transportation"
- **View Budget**: "Show my budget"

### Voice Technology

- **Mobile**: ElevenLabs Conversational AI SDK for real-time speech processing
- **Web**: Simulation mode with sample commands for demonstration
- **Processing**: Supabase Edge Functions parse and execute voice commands

## Installation

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account and project
- ElevenLabs API key (for voice features)
- Gemini AI API key (for budget insights)

### Environment Setup

Create a `.env` file with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_UNSPLASH_KEY=your_unsplash_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EXPO_PUBLIC_REVENUECAT_KEY=your_revenuecat_key
```

### Database Setup

1. Create a new Supabase project
2. Run the migration files in `/supabase/migrations/` to set up the database schema
3. Deploy the Edge Functions in `/supabase/functions/`

### Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run on specific platforms
npm run ios
npm run android
npm run web
```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth, Theme)
├── services/              # API services and utilities
├── supabase/             # Database migrations and functions
├── types/                # TypeScript type definitions
└── assets/               # Static assets (images, fonts)
```

## Key Components

### Voice Integration
- `VoiceButton.tsx`: Main voice command interface
- `EnhancedVoiceButton.tsx`: Advanced voice button with AI integration
- `ConversationalAIProvider.tsx`: ElevenLabs AI context provider

### Financial Features
- `ExpenseModal.tsx`: Add/edit expense transactions
- `IncomeModal.tsx`: Add/edit income transactions
- `ExpenseCard.tsx`: Display expense items with images

### Pro Features
- `InsightDetailModal.tsx`: Detailed AI budget insights
- `StripePaymentModal.tsx`: Secure payment processing
- `WalletHistoryModal.tsx`: Transaction history for Budget Safe

## API Integration

### Supabase Edge Functions

- `parse-voice`: Processes voice commands and updates database
- `stripe-create-checkout-session`: Creates Stripe payment sessions

### External APIs

- **ElevenLabs**: Real-time voice processing and text-to-speech
- **Google Gemini**: AI-powered budget analysis and insights
- **Stripe**: Secure payment processing for wallet top-ups
- **Unsplash**: Category images for expense visualization

## Deployment

### Web Deployment (Netlify)
```bash
# Build for web
npm run build:web

# Deploy to Netlify
# Upload the dist/ folder to Netlify
```

### Mobile Deployment
```bash
# Build for app stores
eas build --platform all

# Submit to stores
eas submit --platform all
```

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure user sessions with Supabase Auth
- **API Key Management**: Environment-based configuration
- **Payment Security**: PCI-compliant processing with Stripe

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: support@budgetbuddy.app
- Documentation: [Budget Buddy Docs](https://docs.budgetbuddy.app)
- Issues: [GitHub Issues](https://github.com/your-repo/budget-buddy/issues)

---

Built with ❤️ using [Bolt.new](https://bolt.new)