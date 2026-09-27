import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Broken(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('shows a message and a reload button instead of a blank page', () => {
    // React logs caught render errors; keep the test output clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
    expect(screen.getByRole('button', { name: 'Volver a cargar' })).toBeInTheDocument();
    spy.mockRestore();
  });
});
