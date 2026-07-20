import { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches unhandled client-side JavaScript crashes in child
 * components, preventing the browser window from going completely blank (White-Screen of Death).
 * Displays a clean operational fallback card.
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, log this crash to a monitoring platform (e.g., Sentry)
    console.error('Uncaught component tree crash:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              ⚠️
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              An unexpected runtime error occurred inside this component view. The error has been logged.
            </p>
            {this.state.error && (
              <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-50 p-3 text-left text-xs font-mono text-slate-600 max-h-36">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
                Reload Page
              </Button>
              <Button onClick={this.handleReset} variant="outline" className="w-full">
                Back to Safety
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
