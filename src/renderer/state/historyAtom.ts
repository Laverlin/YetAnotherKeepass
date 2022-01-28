import { atomFamily } from 'recoil';

export interface IHistoryState {
  isInHistory: boolean;
  historyIndex: number;
}

export const historyAtom = atomFamily<IHistoryState, string>({
  key: 'historyAtom',
  default: {
    isInHistory: false,
    historyIndex: 0,
  },
});
