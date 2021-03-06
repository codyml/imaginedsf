/*
* Imports.
*/

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { LatLngBounds } from 'leaflet';

import useMapEnabled from '../useMapEnabled';
import useZoomToBounds from '../useZoomToBounds';
import Control from './Control';
import useTooltip from '../useTooltip';

import extentImg from '../../img/extent.png';
import extentActiveImg from '../../img/extent-active.png';

/*
* ZoomToExtentControl component definition.
*/

export default function ZoomToExtentControl() {
  //  Retrieves IDs of enabled maps.
  const getMapEnabled = useMapEnabled();
  const {
    mapItems,
    permanentBasemap,
    basemaps,
  } = useSelector((state) => state.mapContent);

  const basemapsSet = useMemo(
    () => new Set(
      [...basemaps, ...(permanentBasemap ? [permanentBasemap] : [])].map((v) => `${v}`),
    ),
    [basemaps, permanentBasemap],
  );

  const allEnabledMapBoundingPoints = useMemo(() => {
    const mapEnabled = getMapEnabled();
    return [].concat(...Object.keys(mapEnabled)
      .filter((id) => !basemapsSet.has(id) && mapItems[id].bounds)
      .map((id) => mapItems[id].bounds));
  }, [basemapsSet, getMapEnabled, mapItems]);

  const bounds = new LatLngBounds(allEnabledMapBoundingPoints);
  const [zoomToBounds, isZoomedToBounds] = useZoomToBounds(bounds);

  const [tooltip] = useTooltip(
    'Zoom to full extent of active maps',
  );

  return (
    <Control tooltip={tooltip}>
      <StyledButton
        className="button"
        onClick={zoomToBounds}
        disabled={!bounds.isValid()}
      >
        <img src={isZoomedToBounds ? extentActiveImg : extentImg} alt="Zoom to full extent of active maps" />
      </StyledButton>
    </Control>
  );
}


/*
* Styles
*/

const StyledButton = styled.button`
  width: 2.25em;
  height: 2.25em;
  padding: 0.25em;
`;
