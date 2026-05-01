import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 max(12px, calc((100vw - 900px) / 2));
  padding: 12px 0px 6px;

  @media (max-width: 640px) {
    padding: 8px 0px 4px;
    margin: 0 12px;
  }
`;

const ModeSwitch = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 3px;
`;

const ModeBtn = styled.button`
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background: ${p => p.$active ? 'rgba(255,255,255,0.12)' : 'transparent'};
  color: ${p => p.$active ? 'inherit' : 'rgba(255,255,255,0.5)'};
  transition: all 0.15s;
  &:hover { color: inherit; }

  @media (max-width: 640px) {
    padding: 5px 10px;
    font-size: 12px;
  }
`;

const Nav = ({ mode, onModeChange }) => {
  return (
    <Container>
      <ModeSwitch>
        <ModeBtn $active={mode === 'tasks'} onClick={() => onModeChange('tasks')}>📋 Tasks</ModeBtn>
        <ModeBtn $active={mode === 'docs'} onClick={() => onModeChange('docs')}>📄 Docs</ModeBtn>
      </ModeSwitch>
    </Container>
  );
};

export default Nav;
