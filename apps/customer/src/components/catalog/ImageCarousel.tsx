import React, { useState } from 'react';
import { ProductImageDto } from '@libreriard/shared';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: ProductImageDto[];
  altName: string;
}

export const ImageCarousel: React.FC<Props> = ({ images, altName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeImages = images.length > 0 ? images : [{ url: '/logo.png', publicId: 'default' }];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full aspect-video sm:h-64 bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-100 group select-none flex items-center justify-center">
      <img
        src={safeImages[currentIndex].url}
        alt={`${altName} - ${currentIndex + 1}`}
        className="w-full h-full object-contain p-2 transition-all duration-300"
      />

      {safeImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Imagen anterior"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-sm transition opacity-80 hover:opacity-100 shadow-md"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Siguiente imagen"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-sm transition opacity-80 hover:opacity-100 shadow-md"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5">
            {safeImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? 'w-6 bg-cyan-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Ver imagen ${i + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-2.5 right-2.5 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {safeImages.length}
          </div>
        </>
      )}
    </div>
  );
};
