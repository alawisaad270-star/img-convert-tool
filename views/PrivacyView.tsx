import React from 'react';
import { Card } from '../components/UI';
import { Shield, Lock, EyeOff, Mail, Cookie, Trash2, Server } from 'lucide-react';
import AdUnit from '../components/AdUnit';

export const PrivacyView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8 border-b border-slate-200">
        <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-500">Last Updated: 17/11/25</p>
      </div>

      {/* Core Statement */}
      <Card className="p-8 border-l-4 border-l-primary shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-primary" />
            Our Simple Promise
        </h2>
        <p className="text-lg text-slate-700 font-medium mb-4">
            Our privacy policy is very simple: your images are yours. You always own them.
        </p>
        <p className="text-slate-600 leading-relaxed">
            When you upload images to ImgConvrTool.com, we temporarily save them on our servers only for the purpose of processing (converting, resizing, compressing, cropping, or using any of our tools). Your images are then <span className="font-semibold text-slate-900">automatically and permanently deleted from our servers within 24 hours</span> — forever.
        </p>
        <p className="text-slate-600 mt-4 flex items-center">
            <EyeOff className="w-4 h-4 mr-2" />
            We do not look at your images, we do not analyze them, and we do not share them with anyone.
        </p>
      </Card>

      {/* Info Collection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Information We Do NOT Collect</h2>
            <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-100">
                {[
                    { title: "Your Name", desc: "We don't collect personal identifiers" },
                    { title: "Your Address", desc: "Location data is not collected" },
                    { title: "Your Phone Number", desc: "Contact information is not required" },
                    { title: "Your Personal Data", desc: "No personal information is stored" }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-start">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-400 mr-3 shrink-0"></div>
                        <div>
                            <span className="block font-semibold text-slate-900">{item.title}</span>
                            <span className="text-sm text-slate-500">{item.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-slate-600 text-sm">We only process the images or files you choose to upload — nothing else.</p>
        </div>

        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Email Information</h2>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-slate-600 mb-4">
                    If you contact us directly or choose to use a feature that involves email, we may receive your email address. It is used only for communication or feature tracking and:
                </p>
                <ul className="space-y-2 mb-4">
                    {['is never sold', 'is never shared', 'is never misused'].map((item, i) => (
                         <li key={i} className="flex items-center text-slate-700">
                            <CheckIcon className="w-4 h-4 text-green-500 mr-2" /> {item}
                         </li>
                    ))}
                </ul>
                <p className="text-sm text-slate-500 italic">
                    If we ever send you an email, it will always include a clear unsubscribe link.
                </p>
            </div>
        </div>
      </div>

      {/* Third Party */}
      <div className="space-y-4">
         <h2 className="text-2xl font-bold text-slate-900">If You Connect Through a Third-Party Service</h2>
         <p className="text-slate-600 leading-relaxed">
            If in the future ImgConvrTool allows posting images directly to a third-party platform (example: Facebook, Google Drive, etc.), and you give us permission through that platform, we may receive limited information such as your email address or account name. This information is stored only to understand how many users use that feature and to improve our tools.
         </p>
         <p className="font-medium text-slate-900">We never share this information with any third party.</p>
      </div>

      {/* Cookies */}
      <div className="space-y-4">
         <h2 className="text-2xl font-bold text-slate-900 flex items-center">
             <Cookie className="w-6 h-6 mr-2 text-amber-500" /> Cookies and Basic Analytics
         </h2>
         <p className="text-slate-600">
            Like most websites, ImgConvrTool uses minimal cookies and anonymous analytics to understand how our tools are used, what needs improvement, and technical performance. <span className="font-semibold">No personally identifiable information is collected.</span>
         </p>
      </div>

      {/* Your Rights */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-8">
         <div className="flex items-start space-x-4">
             <div className="p-3 bg-slate-800 rounded-lg shrink-0">
                 <Server className="w-6 h-6 text-blue-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white mb-2">Your Rights</h2>
                <p className="mb-4 text-slate-300">Since we store no personal data, your privacy rights are simple:</p>
                <ul className="space-y-3 mb-6">
                    <li className="flex items-center"><Trash2 className="w-4 h-4 mr-2 text-red-400" /> You can request deletion of any stored email at any time.</li>
                    <li className="flex items-center"><Trash2 className="w-4 h-4 mr-2 text-red-400" /> All uploaded images are automatically deleted within 24 hours.</li>
                </ul>
                <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm">To request anything privacy-related, contact us at:</p>
                    <a href="mailto:support@imgconvertool.com" className="text-primary font-medium hover:underline flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2" /> support@imgconvertool.com
                    </a>
                </div>
             </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-500 pt-8 border-t border-slate-200">
         <div>
             <h3 className="font-bold text-slate-900 mb-2">Security</h3>
             <p>All uploads and downloads happen over secure HTTPS encryption. We take strong technical measures to keep your data and images safe during processing.</p>
         </div>
         <div>
             <h3 className="font-bold text-slate-900 mb-2">Changes to This Policy</h3>
             <p>We reserve the right to update or modify this Privacy Policy at any time. If we make changes, we will post them here on this page so you can always stay informed.</p>
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

// Helper Icon
const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);