import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { MainFrame } from '../renderer/control/MainFrame';

describe('MainFrame', () => {
  it('should render', () => {
    expect(
      render(
        <RecoilRoot>
          <Router>
            <MainFrame />
          </Router>
        </RecoilRoot>
      )
    ).toBeTruthy();
  });
});
