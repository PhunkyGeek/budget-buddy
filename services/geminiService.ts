import { Platform } from 'react-native';

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface BudgetInsight {
  id: string;
  type: 'savings_tip' | 'investment' | 'analysis' | 'prediction';
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  }

  async generateBudgetInsights(budgetStats: any): Promise<BudgetInsight[]> {
    if (!this.apiKey) {
      return this.getFallbackInsights(budgetStats);
    }

    try {
      const prompt = this.createBudgetAnalysisPrompt(budgetStats);
      const response = await this.callGeminiAPI(prompt);
      
      // Parse the response and convert to insights
      return this.parseInsightsFromResponse(response, budgetStats);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackInsights(budgetStats);
    }
  }

  async chatWithAssistant(messages: GeminiMessage[], budgetContext?: any): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackChatResponse(messages);
    }

    try {
      const prompt = this.createChatPrompt(messages, budgetContext);
      const response = await this.callGeminiAPI(prompt);
      return response;
    } catch (error) {
      console.error('Gemini chat error:', error);
      return this.getFallbackChatResponse(messages);
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
  }

  private createBudgetAnalysisPrompt(budgetStats: any): string {
    // Add current date and time context for dynamic insights
    const currentDate = new Date();
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const season = this.getCurrentSeason();
    
    return `
You are a financial advisor AI generating daily dynamic insights. Today is ${dayOfWeek}, ${currentDate.toLocaleDateString()}, in ${month} (${season} season).

Budget Data:
- Monthly Income: $${budgetStats.monthlyIncome}
- Monthly Expenses: $${budgetStats.monthlyExpenses}
- Remaining Budget: $${budgetStats.remainingBudget}
- Savings Rate: ${budgetStats.savingsRate.toFixed(1)}%
- Category Spending: ${JSON.stringify(budgetStats.categoryTotals)}

Generate exactly 8 unique, actionable insights that are relevant to today's date and current financial situation. Consider:
- Seasonal spending patterns (${season} considerations)
- Day of week relevance (${dayOfWeek} specific advice)
- Current month trends (${month} financial planning)
- Time-sensitive opportunities

Provide insights in this JSON format:
[
  {
    "type": "savings_tip|investment|analysis|prediction",
    "title": "Brief, compelling title",
    "subtitle": "One-line description with specific context",
    "description": "Detailed actionable advice (2-3 sentences max)",
    "priority": "high|medium|low"
  }
]

Make each insight:
1. Specific to their actual spending patterns
2. Relevant to current date/season
3. Actionable with clear next steps
4. Varied in type and priority
5. Fresh and not generic advice

Focus areas:
- Seasonal spending optimization
- Weekly financial habits
- Monthly budget adjustments
- Investment timing opportunities
- Emergency fund strategies
- Debt management tactics
- Long-term wealth building
- Category-specific improvements
`;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  private createChatPrompt(messages: GeminiMessage[], budgetContext?: any): string {
    const systemPrompt = `You are a helpful financial assistant for Budget Buddy app. You help users optimize their budget, provide financial advice, and answer questions about personal finance.

${budgetContext ? `Current user budget context:
- Monthly Income: $${budgetContext.monthlyIncome}
- Monthly Expenses: $${budgetContext.monthlyExpenses}
- Remaining Budget: $${budgetContext.remainingBudget}
- Savings Rate: ${budgetContext.savingsRate.toFixed(1)}%` : ''}

Keep responses helpful, concise, and actionable. Focus on practical financial advice.`;

    const conversationHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    return `${systemPrompt}\n\nConversation:\n${conversationHistory}\n\nassistant:`;
  }

  private parseInsightsFromResponse(response: string, budgetStats: any): BudgetInsight[] {
    try {
      // Try to parse JSON response
      const insights = JSON.parse(response);
      return insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`, // Use timestamp for uniqueness
        ...insight,
        icon: this.getIconForType(insight.type),
        color: this.getColorForType(insight.type),
      }));
    } catch (error) {
      // Fallback if parsing fails
      return this.getFallbackInsights(budgetStats);
    }
  }

  private getFallbackInsights(budgetStats: any): BudgetInsight[] {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const month = currentDate.getMonth();
    const insights: BudgetInsight[] = [];
    
    // Generate dynamic insights based on current date
    const timestamp = Date.now();
    
    // Weekend vs weekday specific advice
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      insights.push({
        id: `weekend-tip-${timestamp}`,
        type: 'savings_tip',
        title: 'Weekend Spending Alert',
        subtitle: 'Weekend expenses tend to be 40% higher',
        description: 'Plan your weekend activities in advance and set a spending limit. Consider free activities like hiking, visiting museums on free days, or hosting potluck dinners.',
        icon: 'piggy-bank',
        color: '#10b981',
        priority: 'high'
      });
    } else {
      insights.push({
        id: `weekday-tip-${timestamp}`,
        type: 'savings_tip',
        title: 'Weekday Lunch Savings',
        subtitle: 'Meal prep can save $200+ monthly',
        description: 'Prepare lunches on Sunday for the week. Even 3 days of home-prepared meals can save significant money compared to daily restaurant purchases.',
        icon: 'piggy-bank',
        color: '#10b981',
        priority: 'medium'
      });
    }

    // Seasonal insights
    const seasonalInsight = this.getSeasonalInsight(month, timestamp);
    if (seasonalInsight) insights.push(seasonalInsight);

    // Budget-specific insights
    if (budgetStats.savingsRate < 10) {
      insights.push({
        id: `emergency-savings-${timestamp}`,
        type: 'prediction',
        title: 'Emergency Fund Priority',
        subtitle: `Build $${(budgetStats.monthlyExpenses * 3).toFixed(0)} emergency fund`,
        description: 'With your current savings rate, focus on building an emergency fund before other investments. Start with $500 as your first milestone.',
        icon: 'shield',
        color: '#ef4444',
        priority: 'high'
      });
    }

    // Investment timing based on market conditions (simulated)
    insights.push({
      id: `investment-timing-${timestamp}`,
      type: 'investment',
      title: 'Dollar-Cost Averaging Opportunity',
      subtitle: 'Market volatility creates buying opportunities',
      description: 'Consider setting up automatic investments to take advantage of market fluctuations. Even $100/month can build substantial wealth over time.',
      icon: 'trending-up',
      color: '#0891b2',
      priority: 'medium'
    });

    // Category analysis
    const topCategory = Object.entries(budgetStats.categoryTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    if (topCategory) {
      insights.push({
        id: `category-analysis-${timestamp}`,
        type: 'analysis',
        title: `${topCategory[0]} Spending Review`,
        subtitle: `$${(topCategory[1] as number).toFixed(2)} this month`,
        description: `This represents ${((topCategory[1] as number / budgetStats.monthlyExpenses) * 100).toFixed(1)}% of your expenses. Consider if this aligns with your priorities and look for optimization opportunities.`,
        icon: 'bar-chart',
        color: '#f97316',
        priority: 'medium'
      });
    }

    // Debt payoff strategy
    insights.push({
      id: `debt-strategy-${timestamp}`,
      type: 'prediction',
      title: 'Debt Acceleration Plan',
      subtitle: 'Pay off high-interest debt first',
      description: 'List all debts by interest rate. Pay minimums on all, then put extra money toward the highest rate debt. This saves the most money long-term.',
      icon: 'target',
      color: '#dc2626',
      priority: 'high'
    });

    // Subscription audit
    insights.push({
      id: `subscription-audit-${timestamp}`,
      type: 'savings_tip',
      title: 'Monthly Subscription Review',
      subtitle: 'Average household has $273 in subscriptions',
      description: 'Review all recurring payments today. Cancel unused services and consider annual plans for 15-20% savings on services you use regularly.',
      icon: 'credit-card',
      color: '#8b5cf6',
      priority: 'medium'
    });

    // Future wealth projection
    insights.push({
      id: `wealth-projection-${timestamp}`,
      type: 'prediction',
      title: '10-Year Wealth Forecast',
      subtitle: 'Compound growth potential analysis',
      description: `At your current savings rate, you could accumulate $${(budgetStats.remainingBudget * 12 * 10 * 1.07).toFixed(0)} in 10 years with 7% annual returns.`,
      icon: 'piggy-bank',
      color: '#059669',
      priority: 'low'
    });

    return insights.slice(0, 8);
  }

  private getSeasonalInsight(month: number, timestamp: number): BudgetInsight | null {
    // Spring (March-May)
    if (month >= 2 && month <= 4) {
      return {
        id: `spring-insight-${timestamp}`,
        type: 'savings_tip',
        title: 'Spring Cleaning Savings',
        subtitle: 'Declutter and earn money',
        description: 'Spring cleaning time! Sell items you no longer need on marketplace apps. Use the proceeds to boost your emergency fund or pay down debt.',
        icon: 'piggy-bank',
        color: '#10b981',
        priority: 'medium'
      };
    }
    
    // Summer (June-August)
    if (month >= 5 && month <= 7) {
      return {
        id: `summer-insight-${timestamp}`,
        type: 'analysis',
        title: 'Summer Expense Planning',
        subtitle: 'Vacation and utility costs rise',
        description: 'Summer typically increases utility bills and vacation spending. Budget an extra 15-20% for these seasonal expenses to avoid overspending.',
        icon: 'bar-chart',
        color: '#f97316',
        priority: 'high'
      };
    }
    
    // Fall (September-November)
    if (month >= 8 && month <= 10) {
      return {
        id: `fall-insight-${timestamp}`,
        type: 'prediction',
        title: 'Holiday Spending Preparation',
        subtitle: 'Start saving for holiday expenses',
        description: 'Begin setting aside money for holiday gifts and celebrations. Saving $100/month now can prevent January credit card debt.',
        icon: 'target',
        color: '#8b5cf6',
        priority: 'high'
      };
    }
    
    // Winter (December-February)
    return {
      id: `winter-insight-${timestamp}`,
      type: 'investment',
      title: 'Year-End Tax Planning',
      subtitle: 'Maximize retirement contributions',
      description: 'Consider maximizing IRA or 401(k) contributions before year-end for tax benefits. This reduces current taxes while building future wealth.',
      icon: 'trending-up',
      color: '#0891b2',
      priority: 'medium'
    };
  }

  private getFallbackChatResponse(messages: GeminiMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    if (lastMessage.includes('budget') || lastMessage.includes('money')) {
      return "I'd be happy to help with your budget! Based on your current financial situation, I recommend focusing on tracking your expenses and setting realistic savings goals. What specific area would you like to improve?";
    }
    
    if (lastMessage.includes('save') || lastMessage.includes('saving')) {
      return "Great question about saving! Start with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Even small amounts saved consistently can make a big difference over time.";
    }
    
    if (lastMessage.includes('invest') || lastMessage.includes('investment')) {
      return "Investment is a great way to grow your wealth! Before investing, make sure you have an emergency fund. Then consider low-cost index funds for long-term growth. Always invest money you won't need for at least 5 years.";
    }
    
    return "I'm here to help with your financial questions! I can provide advice on budgeting, saving, investing, and managing your expenses. What would you like to know more about?";
  }

  private getIconForType(type: string): string {
    const iconMap = {
      'savings_tip': 'piggy-bank',
      'investment': 'trending-up',
      'analysis': 'bar-chart',
      'prediction': 'crystal-ball'
    };
    return iconMap[type as keyof typeof iconMap] || 'lightbulb';
  }

  private getColorForType(type: string): string {
    const colorMap = {
      'savings_tip': '#10b981',
      'investment': '#0891b2',
      'analysis': '#f97316',
      'prediction': '#8b5cf6'
    };
    return colorMap[type as keyof typeof colorMap] || '#64748b';
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Gemini API key test error:', error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();