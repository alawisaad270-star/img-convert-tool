import React from 'react';
import { Card } from '../components/UI';
import { FileText, ShieldAlert, Server, Copyright, Zap, AlertTriangle, Scale, Mail } from 'lucide-react';
import AdUnit from '../components/AdUnit';

export const TermsView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8 border-b border-slate-200">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
        <p className="text-slate-500">Last Updated: November 26, 2025</p>
      </div>

      {/* Intro */}
      <Card className="p-8 shadow-sm">
        <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Welcome to <span className="font-bold text-slate-900">IMGconvertool</span>. These Terms & Conditions outline the rules and guidelines for using our website and all image tools, including our image converter, image compressor, image resizer, and all related services.
        </p>
        <p className="text-slate-600">
            By accessing or using our platform, you agree to follow these Terms & Conditions. If you do not agree, please do not use our website.
        </p>
      </Card>

      {/* Sections */}
      <div className="space-y-12">
        
        {/* 1. Services */}
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Use of Our Services
            </h2>
            <div className="pl-11">
                <p className="text-slate-600 mb-4">
                    IMGconvertool provides free and paid online tools for converting, compressing, resizing, and optimizing images. This includes tools such as:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                        { title: "Image Converter Online", desc: "Convert between multiple formats" },
                        { title: "Format Conversion", desc: "To PNG, JPG, PDF, SVG, TEXT, Pixel, Pixel Art" },
                        { title: "Image Compressor", desc: "Reduce file size without quality loss" },
                        { title: "Image Resizer", desc: "By size or pixel dimensions" },
                        { title: "Batch Processing", desc: "Process multiple images at once" }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg text-sm">
                            <strong className="block text-slate-900">{item.title}</strong>
                            <span className="text-slate-500">{item.desc}</span>
                        </div>
                    ))}
                </div>
                <p className="text-slate-600 text-sm italic">You may use our tools for personal or commercial projects as long as you comply with these Terms.</p>
            </div>
        </section>

        {/* 2. Responsibilities */}
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                User Responsibilities
            </h2>
            <div className="pl-11 bg-slate-50 rounded-xl p-6 border border-slate-200">
                <p className="text-slate-900 font-medium mb-3">When using our services, you agree that:</p>
                <ul className="space-y-3">
                    <li className="flex items-start">
                        <ShieldAlert className="w-5 h-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-slate-700">You will not upload illegal, harmful, or copyrighted material unless you own the rights.</span>
                    </li>
                    <li className="flex items-start">
                        <ShieldAlert className="w-5 h-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-slate-700">You will not use our platform for abusive or malicious activities.</span>
                    </li>
                    <li className="flex items-start">
                        <ShieldAlert className="w-5 h-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-slate-700">You are responsible for ensuring that your use of our tools complies with applicable laws in your region.</span>
                    </li>
                </ul>
                <p className="text-red-600 text-sm font-medium mt-4">Any misuse may result in suspension or blocking of access.</p>
            </div>
        </section>

        {/* 3. Storage */}
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                File Processing & Storage
            </h2>
            <div className="pl-11">
                <p className="text-slate-600 mb-4">To process your images, our system temporarily stores your files on our secure servers.</p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100">
                        <Server className="w-5 h-5 text-green-600 mb-2" />
                        <h4 className="font-bold text-green-800">Auto-Deleted</h4>
                        <p className="text-sm text-green-700">Files are deleted shortly after processing.</p>
                    </div>
                    <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <ShieldAlert className="w-5 h-5 text-blue-600 mb-2" />
                        <h4 className="font-bold text-blue-800">Private</h4>
                        <p className="text-sm text-blue-700">We do not access, view, or reuse your files.</p>
                    </div>
                </div>
                <p className="text-slate-500 text-sm">
                    We take privacy seriously and use encrypted connections (HTTPS/SSL). However, because no system is 100% perfect, we cannot guarantee that data transmission or storage is completely secure.
                </p>
            </div>
        </section>

        {/* 4. IP */}
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
                Intellectual Property
            </h2>
            <div className="pl-11">
                <div className="flex items-start mb-4">
                    <Copyright className="w-5 h-5 text-slate-400 mr-2 mt-1" />
                    <p className="text-slate-600">
                        All content on this website — including text, layout, design, trademarks, logos, and custom algorithms — belongs to IMGconvertool. You may not copy, reproduce, or distribute our tools, design, or content without written permission.
                    </p>
                </div>
                <p className="font-medium text-slate-900 pl-7">
                    However, all images you upload remain your property. We do not claim ownership over your files.
                </p>
            </div>
        </section>

        {/* 5. Accuracy */}
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
                Tool Accuracy & Availability
            </h2>
            <div className="pl-11">
                <p className="text-slate-600 mb-4">We strive to provide fast, high-quality tools such as: <span className="text-slate-500 italic">image converter size • image converter to PNG • image converter to JPG • image converter to PDF • image converter to text • image converter pixel • image converter SVG</span></p>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center mb-2 text-amber-800 font-bold">
                        <Zap className="w-4 h-4 mr-2" />
                        Disclaimer
                    </div>
                    <p className="text-sm text-amber-700 mb-2">While we work to keep everything running smoothly, we do not guarantee:</p>
                    <ul className="list-disc list-inside text-sm text-amber-700 pl-2">
                        <li>Uninterrupted service</li>
                        <li>Error-free processing</li>
                        <li>Perfect file compatibility for every format or device</li>
                    </ul>
                </div>
                <p className="text-slate-500 text-sm mt-2">We may modify, update, or discontinue tools at any time without notice.</p>
            </div>
        </section>

        {/* 6. Liability */}
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
                Limitation of Liability
            </h2>
            <div className="pl-11">
                <p className="text-slate-600 mb-2">By using our site, you agree that IMGconvertool is not responsible for:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {['Data loss', 'Service interruptions', 'Corrupted files', 'Compatibility issues', 'Inaccurate conversions', 'Any damages resulting from use'].map((item, i) => (
                        <li key={i} className="bg-slate-50 px-3 py-2 rounded text-slate-600 text-sm border border-slate-100">{item}</li>
                    ))}
                </ul>
                <p className="font-bold text-slate-900">You use our services at your own risk.</p>
            </div>
        </section>

        {/* 7 & 8 Misc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <section className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">7</span>
                    Third-Party Services
                </h2>
                <div className="pl-8 text-sm text-slate-600">
                    Some features may rely on third-party technologies or hosting providers. We are not responsible for content, security, or performance of external services.
                </div>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">8</span>
                    Changes to These Terms
                </h2>
                <div className="pl-8 text-sm text-slate-600">
                    We may update these Terms & Conditions at any time. The "Last Updated" date at the top reflects when these terms were modified. It is your responsibility to check this page regularly.
                </div>
            </section>
        </div>

      </div>

      {/* Contact Footer */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 mt-12 text-center">
         <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
         <p className="text-slate-300 mb-6">If you have questions about these Terms & Conditions, reach out to us anytime:</p>
         <a href="mailto:support@imgconvertool.com" className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors">
            <Mail className="w-5 h-5 mr-2" /> support@imgconvertool.com
         </a>
         <p className="text-slate-400 text-sm mt-4">We are always here to help.</p>
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