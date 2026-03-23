import { AnimatePresence } from "framer-motion";
import PageWrapper from "global/components/PageWrapper";

interface Props {
    show: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * Fullscreen animated overlay — wraps AnimatePresence internally.
 * Use anywhere: gallery, datepicker, filters, etc.
 */
const PseudoView: React.FC<Props> = ({ show, children, className = "bg-black" }) => {
    return (
        <AnimatePresence>
            {show && (
                <PageWrapper className={`fixed inset-0 z-50 flex flex-col ${className}`}>
                    {children}
                </PageWrapper>
            )}
        </AnimatePresence>
    );
};

export default PseudoView;
