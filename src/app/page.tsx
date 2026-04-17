'use client'

import { useAppStore } from '@/store/useAppStore'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryBar } from '@/components/home/CategoryBar'
import { ProductCarousel } from '@/components/home/ProductCarousel'
import { StoreCarousel } from '@/components/home/StoreCarousel'
import { PartnersBanner } from '@/components/home/PartnersBanner'
import { ProductDetail } from '@/components/product/ProductDetail'
import { StoreProfile } from '@/components/store/StoreProfile'
import { SearchView } from '@/components/search/SearchView'
import { CartView } from '@/components/cart/CartView'
import { CheckoutView } from '@/components/checkout/CheckoutView'
import { OrdersView, OrderDetail } from '@/components/orders/OrdersView'
import { ProfileView } from '@/components/profile/ProfileView'
import { AIChat } from '@/components/chat/AIChat'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProductCard } from '@/components/product/ProductCard'
import { Heart, ShoppingBag } from 'lucide-react'
import type { ProductData, StoreData, BannerData } from '@/store/useAppStore'

const defaultBanners = [
  { id: 'b1', title: 'Ofertas da Semana', subtitle: 'Até 40% de desconto em produtos locais', image: '', gradient: 'bg-gradient-to-r from-primary via-emerald-500 to-teal-500' },
  { id: 'b2', title: 'Entrega Grátis', subtitle: 'Compras acima de R$ 50 em lojas selecionadas', image: '', gradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500' },
  { id: 'b3', title: 'Novidades no App', subtitle: 'Descubra novas lojas e produtos da região', image: '', gradient: 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500' },
  { id: 'b4', title: 'Programa de Fidelidade', subtitle: 'Ganhe pontos a cada compra e troque por descontos', image: '', gradient: 'bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600' },
]

const defaultStores: StoreData[] = [
  { id: 's1', name: 'Mercado do Zé', slug: 'mercado-do-ze', description: 'O melhor mercado de Dom Eliseu com produtos frescos e preços justos.', category: 'FOOD', logo: null, coverImage: null, phone: '(91) 99999-0001', whatsapp: '(91) 99999-0001', address: 'Rua Principal, 123', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 50, rating: 4.7, totalReviews: 128, opensAt: '07:00', closesAt: '21:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's2', name: 'Açaí da Boa', slug: 'acai-da-boa', description: 'O mais autêntico açaí paraense, feito com frutas selecionadas da região.', category: 'FOOD', logo: null, coverImage: null, phone: '(91) 99999-0002', whatsapp: '(91) 99999-0002', address: 'Av. Brasil, 456', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 30, rating: 4.9, totalReviews: 256, opensAt: '08:00', closesAt: '22:00', openDays: '1,2,3,4,5,6' },
  { id: 's3', name: 'Agropecuária São Paulo', slug: 'agropecuaria-sao-paulo', description: 'Tudo para o campo e para a cidade. Ferramentas, sementes e muito mais.', category: 'AGRICULTURE', logo: null, coverImage: null, phone: '(91) 99999-0003', whatsapp: '(91) 99999-0003', address: 'Rod. PA-279, Km 5', neighborhood: 'Zona Rural', city: 'Dom Eliseu', state: 'PA', deliveryFee: 8.00, freeDeliveryAbove: 200, rating: 4.5, totalReviews: 67, opensAt: '06:00', closesAt: '18:00', openDays: '1,2,3,4,5,6' },
  { id: 's4', name: 'Farmácia Vida', slug: 'farmacia-vida', description: 'Sua saúde em primeiro lugar. Medicamentos, suplementos e atendimento farmacêutico.', category: 'HEALTH', logo: null, coverImage: null, phone: '(91) 99999-0004', whatsapp: '(91) 99999-0004', address: 'Rua Pará, 789', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.6, totalReviews: 89, opensAt: '07:00', closesAt: '22:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's5', name: 'Padaria Pão Quente', slug: 'padaria-pao-quente', description: 'Pão fresquinho todo dia! Doces, salgados e muito mais.', category: 'FOOD', logo: null, coverImage: null, phone: '(91) 99999-0005', whatsapp: '(91) 99999-0005', address: 'Rua Amazonas, 321', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 3.00, freeDeliveryAbove: 25, rating: 4.8, totalReviews: 198, opensAt: '05:00', closesAt: '20:00', openDays: '1,2,3,4,5,6,7' },
  { id: 's6', name: 'Loja do Eletrônico', slug: 'loja-do-eletronico', description: 'Celulares, acessórios e eletrônicos com as melhores ofertas.', category: 'ELECTRONICS', logo: null, coverImage: null, phone: '(91) 99999-0006', whatsapp: '(91) 99999-0006', address: 'Rua Tocantins, 654', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 5.00, freeDeliveryAbove: 100, rating: 4.3, totalReviews: 45, opensAt: '08:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
  { id: 's7', name: 'Pet Shop Amigo Fiel', slug: 'pet-shop-amigo-fiel', description: 'Tudo para seu melhor amigo. Rações, banho, tosa e acessórios.', category: 'ANIMALS', logo: null, coverImage: null, phone: '(91) 99999-0007', whatsapp: '(91) 99999-0007', address: 'Rua Maranhão, 987', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 4.00, freeDeliveryAbove: 80, rating: 4.7, totalReviews: 112, opensAt: '08:00', closesAt: '19:00', openDays: '1,2,3,4,5,6' },
  { id: 's8', name: 'Salão da Bella', slug: 'salao-da-bella', description: 'Beleza e bem-estar para mulheres e homens. Cortes, coloração e tratamentos.', category: 'BEAUTY', logo: null, coverImage: null, phone: '(91) 99999-0008', whatsapp: '(91) 99999-0008', address: 'Rua Ceará, 147', neighborhood: 'Centro', city: 'Dom Eliseu', state: 'PA', deliveryFee: 0, freeDeliveryAbove: null, rating: 4.9, totalReviews: 210, opensAt: '09:00', closesAt: '20:00', openDays: '1,2,3,4,5,6' },
]

const defaultProducts: ProductData[] = [
  // Mercado do Zé
  { id: 'p1', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Arroz Tio João 5kg', slug: 'arroz-tio-joao', description: 'Arroz tipo 1 premium, ideal para o dia a dia da sua família.', price: 24.90, comparePrice: 29.90, images: '[]', stock: 50, rating: 4.5, totalReviews: 23, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["5kg","1kg"]', category: 'FOOD' },
  { id: 'p2', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Feijão Carioca 1kg', slug: 'feijao-carioca', description: 'Feijão carioca selecionado de alta qualidade.', price: 8.90, comparePrice: null, images: '[]', stock: 80, rating: 4.3, totalReviews: 15, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: '["1kg","500g"]', category: 'FOOD' },
  { id: 'p3', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Óleo de Soja 900ml', slug: 'oleo-soja', description: 'Óleo de soja puro para cozinhar.', price: 7.49, comparePrice: 8.99, images: '[]', stock: 40, rating: 4.1, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p4', storeId: 's1', storeName: 'Mercado do Zé', storeLogo: null, name: 'Açúcar Cristal 1kg', slug: 'acucar-cristal', description: 'Açúcar cristal refinado premium.', price: 5.49, comparePrice: null, images: '[]', stock: 60, rating: 4.0, totalReviews: 6, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  
  // Açaí da Boa
  { id: 'p5', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí 500ml', slug: 'acai-500ml', description: 'Açaí cremoso feito com frutas frescas do Pará. Acompanha granola e banana.', price: 15.00, comparePrice: 18.00, images: '[]', stock: 100, rating: 4.9, totalReviews: 89, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["300ml","500ml","700ml"]', category: 'FOOD' },
  { id: 'p6', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Açaí Premium 700ml', slug: 'acai-premium-700ml', description: 'Açaí premium com frutas da estação, leite condensado e granola artesanal.', price: 22.00, comparePrice: null, images: '[]', stock: 50, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p7', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Tigela de Cupuaçu', slug: 'tigela-cupuacu', description: 'Cupuaçu cremoso com farinha de tapioca e banana.', price: 18.00, comparePrice: null, images: '[]', stock: 30, rating: 4.7, totalReviews: 32, isFeatured: false, isNew: true, isOffer: false, tags: '[]', variations: '["300ml","500ml"]', category: 'FOOD' },
  { id: 'p8', storeId: 's2', storeName: 'Açaí da Boa', storeLogo: null, name: 'Smoothie de Açaí', slug: 'smoothie-acai', description: 'Smoothie refrescante de açaí com banana e morango.', price: 12.00, comparePrice: 15.00, images: '[]', stock: 40, rating: 4.6, totalReviews: 28, isFeatured: false, isNew: true, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
  
  // Agropecuária São Paulo
  { id: 'p9', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Adubo NPK 20kg', slug: 'adubo-npk', description: 'Adubo NPK para culturas diversas. Alta eficiência.', price: 89.90, comparePrice: null, images: '[]', stock: 25, rating: 4.4, totalReviews: 12, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'p10', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Sementes de Milho 5kg', slug: 'sementes-milho', description: 'Sementes de milho híbrido de alta produtividade.', price: 145.00, comparePrice: 169.90, images: '[]', stock: 15, rating: 4.6, totalReviews: 8, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'p11', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Muda de Cupuaçu', slug: 'muda-cupuacu', description: 'Muda de cupuaçuzeiro com raiz forte, pronta para plantio.', price: 25.00, comparePrice: null, images: '[]', stock: 30, rating: 4.8, totalReviews: 5, isFeatured: true, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'AGRICULTURE' },
  { id: 'p12', storeId: 's3', storeName: 'Agropecuária São Paulo', storeLogo: null, name: 'Ferramenta Multipropósito', slug: 'ferramenta-multi', description: 'Kit de ferramentas básicas para o campo e casa.', price: 67.00, comparePrice: 79.90, images: '[]', stock: 20, rating: 4.2, totalReviews: 9, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'AGRICULTURE' },
  
  // Farmácia Vida
  { id: 'p13', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Vitamina C 500mg', slug: 'vitamina-c', description: 'Suplemento de vitamina C 500mg. Pote com 60 cápsulas.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 100, rating: 4.7, totalReviews: 34, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["500mg","1000mg"]', category: 'HEALTH' },
  { id: 'p14', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Protetor Solar FPS 50', slug: 'protetor-solar', description: 'Protetor solar facial FPS 50 com 120ml.', price: 45.90, comparePrice: null, images: '[]', stock: 50, rating: 4.5, totalReviews: 18, isFeatured: false, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'HEALTH' },
  { id: 'p15', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Kit Primeiros Socorros', slug: 'kit-primeiros-socorros', description: 'Kit completo de primeiros socorros para casa e carro.', price: 59.90, comparePrice: 75.00, images: '[]', stock: 20, rating: 4.8, totalReviews: 22, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'HEALTH' },
  { id: 'p16', storeId: 's4', storeName: 'Farmácia Vida', storeLogo: null, name: 'Pasta de Dente Colgate', slug: 'pasta-dente', description: 'Pasta de dente Colgate Máxima Proteção 90g.', price: 6.90, comparePrice: null, images: '[]', stock: 200, rating: 4.3, totalReviews: 11, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'HEALTH' },
  
  // Padaria Pão Quente
  { id: 'p17', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Pão Francês (6 un)', slug: 'pao-frances', description: 'Pão francês fresquinho saindo do forno. Pacote com 6 unidades.', price: 6.00, comparePrice: null, images: '[]', stock: 200, rating: 4.9, totalReviews: 120, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p18', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Bolo de Chocolate', slug: 'bolo-chocolate', description: 'Bolo de chocolate fofinho com cobertura de ganache. Fatia generosa.', price: 16.50, comparePrice: null, images: '[]', stock: 15, rating: 4.8, totalReviews: 56, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: '["Fatia","Inteiro"]', category: 'FOOD' },
  { id: 'p19', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Coxinha de Frango (10 un)', slug: 'coxinha-frango', description: 'Coxinhas de frango cremosas. Pack com 10 unidades.', price: 35.00, comparePrice: 42.00, images: '[]', stock: 30, rating: 4.7, totalReviews: 78, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'FOOD' },
  { id: 'p20', storeId: 's5', storeName: 'Padaria Pão Quente', storeLogo: null, name: 'Tapioca Recheada', slug: 'tapioca-recheada', description: 'Tapioca recheada com queijo e presunto. Feita na hora.', price: 12.00, comparePrice: null, images: '[]', stock: 50, rating: 4.6, totalReviews: 34, isFeatured: false, isNew: true, isOffer: false, tags: '[]', variations: '["Queijo","Presunto","Frango"]', category: 'FOOD' },
  
  // Loja do Eletrônico
  { id: 'p21', storeId: 's6', storeName: 'Loja do Eletrônico', storeLogo: null, name: 'Capinha de Celular Premium', slug: 'capinha-celular', description: 'Capinha de silicone premium para diversos modelos.', price: 29.90, comparePrice: 49.90, images: '[]', stock: 100, rating: 4.2, totalReviews: 19, isFeatured: false, isNew: true, isOffer: true, tags: '[]', variations: '["iPhone","Samsung","Motorola"]', category: 'ELECTRONICS' },
  { id: 'p22', storeId: 's6', storeName: 'Loja do Eletrônico', storeLogo: null, name: 'Fone Bluetooth', slug: 'fone-bluetooth', description: 'Fone de ouvido Bluetooth com microfone e bateria de longa duração.', price: 79.90, comparePrice: 119.90, images: '[]', stock: 25, rating: 4.4, totalReviews: 14, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'ELECTRONICS' },
  { id: 'p23', storeId: 's6', storeName: 'Loja do Eletrônico', storeLogo: null, name: 'Carregador Turbo 20W', slug: 'carregador-turbo', description: 'Carregador turbo 20W com cabo USB-C compatível com vários aparelhos.', price: 45.00, comparePrice: null, images: '[]', stock: 40, rating: 4.5, totalReviews: 21, isFeatured: false, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'ELECTRONICS' },
  { id: 'p24', storeId: 's6', storeName: 'Loja do Eletrônico', storeLogo: null, name: 'Power Bank 10000mAh', slug: 'power-bank', description: 'Power Bank portátil 10000mAh com duas saídas USB.', price: 89.90, comparePrice: 129.90, images: '[]', stock: 15, rating: 4.3, totalReviews: 7, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'ELECTRONICS' },
  
  // Pet Shop Amigo Fiel
  { id: 'p25', storeId: 's7', storeName: 'Pet Shop Amigo Fiel', storeLogo: null, name: 'Ração Premium Cães 15kg', slug: 'racao-caes', description: 'Ração super premium para cães adultos. Sabor frango e arroz.', price: 89.90, comparePrice: 109.90, images: '[]', stock: 30, rating: 4.8, totalReviews: 45, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: '["8kg","15kg","20kg"]', category: 'ANIMALS' },
  { id: 'p26', storeId: 's7', storeName: 'Pet Shop Amigo Fiel', storeLogo: null, name: 'Coleira Anti-Pulgas', slug: 'coleira-anti-pulgas', description: 'Coleira anti-pulgas e carrapatos para cães e gatos. Duração 8 meses.', price: 32.00, comparePrice: null, images: '[]', stock: 60, rating: 4.5, totalReviews: 28, isFeatured: false, isNew: false, isOffer: false, tags: '[]', variations: '["Pequeno","Grande"]', category: 'ANIMALS' },
  { id: 'p27', storeId: 's7', storeName: 'Pet Shop Amigo Fiel', storeLogo: null, name: 'Brinquedo Corda', slug: 'brinquedo-corda', description: 'Brinquedo de corda resistente para cães de médio e grande porte.', price: 19.90, comparePrice: null, images: '[]', stock: 40, rating: 4.1, totalReviews: 12, isFeatured: false, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'ANIMALS' },
  { id: 'p28', storeId: 's7', storeName: 'Pet Shop Amigo Fiel', storeLogo: null, name: 'Ração Gatos 3kg', slug: 'racao-gatos', description: 'Ração para gatos adultos. Sabor salmão.', price: 45.00, comparePrice: 52.00, images: '[]', stock: 25, rating: 4.6, totalReviews: 19, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'ANIMALS' },
  
  // Salão da Bella
  { id: 'p29', storeId: 's8', storeName: 'Salão da Bella', storeLogo: null, name: 'Corte Feminino', slug: 'corte-feminino', description: 'Corte e styling feminino com profissionais experientes.', price: 45.00, comparePrice: null, images: '[]', stock: 999, rating: 4.9, totalReviews: 98, isFeatured: true, isNew: false, isOffer: false, tags: '[]', variations: '["Corte","Corte + Escova"]', category: 'BEAUTY' },
  { id: 'p30', storeId: 's8', storeName: 'Salão da Bella', storeLogo: null, name: 'Coloração Capilar', slug: 'coloracao-capilar', description: 'Coloração profissional com produtos de alta qualidade.', price: 120.00, comparePrice: 150.00, images: '[]', stock: 999, rating: 4.8, totalReviews: 67, isFeatured: false, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'BEAUTY' },
  { id: 'p31', storeId: 's8', storeName: 'Salão da Bella', storeLogo: null, name: 'Manicure Completa', slug: 'manicure-completa', description: 'Manicure e pedicure completa com esmaltação.', price: 50.00, comparePrice: null, images: '[]', stock: 999, rating: 4.7, totalReviews: 54, isFeatured: false, isNew: true, isOffer: false, tags: '[]', variations: null, category: 'BEAUTY' },
  { id: 'p32', storeId: 's8', storeName: 'Salão da Bella', storeLogo: null, name: 'Hidratação Capilar', slug: 'hidratacao-capilar', description: 'Tratamento de hidratação profunda para cabelos danificados.', price: 80.00, comparePrice: 95.00, images: '[]', stock: 999, rating: 4.9, totalReviews: 41, isFeatured: true, isNew: false, isOffer: true, tags: '[]', variations: null, category: 'BEAUTY' },
]

const offerProducts = defaultProducts.filter(p => p.isOffer)
const newProducts = defaultProducts.filter(p => p.isNew)
const featuredProducts = defaultProducts.filter(p => p.isFeatured)
const suggestedProducts = defaultProducts.slice(0, 8)

const defaultBanners2 = [
  { id: 'b5', title: 'Feira do Produtor', subtitle: 'Toda sexta-feira no centro com produtos fresquinhos!', image: '', gradient: 'bg-gradient-to-r from-amber-500 to-orange-600', level: 'DAILY_OFFERS', order: 0 },
  { id: 'b6', title: 'Grandes Ofertas Farmácia Vida', subtitle: 'Até 30% de desconto em suplementos', image: '', gradient: 'bg-gradient-to-r from-rose-500 to-pink-600', level: 'DAILY_OFFERS', order: 1 },
]

export default function Home() {
  const { currentView, isSearchOpen } = useAppStore()
  
  return (
    <div className="min-h-screen pb-20 md:pb-4">
      <AnimatePresence mode="wait">
        {isSearchOpen ? (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchView />
          </motion.div>
        ) : currentView === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {/* Hero */}
            <section className="mt-4">
              <HeroBanner banners={defaultBanners} />
            </section>
            
            {/* Categories */}
            <section className="mt-6">
              <CategoryBar />
            </section>
            
            {/* Offers of the Day */}
            <section className="mt-6">
              <ProductCarousel title="🔥 Ofertas do Dia" products={offerProducts} />
            </section>
            
            {/* New in City */}
            <section className="mt-6">
              <ProductCarousel title="✨ Novidades na Cidade" products={newProducts} />
            </section>
            
            {/* Featured Stores */}
            <section className="mt-6">
              <StoreCarousel title="🏪 Lojas em Destaque" stores={defaultStores} />
            </section>
            
            {/* Suggestions */}
            <section className="mt-6">
              <ProductCarousel title="💡 Sugestões para Você" products={suggestedProducts} />
            </section>
            
            {/* Partners */}
            <section className="mt-6">
              <PartnersBanner />
            </section>
            
            {/* Segmented Ads */}
            <section className="mt-6">
              <ProductCarousel title="📢 Anúncios Segmentados" products={defaultProducts.filter(p => p.storeId === 's2' || p.storeId === 's5')} />
            </section>
            
            <div className="h-4" />
          </motion.div>
        ) : currentView === 'product' ? (
          <motion.div key="product" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
            {useAppStore.getState().selectedProduct ? (
              <ProductDetail product={useAppStore.getState().selectedProduct!} />
            ) : (
              <p className="text-center py-12 text-muted-foreground">Produto não encontrado</p>
            )}
          </motion.div>
        ) : currentView === 'store' ? (
          <motion.div key="store" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
            {useAppStore.getState().selectedStore ? (
              <StoreProfile store={useAppStore.getState().selectedStore!} />
            ) : (
              <p className="text-center py-12 text-muted-foreground">Loja não encontrada</p>
            )}
          </motion.div>
        ) : currentView === 'cart' ? (
          <motion.div key="cart" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CartView />
          </motion.div>
        ) : currentView === 'checkout' ? (
          <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4">
            <CheckoutView />
          </motion.div>
        ) : currentView === 'orders' ? (
          <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <OrdersView />
          </motion.div>
        ) : currentView === 'order-detail' ? (
          <motion.div key="order-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <OrderDetail />
          </motion.div>
        ) : currentView === 'profile' ? (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ProfileView />
          </motion.div>
        ) : currentView === 'favorites' ? (
          <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-4 pt-4">
            <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Favoritos
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredProducts.slice(0, 6).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
