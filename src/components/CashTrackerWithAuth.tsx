import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Wallet, LogOut, Plus, TrendingUp, TrendingDown, Calendar, Edit, Trash2, Settings } from 'lucide-react'
import ProfileEdit from './ProfileEdit'
import Footer from './Footer'

interface Transaction {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  month: string
  created_at: string
}

const CashTrackerWithAuth = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return

      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Gagal memuat transaksi",
          variant: "destructive"
        })
      } else {
        setTransactions((data || []).map(d => ({ ...d, type: d.type as 'income' | 'expense' })))
      }
      setLoading(false)
    }

    if (user) {
      loadTransactions()
    }
  }, [user, toast])

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !user) {
      toast({
        title: "Error",
        description: "Mohon isi semua field",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    const today = new Date()
    const transactionData = {
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      description,
      date: today.toISOString().split('T')[0],
      month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    }

    const { error } = await supabase
      .from('transactions')
      .insert([transactionData])

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } else {
      setAmount('')
      setDescription('')
      setType('expense')
      
      // Reload transactions
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (data) {
        setTransactions(data.map(d => ({ ...d, type: d.type as 'income' | 'expense' })))
      }

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan"
      })
    }
    setLoading(false)
  }

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !user || !editingId) return

    setLoading(true)
    const today = new Date()
    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      date: today.toISOString().split('T')[0],
      month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    }

    const { error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', editingId)
      .eq('user_id', user.id)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } else {
      setAmount('')
      setDescription('')
      setType('expense')
      setEditingId(null)
      
      // Reload transactions
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (data) {
        setTransactions(data.map(d => ({ ...d, type: d.type as 'income' | 'expense' })))
      }

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil diupdate"
      })
    }
    setLoading(false)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setAmount(transaction.amount.toString())
    setDescription(transaction.description)
    setType(transaction.type)
    setEditingId(transaction.id)
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return

    setLoading(true)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } else {
      setTransactions(transactions.filter(t => t.id !== id))
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus"
      })
    }
    setLoading(false)
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setType('expense')
    setEditingId(null)
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (showProfile) {
    return <ProfileEdit onBack={() => setShowProfile(false)} />
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const balance = totalIncome - totalExpense

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">DompetKu</h1>
                <p className="text-muted-foreground">Selamat datang, {user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowProfile(true)} className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Pengaturan
              </Button>
              <Button variant="outline" onClick={() => setShowProfile(true)} className="sm:hidden">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2 hidden sm:block" />
                <LogOut className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:block">Keluar</span>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="gradient-card border-income/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pemasukan
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-income" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-income">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-expense/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pengeluaran
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-expense">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  Rp {balance.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Transaction Form */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingId ? handleUpdateTransaction : handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe</Label>
                    <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
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
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Keterangan</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Contoh: Gaji, Makan, Transport"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-2">
                  <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                    {editingId ? 'Update' : 'Tambah'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Transaksi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada transaksi. Tambahkan transaksi pertama Anda!
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          transaction.type === 'income' 
                            ? 'bg-income/20 text-income' 
                            : 'bg-expense/20 text-expense'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className={`font-semibold ${
                          transaction.type === 'income' ? 'text-income' : 'text-expense'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}Rp {Number(transaction.amount).toLocaleString('id-ID')}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CashTrackerWithAuth