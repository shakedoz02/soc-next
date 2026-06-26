import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { TOUR_STEPS } from '../config';
import SpotlightOverlay from '../widgets/SpotlightOverlay';

export default function TourStep() {
  const { phase, tourStep, advance, back, skip } = useOnboarding();

  if (phase !== 'tour') return null;

  const current = TOUR_STEPS[tourStep];

  return createPortal(
    <AnimatePresence>
      <SpotlightOverlay
        key={current.tourId}
        tourId={current.tourId}
        placement={current.placement}
        title={current.title}
        description={current.description}
        step={tourStep}
        totalSteps={TOUR_STEPS.length}
        onNext={advance}
        onBack={back}
        onSkip={skip}
      />
    </AnimatePresence>,
    document.body,
  );
}
