import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('🛡️ [ERROR BOUNDARY] Intercepted component render issue:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-text-primary font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md p-6 shadow-modal text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-danger/15 border border-danger/30 text-danger flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-text-primary">Workspace View Recovered</h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                An isolated UI component encountered an issue, but your workspace and data remain safe.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={this.handleReload}
                className="btn-primary px-4 py-2 text-xs flex items-center gap-2 shadow-subtle"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
