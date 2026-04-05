import { AnimatePresence } from "framer-motion";
import PageWrapper from "global/components/PageWrapper";
import { Z_INDEX } from "global/def";

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
    const zIndex = Z_INDEX.PSEUDO_VIEW;
    return (
        <AnimatePresence>
            {show && (
                <PageWrapper style={{ zIndex }} className={`fixed inset-0 flex flex-col ${className}`}>
                    {children}
                </PageWrapper>
            )}
        </AnimatePresence>
    );
};

export default PseudoView;
