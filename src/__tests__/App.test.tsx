import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { MainFrame } from '../renderer/control/MainFrame';

describe('MainFrame', () => {
  it('should render', () => {
    expect(
      render(
        <RecoilRoot>
          <MainFrame />
        </RecoilRoot>
      )
    ).toBeTruthy();
  });
});
