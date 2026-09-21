import { useCallback, useEffect, useRef, useState } from "react";
import { useStudy } from "../context/StudyContext.jsx";

/**
 * Loads data from an API function with loading / error / retry handling.
 * Refetches silently (no skeleton) when app data is invalidated or on `pollMs`.
 *
 * @param {() => Promise<any>} fetcher
 * @param {any[]} deps
 * @param {{pollMs?: number, pollWhile?: (data:any)=>boolean}} [opts]
 */
export function useApi(fetcher, deps = [], { pollMs, pollWhile } = {}) {
  const { dataVersion } = useStudy();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const hasData = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) { setLoading(true); setError(null); }
    try {
      const result = await fetcherRef.current();
      if (id !== requestId.current) return;
      setData(result);
      hasData.current = true;
      setError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      if (!silent || !hasData.current) setError(e);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run({ silent: hasData.current }); }, [dataVersion, ...deps]);

  useEffect(() => {
    if (!pollMs) return undefined;
    if (pollWhile && !pollWhile(data)) return undefined;
    const t = setInterval(() => run({ silent: true }), pollMs);
    return () => clearInterval(t);
  }, [pollMs, pollWhile, data, run]);

  const reload = useCallback(() => run({ silent: false }), [run]);
  return { data, error, loading: loading && !hasData.current, reload, setData };
}
