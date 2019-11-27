/*
* Imports.
*/

import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import HTMLContent from './HTMLContent';
import useLinkAutoClick, { AUTO_CLICKED_CLASS } from './useLinkAutoClick';


/*
* NarrativesPanelViewBody component definition.
*/

export default function NarrativesPanelViewBody() {
  const currentNarrativeId = useSelector((state) => state.currentNarrative);
  const currentNarrative = useSelector((state) => state.narrativesById[currentNarrativeId]);
  const containerProps = useLinkAutoClick();

  return (
    <StyledScrollingContainer {...containerProps}>
      <HTMLContent content={currentNarrative.post_content}>
        <h2>{currentNarrative.post_title}</h2>
      </HTMLContent>
    </StyledScrollingContainer>
  );
}

const StyledScrollingContainer = styled.div`
  height: 100%;
  overflow-y: scroll;

  a[href^="#"] {
    color: ${({ theme }) => theme.colors.darkAccent};

    &.${AUTO_CLICKED_CLASS} {
      font-weight: bold;
      color: ${({ theme }) => theme.colors.brightAccent};
    }
  }
`;
