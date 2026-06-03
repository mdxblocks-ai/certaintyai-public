import { Component } from 'react'

/**
 * Catches render errors anywhere below it and shows a friendly fallback so a
 * single bad page (e.g. Report.jsx hitting a malformed HTML response) doesn't
 * blank the entire app. React still requires error boundaries to be class
 * components.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface in DevTools without crashing; the demo presenter sees the toast
    // and can keep going.
    // eslint-disable-next-line no-console
    console.error('Render error caught by ErrorBoundary:', error, info)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      const message = String(this.state.error?.message || this.state.error)
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-rose-400 text-sm font-medium">
              Something rendered incorrectly.
            </p>
            <p className="mt-2 text-xs text-slate-500 break-words">{message}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <a
                href="/"
                className="px-4 py-2 rounded-lg text-sm border border-slate-700 hover:border-slate-500 transition"
                onClick={this.handleReset}
              >
                Go home
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg text-sm bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
