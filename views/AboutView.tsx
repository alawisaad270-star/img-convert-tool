import React from 'react';
import { Card } from '../components/UI';
import { ShieldCheck, Zap, Heart, Globe, Lock, CheckCircle2, Layers } from 'lucide-react';
import AdUnit from '../components/AdUnit';

export const AboutView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <div className="text-center space-y-6 py-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">About Us</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Welcome to <span className="text-primary font-bold">IMGconvertool</span>, the ultimate online platform for anyone who needs fast, simple, and powerful image tools.
        </p>
      </div>

      {/* Intro Card */}
      <Card className="p-8 sm:p-12 border-primary/10 shadow-lg shadow-primary/5">
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            We created this website to help you convert, compress, resize, and optimize images effortlessly all in one place.
          </p>
          <p className="text-slate-600">
            Our mission is to offer a complete suite of tools that handle every image task: image converter online, image converter size, image converter to PNG, image converter to JPG, image converter to PDF, image converter to SVG, image converter to text, image converter to pixel, and even image converter to pixel art. Whatever you need, you'll find it here free, fast, and secure.
          </p>
        </div>
      </Card>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
             <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
               <Heart className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
          </div>
          <p className="text-slate-600 text-lg">
            At IMGconvertool, we believe that everyone should have access to professional-quality image tools without installing software, creating accounts, or dealing with complicated settings.
          </p>
          <div className="space-y-4">
            {[
              { title: "Convert Formats", desc: "JPG, PNG, WebP, SVG, HEIC, PDF…" },
              { title: "Resize Images", desc: "By size or by pixel dimensions" },
              { title: "Compress Images", desc: "Without losing quality" },
              { title: "Transform Images", desc: "Turn images into text or pixel art" },
              { title: "Prepare for Any Use", desc: "Web, social media, print, or e-commerce" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 mr-3 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <span className="text-slate-500 mx-2">—</span>
                  <span className="text-slate-600">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="font-medium text-primary pt-2">
            Our goal: Make image conversion, compression, and resizing simple for everyone.
          </p>
        </div>
        <div className="bg-slate-100 rounded-2xl p-8 h-full flex flex-col justify-center">
           <div className="bg-white rounded-xl shadow-sm p-6 mb-4 transform -rotate-1">
              <h3 className="font-bold text-slate-900 mb-2">Why We Built This Platform</h3>
              <p className="text-slate-600 text-sm">
                We noticed users constantly jumping between different websites just to convert images, resize dimensions, or reduce file size. Tools were either slow, limited, or full of ads. So we built IMGconvertool a clean, fast, multi-tool platform inspired by top websites like FreeConvert and Convertio, but built to be even more complete and beginner-friendly.
              </p>
           </div>
        </div>
      </div>

      {/* Trust Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Why Millions Trust Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
             <Layers className="w-8 h-8 text-indigo-500 mb-4" />
             <h3 className="font-bold text-slate-900 mb-2">All-in-One Image Tools</h3>
             <p className="text-slate-600 text-sm">Converter, compressor, resizer, optimizer. Supports 100+ formats: JPG, PNG, WebP, SVG, HEIC, RAW, and more.</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
             <Zap className="w-8 h-8 text-amber-500 mb-4" />
             <h3 className="font-bold text-slate-900 mb-2">Smart & Fast</h3>
             <p className="text-slate-600 text-sm">Smart systems for image converter online. Convert images to PNG, JPG, PDF, SVG, text, or pixel art in seconds.</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
             <Lock className="w-8 h-8 text-green-500 mb-4" />
             <h3 className="font-bold text-slate-900 mb-2">Safe & Private</h3>
             <p className="text-slate-600 text-sm">We automatically delete files after processing. Fast on any device mobile, tablet, or desktop.</p>
          </div>
        </div>
      </div>

      {/* Tech & Privacy Section */}
      <div className="bg-slate-900 text-slate-300 rounded-3xl p-8 sm:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-4">
             <h2 className="text-2xl font-bold text-white flex items-center">
               <Globe className="w-6 h-6 mr-3 text-primary" /> Technology Behind the Tools
             </h2>
             <p className="leading-relaxed">
               We use advanced algorithms to ensure high-quality image conversions, minimal data loss, accurate pixel rendering, perfect resizing by size or pixel, clean OCR for image-to-text conversion, and optimized compression.
             </p>
             <p className="leading-relaxed">
               Our infrastructure is designed to handle batch conversions, large image collections, and heavy formats with ease.
             </p>
          </div>
          <div className="space-y-4">
             <h2 className="text-2xl font-bold text-white flex items-center">
               <ShieldCheck className="w-6 h-6 mr-3 text-green-400" /> Your Privacy Matters
             </h2>
             <p className="leading-relaxed">
               Your images stay yours. Every file is processed securely, encrypted, and deleted shortly after completion. No tracking, no storage, no risks.
             </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center space-y-6 pt-8 border-t border-slate-200">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Commitment</h2>
            <p className="text-slate-600 mb-8">
              At IMGconvertool, we are committed to continuous improvement. We're adding new tools, new formats, and more advanced converters including AI-powered resizing, web optimization, and creative tools like pixel art generators.
            </p>
            <p className="text-lg font-medium text-slate-900">
              Thank You for Choosing IMGconvertool
            </p>
            <p className="text-sm text-slate-500 mt-2">
              We are proud to be your trusted solution for: image converter online, image converter size, image converter to PNG, image converter to JPG, image converter to PDF, image converter pixel, image converter SVG, image converter to text, image converter to pixel art, and more.
            </p>
         </div>
      </div>

      {/* Ad Unit at the bottom */}
      <AdUnit 
        slot="9472158739" 
        format="auto" 
        responsive="true" 
      />
    </div>
  );
};
