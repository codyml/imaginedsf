/*
* Imports.
*/

import { useRef, useState, useEffect } from 'react';
import * as L from 'leaflet';

import { fetchGeoJson } from '../../state/actions';

import {
  MAP_GROUP_POST_TYPE,
  TILE_MAP_TYPE,
  WMS_MAP_TYPE,
  GEOJSON_MAP_TYPE,
  GEOJSON_STATUS,
} from '../../constants';


/*
* Custom hook that creates a Leaflet map and keeps it synchronized
* with the Redux state.
*/

export default function useLeafletMapFromState(mapContent, mapState, dispatch) {
  const mapContainer = useRef();
  const leafletMap = useRef();
  const [leafletLayers, setLeafletLayers] = useState([]);
  const {
    mapsAndGroups,
    proposalRanges,
    basemaps,
    geoJson,
  } = mapContent;

  const {
    enabled,
    opacity,
    center,
    zoomLevel,
    bounds,
  } = mapState;

  //  Creates Leaflet map
  useEffect(() => {
    leafletMap.current = L.map(mapContainer.current, { zoomControl: false });
  }, [mapContainer, leafletMap]);

  //  Creates Leaflet layers for each map
  useEffect(() => {
    //  Recursively traverses hierarchies and returns a flattened
    //  array of ordered maps.
    const getMaps = (id) => {
      const mapOrGroup = mapsAndGroups[id];

      //  If group
      if (mapOrGroup.post_type === MAP_GROUP_POST_TYPE) {
        return [].concat(...mapOrGroup.fields.contents.map(getMaps));
      }

      //  If not group
      return [mapOrGroup];
    };

    const maps = [].concat(
      ...proposalRanges.map(
        (range) => range.contents.map(getMaps),
      ),
      ...basemaps.map(getMaps),
    );

    maps.reverse();

    //  Creates a Leaflet layer for each map
    const layers = maps.map((map, index) => {
      switch (map.fields.source_type) {
        //  Creates a TileLayer
        case TILE_MAP_TYPE:
          return { id: map.ID, layer: createTileLayer(map, index) };

        //  Creates a TileLayer.WMS
        case WMS_MAP_TYPE:
          return { id: map.ID, layer: createWmsLayer(map, index) };

        //  Creates a GeoJSON layer
        case GEOJSON_MAP_TYPE:
          return { id: map.ID, layer: createGeoJsonLayer(map) };

        default:
          return null;
      }
    });

    setLeafletLayers(layers);
  }, [proposalRanges, basemaps, mapsAndGroups]);

  //  Sets the opacity of each Leaflet layer
  useEffect(() => {
    leafletLayers.forEach(({ id, layer }) => {
      if (opacity[id]) {
        layer.setOpacity(opacity[id]);
      }
    });
  }, [leafletLayers, opacity]);

  //  Updates which layers are added to the map
  useEffect(() => {
    leafletLayers.forEach(({ id, layer }) => {
      if (enabled[id]) {
        layer.addTo(leafletMap.current);
      } else {
        layer.removeFrom(leafletMap.current);
      }
    });
  }, [leafletLayers, enabled]);

  //  Requests a vector layer's GeoJSON when enabled
  useEffect(() => {
    leafletLayers.forEach(({ id }) => {
      if (
        enabled[id]
        && geoJson[id] === GEOJSON_STATUS.NOT_REQUESTED
      ) {
        dispatch(fetchGeoJson(id));
      }
    });
  }, [leafletLayers, enabled, geoJson, dispatch]);

  //  Updates a vector layer with received GeoJSON data
  useEffect(() => {
    leafletLayers.forEach(({ id, layer }) => {
      if (
        geoJson[id]
        && geoJson[id] !== GEOJSON_STATUS.NOT_REQUESTED
        && geoJson[id] !== GEOJSON_STATUS.REQUESTED
      ) {
        // layer.options.coordsToLatLng = getCoordsToLatLngFn(geoJson[id]);
        layer.clearLayers();
        layer.addData(geoJson[id]);
      }
    });
  }, [leafletLayers, geoJson]);

  return mapContainer;
}