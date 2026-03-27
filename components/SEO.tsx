import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Free Online Image Converter, Compressor & Resizer | IMG Convert Tool",
  description = "The ultimate free online tool to convert, compress, resize, and crop images. Supports JPG, PNG, WebP, PDF, HEIC, and more. Secure, private, and fast client-side processing.",
  keywords = "image converter, online image compressor, resize image, jpg to pdf, png to jpg, webp converter, free image tools, client-side processing, secure image editor, wall art resizer, pdf tools, image crop",
  canonical = "https://imgconvertool.com/",
  ogImage = "https://imgconvertool.com/wp-content/uploads/2025/11/cropped-Green-Blue-Bold-Modern-Creative-Studio-Logo-2.png",
  ogType = "website",
  twitterCard = "summary_large_image",
}) => {
  const siteTitle = title.includes("IMG Convert Tool") ? title : `${title} | IMG Convert Tool`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "IMG Convert Tool",
          "url": "https://imgconvertool.com/",
          "description": description,
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Image Conversion",
            "Image Compression",
            "Image Resizing",
            "PDF to Image",
            "Image to PDF",
            "Watermarking"
          ]
        })}
      </script>
    </Helmet>
  );
};
