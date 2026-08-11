import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * A crash mid-facial must never blank the screen — the therapist needs a way back
 * to the pathway. Real error reporting lands in T23.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack)
  }

  override render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex h-full items-center justify-center bg-brand-navy p-8 text-white">
        <div className="max-w-lg rounded-lg border border-red-400/40 bg-red-950/30 p-8" role="alert">
          <h1 className="font-display text-2xl">Something went wrong</h1>
          <p className="mt-3 text-sm text-red-200/80">
            The screen stopped responding. Your recorded session events are safe — they are written locally before
            anything else.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded bg-black/40 p-3 text-xs text-red-200/70">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="touch-target mt-6 rounded-md bg-brand-gold px-5 font-medium text-brand-navy"
          >
            Return to the pathway
          </button>
        </div>
      </div>
    )
  }
}
