import React from 'react';
import { styled } from 'styled-components';

// The viewport header previously contained undo/redo/preview controls. These were moved to the
// main editor top bar (`Editor.tsx`) to provide a single, consistent place for those actions.
// Keep a minimal header container here to preserve layout.

const HeaderDiv = styled.div`
  width: 100%;
  height: 45px;
  z-index: 99999;
  position: relative;
  padding: 0 10px;
  background: #d4d4d4;
  display: flex;
`;

export const Header = () => {
  // Minimal placeholder header: controls are now in the main top bar (Editor.tsx)
  return (
    <HeaderDiv className="header text-white transition w-full">
      <div className="items-center flex w-full px-4 justify-end">
        {/* Intentionally empty: undo/redo/preview moved to top bar */}
      </div>
    </HeaderDiv>
  );
};
