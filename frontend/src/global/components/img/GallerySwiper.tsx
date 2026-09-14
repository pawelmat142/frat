import { motion } from "framer-motion";
import { Ico } from "global/icon.def";
import { useState } from "react";

interface Props {
    images: string[];
    startIndex: number;
    onClose: () => void;
}

const GallerySwiper: React.FC<Props> = ({ images, startIndex, onClose }) => {
    const [index, setIndex] = useState(startIndex);

    const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const next = () => setIndex((i) => (i + 1) % images.length);

    // Swipe support via drag offset
    const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
        if (info.offset.x < -60) next();
        else if (info.offset.x > 60) prev();
    };

    return (
        <div className="bg-black h-full flex flex-col">
            {/* Close */}
            <button
                className="absolute top-4 right-4 z-10 rounded-full border border-white/30 bg-black/60 p-2 text-2xl text-white transition duration-150 hover:scale-105 hover:border-white/70 hover:bg-white/25 hover:shadow-lg hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={onClose}
                aria-label="Close"
            >
                <Ico.CANCEL />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white opacity-70 lg:left-auto lg:right-16 lg:flex lg:h-10 lg:items-center lg:translate-x-0">
                {index + 1} / {images.length}
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden lg:pt-6">
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="hidden lg:flex absolute left-6 top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/60 p-3 text-white transition duration-150 hover:scale-105 hover:border-white/70 hover:bg-white/25 hover:shadow-lg hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={prev}
                            aria-label="Previous image"
                        >
                            <Ico.CHEVRON_LEFT size={20} />
                        </button>
                        <button
                            type="button"
                            className="hidden lg:flex absolute right-6 top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/60 p-3 text-white transition duration-150 hover:scale-105 hover:border-white/70 hover:bg-white/25 hover:shadow-lg hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={next}
                            aria-label="Next image"
                        >
                            <Ico.CHEVRON_RIGHT size={20} />
                        </button>
                    </>
                )}
                <motion.img
                    key={index}
                    src={images[index]}
                    alt=""
                    className="max-w-full max-h-full object-contain select-none"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            {/* Dots */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 py-4 lg:hidden">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GallerySwiper;