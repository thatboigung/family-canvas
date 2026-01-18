import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileOpen(false);
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md py-3 border-b border-border/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
         <div className="text-white rounded-lg group-hover:bg-primary/90 transition-colors">
  <img
    src="./favi-icon.png"
    alt=""
    className="w-8 h-8 rounded-full" // adjust size and radius
  />
</div>

          <div className="flex flex-col leading-none">
            <span className={`font-bold text-lg tracking-tight ${isScrolled ? 'text-secondary' : 'text-secondary md:text-white'}`}>
              Green Petals
            </span>
            <span className={`text-xs font-medium tracking-widest uppercase ${isScrolled ? 'text-primary' : 'text-primary md:text-white/80'}`}>
              Engineering (GPE)
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "Services", id: "services" },
            { label: "About", id: "about" },
            { label: "Projects", id: "projects" },
            { label: "Contact", id: "contact" },
          ].map((item) => (
            item.href ? (
              <Link key={item.href} href={item.href} className={`text-sm font-medium transition-colors hover:text-primary ${isScrolled ? "text-secondary" : "text-white/90"}`}>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? "text-secondary" : "text-white/90"
                }`}
              >
                {item.label}
              </button>
            )
          ))}

          <Button 
            onClick={() => scrollToSection("contact")}
            className={isScrolled ? "" : "bg-white text-primary hover:bg-white/90 hover:text-primary"}
          >
            Get a Quote
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-secondary"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X /> : <Menu className={isScrolled ? "" : "text-white"} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-xl p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
          {[
            { label: "Services", id: "services" },
            { label: "About", id: "about" },
            { label: "Projects", id: "projects" },
            { label: "Suppliers", id: "store" },
            { label: "Testimonials", id: "testimonials" },
            { label: "Location", id: "location" },
            { label: "Contact", id: "contact" },
          ].map((item) => (
            item.href ? (
              <Link key={item.href} href={item.href} className="text-left py-2 px-4 rounded-lg hover:bg-muted font-medium text-secondary">
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-left py-2 px-4 rounded-lg hover:bg-muted font-medium text-secondary"
              >
                {item.label}
              </button>
            )
          ))}
          <Button onClick={() => scrollToSection("contact")} className="w-full">
            Get a Quote
          </Button>
        </div>
      )}
    </nav>
  );
}
