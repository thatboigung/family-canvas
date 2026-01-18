import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Product } from "@shared/schema";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: [api.products.list.path],
  });

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop"
            alt="Products Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">Products</h1>
          <p className="text-white/80 mt-4 max-w-2xl mx-auto">
            Browse our full product catalog — equipment, inverters, batteries and security systems to suit every project.
          </p>
          <div className="mt-6">
            <Button className="bg-primary text-white">Contact Sales</Button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-3">Browse our full product catalog.</p>
          </div>

          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {["all", "solar_panel", "inverter", "electrical", "security"].map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "bg-primary hover:bg-primary/90" : ""}
              >
                {cat === "all" ? "All Products" : cat === "solar_panel" ? "Solar Panels" : cat === "inverter" ? "Inverters" : cat === "electrical" ? "Electrical" : "Security"}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="bg-gradient-to-br from-muted to-muted/50 h-48 flex items-center justify-center relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : null}
                    <ShoppingCart className="w-12 h-12 text-muted-foreground/50 absolute" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-secondary mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${(product.price / 100).toFixed(2)}</span>
                      <Button size="sm" variant="default">Add to Cart</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
