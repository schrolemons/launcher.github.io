import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { getProjectById } from '../config';
import ProjectIdentity from './ProjectIdentity';

it('明确 ARK 与 WORLD 是同一档案的不同呈现入口', () => {
  render(<ProjectIdentity project={getProjectById('ark')} />);
  expect(screen.getByText(/ARK \/ WORLD 使用同一世界档案，仅呈现方式不同/)).toBeInTheDocument();
});
