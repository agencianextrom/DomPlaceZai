'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Shield,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface CommunityAlert {
  id: string;
  emoji: string;
  title: string;
  description: string;
  time: string;
  category: string;
  severity: 'normal' | 'warning' | 'danger';
}

interface ReportCategory {
  id: string;
  emoji: string;
  label: string;
}

interface EmergencyContact {
  name: string;
  number: string;
  icon: React.ReactNode;
  buttonColor: string;
}

interface CommunityStat {
  label: string;
  value: string;
}

interface SafetyTip {
  id: string;
  emoji: string;
  title: string;
  content: string;
}

const springConfig = { type: 'spring' as const, stiffness: 300, damping: 24 };

const SAFETY_SCORE = 87;
const RING_RADIUS = 58;
const RING_STROKE = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ALERT_LEVELS = [
  { id: 'normal', label: '🟢 Normal', color: '#16a34a', bg: '#dcfce7' },
  { id: 'attention', label: '🟡 Atenção', color: '#ca8a04', bg: '#fef9c3' },
  { id: 'alert', label: '🔴 Alerta', color: '#dc2626', bg: '#fee2e2' },
];

const COMMUNITY_ALERTS: CommunityAlert[] = [
  {
    id: 'a1',
    emoji: '🚗',
    title: 'Acidente na Av. Paulista',
    description:
      'Colisão entre dois veículos bloqueando a faixa da direita. Trânsito intenso na região. Prefira rotas alternativas pela R. Augusta.',
    time: '5min atrás',
    category: 'Trânsito',
    severity: 'warning',
  },
  {
    id: 'a2',
    emoji: '🔒',
    title: 'Tentativa de arrombamento',
    description:
      'Moradores reportaram tentativa de arrombamento na R. Oscar Freire. A polícia foi acionada e está patrulhando a área.',
    time: '23min atrás',
    category: 'Segurança',
    severity: 'danger',
  },
  {
    id: 'a3',
    emoji: '🏗️',
    title: 'Buraco na calçada',
    description:
      'Buraco grande na calçada em frente ao nº 450 da R. Consolação. Risco para pedestres e idosos. Prefeitura já foi notificada.',
    time: '1h atrás',
    category: 'Infraestrutura',
    severity: 'normal',
  },
  {
    id: 'a4',
    emoji: '🌧️',
    title: 'Alagamento na região',
    description:
      'Enchente repentina na Praça da Sé. Nível da água subiu rapidamente. Evite a área e procure pontos elevados se estiver nas proximidades.',
    time: '3h atrás',
    category: 'Clima',
    severity: 'warning',
  },
  {
    id: 'a5',
    emoji: '🏪',
    title: 'Comércio irregular noturno',
    description:
      'Comércio ambulante funcionando após o horário permitido na R. 25 de Março. Barulho e sujeita reportados por moradores.',
    time: '6h atrás',
    category: 'Comércio',
    severity: 'normal',
  },
];

const REPORT_CATEGORIES: ReportCategory[] = [
  { id: 'transito', emoji: '🚗', label: 'Trânsito' },
  { id: 'seguranca', emoji: '🔒', label: 'Segurança' },
  { id: 'infraestrutura', emoji: '🏗️', label: 'Infraestrutura' },
  { id: 'clima', emoji: '🌧️', label: 'Clima' },
  { id: 'comercio', emoji: '🏪', label: 'Comércio' },
  { id: 'animais', emoji: '🐾', label: 'Animais' },
];

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: 'Polícia', number: '190', icon: <Shield className="h-5 w-5" />, buttonColor: '#16a34a' },
  { name: 'SAMU', number: '192', icon: <Phone className="h-5 w-5" />, buttonColor: '#16a34a' },
  { name: 'Bombeiros', number: '193', icon: <AlertTriangle className="h-5 w-5" />, buttonColor: '#ca8a04' },
  { name: 'Defesa Civil', number: '199', icon: <AlertTriangle className="h-5 w-5" />, buttonColor: '#dc2626' },
];

const COMMUNITY_STATS: CommunityStat[] = [
  { label: 'Moradores', value: '1.2k' },
  { label: 'Reportes esta semana', value: '47' },
  { label: 'Resolvidos', value: '89%' },
  { label: 'Tempo médio', value: '12min' },
];

const SAFETY_TIPS: SafetyTip[] = [
  {
    id: 't1',
    emoji: '🔒',
    title: 'Segurança em casa',
    content:
      'Mantenha portas e janelas trancadas, especialmente à noite. Instale câmeras de segurança e sensor de movimento. Comunique-se regularmente com vizinhos sobre atividades suspeitas.',
  },
  {
    id: 't2',
    emoji: '🚶',
    title: 'Caminhada segura',
    content:
      'Evite ruas pouco iluminadas e vazias. Informe alguém sobre seu itinerário. Carregue celular carregado e use fones de ouvido apenas em um lado para manter atenção ao ambiente.',
  },
  {
    id: 't3',
    emoji: '📱',
    title: 'Tecnologia a seu favor',
    content:
      'Ative rastreamento no celular, compartilhe localização com familiares e use aplicativos de segurança da comunidade. Mantenha os contatos de emergência salvos na agenda.',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#ca8a04';
  return '#dc2626';
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Muito Seguro';
  if (score >= 40) return 'Moderado';
  return 'Atenção';
}

function severityBg(severity: string): string {
  if (severity === 'danger') return '#fee2e2';
  if (severity === 'warning') return '#fef9c3';
  return '#f0fdf4';
}

function severityText(severity: string): string {
  if (severity === 'danger') return '#dc2626';
  if (severity === 'warning') return '#ca8a04';
  return '#16a34a';
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ''}`}
      style={{ backgroundColor: '#e5e7eb' }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-4">
      <SkeletonBox className="h-20 w-full" />
      <div className="flex items-center justify-center gap-8">
        <SkeletonBox className="h-40 w-40 rounded-full" />
        <div className="space-y-3">
          <SkeletonBox className="h-6 w-40" />
          <SkeletonBox className="h-4 w-52" />
        </div>
      </div>
      <SkeletonBox className="h-14 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox key={i} className="h-16 w-full" />
        ))}
      </div>
      <SkeletonBox className="h-64 w-full" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function NeighborhoodSafetyHub() {
  const [loading, setLoading] = useState(true);
  const [activeAlertLevel, setActiveAlertLevel] = useState('normal');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
  const [scoreAnimated, setScoreAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setScoreAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const scoreOffset = useMemo(
    () => RING_CIRCUMFERENCE - (scoreAnimated ? (SAFETY_SCORE / 100) * RING_CIRCUMFERENCE : RING_CIRCUMFERENCE),
    [scoreAnimated],
  );

  const handleSendReport = () => {
    if (!selectedCategory) return;
    setReportSent(true);
    setTimeout(() => {
      setReportSent(false);
      setSelectedCategory(null);
    }, 2000);
  };

  /* ---- Loading state ---- */
  if (loading) return <LoadingSkeleton />;

  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springConfig, delay: 0.05 }}
        className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* ========== 1. HEADER ========== */}
        <motion.div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 50%, #38bdf8 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white" />
            <h2 className="text-white font-bold text-lg tracking-tight">
              Segurança do Bairro 🛡️
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springConfig, delay: 0.3 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
          >
            <span
              className="relative flex h-2.5 w-2.5"
            >
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                style={{ backgroundColor: '#4ade80' }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: '#22c55e' }}
              />
            </span>
            Ativo agora
          </motion.div>
        </motion.div>

        <div className="px-5 py-5 space-y-6" style={{ backgroundColor: '#ffffff' }}>
          {/* ========== 2. SAFETY SCORE ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
          >
            <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
              <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={RING_STROKE}
                />
                {/* Progress ring */}
                <motion.circle
                  cx="70"
                  cy="70"
                  r={RING_RADIUS}
                  fill="none"
                  stroke={scoreColor(SAFETY_SCORE)}
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  animate={{ strokeDashoffset: scoreOffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold" style={{ color: scoreColor(SAFETY_SCORE) }}>
                  {SAFETY_SCORE}
                </span>
                <span className="text-xs text-gray-500 font-medium">/100</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  color: scoreColor(SAFETY_SCORE),
                  backgroundColor:
                    SAFETY_SCORE >= 70
                      ? '#dcfce7'
                      : SAFETY_SCORE >= 40
                        ? '#fef9c3'
                        : '#fee2e2',
                }}
              >
                {scoreLabel(SAFETY_SCORE)}
              </span>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <TrendingUp className="h-4 w-4" style={{ color: '#16a34a' }} />
                <span className="text-sm font-medium" style={{ color: '#16a34a' }}>
                  ↑ +3 esta semana
                </span>
              </div>
            </div>
          </motion.div>

          {/* ========== 3. ALERT LEVEL BAR ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.15 }}
            className="flex gap-3 overflow-x-auto pb-1"
          >
            {ALERT_LEVELS.map((level, i) => {
              const isActive = activeAlertLevel === level.id;
              return (
                <motion.button
                  key={level.id}
                  layout
                  onClick={() => setActiveAlertLevel(level.id)}
                  className="flex-shrink-0 flex items-center justify-center rounded-xl px-4 min-h-[44px] text-sm font-semibold transition-colors cursor-pointer"
                  style={{
                    minWidth: 120,
                    backgroundColor: isActive ? level.color : level.bg,
                    color: isActive ? '#ffffff' : level.color,
                    border: `2px solid ${isActive ? level.color : 'transparent'}`,
                    boxShadow: isActive
                      ? `0 4px 14px ${level.color}44`
                      : 'none',
                  }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springConfig, delay: 0.2 + i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {level.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* ========== 4. RECENT ALERTS ========== */}
          <div className="space-y-3">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base font-bold text-gray-800 flex items-center gap-2"
            >
              <MessageSquare className="h-5 w-5 text-gray-500" />
              Alertas Recentes
            </motion.h3>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {COMMUNITY_ALERTS.map((alert, i) => {
                const isExpanded = expandedAlertId === alert.id;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.35 + i * 0.06 }}
                    className="rounded-xl border p-3.5"
                    style={{
                      borderColor: severityBg(alert.severity),
                      backgroundColor: severityBg(alert.severity),
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl leading-none mt-0.5">{alert.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {alert.title}
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: severityText(alert.severity) + '18',
                              color: severityText(alert.severity),
                            }}
                          >
                            {alert.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {alert.time}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="text-sm text-gray-700 mt-2 overflow-hidden"
                            >
                              {alert.description}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        <motion.button
                          onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                          className="flex items-center gap-1 mt-1.5 text-xs font-semibold min-h-[44px] min-w-[44px] px-1 cursor-pointer"
                          style={{ color: severityText(alert.severity) }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              Ver mais
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ========== 5. QUICK REPORT ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.55 }}
            className="rounded-xl border p-4"
            style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
          >
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Send className="h-5 w-5 text-gray-500" />
              Reportar Ocorrência
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {REPORT_CATEGORIES.map((cat, i) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-semibold transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? '#0d9488' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#374151',
                      border: isSelected ? '2px solid #0d9488' : '2px solid #e5e7eb',
                      boxShadow: isSelected
                        ? '0 4px 14px rgba(13,148,136,0.25)'
                        : 'none',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...springConfig, delay: 0.6 + i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    {cat.label}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              onClick={handleSendReport}
              disabled={!selectedCategory || reportSent}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl min-h-[44px] text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedCategory ? '#0d9488' : '#d1d5db',
                color: selectedCategory ? '#ffffff' : '#9ca3af',
                boxShadow: selectedCategory
                  ? '0 4px 14px rgba(13,148,136,0.25)'
                  : 'none',
              }}
              whileTap={selectedCategory ? { scale: 0.97 } : undefined}
            >
              {reportSent ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Reporte Enviado!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Report
                </>
              )}
            </motion.button>
          </motion.div>

          {/* ========== 6. EMERGENCY CONTACTS ========== */}
          <div className="space-y-3">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="text-base font-bold text-gray-800 flex items-center gap-2"
            >
              <Phone className="h-5 w-5 text-gray-500" />
              Contatos de Emergência
            </motion.h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMERGENCY_CONTACTS.map((contact, i) => (
                <motion.div
                  key={contact.name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: 0.8 + i * 0.08 }}
                  className="flex items-center justify-between rounded-xl border p-3.5"
                  style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: contact.buttonColor + '18',
                        color: contact.buttonColor,
                      }}
                    >
                      {contact.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.number}</p>
                    </div>
                  </div>
                  <motion.button
                    className="flex items-center gap-1.5 rounded-lg px-3 min-h-[44px] min-w-[44px] text-sm font-semibold text-white cursor-pointer"
                    style={{
                      backgroundColor: contact.buttonColor,
                      boxShadow: `0 3px 10px ${contact.buttonColor}44`,
                    }}
                    whileTap={{ scale: 0.93 }}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Ligar
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ========== 7. COMMUNITY WATCH STATS ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 1.0 }}
            className="space-y-3"
          >
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              Estatísticas da Comunidade
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {COMMUNITY_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springConfig, delay: 1.05 + i * 0.06 }}
                  className="flex-shrink-0 rounded-xl border p-4 text-center min-w-[120px]"
                  style={{ borderColor: '#e5e7eb', backgroundColor: '#f0fdfa' }}
                >
                  <p className="text-xl font-extrabold" style={{ color: '#0d9488' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ========== 8. SAFETY TIPS ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 1.15 }}
            className="space-y-3"
          >
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-500" />
              Dicas de Segurança
            </h3>

            <div className="space-y-2.5">
              {SAFETY_TIPS.map((tip, i) => {
                const isExpanded = expandedTipId === tip.id;
                return (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 1.2 + i * 0.08 }}
                    className="rounded-xl border p-3.5"
                    style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{tip.emoji}</span>
                        <span className="text-sm font-bold text-gray-900">{tip.title}</span>
                      </div>
                      <motion.button
                        onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                        className="flex items-center gap-1 text-xs font-semibold min-h-[44px] min-w-[44px] px-1 cursor-pointer"
                        style={{ color: '#0d9488' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            Fechar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            Ler mais
                          </>
                        )}
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-sm text-gray-600 mt-2.5 overflow-hidden leading-relaxed"
                        >
                          {tip.content}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="pt-2 pb-1 text-center">
            <p className="text-xs text-gray-400">
              Dados atualizados em tempo real pela comunidade
            </p>
          </div>
        </div>
      </motion.div>
    </LayoutGroup>
  );
}
