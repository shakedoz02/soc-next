import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useScenarioVariant(scenarioId, userLevel) {
  const [variant, setVariant]   = useState(null);
  const [logs, setLogs]         = useState([]);
  const [playbook, setPlaybook] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!scenarioId) return;

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      const level = userLevel ?? 1;

      const { data: variants, error: variantsErr } = await supabase
        .from('scenario_variants')
        .select('*')
        .eq('scenario_id', scenarioId)
        .lte('min_level', level);

      if (cancelled) return;
      if (variantsErr) { setError(variantsErr.message); setLoading(false); return; }
      if (!variants?.length) {
        setError(`No eligible variants found for scenario "${scenarioId}" at level ${level}`);
        setLoading(false);
        return;
      }

      const picked = variants[Math.floor(Math.random() * variants.length)];

      const [logsRes, playbookRes] = await Promise.all([
        supabase
          .from('logs')
          .select('*')
          .eq('scenario_id', scenarioId)
          .eq('variant_number', picked.variant_number)
          .order('timestamp', { ascending: true }),
        supabase
          .from('playbook_steps')
          .select('*')
          .eq('scenario_id', scenarioId)
          .order('step_number', { ascending: true }),
      ]);

      if (cancelled) return;
      if (logsRes.error) { setError(logsRes.error.message); setLoading(false); return; }

      setVariant(picked);
      setLogs(logsRes.data ?? []);
      setPlaybook(
        (playbookRes.data ?? []).map(r => ({
          step:        r.step_number,
          title:       r.title,
          description: r.description,
        }))
      );
      setLoading(false);
    }

    fetch();
    return () => { cancelled = true; };
  }, [scenarioId, userLevel]);

  return { variant, logs, playbook, loading, error };
}
