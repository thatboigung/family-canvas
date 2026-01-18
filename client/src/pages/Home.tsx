import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Sun, 
  Zap, 
  Shield, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Phone,
  Mail,
  MapPin,
  Star,
  ShoppingCart,
  Instagram,
  Facebook,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { insertInquirySchema, type InsertInquiry, type Product, type Testimonial } from "@shared/schema";
import { useSubmitInquiry } from "@/hooks/use-contact";
import { api } from "@shared/routes";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

function Home() {
  const mutation = useSubmitInquiry();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: [api.products.list.path],
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: [api.testimonials.list.path],
  });

  // Map testimonials to provided names and link to project images
  type TestimonialWithProject = Testimonial & { project?: string };
  const testimonialNames = ["Mr Banda", "Dr L Shayamunda", "Mama Mai Ccuh", "Mr Mafini", "Dalph", "Dr L Shayamunda", "Mr Mazhindu", "Mr Mazhindu"];
  const testimonialProjects = ["Prjct1.jpeg", "Prjct2.jpeg", "Prjct4.jpeg", "Prjct5.jpeg", "Prjct7.jpeg", "Prjct9.jpeg", "Prjct12.jpeg", "Prjct11.jpeg"];
  const testimonialContents = [
    "Top-notch service! The team was professional and the electric fence is solid. Highly recommend! 👍",
    "Quality work, on time and budget! My sliding gate looks sleek, gabions are sturdy. Thanks Green Petals Engineering! 😊",
    "These solar lights are a game-changer! Bright and reliable, even on cloudy days. Thanx so much! 🌞",
    "Expertise and professionalism! Our solar system is efficient, reduced our bills. Well done Green Petals Engineering! 💡",
    "Quick response, fixed my gate motor in no time. Handy guys, will call again! 👍",
    "Convenient and secure! The audio intercom is top-notch, thanks for the install. 😊",
    "Peace of mind with these cameras. Clear footage, great service! 👍",
    "Water is life! Thanks Green Petals Engineering, our borehole is pumping strong with solar power. 💧"
  ];

  const enhancedTestimonials = (testimonials && testimonials.length
    ? (testimonials as TestimonialWithProject[]).slice(0, 8).map((t, i) => ({
        ...t,
        author: testimonialNames[i] ?? t.author,
        content: testimonialContents[i] ?? t.content,
        project: testimonialProjects[i],
      }))
    : testimonialNames.map((name, i) => ({
        id: i + 100,
        createdAt: null,
        author: name,
        position: null,
        content: testimonialContents[i] ?? "Excellent workmanship and timely delivery.",
        rating: 5,
        project: testimonialProjects[i],
      }))) as TestimonialWithProject[];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const suppliers = [
    { name: "Sako", logo: "/logos/sako.webp" },
    { name: "Must", logo: "/logos/must.jpg" },
    { name: "Hz", logo: "/logos/hzsolar.svg" },
    { name: "Srne", logo: "/logos/srne.webp" },
    { name: "Deye", logo: "/logos/deye.jpg" },
    { name: "Sumry", logo: "/logos/sumry.webp" },
    { name: "Sunsynk", logo: "/logos/sunsynk.avif" },
    { name: "JA", logo: "/logos/ja-solar.png" },
    { name: "Jinko", logo: "/logos/jinko.png" },
    { name: "Canadian", logo: "/logos/canadian-solar.png" },
    { name: "Sunpro", logo: "/logos/sunpro.jpg" },
    { name: "Victron", logo: "/logos/victron.png" },
    { name: "Solis", logo: "/logos/solis.webp" },
    { name: "Goodwe", logo: "/logos/goodwe.svg" },
  ];

  // Provide a guaranteed fallback as an inline SVG data URL so logos always render even if external sources fail
  const logoFallback = (name: string) => {
    const bg = "#f8fafc"; // light neutral background
    const color = "#111827"; // dark text
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='160'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='28' fill='${color}'>${name}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // Core values list (used for the horizontal auto-scrolling row)
  const coreValues = [
    { key: 'Innovation', text: 'Embracing cutting-edge tech for smarter, future-proof solutions.' },
    { key: 'Integrity', text: 'Transparency and trust in all we do, every time.' },
    { key: 'Customer Focus', text: 'Tailoring solutions to your unique needs, driving satisfaction.' },
    { key: 'Sustainability', text: 'Eco-friendly practices at our core, reducing environmental impact.' },
    { key: 'Empowerment', text: 'Enabling clients through knowledge, training, and tech access.' },
    { key: 'Safety', text: 'Prioritizing people and property in all solutions, always.' },
    { key: 'Efficiency', text: 'Optimizing resources for maximum impact, minimizing waste.' },
    { key: 'Effectiveness', text: 'Delivering results that drive growth, performance, and success.' },
  ];

  const valuesRef = useRef<HTMLDivElement | null>(null);
  const [valuesPaused, setValuesPaused] = useState(false);

  useEffect(() => {
    const el = valuesRef.current;
    if (!el) return;

    // Configurable timing for scroll speed
    const SCROLL_INTERVAL = 3200; // ms between step starts
    const ANIMATION_DURATION = 900; // ms duration of each smooth scroll

    let interval: ReturnType<typeof setInterval> | null = null;

    const getStep = () => (window.matchMedia('(min-width: 1024px)').matches ? 3 : 1);

    // Smooth scroll helper using requestAnimationFrame to allow configurable duration
    const smoothScrollBy = (element: HTMLElement, distance: number, duration: number) => {
      const start = element.scrollLeft;
      const end = start + distance;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // easeInOutQuad-ish easing
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        element.scrollLeft = start + (end - start) * eased;
        if (t < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    };

    const scrollStep = () => {
      if (valuesPaused) return;
      const children = el.querySelectorAll('.value-item');
      if (!children.length) return;
      const step = getStep();
      const itemWidth = (children[0] as HTMLElement).offsetWidth + 16; // include gap approximation
      const scrollAmount = itemWidth * step;

      // don't attempt to scroll when there's no overflow
      if (el.scrollWidth <= el.clientWidth) return;

      // If we've scrolled past half (duplicate boundary), bring position back by half-width to continue seamlessly
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft -= el.scrollWidth / 2;
      }

      // perform smooth step
      smoothScrollBy(el, scrollAmount, ANIMATION_DURATION);
    };

    interval = setInterval(scrollStep, SCROLL_INTERVAL);

    const onEnter = () => setValuesPaused(true);
    const onLeave = () => setValuesPaused(false);
    const onTouchStart = () => setValuesPaused(true);
    const onTouchEnd = () => setValuesPaused(false);
    const onFocusIn = () => setValuesPaused(true);
    const onFocusOut = () => setValuesPaused(false);

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: true } as AddEventListenerOptions);
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);

    return () => {
      if (interval) clearInterval(interval);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, [valuesPaused]);

  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  function onSubmit(data: InsertInquiry) {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  // Scroll to a specific service card and apply a temporary highlight
  function scrollToService(id: string) {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // add highlight class
    el.classList.add('service-highlight');
    // remove after animation
    window.setTimeout(() => el.classList.remove('service-highlight'), 1800);
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Unsplash: Solar panels / Engineering */}
          <img 
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop"
            alt="Solar Panels and Engineering"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent opacity-90" />
        </div>


        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary-foreground text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Leading Engineering Solutions
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-display">
                Powering Your Future,<br />
                <span className="text-primary-foreground">Securing Your Present</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
                Green Petals Engineering delivers exceptional solar installations, electrical maintenance, and advanced security systems for homes and industries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white font-semibold h-14 px-8 rounded-full text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Free Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-14 px-8 rounded-full text-base backdrop-blur-sm transition-all"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Services
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
     {/* ABOUT SECTION - CLEAN & SPACIOUS WITH FLEX LAYOUT */}
<section id="about" className="py-12 md:py-20 bg-white">
  <div className="container mx-auto px-4">
    
    {/* Section Header */}
    <div className="text-center mb-12 md:mb-16">
      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-medium rounded-full text-sm mb-4">
        About Us
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        Engineering Excellence for <span className="text-primary">Every Project</span>
      </h2>
      <p className="text-gray-600 max-w-2xl mx-auto">
        We combine technical expertise with practical solutions to deliver reliable engineering services across Zimbabwe.
      </p>
    </div>

     {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-12 md:mb-16">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-primary">100+</div>
            <div className="text-xs text-gray-600">Projects</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-primary">100%</div>
            <div className="text-xs text-gray-600">Satisfaction</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-primary">24/7</div>
            <div className="text-xs text-gray-600">Support</div>
          </div>
        </div>

    {/* Main Flex Content */}
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
      
      {/* Image Column */}
      <div className="w-full lg:w-1/2">
       <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Unsplash: Engineer working */}
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop" 
                  alt="Engineer working on solar panels"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-white p-8 rounded-2xl shadow-xl hidden md:block max-w-xs">
                <p className="font-bold text-3xl mb-1">5+</p>
                <p className="text-sm opacity-90">Years of delivering excellence in engineering and maintenance.</p>
              </div>
            </motion.div>

       
      </div>

      {/* Text Content Column */}
      <div className="w-full lg:w-1/2 space-y-8">
        
        {/* Company Description */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Who We Are</h3>
          <p className="text-gray-600 leading-relaxed">
          At Green Petals Engineering, we specialize in delivering integrated solutions in electrical engineering, computer engineering, automation, and energy systems. Our expertise spans design, implementation, and optimization of cutting-edge technologies tailored to meet the unique requirements of residential, commercial, and industrial clients. By leveraging our technical prowess in electrical installations, automation systems, and renewable energy integration, we drive operational efficiency, sustainability, and innovation for our clients.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our team focuses on quality workmanship, reliable service, and building lasting relationships with our clients.
          </p>
        </div>

        {/* Mission, Vision & Core Values */}
        <div className="space-y-6">
          <div className="p-5 bg-blue-50 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Our Mission</h4>
                <p className="text-sm text-gray-600">
                  To deliver exceptional engineering solutions, exceeding client expectations through technical expertise, professionalism, and a commitment to sustainable practices.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-green-50 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Our Vision</h4>
                <p className="text-sm text-gray-600">
                  To pioneer technological advancement in energy, security, and automation, shaping a smarter, sustainable future for Zimbabwe and beyond.
                </p>
              </div>
            </div>
          </div>

          
        </div>

      </div>

    </div>

 {/* Core Values — horizontal marquee */}
          <div className="bg-white rounded-2xl p-6 shadow-md ">
            <h3 className="text-lg font-semibold mb-4 text-center">Core Values</h3>

            <div className="overflow-hidden">
            <div ref={valuesRef} className="values-track flex items-center gap-4 overflow-x-auto no-scrollbar">
              {[...coreValues, ...coreValues].map((v, i) => (
                <div key={`${v.key}-${i}`} className="value-item min-w-[220px] bg-gray-50 rounded-lg p-4 shadow-sm inline-flex items-start gap-3" tabIndex={0}>
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{v.key}</p>
                    <p className="text-sm text-gray-600">{v.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .values-track { display: flex; gap: 16px; align-items: stretch; overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .values-track.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .values-track.no-scrollbar::-webkit-scrollbar { display: none; }

            .value-item { flex: 0 0 100%; }

            @media(min-width: 640px) {
              .value-item { flex: 0 0 48%; }
            }

            @media(min-width: 1024px) {
              /* show 3 items visible in the viewport */
              .value-item { flex: 0 0 calc((100% - 32px)/3); }
            }

            /* ensure we only attempt to scroll when overflow exists */
            @media (max-width: 768px) {
              .values-track { overflow-x: auto; }
            }
          `}</style>
          </div>
  </div>

 
</section>

      {/* SERVICES SECTION */}
     {/* SERVICES SECTION - MODERN WITH ANIMATIONS & CENTERED */}
<section id="services" className="py-16 md:py-24 bg-white">
  <div className="container mx-auto px-4">
    
    {/* Section Header with Animation */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-3xl mx-auto mb-12 md:mb-20"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-medium rounded-full text-sm mb-4"
      >
        Our Services
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
      >
        Comprehensive Engineering Solutions
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-gray-600"
      >
        From automation to energy systems, we provide complete engineering services with precision and expertise.
      </motion.p>
    </motion.div>

    {/* Services Grid - Centered with responsive columns */}
    <div className="flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        
        {/* Automation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          id="service-automation"
          className="service-card bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-blue-50 p-3 rounded-lg"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900">Automation</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Complete automation solutions from smart home to industrial process control.
          </p>
          <ul className="space-y-2">
            {["Smart Home Automation: Lighting, HVAC & Appliance Control", "Industrial Process Automation: PLC & SCADA Systems", "Building Management Systems (BMS)", "IoT Solutions: Device Integration", "Access Control Systems: Biometric & Card-Based", "Time & Attendance Systems", "Automated Irrigation Systems"].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Security Systems */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          id="service-security"
          className="service-card bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-red-50 p-3 rounded-lg"
            >
              <Shield className="w-6 h-6 text-red-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900">Security Systems</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Comprehensive security solutions to protect your property with advanced technology.
          </p>
          <ul className="space-y-2">
            {["Electric Fencing: Secure Perimeter Protection", "Access Control: Biometric & Smart Locks", "CCTV Surveillance: IP-Based Systems", "Alarm Systems: Intrusion Detection", "Smart Security: Mobile App Control", "Security Consulting & Risk Assessment", "Perimeter Security: Beam Sensors & Motion Detectors", "Video Analytics: AI-Powered Alerts"].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Energy Solutions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          id="service-energy"
          className="service-card bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-yellow-50 p-3 rounded-lg"
            >
              <Sun className="w-6 h-6 text-yellow-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900">Renewable Energy Solutions</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Complete renewable energy solutions for sustainable power generation.
          </p>
          <ul className="space-y-2">
            {["Solar PV System Design & Installation", "Energy Storage & Battery Systems", "Green Energy Audits", "Microgrids: Localized Energy Systems", "Solar System Maintenance", "System Optimization"].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Electrical Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          id="service-electrical"
          className="service-card bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-purple-50 p-3 rounded-lg"
            >
              <Zap className="w-6 h-6 text-purple-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900">Electrical Services</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Professional electrical solutions for all applications with safety and efficiency.
          </p>
          <ul className="space-y-2">
            {["Electrical Installations: Wiring & Cabling", "Lighting Design & Installation", "Electrical Maintenance & Repairs", "Power Distribution & Switchgear", "Earthing & Lightning Protection", "Generator Installation & Maintenance", "Electrical Troubleshooting & Diagnostics", "Industrial System Upgrades"].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Industrial Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          id="service-industrial"
          className="service-card bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gray-100 p-3 rounded-lg"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900">Industrial Services</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Specialized industrial engineering and automation services for efficient operations.
          </p>
          <ul className="space-y-2">
            {["Machinery Installation & Commissioning", "Industrial Automation & Control Systems", "Predictive Maintenance Programs", "Industrial Electrical Repairs", "Panel Building & Installation", "Industrial IT & Cybersecurity", "Energy Efficiency Audits", "Safety Audits & Compliance Services"].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

           <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        id="service-consultancy"
        className="service-card bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 w-full max-w-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-teal-50 p-3 rounded-lg"
          >
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900">Consultancy</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Expert consulting in electrical, electronic, and computer engineering solutions.
        </p>
        <ul className="space-y-2">
          {["System Design & Integration", "Technical Feasibility Studies", "Energy Efficiency Audits", "Network Design & Implementation", "Cybersecurity Solutions", "Automation System Design", "Product Development & Design", "Testing & Certification", "Cloud Solutions for Industrial Data", "IoT Integration for Smart Solutions", "IT Infrastructure Planning"].map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{item}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      </div>
    </div>

    {/* Consultancy Card - Centered on its own row */}
    <div className="flex justify-center mt-6">
   
    </div>

    {/* Service Highlights Row with Animation - Reduced Padding */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-12 bg-gray-50 rounded-xl p-4 md:p-6"
    >
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { 
            title: "Expert Team", 
            desc: "Certified engineers with specialized training",
            icon: (
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.198a6 6 0 00-9-5.197" />
              </svg>
            )
          },
          { 
            title: "Quality Work", 
            desc: "Premium materials and professional installation",
            icon: (
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )
          },
          { 
            title: "After-Sales Support", 
            desc: "Comprehensive warranty and maintenance",
            icon: (
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          }
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="flex items-center gap-3 p-3"
          >
            <div className="bg-primary/10 p-2 rounded-lg">
              {item.icon}
            </div>
            <div className="text-left">
              <div className="font-bold text-primary">{item.title}</div>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* CTA with Animation */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="text-center mt-8"
    >
      <p className="text-gray-600 mb-4">
        Need a custom solution or have specific requirements?
      </p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Button 
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-primary hover:bg-primary/90 px-6 py-4"
        >
          Get a Free Consultation
        </Button>
      </motion.div>
    </motion.div>

  </div>
</section>

      {/* PROJECTS SECTION */}
      {/* PROJECTS SECTION - CENTERED WITH ANIMATIONS */}
<section id="projects" className="py-16 md:py-24 bg-white">
  <div className="container mx-auto px-4">
    
    {/* Section Header with Animation */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-medium rounded-full text-sm mb-4"
      >
        Our Projects
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
      >
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-gray-600"
      >
        Showcasing our expertise in delivering robust, reliable, and innovative solutions for Zimbabwe's infrastructure needs, from harnessing renewable energy to securing properties and maintaining critical systems.
      </motion.p>
    </motion.div>

    {/* Projects Grid - Centered */}
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mx-auto place-items-center">
        {[
          { images: ["Prjct1.jpeg"], caption: "Mandara - Electric Fence Installation", category: "Security Systems" },
          { images: ["Prjct2.jpeg", "Prjct3.jpeg"], caption: "Manresa Park - Sliding Gates, Gabions & Horizontal Fencing Fabrication", category: "Welding" },
          { images: ["Prjct4.jpeg"], caption: "Dema - Solar Powered Floodlights", category: "Solar Lights" },
          { images: ["Prjct5.jpeg", "Prjct6.jpeg"], caption: "Sally Mugabe Heights - Solar System Design and Installation", category: "Solar Powered Systems" },
          { images: ["Prjct7.jpeg", "Prjct8.jpeg"], caption: "Manresa Park - Gate Motor Repair", category: "Repairs and Maintenance" },
          { images: ["Prjct9.jpeg", "Prjct10.jpeg"], caption: "Manresa Park - Audio Intercom Installation", category: "Access Control System" },
          { images: ["Prjct12.jpeg"], caption: "Manresa Park - IP Based Camera Installation", category: "CCTV Surveillance System" },
          { images: ["Prjct11.jpeg"], caption: "Gutu - Solar Powered Borehole Installation", category: "Reliable Water Systems" },
        ].map((p, i) => (
          <motion.div
            key={p.images[0]}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * (i % 3) }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="flex items-center justify-center w-full"
          >
            <div
              className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group w-full max-w-md"
              onClick={() => { 
                setLightboxImages(p.images.map(img => `/projects/${img}`));
                setCurrentImageIndex(0);
                setActiveImage(`/projects/${p.images[0]}`);
                setLightboxOpen(true);
              }}
            >
              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + (i % 3) * 0.1 }}
                className="absolute top-4 left-4 z-10"
              >
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                  {p.category}
                </span>
              </motion.div>
              
              {/* Image */}
              <div className="overflow-hidden">
                <motion.img
                  src={`/projects/${p.images[0]}`}
                  alt={p.caption}
                  className="w-full h-44 md:h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  role="button"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {/* Overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white font-semibold text-sm">{p.caption}</p>
              </motion.div>
              
              {/* View Button */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white font-medium text-sm">View Project</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Social Media & CTA */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="text-center mt-12 space-y-6"
    >
      <p className="text-gray-600">
        And many more projects — view our work on social media:
      </p>

      {/* Social Icons */}
      <motion.div 
        className="flex items-center justify-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {[
          { 
            href: "https://www.instagram.com/green_petals_engineering?igsh=MzRpamQ5a242N2Ns", 
            label: "Instagram",
            icon: <Instagram className="w-5 h-5" />,
            color: "text-pink-500"
          },
          { 
            href: "https://www.facebook.com/share/1GfdkWzPAq/", 
            label: "Facebook",
            icon: <Facebook className="w-5 h-5" />,
            color: "text-blue-500"
          },
          { 
            href: "https://www.tiktok.com/@green.petals.engi?_t=ZM-8wNAdYON6JC&_r=1", 
            label: "TikTok",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M16.5 3h2.2V8.1c-.5.2-1 .3-1.5.3-.7 0-1.4-.2-1.9-.5v5.8c0 2.3-1.9 4.2-4.2 4.2-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2c.2 0 .5 0 .7.1V7.7c-.3-.1-.7-.2-1.1-.2-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8 3.8-1.7 3.8-3.8V4.5h-1.2V3z" />
              </svg>
            ),
            color: "text-black"
          }
        ].map((social, index) => (
          <motion.a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            className={`inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300 ${social.color}`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            {social.icon}
          </motion.a>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="pt-4"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            Request a Quote
          </Button>
        </motion.div>
      </motion.div>

      {/* Additional Projects Info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="pt-6"
      >
        <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>All projects include warranty and after-sales support</span>
        </div>
      </motion.div>
    </motion.div>

  </div>
</section>

      {/* STORE SECTION - FIXED */}
      <section id="store" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-bold uppercase tracking-widest text-sm">Main Suppliers</span>
            <h2 className="text-4xl font-bold mt-3 mb-4">Trusted Brands We Supply</h2>
            <p className="text-muted-foreground text-lg">
              Green Petals Engineering supplies high-quality solar panels, inverters, batteries and system accessories from leading manufacturers — backed by professional installation and after-sales support.
            </p>
          </div>

        

          {/* Marquee Animation - Optional but fixed */}
          <div className="mt-12">
            <p className="text-center text-muted-foreground mb-6">Featured Partners</p>
            <div className="relative overflow-hidden py-6">
              <style>{`
                @keyframes scroll {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                .animate-scroll {
                  animation: scroll 30s linear infinite;
                }
                .animate-scroll:hover {
                  animation-play-state: paused;
                }

                /* Temporary highlight for selected services */
                .service-highlight { box-shadow: 0 12px 40px rgba(59,130,246,0.12), inset 0 0 0 4px rgba(59,130,246,0.06); transform: translateY(-6px); transition: transform .25s ease, box-shadow .25s ease; }
              `}</style>
              
              <div className="flex animate-scroll space-x-8">
                {[...suppliers, ...suppliers].map((s, idx) => (
                  <a
                    key={`${s.name}-${idx}`}
                    href={`https://www.google.com/search?q=${encodeURIComponent(s.name)}+solar+inverter`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex-shrink-0 w-40 h-28"
                    aria-label={`${s.name} products`}
                  >
                    <img
                      src={s.logo}
                      alt={`${s.name} logo`}
                      className="h-12 w-auto object-contain"
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement; 
                        target.src = logoFallback(s.name); 
                        target.onerror = null; 
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              Looking for specific brands or equipment? Contact us for product catalogs and pricing.
            </p>
            <Button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary hover:bg-primary/90"
            >
              Request Product Info
              <ShoppingCart className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-primary font-bold uppercase tracking-widest text-sm">Client Reviews</span>
            <h2 className="text-4xl font-bold mt-3 mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground text-lg">
              Real experiences from our satisfied customers across homes and industries.
            </p>
          </div>

          <Carousel>
            <CarouselContent className="items-stretch">
              {enhancedTestimonials.map((testimonial) => {
                const initials = testimonial.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/2">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                      <Card className="p-8 h-full flex flex-col">
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-muted-foreground mb-6 flex-grow text-lg leading-relaxed">"{testimonial.content}"</p>
                        <div className="border-t pt-4 flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-secondary">{testimonial.author}</p>
                            {testimonial.position && <p className="text-sm text-muted-foreground">{testimonial.position}</p>}
                            {testimonial.project && (
                              <p className="mt-1 text-sm">
                                <button
                                  className="text-primary underline"
                                  onClick={() => {
                                    setActiveImage(`/projects/${testimonial.project}`);
                                    setLightboxOpen(true);
                                  }}
                                >
                                  View project
                                </button>
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Arrows moved below the carousel and centered */}
            <div className="flex items-center justify-center gap-4 mt-20">
              <CarouselPrevious className="static h-10 w-10" />
              <CarouselNext className="static h-10 w-10" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* LOCATION SECTION */}
      <section id="location" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold uppercase tracking-widest text-sm">Find Us</span>
            <h2 className="text-4xl font-bold mt-3 mb-4">Our Location</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-xl h-96"
            >
           <iframe
  width="100%"
  height="100%"
  frameBorder="0"
  src="https://www.google.com/maps?q=414+Acacia+Road,+Manresa+Park,+Harare,+Zimbabwe&output=embed"
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>

            </motion.div>

            {/* Location Info */}
            <div className="flex flex-col justify-center space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-secondary mb-4">Green Petals Engineering</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Located in the heart of the tech district, we serve customers throughout the region with cutting-edge engineering solutions.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">Address</h4>
                    <p className="text-muted-foreground">414 Acacia road, Manresa Park, Harare, Zimbabwe</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-3">Phone</h4>
                    <div className="space-y-2">
                      <div><a href="tel:+263784932948" className="text-muted-foreground hover:underline">+263 78 493 2948</a></div>
                      <div><a href="tel:+263242437342" className="text-muted-foreground hover:underline">+263 242 437342</a></div>
                      <div><a href="tel:+263787535759" className="text-muted-foreground hover:underline">+263 787 535759</a></div>
                      <div><a href="tel:+263719335497" className="text-muted-foreground hover:underline">+263 719 335497</a></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">Email</h4>
                    <p className="text-muted-foreground">jshayamunda@yahoo.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Instagram className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">Instagram</h4>
                    <p className="text-muted-foreground"><a href="https://www.instagram.com/green_petals_engineering" target="_blank" rel="noreferrer" className="underline">green_petals_engineering</a></p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Facebook className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">Facebook</h4>
                    <p className="text-muted-foreground"><a href="https://www.facebook.com/greenpetalsengineering" target="_blank" rel="noreferrer" className="underline">green petals engineering</a></p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg"
                className="w-fit bg-primary hover:bg-primary/90 text-white font-semibold h-12 px-8 rounded-full"
              >
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-secondary rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2">
              
              {/* Contact Info Side */}
              <div className="p-10 md:p-16 text-white bg-secondary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                  <p className="text-white/70 mb-10 text-lg">
                    Ready to start your project? Contact us for a free quote or consultation. Our team is ready to assist you.
                  </p>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-white">Phone</h4>
                        <p className="text-white/70"><a href="tel:+263784932948" aria-label="Call +263 78 493 2948" className="hover:underline">+263 78 493 2948</a></p>
                        <p className="text-white/70 mt-2 font-medium">Other numbers</p>
                        <div className="mt-2 space-y-1 text-white/70">
                          <div><a href="tel:+263242437342" aria-label="Call +263 242 437342" className="hover:underline">+263 242 437342</a></div>
                          <div><a href="tel:+263787535759" aria-label="Call +263 787 535759" className="hover:underline">+263 787 535759</a></div>
                          <div><a href="tel:+263719335497" aria-label="Call +263 719 335497" className="hover:underline">+263 719 335497</a></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-white">Email</h4>
                        <p className="text-white/70">jshayamunda@yahoo.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-white">Location</h4>
                          <p className="text-white/70">414 Acacia road, Manresa Park,Harare, Zimbabwe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="bg-white p-10 md:p-16">
                <h3 className="text-2xl font-bold text-secondary mb-6">Send us a Message</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-12 bg-muted/30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+263 00 000 0000" className="h-12 bg-muted/30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" className="h-12 bg-muted/30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Interested In</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-muted/30">
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Solar Systems">Solar Systems</SelectItem>
                              <SelectItem value="Electrical">Electrical Services</SelectItem>
                              <SelectItem value="Security">Security Systems</SelectItem>
                              <SelectItem value="Plumbing">Plumbing & General</SelectItem>
                              <SelectItem value="Other">Other Inquiry</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project requirements..." 
                              className="min-h-[120px] bg-muted/30 resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Sending Inquiry..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </Form>
              </div>

            </div>
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Main Image */}
          <div className="relative flex flex-col items-center max-w-4xl w-full">
            <img 
              src={activeImage ?? ""} 
              alt="Preview" 
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg" 
              onClick={(e) => e.stopPropagation()} 
            />
            
            {/* Image Counter and Navigation */}
            {lightboxImages.length > 1 && (
              <div className="mt-4 flex items-center gap-4 w-full justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = currentImageIndex === 0 ? lightboxImages.length - 1 : currentImageIndex - 1;
                    setCurrentImageIndex(newIndex);
                    setActiveImage(lightboxImages[newIndex]);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ArrowRight className="w-5 h-5 transform rotate-180" />
                </button>
                
                <span className="text-white font-medium px-4">
                  {currentImageIndex + 1} / {lightboxImages.length}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = (currentImageIndex + 1) % lightboxImages.length;
                    setCurrentImageIndex(newIndex);
                    setActiveImage(lightboxImages[newIndex]);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Home;