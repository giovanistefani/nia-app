import React from 'react';
import Image from 'next/image';
import { Check, Calendar, Clock, MessageSquare, Bot, ArrowRight, Shield } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nia | O Agente de Agendamento Inteligente via WhatsApp',
  description: 'Automatize seus agendamentos, reduza faltas e economize horas todos os dias. A Nia responde, cruza horários no Google Calendar e agenda 24/7.',
  openGraph: {
    title: 'Nia | Agente de Agendamento Inteligente',
    description: 'Automatize seus agendamentos, reduza faltas e economize horas todos os dias.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://nia.app',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-slate-50 font-sans selection:bg-violet-500/30">
      <Header />
      <HeroCentered />
      <Features />
      <Pricing />
      <FAQ />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="absolute top-0 z-50 w-full px-4 py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            N
          </div>
          Nia App
        </div>
        <a href="/login" className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 backdrop-blur-sm">
          Login
        </a>
      </div>
    </header>
  );
}

function HeroCentered() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-950 px-4 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      
      <div className="relative z-10 max-w-4xl pt-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          A revolução no seu atendimento
        </div>
        
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
          Sua agenda vive uma bagunça?<br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            A Nia resolve.
          </span>
        </h1>
        
        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-400">
          Cada hora gasta no WhatsApp confirmando consultas é uma hora não monetizada. 
          Enquanto seus concorrentes escalam com automação, você lida com planilhas e mensagens acumuladas.
        </p>
        
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a href="https://wa.me/5548988253605" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-lg bg-violet-600 px-8 font-medium text-white transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-950">
            Automatizar minha agenda →
          </a>
          <a href="#features" className="inline-flex h-12 items-center justify-center rounded-lg border border-gray-800 bg-transparent px-8 font-medium text-gray-300 transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-950">
            Ver como funciona
          </a>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          Integração nativa com Google Calendar e Outlook
        </p>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: 'Atendimento e marcação 24/7',
      description: 'A Nia atende seus clientes a qualquer hora do dia ou da noite, entendendo a intenção, verificando a disponibilidade e concluindo o agendamento em segundos, tudo via WhatsApp.',
      badge: 'Disponibilidade Total',
      icon: <Clock className="h-6 w-6 text-violet-400" />
    },
    {
      title: 'Sincronização em Tempo Real',
      description: 'Chega de conflitos de horário. A Nia cruza os dados do seu Google Calendar ou Outlook instantaneamente antes de oferecer opções ao cliente, garantindo organização impecável.',
      badge: 'Zero Conflitos',
      icon: <Calendar className="h-6 w-6 text-violet-400" />
    },
    {
      title: 'Extração Inteligente (IA)',
      description: 'Não é um bot de opções rígidas. Nossa IA entende linguagem natural. Se o cliente disser "quero cortar o cabelo amanhã de manhã", a Nia extrai o serviço e a preferência de horário.',
      badge: 'Gemini AI',
      icon: <Bot className="h-6 w-6 text-violet-400" />
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-950 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Sua clínica, empresa ou consultório <br /> funcionando no piloto automático
          </h2>
        </div>

        <div className="flex flex-col gap-20">
          {features.map((feature, i) => (
            <div key={i} className={`flex flex-col gap-10 lg:items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-400">
                  {feature.icon}
                  {feature.badge}
                </div>
                <h3 className="text-3xl font-bold text-white">{feature.title}</h3>
                <p className="text-lg text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
              <div className="flex-1">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl flex items-center justify-center">
                  {/* Substituir por imagem real do sistema. Ex: src="/features/feat-1.jpg" */}
                  <div className="text-gray-700 font-medium">✨ Demonstração do Produto ✨</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 149',
      description: 'Para profissionais liberais começando a automatizar.',
      features: ['Até 200 agendamentos/mês', '1 Profissional (Google Calendar)', 'Suporte por email', 'WhatsApp da Nia'],
      cta: 'Começar com Starter',
      highlighted: false
    },
    {
      name: 'Pro',
      price: 'R$ 349',
      description: 'A solução ideal para clínicas e salões em crescimento.',
      features: ['Agendamentos ilimitados', 'Até 5 Profissionais', 'Sincronização Google/Outlook', 'Número de WhatsApp Próprio', 'Suporte prioritário'],
      cta: 'Assinar o Pro',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: null,
      description: 'Para redes de clínicas e operações complexas.',
      features: ['Profissionais Ilimitados', 'Integração com ERP/CRM', 'Multi-tenant interno', 'Painel analítico customizado', 'Gerente de conta dedicado'],
      cta: 'Falar com vendas',
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gray-950 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Um plano para cada estágio do seu negócio
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Cancele a qualquer momento. Sem taxas ocultas.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`flex flex-col rounded-3xl p-8 ${
                plan.highlighted
                  ? 'border-2 border-violet-500 bg-violet-950/50 ring-4 ring-violet-500/20'
                  : 'border border-gray-800 bg-gray-900'
              }`}
            >
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
              
              <div className="my-6">
                {plan.price ? (
                  <div className="flex items-baseline text-4xl font-bold text-white">
                    {plan.price}
                    <span className="ml-1 text-base font-normal text-gray-400">/mês</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-white">Sob consulta</div>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="h-5 w-5 shrink-0 text-violet-500" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`h-12 w-full rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: 'A Nia substitui completamente a recepcionista?',
      a: 'A Nia cuida de todo o agendamento rotineiro, liberando sua equipe para focar no relacionamento humano, dúvidas complexas e atendimento presencial, reduzindo a sobrecarga no WhatsApp.'
    },
    {
      q: 'Funciona com qual calendário?',
      a: 'Temos integração nativa em tempo real com Google Calendar e Outlook. Assim que o cliente agenda pelo WhatsApp, o evento aparece na sua agenda.'
    },
    {
      q: 'E se o cliente desistir no meio da conversa?',
      a: 'A inteligência artificial compreende o abandono. O horário só é bloqueado no seu calendário após a confirmação final afirmativa do cliente.'
    },
    {
      q: 'Posso configurar os horários de expediente?',
      a: 'Sim, você define as janelas de disponibilidade, serviços prestados, duração e valor no nosso painel administrativo. A Nia respeitará 100% das suas regras.'
    }
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  return (
    <section className="py-24 bg-gray-950 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          Perguntas Frequentes
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-white">
                {faq.q}
                <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-800 text-violet-400 group-open:rotate-180 transition-transform">
                  ↓
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      quote: "Desde que implantamos a Nia, acabaram os furos na agenda por choque de horário. A economia de tempo da minha equipe de recepção foi brutal.",
      name: "Dra. Camila Ferraz",
      role: "Clínica Odontológica",
      initials: "CF"
    },
    {
      quote: "Meus clientes adoram poder marcar corte de cabelo às 2 da manhã do sábado. Eu acordo e minha agenda da semana já está cheia.",
      name: "Roberto Silva",
      role: "Barbearia",
      initials: "RS"
    },
    {
      quote: "A facilidade de extração da IA é mágica. O paciente fala do jeito dele, e a Nia organiza os horários perfeitamente no Google Calendar.",
      name: "Dr. João Pedro",
      role: "Psicólogo",
      initials: "JP"
    }
  ];

  return (
    <section className="py-24 bg-gray-950 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-white md:text-5xl">
          Empresas que já escalaram seu atendimento
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-3xl border border-gray-800 bg-gray-900 p-8 flex flex-col justify-between">
              <div>
                <div className="mb-6 flex gap-1 text-violet-500">
                  ★★★★★
                </div>
                <p className="text-lg italic text-gray-300">"{t.quote}"</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-900 text-violet-200 font-bold">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-violet-900 to-gray-900 border border-violet-500/20 p-10 text-center shadow-2xl md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Pronto para focar no que realmente importa?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-violet-200">
            Deixe que a Nia cuide dos agendamentos enquanto você cuida do seu negócio. Comece a automatizar sua agenda em menos de 10 minutos.
          </p>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="https://wa.me/5548988253605" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-white px-8 font-semibold text-violet-900 transition-colors hover:bg-gray-100">
              Quero automatizar minha agenda
            </a>
            <button className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-violet-400/30 bg-violet-900/50 px-8 font-medium text-white transition-colors hover:bg-violet-800/50">
              Falar com o suporte
            </button>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-violet-300">
            <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Pagamento Seguro</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Cancele quando quiser</span>
            <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Suporte humanizado</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 px-4 py-12">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            N
          </div>
          Nia App
        </div>
        
        <div className="flex gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          <a href="#" className="hover:text-white transition-colors">Contato</a>
        </div>
        
        <div className="text-sm text-gray-600">
          © {new Date().getFullYear()} Nia App. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
