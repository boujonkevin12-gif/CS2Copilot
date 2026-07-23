import { Crosshair } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Producto: [
    { label: "Características", href: "#features" },
    { label: "Precios", href: "#pricing" },
    { label: "Overlay", href: "#" },
    { label: "API", href: "#" },
  ],
  Empresa: [
    { label: "Acerca de", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreras", href: "#" },
    { label: "Prensa", href: "#" },
  ],
  Recursos: [
    { label: "Documentación", href: "#" },
    { label: "Comunidad", href: "#" },
    { label: "Soporte", href: "#" },
    { label: "Estado", href: "#" },
  ],
  Legal: [
    { label: "Privacidad", href: "#" },
    { label: "Términos", href: "#" },
    { label: "Política de Cookies", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo-icon.png" alt="CS2Pilot" className="h-9 w-9 rounded-xl" />
              <span className="text-lg font-bold tracking-tight">
                CS2<span className="text-primary">Pilot</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              La plataforma de análisis definitiva para Counter-Strike 2. Sube
              de nivel con información impulsada por IA.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CS2Pilot. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Discord
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
