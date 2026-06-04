import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#111927] flex items-center justify-center p-8" dir="rtl">
        <div className="max-w-md w-full bg-[#1C2536] border border-red-500/30 rounded-lg p-8 text-center">
          <span className="material-symbols-outlined text-red-400 text-5xl mb-4 block">error</span>
          <h1 className="text-white font-bold text-xl mb-2">שגיאה בטעינת הדף</h1>
          <p className="text-slate-500 text-sm mb-6">
            משהו השתבש. נסה לרענן את הדף.
          </p>
          {this.state.error && (
            <pre className="text-left text-[10px] text-red-400 bg-[#0D1117] p-3 rounded mb-6 overflow-auto max-h-32 font-mono">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-[#9FEF00] text-[#111927] px-6 py-2 rounded font-bold text-sm hover:brightness-110 transition-all"
          >
            רענן דף
          </button>
        </div>
      </div>
    );
  }
}
