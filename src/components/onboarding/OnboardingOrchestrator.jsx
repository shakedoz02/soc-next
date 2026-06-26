/**
 * OnboardingOrchestrator
 *
 * Renders the correct onboarding step based on the current phase.
 * All step components portal themselves into document.body, so this component
 * is a thin coordinator — it only needs to be mounted once inside AppShell.
 *
 * To reset onboarding during development, call `reset()` from useOnboarding()
 * or run: localStorage.removeItem('soc_onboarding_v1') and refresh.
 */
import WelcomeStep        from './steps/WelcomeStep';
import PersonalizationStep from './steps/PersonalizationStep';
import TourStep           from './steps/TourStep';
import CompletionStep     from './steps/CompletionStep';

export default function OnboardingOrchestrator() {
  return (
    <>
      <WelcomeStep />
      <PersonalizationStep />
      <TourStep />
      <CompletionStep />
    </>
  );
}
