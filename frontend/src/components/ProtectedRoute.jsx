import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client';

export default function ProtectedRoute({ children, roles }) {
  const [state, setState] = useState({ loading: true, user: null, error: null });

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((data) => {
        if (!cancelled) setState({ loading: false, user: data.user, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, user: null, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div role="status" className="text-center py-20 text-gray-400">
        Checking session…
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length && !roles.includes(state.user.role)) {
    return (
      <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        You do not have permission to view this page. Your role is <strong>{state.user.role}</strong>.
      </div>
    );
  }

  return typeof children === 'function' ? children(state.user) : children;
}
