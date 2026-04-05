import FloatingLabel from './FloatingLabel';

interface SkeletonControlProps {
    fullWidth?: boolean;
    className?: string;
    label?: string;
    required?: boolean;
}

const SkeletonControl: React.FC<SkeletonControlProps> = ({ fullWidth = false, className = '', label, required }) => {
    return (
        <div className={`floating-input-wrapper ${className}`}>
            <div className="floating-input-container">
                <div className={`skeleton-control${fullWidth ? ' w-full' : ''}`}>
                    <div className="skeleton-shimmer" />
                </div>
                <FloatingLabel
                    label={label}
                    required={required}
                    isActive={false}
                />
            </div>
        </div>
    );
};

export default SkeletonControl;
