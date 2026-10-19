import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GravityFieldSwitch } from '../GravityFieldSwitch';
import { useUIStore } from '@/stores/ui.store';

describe('GravityFieldSwitch Component', () => {
  beforeEach(() => {
    useUIStore.setState({ gravityMode: 'repel' });
  });

  it('renders with role switch and initial checked state', () => {
    render(<GravityFieldSwitch />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles gravityMode in store when clicked', () => {
    render(<GravityFieldSwitch />);

    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);

    expect(useUIStore.getState().gravityMode).toBe('attract');
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
  });
});
