interface Props {
    stepsOrder: string[];
    stepLabels?: Partial<Record<string, string>>;
    currentStep: string;
}

const Stepper: React.FC<Props> = ({ currentStep, stepLabels, stepsOrder }) => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    const hasLabels = Object.keys(stepLabels ?? {}).length > 0;

    return (
        <div className={`wizard-stepper${hasLabels ? ' has-labels' : ''}`}>
            {stepsOrder.map((step, i) => {
                const isCompleted = i < currentIndex;
                const isCurrent = i === currentIndex;
                const label = stepLabels?.[step];

                return (
                    <div key={step} className="wizard-stepper-item">
                        {i > 0 && (
                            <div className={`wizard-stepper-line ${isCompleted || isCurrent ? 'active' : ''}`} />
                        )}
                        <div className={`wizard-stepper-marker ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}>
                            <div className={`wizard-stepper-circle ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`} />
                            {label && <span className="wizard-stepper-label">{label}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;