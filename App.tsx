

import React, { useState, useEffect, Suspense } from 'react';
import { 
  FileType, 
  Minimize2, 
  Maximize2, 
  Stamp, 
  Crop, 
  FilePlus, 
  FileImage, 
  FileText, 
  Code, 
  Image as ImageIcon,
  ShieldCheck,
  Code2,
  LayoutGrid,
  BookOpen,
  Menu,
  X,
  Zap,
  CheckCircle2,
  Globe,
  Wand2,
  Layout,
  ArrowRight,
  Sparkles,
  MousePointer2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolType, ToolConfig } from './types';
import { Card } from './components/UI';
import { ToolWorkspace } from './views/ToolWorkspace';
import { AboutView } from './views/AboutView';
import { PrivacyView } from './views/PrivacyView';
import { TermsView } from './views/TermsView';
import { ContactView } from './views/ContactView';
import { DocsView } from './views/DocsView';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import AdUnit from './components/AdUnit';

const TOOLS: ToolConfig[] = [
  { id: ToolType.WallArtResizer, slug: 'wall-art-resizer', description: 'Wall Art Resizer', icon: 'Layout', accepts: 'image/*' },
  { id: ToolType.FormatConverter, slug: 'image-converter', description: 'Convert Images', icon: 'FileType', accepts: 'image/*' },
  { id: ToolType.Compressor, slug: 'image-compressor', description: 'Compress Images', icon: 'Minimize2', accepts: 'image/*' },
  { id: ToolType.Resizer, slug: 'image-resizer', description: 'Resize Images', icon: 'Maximize2', accepts: 'image/*' },
  { id: ToolType.Watermark, slug: 'add-watermark', description: 'Add Watermark', icon: 'Stamp', accepts: 'image/*' },
  { id: ToolType.Crop, slug: 'crop-image', description: 'Crop Image', icon: 'Crop', accepts: 'image/*' },
  { id: ToolType.JpgToPdf, slug: 'jpg-to-pdf', description: 'JPG to PDF', icon: 'FilePlus', accepts: 'image/jpeg,image/png' },
  { id: ToolType.PdfToJpg, slug: 'pdf-to-jpg', description: 'PDF to Image', icon: 'FileImage', accepts: 'application/pdf' },
  { id: ToolType.PdfToPng, slug: 'pdf-to-png', description: 'PDF to PNG', icon: 'FileImage', accepts: 'application/pdf' },
  { id: ToolType.PdfToWord, slug: 'pdf-to-word', description: 'PDF to Word', icon: 'FileText', accepts: 'application/pdf' },
  { id: ToolType.ImageToHtml, slug: 'image-to-html', description: 'Image to HTML', icon: 'Code', accepts: 'image/*' },
  { id: ToolType.HtmlToImage, slug: 'html-to-image', description: 'HTML to Image', icon: 'ImageIcon', accepts: 'text/html' },
];

const IconMap: Record<string, React.FC<{ className?: string }>> = {
  FileType, Minimize2, Maximize2, Stamp, Crop, FilePlus, FileImage, FileText, Code, ImageIcon, Wand2, Layout
};

function App() {
  // Helper to parse current path and set initial state
  const getInitialState = () => {
    const path = window.location.pathname.substring(1); // Remove leading slash
    
    // Check if path matches a tool slug
    const tool = TOOLS.find(t => t.slug === path);
    if (tool) {
      return { toolId: tool.id, page: 'dashboard' as const };
    }

    // Check if path matches a page
    if (['about', 'privacy', 'terms', 'contact', 'docs'].includes(path)) {
      return { toolId: null, page: path as 'about' | 'privacy' | 'terms' | 'contact' | 'docs' };
    }

    // Default to dashboard
    return { toolId: null, page: 'dashboard' as const };
  };

  const initialState = getInitialState();
  const [activeToolId, setActiveToolId] = useState<ToolType | null>(initialState.toolId);
  const [activePage, setActivePage] = useState<'dashboard' | 'about' | 'privacy' | 'terms' | 'contact' | 'docs'>(initialState.page);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle Browser Back/Forward Buttons
  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialState();
      setActiveToolId(state.toolId);
      setActivePage(state.page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const activeTool = TOOLS.find(t => t.id === activeToolId);

  const handleNavigation = (page: 'about' | 'privacy' | 'terms' | 'contact' | 'dashboard' | 'docs') => {
    setActiveToolId(null);
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL
    const url = page === 'dashboard' ? '/' : `/${page}`;
    window.history.pushState({}, '', url);
  };

  const handleToolClick = (toolId: ToolType) => {
    setActiveToolId(toolId);
    setActivePage('dashboard');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL with slug
    const tool = TOOLS.find(t => t.id === toolId);
    if (tool) {
      window.history.pushState({}, '', `/${tool.slug}`);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-100">
        <div 
          className="flex items-center cursor-pointer group select-none" 
          onClick={() => handleNavigation('dashboard')}
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">IMG CONVERT</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <button 
          onClick={() => handleNavigation('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-4 ${!activeToolId && activePage === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>All Tools</span>
        </button>

        <div className="px-4 pb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tools</p>
        </div>
        
        {TOOLS.map((tool) => {
            const Icon = IconMap[tool.icon];
            const isActive = activeToolId === tool.id;
            return (
                <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                        isActive 
                        ? 'bg-primary/10 text-primary font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="truncate">{tool.description}</span>
                </button>
            );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100">
             <div className="px-4 pb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Help</p>
            </div>
            <button 
              onClick={() => handleNavigation('docs')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${activePage === 'docs' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
                <BookOpen className={`w-4 h-4 ${activePage === 'docs' ? 'text-primary' : 'text-slate-400'}`} />
                <span>Documentation</span>
            </button>
        </div>

        {/* Sidebar Ad */}
        <div className="mt-8 px-4">
          <AdUnit 
            slot="1082532822" 
            format="auto" 
            responsive="true" 
            className="my-4"
          />
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-primary/20 selection:text-primary">
      <SEO 
        title={activeTool ? activeTool.description : activePage !== 'dashboard' ? activePage.charAt(0).toUpperCase() + activePage.slice(1) : undefined}
      />
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center cursor-pointer select-none" onClick={() => handleNavigation('dashboard')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">IMG CONVERT</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 z-40 bg-white pt-20"
          >
             <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTool ? (
              <motion.div
                key={activeTool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ToolWorkspace 
                  tool={activeTool} 
                  onBack={() => {
                    setActiveToolId(null);
                    window.history.pushState({}, '', '/');
                  }} 
                />
              </motion.div>
            ) : activePage === 'about' ? (
              <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AboutView /></motion.div>
            ) : activePage === 'privacy' ? (
              <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PrivacyView /></motion.div>
            ) : activePage === 'terms' ? (
              <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TermsView /></motion.div>
            ) : activePage === 'contact' ? (
              <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ContactView /></motion.div>
            ) : activePage === 'docs' ? (
              <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DocsView /></motion.div>
            ) : (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 sm:p-16 text-white shadow-2xl shadow-slate-200">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
                  
                  <div className="relative z-10 max-w-3xl">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-6"
                    >
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>100% Free & Private</span>
                    </motion.div>
                    
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl sm:text-6xl font-black mb-6 leading-[1.1] tracking-tight"
                    >
                      Universal Image <br />
                      <span className="text-primary">Editing Suite.</span>
                    </motion.h1>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed font-medium"
                    >
                      Professional-grade tools to convert, compress, and resize images directly in your browser. No uploads, no limits, just pure performance.
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap gap-4"
                    >
                      <button 
                        onClick={() => handleToolClick(ToolType.FormatConverter)}
                        className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all flex items-center group shadow-xl shadow-primary/30"
                      >
                        Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <div className="flex items-center space-x-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                              {['JPG', 'PNG', 'PDF'][i-1]}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm font-bold text-white/60">Supports 50+ Formats</span>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* Horizontal v2 Ad */}
                <AdUnit 
                  slot="3490587208" 
                  style={{ display: 'inline-block', width: '728px', height: '110px' }} 
                  responsive="false"
                  className="hidden md:flex"
                />

                {/* Hori v3 Responsive Ad */}
                <AdUnit 
                  slot="9472158739" 
                  format="auto" 
                  responsive="true" 
                />

                {/* Bento Grid Tools */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Powerful Tools</h2>
                    <div className="h-px flex-1 bg-slate-200 mx-6 hidden sm:block" />
                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">12 Available</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {TOOLS.map((tool, index) => {
                      const Icon = IconMap[tool.icon];
                      return (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            onClick={() => handleToolClick(tool.id)}
                            className="group relative overflow-hidden p-8 h-full min-h-[14rem] flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-slate-200 hover:border-primary/50 bg-white"
                          >
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-primary/5 transition-colors duration-500" />
                            
                            <div className="relative z-10">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-500">
                                <Icon className="w-7 h-7 text-slate-600 group-hover:text-white transition-colors" />
                              </div>
                              <h3 className="font-black text-slate-900 text-xl group-hover:text-primary transition-colors mb-2">{tool.description}</h3>
                              <p className="text-slate-500 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Fast, secure {tool.description.toLowerCase()} in your browser.
                              </p>
                            </div>
                            
                            <div className="relative z-10 flex items-center text-primary font-bold text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              Open Tool <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>

                {/* Trust / Features Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
                   {[
                     { icon: ShieldCheck, title: "Privacy First", desc: "Your files never leave your computer. Processing happens 100% locally.", color: "blue" },
                     { icon: Zap, title: "Lightning Fast", desc: "Powered by WebAssembly for near-native processing speeds in your browser.", color: "amber" },
                     { icon: Lock, title: "Secure & Safe", desc: "No registration required. No data collection. No hidden tracking.", color: "green" }
                   ].map((feature, i) => (
                     <div key={i} className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 bg-${feature.color}-50 rounded-xl flex items-center justify-center mb-6`}>
                          <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                        </div>
                        <h4 className="font-black text-slate-900 text-lg mb-2">{feature.title}</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
                     </div>
                   ))}
                </section>

                {/* SEO Rich Content */}
                <section className="prose prose-slate max-w-none bg-white rounded-[2.5rem] p-8 sm:p-16 border border-slate-200">
                  <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center">
                      <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">The Ultimate Online Image Toolkit</h2>
                      <p className="text-xl text-slate-600 font-medium leading-relaxed">
                        Why compromise on privacy or speed? <strong>IMG Convert Tool</strong> brings professional image processing directly to your browser.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-slate-900">Advanced Image Compression</h3>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          Our <strong>Image Compressor</strong> uses state-of-the-art algorithms to shrink file sizes by up to 90% while maintaining stunning visual fidelity. Perfect for optimizing website assets, reducing email attachment sizes, or saving disk space.
                        </p>
                        <div className="flex items-center space-x-2 text-primary font-bold">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Smart WebP & AVIF Support</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-slate-900">Universal Format Support</h3>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          From <strong>HEIC to JPG</strong> to <strong>PDF to PNG</strong>, we support a vast array of modern and legacy formats. Our converter ensures color accuracy and metadata preservation across all transformations.
                        </p>
                        <div className="flex items-center space-x-2 text-primary font-bold">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Batch Processing Enabled</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-12 border-t border-slate-100">
                      <h3 className="text-2xl font-black text-slate-900 mb-8 text-center">Frequently Asked Questions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { q: "Is it really free?", a: "Yes, 100% free with no hidden costs, subscriptions, or watermarks on your files." },
                          { q: "Are my files safe?", a: "Absolutely. Your files are processed locally in your browser and are never uploaded to any server." },
                          { q: "What formats are supported?", a: "We support JPG, PNG, WebP, GIF, PDF, HEIC, SVG, and many more." },
                          { q: "Is there a file size limit?", a: "The only limit is your device's memory. We've tested files up to 100MB with ease." }
                        ].map((faq, i) => (
                          <div key={i} className="space-y-2">
                            <h4 className="font-bold text-slate-900">{faq.q}</h4>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Autorelaxed Ad */}
                <AdUnit 
                  slot="3834657355" 
                  format="autorelaxed" 
                  responsive="true" 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <Footer onNavigate={handleNavigation} />
      </div>
    </div>
  );
}

export default App;
