import React from 'react';
import * as Sentry from "@sentry/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    Sentry.captureException(error, { contexts: { errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#fafafa',
        }}>
          <div style={{ maxWidth: '400px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              We've been notified of the error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Sentry.withProfiler(ErrorBoundary);
