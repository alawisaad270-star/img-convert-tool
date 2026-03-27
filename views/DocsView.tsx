import React from 'react';
import { Card } from '../components/UI';
import { BookOpen, Shield, Cpu, AlertCircle, FileType, Minimize2, Maximize2, Stamp, Crop, FileText, HelpCircle } from 'lucide-react';
import AdUnit from '../components/AdUnit';

export const DocsView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8 border-b border-slate-200">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Documentation</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Learn how to use IMG Convert Tool effectively. Everything runs in your browser.</p>
      </div>

      {/* Core Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="p-6 border-l-4 border-l-primary">
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" /> Client-Side Processing
            </h2>
            <p className="text-slate-600">
                Unlike other converters, <strong>we do not upload your files to any server</strong>. All processing (conversion, compression, resizing) happens directly inside your web browser using WebAssembly and advanced JavaScript APIs. This ensures your data never leaves your device.
            </p>
         </Card>
         <Card className="p-6 border-l-4 border-l-green-500">
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-green-500" /> Performance Tips
            </h2>
            <p className="text-slate-600">
                For best performance, we recommend processing files under <strong>50MB</strong>. Since your device's CPU handles the work, very large files might slow down older devices or mobile phones.
            </p>
         </Card>
      </div>

      {/* Tool Guides */}
      <div className="space-y-8">
         <h2 className="text-2xl font-bold text-slate-900 pb-2 border-b border-slate-200">Tool Guides</h2>
         
         <div className="grid grid-cols-1 gap-6">
             {/* Format Converter */}
             <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                        <FileType className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Format Converter</h3>
                        <p className="text-slate-600 mb-4">Convert images between JPG, PNG, WebP, AVIF, PDF, and more.</p>
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                            <li>Supports <strong>Image to Document</strong> (JPG to PDF/DOC).</li>
                            <li>Supports <strong>Vector</strong> conversions (SVG output).</li>
                            <li><strong>Best for:</strong> Changing file compatibility without editing content.</li>
                        </ul>
                    </div>
                </div>
             </div>

             {/* Compressor */}
             <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600 shrink-0">
                        <Minimize2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Image Compressor</h3>
                        <p className="text-slate-600 mb-4">Reduce file size significantly while maintaining visual quality.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded">
                                <strong className="block text-slate-900 mb-1">Manual Mode</strong>
                                <span className="text-slate-500">Use the slider to balance Quality vs Size. Good for quick adjustments.</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <strong className="block text-slate-900 mb-1">Target Size Mode</strong>
                                <span className="text-slate-500">Specify exactly how big the file should be (e.g., "1MB"). The tool iteratively compresses to match.</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Editors (Crop/Watermark) */}
             <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600 shrink-0">
                        <Crop className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Editors (Crop, Resize, Watermark)</h3>
                        <p className="text-slate-600 mb-4">Visual tools to modify your images.</p>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center"><Maximize2 className="w-4 h-4 mr-2 text-slate-400" /> <strong>Resizer:</strong> Change dimensions by pixel or percentage.</li>
                            <li className="flex items-center"><Stamp className="w-4 h-4 mr-2 text-slate-400" /> <strong>Watermark:</strong> Add text or image logos. Supports opacity, rotation, and tiling.</li>
                            <li className="flex items-center"><Crop className="w-4 h-4 mr-2 text-slate-400" /> <strong>Cropper:</strong> Cut out specific areas with aspect ratio presets (1:1, 16:9, etc).</li>
                        </ul>
                    </div>
                </div>
             </div>

             {/* PDF Tools */}
             <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-red-50 rounded-lg text-red-600 shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">PDF Tools</h3>
                        <p className="text-slate-600 mb-4">Manage PDF conversions entirely in browser.</p>
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                            <li><strong>JPG to PDF:</strong> Combine multiple images into a single PDF document.</li>
                            <li><strong>PDF to Image:</strong> Extract pages as individual JPG/PNG files.</li>
                            <li><strong>PDF to Word:</strong> Best-effort text extraction to .doc format (formatting may vary).</li>
                        </ul>
                    </div>
                </div>
             </div>
         </div>
      </div>

      {/* Troubleshooting */}
      <div className="space-y-6">
         <h2 className="text-2xl font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center">
            <AlertCircle className="w-6 h-6 mr-3 text-amber-500" /> Troubleshooting
         </h2>
         <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 space-y-4">
             <div>
                 <h4 className="font-bold text-amber-900">Why does "PDF to Word" look different?</h4>
                 <p className="text-amber-800 text-sm mt-1">
                     PDF is a layout-fixed format, while Word is flow-based. Converting strictly in the browser without a backend engine means we extract text and images line-by-line. Complex layouts (columns, tables) may need manual adjustment in Word.
                 </p>
             </div>
             <div>
                 <h4 className="font-bold text-amber-900">Why is the page slowing down?</h4>
                 <p className="text-amber-800 text-sm mt-1">
                     Processing high-resolution images (e.g., 4K, 20MB+) requires significant RAM. If the browser tab crashes or freezes, try processing fewer files at once or closing other tabs.
                 </p>
             </div>
             <div>
                 <h4 className="font-bold text-amber-900">Supported Browsers</h4>
                 <p className="text-amber-800 text-sm mt-1">
                     We recommend the latest versions of <strong>Chrome, Edge, Firefox, or Safari</strong>. Internet Explorer is not supported.
                 </p>
             </div>
         </div>
      </div>

      {/* Footer Helper */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 text-center">
         <HelpCircle className="w-10 h-10 mx-auto mb-4 text-primary" />
         <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
         <p className="text-slate-300 mb-6">Our support team is happy to help you with any issues.</p>
         <a href="mailto:support@imgconvertool.com" className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors">
            Contact Support
         </a>
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