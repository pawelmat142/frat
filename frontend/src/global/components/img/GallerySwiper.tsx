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
        <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Close */}
            <button
                className="absolute top-4 right-4 z-10 text-white text-2xl p-2"
                onClick={onClose}
                aria-label="Close"
            >
                <Ico.CANCEL />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm opacity-70">
                {index + 1} / {images.length}
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
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
                <div className="flex justify-center gap-2 py-4">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default GallerySwiper;