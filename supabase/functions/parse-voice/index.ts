/*
  # Voice Command Parser Edge Function

  This function processes voice commands and extracts structured data for budget operations.
  It handles commands like:
  - "Add $2000 from salary to my income"
  - "Deduct $50 for groceries"
  - "Show my budget"
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VoiceCommand {
  type: 'income' | 'expense' | 'show_budget' | 'unknown'
  amount?: number
  source?: string
  category?: string
  text: string
}

interface ParsedResponse {
  success: boolean
  command: VoiceCommand
  message: string
  audioResponse?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, userId } = await req.json()

    if (!text || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing text or userId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse the voice command
    const command = parseVoiceCommand(text)
    let response: ParsedResponse = {
      success: false,
      command,
      message: 'Command not recognized'
    }

    // Process the command
    switch (command.type) {
      case 'income':
        response = await processIncomeCommand(supabase, userId, command)
        break
      case 'expense':
        response = await processExpenseCommand(supabase, userId, command)
        break
      case 'show_budget':
        response = await processBudgetQuery(supabase, userId)
        break
      default:
        response = {
          success: false,
          command,
          message: 'I didn\'t understand that command. Try saying "Add $50 for groceries" or "Add $2000 from salary to my income".'
        }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing voice command:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function parseVoiceCommand(text: string): VoiceCommand {
  const lowercaseText = text.toLowerCase().trim()

  // Parse income commands: "add $2000 from salary to my income"
  const incomeMatch = lowercaseText.match(/add\s+\$?(\d+(?:\.\d{2})?)\s+from\s+(.+?)\s+to\s+(?:my\s+)?income/)
  if (incomeMatch) {
    return {
      type: 'income',
      amount: parseFloat(incomeMatch[1]),
      source: incomeMatch[2].trim(),
      text
    }
  }

  // Parse expense commands: "deduct $50 for groceries" or "spend $50 on groceries"
  const expenseMatch = lowercaseText.match(/(?:deduct|spend|spent)\s+\$?(\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+)/)
  if (expenseMatch) {
    return {
      type: 'expense',
      amount: parseFloat(expenseMatch[1]),
      category: expenseMatch[2].trim(),
      text
    }
  }

  // Parse budget query: "show my budget"
  if (lowercaseText.includes('show') && lowercaseText.includes('budget')) {
    return {
      type: 'show_budget',
      text
    }
  }

  return {
    type: 'unknown',
    text
  }
}

async function processIncomeCommand(supabase: any, userId: string, command: VoiceCommand): Promise<ParsedResponse> {
  try {
    // Find or create income source
    let sourceId: string

    // First, try to find existing source
    const { data: existingSources } = await supabase
      .from('income_sources')
      .select('id')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .ilike('name', command.source)
      .limit(1)

    if (existingSources && existingSources.length > 0) {
      sourceId = existingSources[0].id
    } else {
      // Create custom source
      const { data: newSource, error: sourceError } = await supabase
        .from('income_sources')
        .insert({
          user_id: userId,
          name: command.source,
          is_custom: true
        })
        .select('id')
        .single()

      if (sourceError) throw sourceError
      sourceId = newSource.id
    }

    // Add income record
    const { error: incomeError } = await supabase
      .from('incomes')
      .insert({
        user_id: userId,
        source_id: sourceId,
        amount: command.amount,
        date: new Date().toISOString().split('T')[0]
      })

    if (incomeError) throw incomeError

    return {
      success: true,
      command,
      message: `Added $${command.amount} from ${command.source} to your income.`,
      audioResponse: `Great! I've added $${command.amount} from ${command.source} to your income for today.`
    }

  } catch (error) {
    console.error('Error processing income command:', error)
    return {
      success: false,
      command,
      message: 'Sorry, I couldn\'t add that income. Please try again.'
    }
  }
}

async function processExpenseCommand(supabase: any, userId: string, command: VoiceCommand): Promise<ParsedResponse> {
  try {
    // Find or create category
    let categoryId: string

    // First, try to find existing category
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .ilike('name', command.category)
      .limit(1)

    if (existingCategories && existingCategories.length > 0) {
      categoryId = existingCategories[0].id
    } else {
      // Create custom category
      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: command.category,
          is_custom: true
        })
        .select('id')
        .single()

      if (categoryError) throw categoryError
      categoryId = newCategory.id
    }

    // Add expense record
    const { error: expenseError } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount: command.amount,
        date: new Date().toISOString().split('T')[0]
      })

    if (expenseError) throw expenseError

    return {
      success: true,
      command,
      message: `Added $${command.amount} expense for ${command.category}.`,
      audioResponse: `Perfect! I've recorded your $${command.amount} expense for ${command.category}.`
    }

  } catch (error) {
    console.error('Error processing expense command:', error)
    return {
      success: false,
      command,
      message: 'Sorry, I couldn\'t add that expense. Please try again.'
    }
  }
}

async function processBudgetQuery(supabase: any, userId: string): Promise<ParsedResponse> {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Get monthly income
    const { data: incomes } = await supabase
      .from('incomes')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
      .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)

    // Get monthly expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
      .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)

    const totalIncome = incomes?.reduce((sum, income) => sum + parseFloat(income.amount), 0) || 0
    const totalExpenses = expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0
    const remaining = totalIncome - totalExpenses

    const message = `Your budget summary: $${totalIncome.toFixed(2)} income, $${totalExpenses.toFixed(2)} expenses, $${remaining.toFixed(2)} remaining.`

    return {
      success: true,
      command: { type: 'show_budget', text: 'show budget' },
      message,
      audioResponse: `Here's your budget summary for this month. You have $${totalIncome.toFixed(2)} in income, you've spent $${totalExpenses.toFixed(2)}, leaving you with $${remaining.toFixed(2)} remaining.`
    }

  } catch (error) {
    console.error('Error processing budget query:', error)
    return {
      success: false,
      command: { type: 'show_budget', text: 'show budget' },
      message: 'Sorry, I couldn\'t retrieve your budget information right now.'
    }
  }
}