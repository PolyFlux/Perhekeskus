import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, CreditCard, PiggyBank } from 'lucide-react';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

interface Budget {
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: Date;
  color: string;
}

const BudgetTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, description: 'Palkka', amount: 5000, type: 'income', category: 'salary', date: new Date(2025, 0, 1) },
    { id: 2, description: 'Ruokaostokset', amount: -350, type: 'expense', category: 'food', date: new Date(2025, 0, 5) },
    { id: 3, description: 'Bensiini', amount: -80, type: 'expense', category: 'transport', date: new Date(2025, 0, 7) },
    { id: 4, description: 'Freelance-työ', amount: 800, type: 'income', category: 'freelance', date: new Date(2025, 0, 10) },
    { id: 5, description: 'Sähkölasku', amount: -120, type: 'expense', category: 'utilities', date: new Date(2025, 0, 12) },
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { category: 'Ruoka ja ravintolat', allocated: 800, spent: 350, color: 'bg-green-500' },
    { category: 'Liikenne', allocated: 300, spent: 80, color: 'bg-blue-500' },
    { category: 'Laskut', allocated: 400, spent: 120, color: 'bg-yellow-500' },
    { category: 'Viihde', allocated: 200, spent: 0, color: 'bg-purple-500' },
    { category: 'Ostokset', allocated: 300, spent: 0, color: 'bg-pink-500' },
  ]);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { id: 1, name: 'Hätävara', target: 10000, current: 6500, deadline: new Date(2025, 11, 31), color: 'bg-red-500' },
    { id: 2, name: 'Loma', target: 3000, current: 1200, deadline: new Date(2025, 5, 15), color: 'bg-blue-500' },
    { id: 3, name: 'Uusi auto', target: 25000, current: 8500, deadline: new Date(2026, 2, 1), color: 'bg-green-500' },
  ]);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'food'
  });

  const categories = [
    { value: 'food', label: 'Ruoka ja ravintolat' },
    { value: 'transport', label: 'Liikenne' },
    { value: 'utilities', label: 'Laskut' },
    { value: 'entertainment', label: 'Viihde' },
    { value: 'shopping', label: 'Ostokset' },
    { value: 'salary', label: 'Palkka' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'other', label: 'Muu' },
  ];

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    const transaction: Transaction = {
      id: Date.now(),
      description: newTransaction.description,
      amount: newTransaction.type === 'expense' ? -Math.abs(parseFloat(newTransaction.amount)) : Math.abs(parseFloat(newTransaction.amount)),
      type: newTransaction.type,
      category: newTransaction.category,
      date: new Date()
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({ description: '', amount: '', type: 'expense', category: 'food' });
    setShowAddTransaction(false);
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  };

  const getNetIncome = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getBudgetProgress = (budget: Budget) => {
    return Math.min((budget.spent / budget.allocated) * 100, 100);
  };

  const getSavingsProgress = (goal: SavingsGoal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Otsikko */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Budjetti ja säästöt</h2>
          <p className="text-slate-600">Seuraa menoja ja hallinnoi säästötavoitteita</p>
        </div>
        <button
          onClick={() => setShowAddTransaction(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Lisää tapahtuma</span>
        </button>
      </div>

      {/* Yleiskatsauskortit */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tulot yhteensä</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalIncome())}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Menot yhteensä</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(getTotalExpenses())}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Nettotulot</p>
              <p className={`text-2xl font-bold ${getNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(getNetIncome())}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${getNetIncome() >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${getNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Säästöt yhteensä</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(savingsGoals.reduce((sum, goal) => sum + goal.current, 0))}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <PiggyBank className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Budjettikategoriat */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Kuukausibudjetti</h3>
        <div className="space-y-4">
          {budgets.map((budget, index) => {
            const progress = getBudgetProgress(budget);
            const isOverBudget = budget.spent > budget.allocated;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{budget.category}</span>
                  <div className="text-sm text-slate-600">
                    <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-slate-400"> / {formatCurrency(budget.allocated)}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-red-500' : budget.color
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{progress.toFixed(1)}% käytetty</span>
                  <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {isOverBudget 
                      ? `${formatCurrency(budget.spent - budget.allocated)} yli budjetin`
                      : `${formatCurrency(budget.allocated - budget.spent)} jäljellä`
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Säästötavoitteet */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Säästötavoitteet</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savingsGoals.map(goal => {
            const progress = getSavingsProgress(goal);
            const remaining = goal.target - goal.current;
            
            return (
              <div key={goal.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-800">{goal.name}</h4>
                  <Target className="h-5 w-5 text-slate-400" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Edistyminen</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${goal.color}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{formatCurrency(goal.current)}</span>
                    <span>{formatCurrency(goal.target)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{formatCurrency(remaining)}</span> jäljellä
                  </div>
                  <div className="text-xs text-slate-500">
                    Takaraja: {goal.deadline.toLocaleDateString('fi-FI')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viimeisimmät tapahtumat */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Viimeisimmät tapahtumat</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {transactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-800">{transaction.description}</div>
                  <div className="text-sm text-slate-600 capitalize">
                    {categories.find(c => c.value === transaction.category)?.label || transaction.category}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm text-slate-600">
                  {transaction.date.toLocaleDateString('fi-FI')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lisää tapahtuma -modaali */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Lisää tapahtuma</h3>
              <button
                onClick={() => setShowAddTransaction(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kuvaus</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Syötä kuvaus..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Summa</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tyyppi</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={newTransaction.type === 'income'}
                      onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-green-600">Tulo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={newTransaction.type === 'expense'}
                      onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-red-600">Meno</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kategoria</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddTransaction(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Peruuta
              </button>
              <button
                onClick={addTransaction}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Lisää tapahtuma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;