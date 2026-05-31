import Image from "next/image";
import Link from 'next/link';

export default function Footer() {
  return (
    <div className="bg-black text-white selection:bg-purple-500 selection:text-white overflow-x-hidden">
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
