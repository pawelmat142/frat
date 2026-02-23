interface Props {
    stepsOrder: string[];
    currentStep: string;
}

const Stepper: React.FC<Props> = ({ currentStep, stepsOrder }) => {
    const currentIndex = stepsOrder.indexOf(currentStep);

    return (
        <div className="wizard-stepper">
            {stepsOrder.map((step, i) => {
                const isCompleted = i < currentIndex;
                const isCurrent = i === currentIndex;

                return (
                    <div key={step} className="wizard-stepper-item">
                        {i > 0 && (
                            <div className={`wizard-stepper-line ${isCompleted || isCurrent ? 'active' : ''}`} />
                        )}
                        <div className={`wizard-stepper-circle ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`} />
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;