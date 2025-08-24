import React from 'react'
import { Separator } from '@/components/ui/separator'
import { Wallet, Heart, Shield, FileText, HelpCircle, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                DompetKu
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Aplikasi manajemen keuangan pribadi yang mudah dan aman untuk melacak penghasilan dan pengeluaran Anda.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Dibuat dengan</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>di Indonesia</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold">Fitur</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Pencatatan Transaksi
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Laporan Keuangan
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Analisis Pengeluaran
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Backup Otomatis
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Kebijakan Privasi
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Syarat & Ketentuan
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Kebijakan Cookie
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Dukungan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Pusat Bantuan
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Hubungi Kami
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                FAQ
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer">
                Tutorial
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} DompetKu. Semua hak dilindungi.
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Status Sistem
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              API Docs
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Changelog
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Keamanan Data Terjamin</p>
              <p className="text-muted-foreground">
                Data keuangan Anda dienkripsi dan disimpan dengan standar keamanan tinggi. 
                Kami tidak akan pernah membagikan informasi pribadi Anda kepada pihak ketiga.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer