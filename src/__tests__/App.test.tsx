import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MainFrame } from '../renderer/control/MainFrame';

describe('MainFrame', () => {
  it('should render', () => {
    expect(render(<MainFrame />)).toBeTruthy();
  });
});
