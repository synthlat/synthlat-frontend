import { redirect } from 'next/navigation';
import { ArrowRight, Book, MessageCircle, Shield, Zap, Star, Users } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { getNews } from '@/lib/news';

export default async function Dashboard() {
  const user = await getUser();
  
  if (!user) {
    redirect('/api/v1/oauth/discord');
  }

  const news = await getNews();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 to-black border border-white/10 p-8 md:p-12 mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hola, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user.globalName || user.username}</span> 👋
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed">
            Bienvenido al panel de control de Synthlat. Estás a un paso de potenciar tu comunidad con las mejores herramientas de moderación y entretenimiento.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="/dashboard/servers" 
              className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              Gestionar mis Servidores
              <ArrowRight size={18} />
            </a>
            <a 
              href="https://discord.com/invite/synthlat" 
              target="_blank"
              className="px-6 py-3 bg-white/10 border border-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Unirse al Soporte
            </a>
          </div>
        </div>
      </div>

      {/* Quick Steps / Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <ResourceCard 
          icon={<Book className="text-blue-400" size={24} />}
          title="Documentación"
          description="Aprende a configurar cada módulo y comando de Synthlat paso a paso."
          link="#"
          linkText="Leer Guías"
        />
        <ResourceCard 
          icon={<Users className="text-yellow-400" size={24} />}
          title="Comunidad"
          description="Únete a nuestro servidor de Discord para obtener ayuda, sugerir ideas y charlar."
          link="https://discord.com/invite/synthlat"
          linkText="Unirse Ahora"
        />
        <ResourceCard 
          icon={<Shield className="text-green-400" size={24} />}
          title="Seguridad"
          description="Revisa las mejores prácticas para mantener tu servidor seguro de raids."
          link="#"
          linkText="Ver Consejos"
        />
      </div>

      {/* What's New Section */}
      <div className="border-t border-white/10 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-purple-500" />
            Novedades
          </h2>
          <span className="text-sm text-gray-500">Últimas actualizaciones</span>
        </div>
        
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.slice(0, 4).map((item) => (
              <UpdateCard 
                key={item.id}
                tag={item.tag}
                tagColor={item.tagColor}
                title={item.title}
                date={new Date(item.createdAt).toLocaleDateString()}
                description={item.description}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay novedades recientes.
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ icon, title, description, link, linkText }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-colors group">
      <div className="mb-4 p-3 bg-black/40 w-fit rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4 min-h-[40px]">{description}</p>
      <a href={link} className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 group-hover:gap-2 transition-all">
        {linkText} <ArrowRight size={14} />
      </a>
    </div>
  );
}

function UpdateCard({ tag, tagColor, title, date, description }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          <Zap size={20} className="text-gray-400" />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${tagColor}`}>
            {tag}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <h3 className="font-bold text-gray-200 mb-1">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
