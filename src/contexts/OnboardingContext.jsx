import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LS_KEY, TOUR_STEPS } from '../components/onboarding/config';

// ─── State shape ────────────────────────────────────────────────────────────

const initialState = {
  phase: 'idle',          // 'idle'|'welcome'|'personalization'|'tour'|'checklist'|'complete'|'skipped'
  direction: 1,           // animation direction: 1 = forward, -1 = back
  tourStep: 0,            // index into TOUR_STEPS (0–3)
  personalization: { role: null, goal: null },
  checklist: {
    startScenario:          false,
    completeInvestigation:  false,
    visitProfile:           false,
  },
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...initialState, phase: 'welcome', direction: 1 };

    case 'RESTORE':
      return { ...initialState, ...action.payload };

    case 'ADVANCE': {
      const { phase, tourStep } = state;
      if (phase === 'welcome')         return { ...state, phase: 'personalization', direction: 1 };
      if (phase === 'personalization') return { ...state, phase: 'tour', tourStep: 0, direction: 1 };
      if (phase === 'tour') {
        if (tourStep < TOUR_STEPS.length - 1) return { ...state, tourStep: tourStep + 1, direction: 1 };
        return { ...state, phase: 'checklist', direction: 1 };
      }
      return state;
    }

    case 'BACK': {
      const { phase, tourStep } = state;
      if (phase === 'personalization') return { ...state, phase: 'welcome', direction: -1 };
      if (phase === 'tour') {
        if (tourStep > 0) return { ...state, tourStep: tourStep - 1, direction: -1 };
        return { ...state, phase: 'personalization', direction: -1 };
      }
      return state;
    }

    case 'SKIP':
      return { ...state, phase: 'skipped' };

    case 'SET_PERSONALIZATION':
      return {
        ...state,
        personalization: { ...state.personalization, ...action.payload },
      };

    case 'COMPLETE_ITEM': {
      const checklist = { ...state.checklist, [action.payload]: true };
      const allDone   = Object.values(checklist).every(Boolean);
      return {
        ...state,
        checklist,
        phase: allDone && state.phase === 'checklist' ? 'complete' : state.phase,
      };
    }

    case 'CLOSE_COMPLETION':
      return { ...state, phase: 'skipped' };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children, onComplete }) {
  const { user, loading } = useAuth();
  const location          = useLocation();
  const navigate          = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  // Track the last user ID we ran the bootstrap for, so we never re-trigger
  // when the same user's profile object updates (e.g. after XP sync).
  const bootstrappedUserId = useRef(null);

  // ── Bootstrap: once auth resolves, check if we should start onboarding ───
  useEffect(() => {
    if (loading) return;
    if (!user?.id) return;                              // logged-out / public page
    if (bootstrappedUserId.current === user.id) return; // already handled this user

    bootstrappedUserId.current = user.id;

    const stored = (() => {
      try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; }
    })();

    if (stored && stored.phase && stored.phase !== 'idle') {
      dispatch({ type: 'RESTORE', payload: stored });
      return;
    }

    // First-time user: no completed sessions and no stored onboarding state
    if ((user.sessionsCompleted ?? 0) === 0) {
      dispatch({ type: 'START' });
    }
  }, [user?.id, loading]);

  // ── Persist state to localStorage on every change ────────────────────────
  useEffect(() => {
    if (state.phase === 'idle') return;
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  // ── Navigate to lobby when tour phase starts (tour targets live there) ───
  useEffect(() => {
    if (state.phase === 'tour' && location.pathname !== '/lobby') {
      navigate('/lobby', { replace: true });
    }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Route-based checklist tracking ───────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'checklist') return;
    const path = location.pathname;
    if (path.startsWith('/investigate/') && !state.checklist.startScenario) {
      dispatch({ type: 'COMPLETE_ITEM', payload: 'startScenario' });
    }
    if (path.startsWith('/summary/') && !state.checklist.completeInvestigation) {
      dispatch({ type: 'COMPLETE_ITEM', payload: 'completeInvestigation' });
    }
    if (path === '/profile' && !state.checklist.visitProfile) {
      dispatch({ type: 'COMPLETE_ITEM', payload: 'visitProfile' });
    }
  }, [location.pathname, state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── onComplete callback ───────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'complete') {
      onComplete?.();
    }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived flags ─────────────────────────────────────────────────────────
  const isModalActive = ['welcome', 'personalization', 'tour'].includes(state.phase);
  const showChecklist = state.phase === 'checklist';
  const checklistTotal     = Object.keys(state.checklist).length;
  const checklistCompleted = Object.values(state.checklist).filter(Boolean).length;

  // ── Actions ───────────────────────────────────────────────────────────────
  const advance          = useCallback(() => dispatch({ type: 'ADVANCE' }), []);
  const back             = useCallback(() => dispatch({ type: 'BACK' }), []);
  const skip             = useCallback(() => dispatch({ type: 'SKIP' }), []);
  const closeCompletion  = useCallback(() => dispatch({ type: 'CLOSE_COMPLETION' }), []);
  const setPersonalization = useCallback(
    (data) => dispatch({ type: 'SET_PERSONALIZATION', payload: data }),
    [],
  );
  const completeItem = useCallback(
    (id) => dispatch({ type: 'COMPLETE_ITEM', payload: id }),
    [],
  );
  const reset = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    initialized.current = false;
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    isModalActive,
    showChecklist,
    checklistTotal,
    checklistCompleted,
    advance,
    back,
    skip,
    closeCompletion,
    setPersonalization,
    completeItem,
    reset,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
};
