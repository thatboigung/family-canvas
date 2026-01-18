import { Leaf, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary rounded-md">
                      <div className="text-white rounded-lg group-hover:bg-primary/90 transition-colors">
  <img
    src="./favi-icon.png"
    alt=""
    className="w-8 h-8 rounded-full" // adjust size and radius
  />
</div>
              </div>
              <span className="font-bold text-xl tracking-tight">Green Petals Engineering</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Exceptional engineering solutions for homes and industries. Powering your future, securing your present.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white">Services</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#services" className="hover:text-white transition-colors">Solar System Installations</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Repair & Maintenance</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Electrical Installations</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Security Installations</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Welding</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Projects</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <span>414 Acacia road, Manresa Park<br/>Harare, Zimbabwe</span>
              </li>
              <li className="space-y-1">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-medium">Phone</span>
                </div>
                <div className="pl-7 text-sm space-y-1 text-white/70">
                  <div><a href="tel:+263784932948" className="hover:underline">+263 78 493 2948</a></div>
                  <div><a href="tel:+263242437342" className="hover:underline">+263 242 437342</a></div>
                  <div><a href="tel:+263787535759" className="hover:underline">+263 787 535759</a></div>
                  <div><a href="tel:+263719335497" className="hover:underline">+263 719 335497</a></div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>jshayamunda@yahoo.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Green Petals Engineering. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
