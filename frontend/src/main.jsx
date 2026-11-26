import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("InspectAI Runtime Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB] dark:bg-[#141312] p-6 text-[#1C1917] dark:text-[#F5F2EB] font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#1E1C1A] border border-amber-200 dark:border-[#38332E] rounded-3xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-2xl">
              ⚠️
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans">Interface Recovery Mode</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
                A rendering issue was intercepted. Your inspection pipeline and data are unaffected.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-stone-100 dark:bg-[#282522] rounded-xl text-left text-xs font-mono text-red-600 dark:text-red-400 max-h-32 overflow-auto">
                  {this.state.error.toString()}
                </div>
              )}
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 bg-lime-500 hover:bg-lime-600 text-stone-950 font-bold rounded-2xl transition shadow-md flex items-center justify-center space-x-2 text-sm"
            >
              <span>Refresh & Recover</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

