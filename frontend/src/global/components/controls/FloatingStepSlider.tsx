import React, { useMemo } from 'react';

interface StepSliderBaseProps {
    label: string;
    value: number | null | undefined;
    onChange: (value: number) => void;
    unit?: string;
    displayValue?: (value: number) => string;
    fullWidth?: boolean;
    disabled?: boolean;
    className?: string;
}

interface StepSliderWithSteps extends StepSliderBaseProps {
    steps: number[];
    min?: never;
    max?: never;
}

interface StepSliderWithRange extends StepSliderBaseProps {
    steps?: never;
    min: number;
    max: number;
}

export type FloatingStepSliderProps = StepSliderWithSteps | StepSliderWithRange;

const FloatingStepSlider: React.FC<FloatingStepSliderProps> = ({
    label,
    steps,
    min: minProp,
    max: maxProp,
    value,
    onChange,
    unit = '',
    displayValue: displayValueFn,
    fullWidth = false,
    disabled = false,
    className = '',
}) => {
    const isRangeMode = steps == null;

    const sortedSteps = useMemo(
        () => (steps ? [...steps].sort((a, b) => a - b) : []),
        [steps],
    );

    const rangeMin = isRangeMode ? (minProp ?? 0) : 0;
    const rangeMax = isRangeMode ? (maxProp ?? 0) : sortedSteps.length - 1;

    const currentIndex = useMemo(() => {
        if (isRangeMode) return value ?? rangeMin;
        if (value == null) return 0;
        const idx = sortedSteps.indexOf(value);
        if (idx !== -1) return idx;
        // Find closest step
        let closest = 0;
        let minDiff = Math.abs(sortedSteps[0] - value);
        for (let i = 1; i < sortedSteps.length; i++) {
            const diff = Math.abs(sortedSteps[i] - value);
            if (diff < minDiff) {
                minDiff = diff;
                closest = i;
            }
        }
        return closest;
    }, [value, sortedSteps, isRangeMode, rangeMin]);

    const progressPercent =
        rangeMax > rangeMin
            ? ((currentIndex - rangeMin) / (rangeMax - rangeMin)) * 100
            : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idx = parseInt(e.target.value, 10);
        onChange(isRangeMode ? idx : sortedSteps[idx]);
    };

    const resolvedValue = isRangeMode ? (value ?? rangeMin) : (value ?? sortedSteps[0]);

    const formattedValue = displayValueFn
        ? displayValueFn(resolvedValue)
        : `${resolvedValue}${unit ? ` ${unit}` : ''}`;

    const minLabel = isRangeMode ? rangeMin : sortedSteps[0];
    const maxLabel = isRangeMode ? rangeMax : sortedSteps[sortedSteps.length - 1];

    let wrapperClass = `${className}`;
    if (fullWidth) {
        wrapperClass += ' w-full';
    }

    return (
        <div className={wrapperClass}>
            <div className={`flex items-center justify-between px- mb-1 `}>
                <span className="text-sm secondary-text">
                    {label}
                </span>
                <span className="text-sm font-semibold primary-color">
                    {formattedValue}
                </span>
            </div>
            <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    step={1}
                    value={currentIndex}
                    onChange={handleChange}
                    className="w-full duration-slider"
                    style={{ ['--slider-progress' as any]: `${progressPercent}%` }}
                    disabled={disabled}
                />
                <div className="flex justify-between mt-1 px-1">
                    <span className="text-xs secondary-text">{minLabel}{unit ? ` ${unit}` : ''}</span>
                    <span className="text-xs secondary-text">{maxLabel}{unit ? ` ${unit}` : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default FloatingStepSlider;
