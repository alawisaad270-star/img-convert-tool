import React from 'react';
import { ShieldCheck, Github } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: 'about' | 'privacy' | 'terms' | 'contact' | 'dashboard' | 'docs') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2 space-y-4">
                <div className="flex items-center cursor-pointer select-none" onClick={() => onNavigate('dashboard')}>
                    <img src="https://imgconvertool.com/wp-content/uploads/2025/11/cropped-Green-Blue-Bold-Modern-Creative-Studio-Logo-2.png" alt="IMG CONVERT TOOL" className="h-8 w-auto object-contain" />
                </div>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                    The ultimate privacy-first online platform for converting, compressing, and editing images directly in your browser.
                </p>
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 w-fit px-3 py-1.5 rounded-full border border-green-100">
                     <ShieldCheck className="w-4 h-4" />
                     <span className="text-xs font-semibold">Processed Locally</span>
                </div>
            </div>
            
            {/* Navigation Columns */}
            <div>
                <h4 className="font-bold text-slate-900 mb-4">Tools</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                    <li>
                        <button onClick={() => onNavigate('dashboard')} className="hover:text-primary transition-colors">
                            All Tools
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onNavigate('docs')} className="hover:text-primary transition-colors">
                            Documentation
                        </button>
                    </li>
                    <li>
                        <a href="#" className="hover:text-primary transition-colors">Github Repo</a>
                    </li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                    <li>
                        <button onClick={() => onNavigate('about')} className="hover:text-primary transition-colors">
                            About Us
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onNavigate('privacy')} className="hover:text-primary transition-colors">
                            Privacy Policy
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onNavigate('terms')} className="hover:text-primary transition-colors">
                            Terms & Conditions
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onNavigate('contact')} className="hover:text-primary transition-colors">
                            Contact Us
                        </button>
                    </li>
                </ul>
            </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© 2024 IMG Convert Tool. All rights reserved.</p>
            <div className="flex items-center space-x-6">
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Github className="w-5 h-5" />
                </a>
            </div>
        </div>
      </div>
    </footer>
  );
};