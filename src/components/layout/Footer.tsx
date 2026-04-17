'use client'

import { ShieldCheck, HelpCircle, FileText, Lock } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/domplace-logo.png" alt="DomPlace" className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-lg text-primary">DomPlace</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu marketplace local em Dom Eliseu, Pará. Conectando a comunidade local com os melhores produtos e serviços.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Sobre</h4>
            <ul className="space-y-2">
              {['Sobre o DomPlace', 'Central de Ajuda', 'Seja Parceiro', 'Trabalhe Conosco'].map((link) => (
                <li key={link}>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { icon: FileText, label: 'Termos de Uso' },
                { icon: Lock, label: 'Privacidade (LGPD)' },
                { icon: ShieldCheck, label: 'Segurança' },
                { icon: HelpCircle, label: 'FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Redes Sociais</h4>
            <div className="flex gap-3">
              {['Instagram', 'Facebook', 'WhatsApp'].map((social) => (
                <button
                  key={social}
                  className="h-10 w-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-sm font-medium transition-colors"
                >
                  {social[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>DomPlace © 2025 - Dom Eliseu, PA. Todos os direitos reservados.</p>
          <p>Feito com 💚 para a comunidade de Dom Eliseu</p>
        </div>
      </div>
    </footer>
  )
}
