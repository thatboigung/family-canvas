import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { TreePine, Users, Heart, ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full min-h-screen bg-[#09090b] relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass border border-white/10 mb-4">
            <TreePine className="w-12 h-12 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-display font-bold text-white tracking-tighter">
              GAV3NA <span className="text-primary font-light">Heritage</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-light max-w-2xl mx-auto">
              Preserve your family legacy and build your ancestral tree from present to past
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="glass border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Family Connections</h3>
              <p className="text-sm text-white/60">
                Build relationships between family members with intuitive visual connections
              </p>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Heritage Tracking</h3>
              <p className="text-sm text-white/60">
                Track surname inheritance and family lineages through generations
              </p>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Beautiful Visualization</h3>
              <p className="text-sm text-white/60">
                Interactive tree layout with color-coded relationships and smooth animations
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button
              onClick={() => setLocation("/tree")}
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
            >
              Start Building Your Tree
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-white/40">
              No account needed • Free to use • Start in seconds
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-white/30 text-sm font-mono tracking-widest uppercase">
              Family Tree Visualization V1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
