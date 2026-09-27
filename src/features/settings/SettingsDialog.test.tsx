import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';

const dialog = () => screen.getByRole('dialog', { hidden: true });

describe('SettingsDialog', () => {
  it('opens from the header and closes with "Listo"', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    expect(dialog()).toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Listo' }));
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('closes when the dimmed area around it is tapped', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    await user.click(dialog());
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('stays open when its content is tapped', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    await user.click(screen.getByRole('button', { name: 'Día' }));
    expect(dialog()).toHaveAttribute('open');
  });
});
