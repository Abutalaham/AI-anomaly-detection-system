import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TiltCard } from '../TiltCard';
import { useVisualModeStore } from '@/stores/visual-mode.store';

describe('TiltCard Component', () => {
  beforeEach(() => {
    useVisualModeStore.setState({ visualMode: 'quantum' });
  });

  it('renders exact copy and footer tag correctly', () => {
    render(
      <MemoryRouter>
        <TiltCard
          id="quantum"
          title="Quantum Engine"
          copy="Simulating multi-layered spatial perspective depth with hardware-accelerated transformation calculations."
          footerTag="Interactive Tilt"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Quantum Engine')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Simulating multi-layered spatial perspective depth with hardware-accelerated transformation calculations.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Interactive Tilt')).toBeInTheDocument();
  });

  it('updates visual-mode store when clicked', () => {
    render(
      <MemoryRouter>
        <TiltCard
          id="glassmorphism"
          title="3D Glassmorphism"
          copy="Blending translucent frosted glass shaders with dynamic light dispersion coordinates and specular sheen."
          footerTag="Perspective Depth"
        />
      </MemoryRouter>
    );

    const card = screen.getByRole('button', { name: /3D Glassmorphism/i });
    fireEvent.click(card);

    expect(useVisualModeStore.getState().visualMode).toBe('glassmorphism');
  });
});
