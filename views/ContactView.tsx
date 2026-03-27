import React from 'react';
import { Card } from '../components/UI';
import { Mail, Send, Lightbulb, Bug } from 'lucide-react';
import AdUnit from '../components/AdUnit';

export const ContactView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8 border-b border-slate-200">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
            <Mail className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Contact Us</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">We're here to help you with your image processing needs.</p>
      </div>

      {/* Intro */}
      <Card className="p-8 shadow-sm">
        <p className="text-lg text-slate-700 leading-relaxed">
            At <span className="font-bold text-slate-900">IMGconvertool</span>, we work hard to provide the best online image tools — from converting and compressing to resizing and optimizing. If something isn't working as expected, or you have ideas to improve our image converter online, image resizer, image compressor, or any other tool, we'd love to hear from you.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email Support */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <Send className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Support</h2>
              <a href="mailto:support@imgconvertool.com" className="text-xl font-medium text-primary hover:underline block mb-4">
                  support@imgconvertool.com
              </a>
              <p className="text-slate-600">
                  Send us a message anytime — we usually reply within 24 hours.
              </p>
          </div>

          {/* Suggestions */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Suggestions & Feature Requests</h2>
              <p className="text-slate-600 mb-4">
                  Have an idea for new tools like image converter to PNG, image converter to JPG, image converter to PDF, image converter to SVG, or image converter to text?
              </p>
              <p className="font-medium text-slate-900">Tell us — your feedback helps us grow!</p>
          </div>
      </div>

      {/* Technical Issues */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
           <div className="shrink-0 bg-red-100 p-3 rounded-full">
               <Bug className="w-6 h-6 text-red-600" />
           </div>
           <div>
               <h2 className="text-xl font-bold text-slate-900 mb-2">Technical Issues</h2>
               <p className="text-slate-600">
                   If you experience bugs, slow processing, or formatting errors (size, pixel, compression, etc.), let us know so we can fix it quickly.
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