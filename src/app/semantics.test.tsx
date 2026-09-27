import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

// What a screen reader user gets: landmarks, headings, names and live regions.
describe('App semantics', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('puts the whole simulator in the main landmark', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('group', { name: 'Puntos de control' })).toBeInTheDocument();
    expect(within(main).getByRole('heading', { name: 'Combinación simple' })).toBeInTheDocument();
    expect(within(main).getByRole('group', { name: /^Esquema:/ })).toBeInTheDocument();
    expect(within(main).getByRole('status')).toHaveTextContent('Lámpara encendida');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('keeps the settings dialog out of the banner', () => {
    render(<App />);
    const banner = screen.getByRole('banner');
    expect(within(banner).getByRole('heading', { level: 1 })).toHaveTextContent('Circuito');
    expect(within(banner).queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('names the lamp after its state', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const lampTitle = () => container.querySelector('[data-on] > title');
    expect(lampTitle()).toHaveTextContent('Lámpara encendida');
    await user.click(screen.getByRole('button', { name: /^Llave 1/ }));
    expect(lampTitle()).toHaveTextContent('Lámpara apagada');
  });

  it('silences the live regions while the demo runs', async () => {
    const user = userEvent.setup();
    render(<App />);
    const message = screen.getByText(/Circuito cerrado/);
    expect(message).toHaveAttribute('aria-live', 'polite');
    expect(message).toHaveAttribute('aria-atomic', 'true');

    await user.click(screen.getByRole('button', { name: 'Demo' }));
    expect(message).toHaveAttribute('aria-live', 'off');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'off');

    await user.click(screen.getByRole('button', { name: 'Parar' }));
    expect(message).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('says the demo state once, in the label only', async () => {
    const user = userEvent.setup();
    render(<App />);
    const demo = screen.getByRole('button', { name: 'Demo' });
    expect(demo).not.toHaveAttribute('aria-pressed');
    await user.click(demo);
    expect(screen.getByRole('button', { name: 'Parar' })).not.toHaveAttribute('aria-pressed');
  });
});
