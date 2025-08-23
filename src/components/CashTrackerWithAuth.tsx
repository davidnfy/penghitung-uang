import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Trash2, Edit, Plus, TrendingUp, TrendingDown, Wallet, CalendarIcon, LogOut, User } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  month: string;
  created_at: string;
}

const CashTrackerWithAuth = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date()
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Load transactions when user is available
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat transaksi",
        variant: "destructive"
      });
    } else {
      setTransactions((data || []).map(d => ({ ...d, type: d.type as 'income' | 'expense' })));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !user) {
      toast({
        title: "Error",
        description: "Mohon isi semua field",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const transactionDate = formData.date.toISOString().split('T')[0];
    const transactionMonth = `${formData.date.getFullYear()}-${String(formData.date.getMonth() + 1).padStart(2, '0')}`;
    
    const transactionData = {
      user_id: user.id,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: transactionDate,
      month: transactionMonth
    };

    let result;
    if (editingId) {
      result = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', editingId)
        .eq('user_id', user.id);
      setEditingId(null);
    } else {
      result = await supabase
        .from('transactions')
        .insert([transactionData]);
    }

    if (result.error) {
      toast({
        title: "Error",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      await loadTransactions();
      setFormData({ type: 'income', amount: '', description: '', date: new Date() });
      toast({
        title: "Berhasil",
        description: editingId ? "Transaksi berhasil diupdate" : "Transaksi berhasil ditambahkan"
      });
    }
    setLoading(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: new Date(transaction.date)
    });
    setEditingId(transaction.id);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      await loadTransactions();
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus"
      });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredTransactions = transactions.filter(t => t.month === selectedMonth);
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2025, i);
    return {
      value: `2025-${String(i + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with logout */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="text-center space-y-2 flex-1">
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Wallet className="h-8 w-8" />
              DompetKu
            </h1>
            <p className="text-muted-foreground">Kelola keuangan Anda dengan mudah</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {user?.email}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Month Selector */}
        <Card className="gradient-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="month" className="font-medium">Pilih Bulan:</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="gradient-card animate-fade-in border-income/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pemasukan
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card animate-fade-in border-expense/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pengeluaran
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(totalExpense)}
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Akhir
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transaction Form */}
          <Card className="gradient-card animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Transaksi</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'income' | 'expense') => 
                      setFormData({...formData, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah (Rp)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Keterangan</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Contoh: Gaji, Makan, Transport"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "dd MMMM yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({...formData, date: date || new Date()})}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Memproses...' : editingId ? 'Update' : 'Tambah'} Transaksi
                  </Button>
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ type: 'income', amount: '', description: '', date: new Date() });
                      }}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card className="gradient-card animate-slide-in">
            <CardHeader>
              <CardTitle>Daftar Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">
                  Memuat transaksi...
                </p>
              ) : filteredTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada transaksi untuk bulan ini
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                        transaction.type === 'income' 
                          ? 'border-l-income bg-income/5' 
                          : 'border-l-expense bg-expense/5'
                      } hover:shadow-md transition-shadow`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.description}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-income text-income-foreground' 
                              : 'bg-expense text-expense-foreground'
                          }`}>
                            {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                          </span>
                        </div>
                        <div className={`font-semibold ${
                          transaction.type === 'income' ? 'text-income' : 'text-expense'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(transaction)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CashTrackerWithAuth;