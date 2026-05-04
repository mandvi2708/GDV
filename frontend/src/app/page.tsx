'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Bot, MessageSquare, Users, Zap, Shield, Sparkles, Globe, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen mesh-gradient selection:bg-primary/30">
      {/* Navbar Placeholder - Assuming it's in layout, but adding local CTA for hero */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8 animate-float"
          >
            <Sparkles className="w-4 h-4" />
            Next-Gen AI Discussion Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight leading-[1.1]"
          >
            Elevate every <br />
            <span className="text-gradient">Conversation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 mb-12 leading-relaxed font-medium"
          >
            GDVerse blends cutting-edge WebRTC with Gemini-powered intelligence. 
            Real-time moderation, sentiment insights, and automated MoM generation 
            for teams that value clarity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register" className="btn-primary flex items-center gap-2 text-lg px-10 py-5">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="btn-secondary flex items-center gap-2 text-lg px-10 py-5">
              <PlayCircle className="w-6 h-6" />
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative group max-w-6xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative glass-card rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
            <div className="bg-white/5 border-b border-white/5 p-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="mx-auto bg-white/5 px-4 py-1 rounded-lg text-[10px] text-gray-500 font-mono">
                app.gdverse.ai/discussion/global-strategy
              </div>
            </div>
            <img 
              src="/Users/mandvi/.gemini/antigravity/brain/b431945f-a05d-46fa-beb0-c5159ba349db/gdverse_dashboard_mockup_1777894057440.png" 
              alt="Dashboard Preview" 
              className="w-full opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Bot className="w-10 h-10 text-primary" />}
            title="Intelligent Moderation"
            description="Our Gemini-powered bots track sentiment, manage speaking time, and intervene to prevent toxicity."
          />
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-secondary" />}
            title="Instant MoM Reports"
            description="Stop taking notes. Get structured Minutes of Meeting, action items, and key decisions instantly."
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-accent" />}
            title="Enterprise Security"
            description="End-to-end encrypted WebRTC streams and secure data handling for professional privacy."
          />
        </div>

        {/* Stats Section */}
        <div className="mt-48 flex flex-wrap justify-center gap-12 md:gap-32 text-center border-y border-white/5 py-20">
          <div>
            <p className="text-4xl font-extrabold mb-2">99.9%</p>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Uptime Reliability</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold mb-2">10k+</p>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Global Discussions</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold mb-2">50ms</p>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Avg. Latency</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-48 glass-card p-12 md:p-20 rounded-[48px] text-center bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to transform your <br /><span className="text-gradient">Collaboration?</span></h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto text-lg">Join thousands of teams who have already upgraded their discussion experience with GDVerse.</p>
          <Link href="/register" className="btn-primary px-12 py-6 text-xl inline-flex items-center gap-3">
            Get Started Now
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 pb-12 text-center text-gray-600 text-sm">
        <div className="flex justify-center gap-8 mb-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
        </div>
        <p>© 2026 GDVerse AI. Built for the modern workspace.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass-card p-10 rounded-[32px] text-left group"
    >
      <div className="mb-6 p-4 bg-white/5 w-fit rounded-2xl group-hover:bg-primary/20 transition-colors">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-lg">{description}</p>
    </motion.div>
  );
}
