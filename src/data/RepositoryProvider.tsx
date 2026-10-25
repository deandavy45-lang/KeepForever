import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { create } from 'zustand';
import { createRepository } from './createRepository';
import type { Repository } from './repository';

const RepoContext = createContext<Repository | null>(null);

/** Bumped after every write so all mounted queries refetch. Simple and enough for a local-first app. */
const useDataVersion = create<{ v: number; bump: () => void }>((set) => ({
  v: 0,
  bump: () => set((s) => ({ v: s.v + 1 })),
}));

export function RepositoryProvider({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [repo, setRepo] = useState<Repository | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    createRepository().then(setRepo, setError);
  }, []);
  if (error) throw error;
  if (!repo) return <>{fallback ?? null}</>;
  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}

export function useRepository(): Repository {
  const repo = useContext(RepoContext);
  if (!repo) throw new Error('useRepository must be used inside <RepositoryProvider>');
  return repo;
}

export function useQuery<T>(fn: (repo: Repository) => Promise<T>, deps: unknown[] = []) {
  const repo = useRepository();
  const v = useDataVersion((s) => s.v);
  const [state, setState] = useState<{ data: T | undefined; loading: boolean; error: Error | null }>({
    data: undefined,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let alive = true;
    fn(repo).then(
      (data) => alive && setState({ data, loading: false, error: null }),
      (error) => alive && setState((s) => ({ ...s, loading: false, error })),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, v, ...deps]);
  return state;
}

export function useMutation<A extends unknown[], R>(fn: (repo: Repository, ...args: A) => Promise<R>) {
  const repo = useRepository();
  const bump = useDataVersion((s) => s.bump);
  const [pending, setPending] = useState(false);
  const run = useCallback(
    async (...args: A) => {
      setPending(true);
      try {
        const r = await fn(repo, ...args);
        bump();
        return r;
      } finally {
        setPending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repo, bump],
  );
  return { run, pending };
}
