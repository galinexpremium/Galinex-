import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GALINEX App Error Caught by Boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-walnut-950 text-cream flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-walnut-900 border border-gold-500/30 rounded-card p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>

            <h2 className="font-display text-2xl text-cream font-semibold mb-3">
              Application Notice
            </h2>

            <p className="text-sm text-cream/70 font-light mb-6 leading-relaxed">
              We encountered a temporary display issue. You can refresh the page or return to the homepage.
            </p>

            {this.state.error?.message && (
              <div className="bg-walnut-950/80 p-3 rounded-input border border-walnut-800 text-left mb-6 overflow-x-auto">
                <p className="text-[11px] font-mono text-gold-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 rounded-btn bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 rounded-btn bg-walnut-800 hover:bg-walnut-700 text-cream text-xs font-medium border border-gold-900/40 flex items-center justify-center gap-2 transition-colors"
              >
                <Home size={14} />
                <span>Go to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
