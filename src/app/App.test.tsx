import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

const lampStatus = () => screen.getByRole('status');

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('starts with the lamp on in the two-point circuit', () => {
    render(<App />);
    expect(screen.getByText('Combinación simple')).toBeInTheDocument();
    expect(lampStatus()).toHaveTextContent('Lámpara encendida');
  });

  it('turns the lamp off and on again from either switch', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^Llave 2, Posición A/ }));
    expect(lampStatus()).toHaveTextContent('Lámpara apagada');
    expect(screen.getByText(/Ojo: el puente A sigue con tensión/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Llave 1, Posición A/ }));
    expect(lampStatus()).toHaveTextContent('Lámpara encendida');
  });

  it('works from the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);
    screen.getByRole('button', { name: /^Llave 1/ }).focus();
    await user.keyboard('{Enter}');
    expect(lampStatus()).toHaveTextContent('Lámpara apagada');
  });

  it('switches to the four-point circuit', async () => {
    const user = userEvent.setup();
    render(<App />);
    const picker = screen.getByRole('group', { name: 'Puntos de control' });
    await user.click(within(picker).getByRole('button', { name: '4 puntos' }));
    expect(await screen.findByText('Combinación con dos cruces')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Cruce 2, Directo/ })).toBeInTheDocument();
  });

  it('hides the tension warning when the switch is turned off', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('checkbox', { name: 'Ver tensión' }));
    await user.click(screen.getByRole('button', { name: /^Llave 2/ }));
    expect(screen.queryByText(/Ojo:/)).not.toBeInTheDocument();
  });
});
