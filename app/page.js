import Image from "next/image";
import { Bot, Zap, Shield, Music, BarChart3, ArrowRight, Sparkles, Ticket, Coins, Mic, UserPlus, AlertTriangle } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-all duration-300">
              <Image
                src="/images/logo.png"
                alt="Synthlat Logo"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent group-hover:to-purple-400 transition-all duration-300">
              Synthlat
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            {['Características', 'Comandos'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="relative hover:text-purple-400 transition-colors group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
              <a href="/discord" className="relative hover:text-purple-400 transition-colors group">
                Soporte
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
          </div>
          <a href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:-translate-y-0.5 active:translate-y-0">
            Panel de Control
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow delay-500" />
        
        {/* Floating Elements */}
        <div className="absolute top-40 left-[10%] w-16 h-16 bg-purple-500/10 rounded-2xl rotate-12 animate-float blur-sm pointer-events-none" />
        <div className="absolute bottom-40 right-[10%] w-24 h-24 bg-pink-500/10 rounded-full animate-float delay-300 blur-sm pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up delay-100">
            Potencia tu servidor con <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Synthlat
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Synthlat es el bot todo en uno definitivo. Desde moderación con IA hasta economía avanzada, 
            tickets de soporte y canales de voz temporales. Todo en una interfaz moderna.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <a 
              href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Invitar Bot
            </a>
            <a 
              href="/dashboard"
              className="group w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-2"
            >
              Ver Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-black/50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Sparkles className="text-purple-500 w-6 h-6" />
              Todo lo que necesitas
              <Sparkles className="text-purple-500 w-6 h-6" />
            </h2>
            <p className="text-gray-400">Herramientas poderosas diseñadas para comunidades modernas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<AlertTriangle className="w-8 h-8 text-orange-400" />}
              title="Reportes con IA"
              description="Detecta toxicidad automáticamente analizando el contexto de los mensajes con inteligencia artificial avanzada."
              delay="delay-100"
            />
            <FeatureCard 
              icon={<Ticket className="w-8 h-8 text-blue-400" />}
              title="Sistema de Tickets"
              description="Crea paneles de soporte con categorías personalizadas, roles específicos y transcripciones."
              delay="delay-200"
            />
            <FeatureCard 
              icon={<Coins className="w-8 h-8 text-yellow-400" />}
              title="Economía Global"
              description="Sistema monetario completo con tienda de items, subastas, trabajos y recompensas por actividad."
              delay="delay-300"
            />
            <FeatureCard 
              icon={<Mic className="w-8 h-8 text-cyan-400" />}
              title="Canales Temporales"
              description="Permite a tus usuarios crear sus propios canales de voz dinámicos (Join to Create)."
              delay="delay-400"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
              title="Niveles y XP"
              description="Engancha a tu comunidad con un sistema de progresión visual, roles por nivel y notificaciones."
              delay="delay-500"
            />
            <FeatureCard 
              icon={<UserPlus className="w-8 h-8 text-indigo-400" />}
              title="Invite Tracker"
              description="Rastrea quién invita a nuevos miembros, gestiona códigos y detecta invitaciones falsas."
              delay="delay-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-pink-900/10 animate-pulse-slow" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat number="500+" label="Servidores" delay="delay-100" />
            <Stat number="1M+" label="Usuarios" delay="delay-200" />
            <Stat number="99.9%" label="Uptime" delay="delay-300" />
            <Stat number="24/7" label="Soporte" delay="delay-400" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in-up">¿Listo para mejorar tu servidor?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-100">
            Únete a miles de comunidades que ya confían en Synthlat para gestionar y entretener a sus miembros.
          </p>
          <a 
            href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300 animate-fade-in-up delay-200 overflow-hidden"
          >
            <span className="relative z-10">Añadir Synthlat Ahora</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden group-hover:rotate-12 transition-transform duration-300">
                <Image
                  src="/images/logo.png"
                  alt="Synthlat Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:to-white transition-all">Synthlat</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Synthlat. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-gray-400">
              <Link href="/terms" className="hover:text-purple-400 transition-colors hover:underline decoration-purple-500/50 underline-offset-4">Términos</Link>
              <Link href="/privacy" className="hover:text-purple-400 transition-colors hover:underline decoration-purple-500/50 underline-offset-4">Privacidad</Link>
              <a href="/discord" className="hover:text-purple-400 transition-colors hover:underline decoration-purple-500/50 underline-offset-4">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <div className={`p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.07] transition-all duration-300 group animate-fade-in-up ${delay} hover:-translate-y-1`}>
      <div className="mb-4 p-3 rounded-xl bg-black/50 w-fit group-hover:scale-110 group-hover:bg-purple-500/10 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{description}</p>
    </div>
  );
}

function Stat({ number, label, delay }) {
  return (
    <div className={`animate-fade-in-up ${delay} hover:scale-105 transition-transform duration-300`}>
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-purple-400 font-medium">{label}</div>
    </div>
  );
}
