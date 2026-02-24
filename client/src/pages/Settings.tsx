import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Info, Shield, Scale, Heart, RotateCcw, ChevronRight, Mail, Globe, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SettingsTab = 'account' | 'about' | 'privacy' | 'support';

export default function SettingsPage() {
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    const handleReset = () => {
        localStorage.removeItem('family-canvas-data');
        localStorage.removeItem('fc-level');
        localStorage.removeItem('fc-exp');
        localStorage.removeItem('fc-completedFamilies');
        localStorage.removeItem('family-canvas-node-positions');
        window.location.href = '/tree'; // Reload to clear state
    };

    const navItems = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'about', label: 'About', icon: Info },
        { id: 'privacy', label: 'Privacy & Security', icon: Shield },
        { id: 'support', label: 'Support', icon: Heart },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-primary/30">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/tree")}
                        className="rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-white/50 text-sm">Manage your account and app preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-1 space-y-1 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                        {navItems.map((item) => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                onClick={() => setActiveTab(item.id as SettingsTab)}
                                className={`w-full justify-start gap-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-primary" : ""}`} />
                                <span className="font-medium">{item.label}</span>
                                {activeTab === item.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-1 h-4 bg-primary rounded-full"
                                    />
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-3 min-h-[600px] flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1"
                            >
                                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                                    {/* Account Section */}
                                    {activeTab === 'account' && (
                                        <div className="space-y-8 pb-12">
                                            <div className="flex items-center gap-6 p-6 glass rounded-2xl border-white/5">
                                                <Avatar className="w-24 h-24 border-4 border-primary/20 p-1 bg-primary/10 shadow-2xl">
                                                    <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">JD</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h2 className="text-2xl font-bold">John Doe</h2>
                                                    <p className="text-white/40 font-medium">Free Tier • Member since Feb 2026</p>
                                                    <div className="flex gap-2 mt-4">
                                                        <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full h-8 px-4 text-xs font-bold">Edit Profile</Button>
                                                        <Button variant="outline" size="sm" className="glass border-white/10 hover:bg-white/5 rounded-full h-8 px-4 text-xs font-bold">Logout</Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-6">
                                                <Card className="glass border-white/5 bg-white/[0.02] overflow-hidden">
                                                    <CardHeader className="bg-white/[0.01] border-b border-white/5 pb-4">
                                                        <CardTitle className="text-sm font-semibold text-white/70 uppercase tracking-wider">Account Information</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6 space-y-4">
                                                        <div className="flex justify-between items-center group">
                                                            <span className="text-white/40 text-sm">Display Name</span>
                                                            <span className="text-white font-medium group-hover:text-primary transition-colors cursor-default">John Doe</span>
                                                        </div>
                                                        <Separator className="bg-white/5" />
                                                        <div className="flex justify-between items-center group">
                                                            <span className="text-white/40 text-sm">Email Address</span>
                                                            <span className="text-white font-medium group-hover:text-primary transition-colors cursor-default">john.doe@example.com</span>
                                                        </div>
                                                        <Separator className="bg-white/5" />
                                                        <div className="flex justify-between items-center group">
                                                            <span className="text-white/40 text-sm">Family Surname</span>
                                                            <span className="text-white font-medium group-hover:text-primary transition-colors cursor-default uppercase">Doe</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-red-500/20 bg-red-500/[0.02]">
                                                    <CardHeader>
                                                        <CardTitle className="text-red-400 text-lg flex items-center gap-2">
                                                            <RotateCcw className="w-5 h-5" /> Danger Zone
                                                        </CardTitle>
                                                        <CardDescription className="text-red-400/60">
                                                            Permanently delete all members, relationships, and layout settings.
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" className="w-full rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20">
                                                                    Reset Family Tree
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="bg-zinc-950 border-white/10 scale-105">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-2xl font-bold">Wipe everything?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-white/60 text-lg py-2">
                                                                        All your hard work documenting your lineage will be gone forever. Are you sure you're ready to start over?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="mt-6 flex gap-3">
                                                                    <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10 rounded-xl px-6 h-12 flex-1">Keep Data</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={handleReset}
                                                                        className="bg-red-600 hover:bg-red-700 text-white border-none rounded-xl px-6 h-12 flex-1 font-bold shadow-lg shadow-red-600/20"
                                                                    >
                                                                        Reset Tree
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    )}

                                    {/* About Section */}
                                    {activeTab === 'about' && (
                                        <div className="space-y-8 pb-12">
                                            <div className="p-8 glass rounded-3xl border-white/5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 transition-colors group-hover:bg-primary/20" />
                                                <h2 className="text-3xl font-bold mb-6">Havena Heritage</h2>
                                                <p className="text-white/70 text-lg leading-relaxed mb-8">
                                                    Our mission is to bridge the gap between generations by turning dry family records into dynamic, visual stories.
                                                    We believe that understanding your past is key to navigating your future.
                                                </p>

                                                <div className="space-y-6">
                                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
                                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Globe className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">Visual Root-Mapping</h3>
                                                            <p className="text-white/50 text-sm mt-1">Advanced auto-layout algorithms that handle complex multi-generational family structures effortlessly.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
                                                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                                            <RotateCcw className="w-6 h-6 text-purple-500" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">Legacy Interactive Canvas</h3>
                                                            <p className="text-white/50 text-sm mt-1">A smooth, game-like experience for exploring your heritage. Zoom, pan, and interact with every leaf on your tree.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Card className="glass border-white/5 bg-white/[0.02]">
                                                    <CardContent className="p-6">
                                                        <h4 className="text-primary font-bold mb-2">The Vision</h4>
                                                        <p className="text-white/50 text-sm leading-relaxed">
                                                            To become the world's most accessible and visually stunning platform for genealogy preservation.
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="glass border-white/5 bg-white/[0.02]">
                                                    <CardContent className="p-6">
                                                        <h4 className="text-purple-500 font-bold mb-2">Community Driven</h4>
                                                        <p className="text-white/50 text-sm leading-relaxed">
                                                            Owned and shaped by the users who use it. No corporate tracking, just your family story.
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    )}

                                    {/* Privacy Section */}
                                    {activeTab === 'privacy' && (
                                        <div className="space-y-8 pb-12">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Shield className="w-8 h-8 text-primary" />
                                                <h2 className="text-3xl font-bold">Privacy & Security</h2>
                                            </div>

                                            <p className="text-white/60 text-lg leading-relaxed">
                                                At Havena Heritage, your privacy isn't just a feature—it's our foundation.
                                                We don't sell your data, and we don't track your family members.
                                            </p>

                                            <div className="grid gap-4">
                                                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                                                    <h3 className="text-lg font-bold text-primary mb-3">Local-First Architecture</h3>
                                                    <ul className="space-y-3">
                                                        <li className="flex gap-3 items-start text-sm text-white/70">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                            <span>Your tree data is primarily stored in your browser's Local Storage for immediate access and total control.</span>
                                                        </li>
                                                        <li className="flex gap-3 items-start text-sm text-white/70">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                            <span>Optional cloud sync is end-to-end encrypted; only you hold the keys to decrypt and view your lineage.</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <Card className="glass border-white/5 bg-white/[0.02]">
                                                    <CardHeader>
                                                        <CardTitle className="text-lg">Security Measures</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="grid sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-white/70">
                                                                <Scale className="w-4 h-4 text-primary" />
                                                                <span className="font-medium">Data Portability</span>
                                                            </div>
                                                            <p className="text-white/40 text-xs">Export your entire tree as JSON at any time. Your data belongs to you.</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-white/70">
                                                                <LogOut className="w-4 h-4 text-primary" />
                                                                <span className="font-medium">Session Control</span>
                                                            </div>
                                                            <p className="text-white/40 text-xs">Automatic session timeouts and secure cookies to protect against unauthorized access.</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">Legal Foundation</p>
                                                    <div className="flex flex-wrap justify-center gap-4">
                                                        <Button variant="link" className="text-primary hover:no-underline flex items-center gap-2">
                                                            Privacy Policy <ExternalLink className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="link" className="text-primary hover:no-underline flex items-center gap-2">
                                                            Terms of Service <ExternalLink className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="link" className="text-primary hover:no-underline flex items-center gap-2">
                                                            Cookie Policy <ExternalLink className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Support Section */}
                                    {activeTab === 'support' && (
                                        <div className="space-y-8 pb-12">
                                            <div className="flex flex-col items-center text-center p-12 glass rounded-[2.5rem] border-white/5 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                                                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
                                                    <Heart className="w-10 h-10 text-red-500 fill-red-500/20" />
                                                </div>
                                                <h2 className="text-4xl font-bold mb-4 tracking-tight">Keep the Roots Growing</h2>
                                                <p className="text-white/60 text-lg max-w-md mb-10 leading-relaxed">
                                                    We are an independent team dedicated to preserving your history. Every dollar helps maintain our servers and develop new features.
                                                </p>

                                                <Button className="w-full max-w-xs h-16 bg-primary hover:bg-primary/90 text-white shadow-[0_10px_40px_rgba(124,58,237,0.3)] text-xl font-black rounded-3xl group transition-all duration-300 hover:scale-[1.02] active:scale-95">
                                                    Donate $1 <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                                <p className="mt-4 text-xs text-white/30 font-medium">Safe & secure via Stripe • Cancel anytime</p>
                                            </div>

                                            <div className="grid gap-6">
                                                <h3 className="text-xl font-bold px-2">Need a hand?</h3>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <Card className="glass border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group">
                                                        <CardContent className="p-6 flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                                <Mail className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold">Contact Support</h4>
                                                                <p className="text-xs text-white/40">Response within 24h</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card className="glass border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group">
                                                        <CardContent className="p-6 flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                                                <Info className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold">Help Documentation</h4>
                                                                <p className="text-xs text-white/40">Guides & tutorials</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
