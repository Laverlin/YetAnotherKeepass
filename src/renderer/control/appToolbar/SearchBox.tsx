import { IconButton, InputAdornment, OutlinedInput, styled } from '@mui/material';
import { FC } from 'react';
import { useRecoilState } from 'recoil';
import { SystemIcon } from '../../entity/SystemIcon';
import { searchFilterAtom } from '../../state/FilterAtom';
import { SvgPath } from '../common/SvgPath';

const SearchInput = styled(OutlinedInput)(({ theme }) => ({
  WebkitAppRegion: 'no-drag',
  height: '24px',
  width: '400px',
  color: theme.palette.getContrastText(theme.palette.primary.dark),
  backgroundColor: theme.palette.primary.main,
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(1),
  '.MuiOutlinedInput-notchedOutline': {
    border: '1px solid',
    borderColor: theme.palette.grey[600],
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: '1px solid',
    borderColor: theme.palette.grey[400],
  },
  '&:focus-within .MuiOutlinedInput-notchedOutline': {
    border: '1px solid',
    borderColor: theme.palette.grey[500],
  },
}));

export const SearchBox: FC = () => {
  const [searchFilter, setSearchFilter] = useRecoilState(searchFilterAtom);

  return (
    <SearchInput
      id="search"
      onChange={(event) => setSearchFilter(event.target.value)}
      onKeyDown={(event) => event.key === 'Escape' && setSearchFilter('')}
      value={searchFilter}
      placeholder="Search"
      notched
      endAdornment={
        <InputAdornment position="end">
          {searchFilter ? (
            <IconButton onClick={() => setSearchFilter('')}>
              <SvgPath size={15} path={SystemIcon.clear} style={{ color: '#FFF' }} />
            </IconButton>
          ) : (
            <SvgPath size={15} path={SystemIcon.search} style={{ color: '#FFF' }} />
          )}
        </InputAdornment>
      }
    />
  );
};
