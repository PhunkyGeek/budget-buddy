import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helpers
export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async (redirectTo?: string) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
};

export const handleOAuthCallback = async (url: string) => {
  const { data, error } = await supabase.auth.getSessionFromUrl(url);
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Profile management
export const createProfile = async (userId: string, firstName: string, lastName: string, email: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      theme: 'light',
      subscription_status: 'free',
      last_tutorial_shown_month: null, // New users start with null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Data helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// NEW: Update tutorial tracking
export const updateUserLastTutorialMonth = async (userId: string, month: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ last_tutorial_shown_month: month })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getIncomeSources = async (userId: string) => {
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('is_custom', { ascending: true })
    .order('name');

  if (error) throw error;
  return data;
};

export const getCategories = async (userId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('is_custom', { ascending: true })
    .order('name');

  if (error) throw error;
  return data;
};

export const addIncome = async (userId: string, sourceId: string, amount: number, date: string) => {
  const { data, error } = await supabase
    .from('incomes')
    .insert({
      user_id: userId,
      source_id: sourceId,
      amount,
      date,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addExpense = async (userId: string, categoryId: string, amount: number, date: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      category_id: categoryId,
      amount,
      date,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMonthlyIncome = async (userId: string, year: number, month: number) => {
  const { data, error } = await supabase
    .from('incomes')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
    .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);

  if (error) throw error;
  return data.reduce((sum, income) => sum + income.amount, 0);
};

export const getMonthlyExpenses = async (userId: string, year: number, month: number) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
    .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);

  if (error) throw error;
  return data.reduce((sum, expense) => sum + expense.amount, 0);
};

export const getTodayExpenses = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      categories(name)
    `)
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getExpenses = async (userId: string, filters?: any) => {
  let query = supabase
    .from('expenses')
    .select(`
      *,
      categories(name)
    `)
    .eq('user_id', userId);

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.date) {
    query = query.eq('date', filters.date);
  }

  if (filters?.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('date', filters.dateTo);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// NEW: Get incomes with source information for transaction history
export const getIncomes = async (userId: string, filters?: any) => {
  let query = supabase
    .from('incomes')
    .select(`
      *,
      income_sources(name)
    `)
    .eq('user_id', userId);

  if (filters?.sourceId) {
    query = query.eq('source_id', filters.sourceId);
  }

  if (filters?.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('date', filters.dateTo);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const deleteExpense = async (expenseId: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
};

export const createCustomIncomeSource = async (userId: string, name: string) => {
  const { data, error } = await supabase
    .from('income_sources')
    .insert({
      user_id: userId,
      name,
      is_custom: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createCustomCategory = async (userId: string, name: string) => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name,
      is_custom: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// NEW: Feedback functionality
export const addFeedback = async (userId: string, subject: string, message: string) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      user_id: userId,
      subject,
      message,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// NEW: Wallet transaction logging
export const addWalletTransaction = async (
  userId: string, 
  transactionType: 'add' | 'withdraw' | 'lock' | 'unlock', 
  amount: number, 
  description: string
) => {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      transaction_type: transactionType,
      amount,
      description,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// NEW: Get wallet transaction history
export const getWalletTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data;
};

// NEW: Wallet functionality for Budget Safe
export const getWalletBalance = async (userId: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no wallet exists, create one
    if (error.code === 'PGRST116') {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          balance: 0,
          locked_amount: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newWallet;
    }
    throw error;
  }
  return data;
};

export const addFundsToWallet = async (userId: string, amount: number) => {
  const { data, error } = await supabase
    .from('wallets')
    .update({
      balance: supabase.raw(`balance + ${amount}`),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Log the transaction
  await addWalletTransaction(userId, 'add', amount, 'Added funds via Stripe');

  return data;
};

export const withdrawFundsFromWallet = async (userId: string, amount: number) => {
  const { data, error } = await supabase
    .from('wallets')
    .update({
      balance: supabase.raw(`balance - ${amount}`),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Log the transaction
  await addWalletTransaction(userId, 'withdraw', amount, 'Withdrawn to bank account');

  return data;
};

export const lockFundsInWallet = async (userId: string, amount: number, lockExpiry: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .update({
      balance: supabase.raw(`balance - ${amount}`),
      locked_amount: supabase.raw(`locked_amount + ${amount}`),
      lock_expiry: lockExpiry,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Calculate duration for description
  const expiryDate = new Date(lockExpiry);
  const now = new Date();
  const diffMonths = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const durationText = diffMonths >= 12 ? `${Math.round(diffMonths / 12)} year(s)` : `${diffMonths} month(s)`;

  // Log the transaction
  await addWalletTransaction(userId, 'lock', amount, `Locked for savings goal (${durationText})`);

  return data;
};

export const unlockFunds = async (userId: string) => {
  // First, get the current locked amount to log the transaction
  const wallet = await getWalletBalance(userId);
  const lockedAmount = wallet.locked_amount;

  const { data, error } = await supabase
    .from('wallets')
    .update({
      balance: supabase.raw(`balance + locked_amount`),
      locked_amount: 0,
      lock_expiry: null,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Log the transaction
  if (lockedAmount > 0) {
    await addWalletTransaction(userId, 'unlock', lockedAmount, 'Unlocked savings funds');
  }

  return data;
};

// NEW: Get budget statistics for AI analysis
export const getBudgetStatistics = async (userId: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [monthlyIncome, monthlyExpenses, expensesByCategory] = await Promise.all([
    getMonthlyIncome(userId, year, month),
    getMonthlyExpenses(userId, year, month),
    supabase
      .from('expenses')
      .select(`
        amount,
        categories(name)
      `)
      .eq('user_id', userId)
      .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
      .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
  ]);

  if (expensesByCategory.error) throw expensesByCategory.error;

  // Group expenses by category
  const categoryTotals = expensesByCategory.data.reduce((acc, expense) => {
    const categoryName = expense.categories?.name || 'Unknown';
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    monthlyIncome,
    monthlyExpenses,
    remainingBudget: monthlyIncome - monthlyExpenses,
    categoryTotals,
    savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
  };
};