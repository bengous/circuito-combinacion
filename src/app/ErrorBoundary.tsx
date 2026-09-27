import { Component, type ReactNode } from 'react';
import { es } from '@/i18n/es';
import { Button } from '@/shared/ui/Button';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

/**
 * Last line of defence: an unexpected error shows a short message and a reload button
 * instead of a blank page. (React needs a class component for this.)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={styles.fallback} role="alert">
        <p>{es.error.message}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          {es.error.reload}
        </Button>
      </div>
    );
  }
}
