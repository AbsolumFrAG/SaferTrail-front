import { memo } from "react";
import { Polyline } from "react-native-maps";
import { COLORS, RISK_THRESHOLDS } from "../../constants";
import { ColoredSegment, StreetSegment } from "../../../types";

interface MapPolylinesProps {
  streetSegments: StreetSegment[];
  coloredSegments: ColoredSegment[];
}

const getColorFromRiskScore = (score: number): string => {
  if (score >= RISK_THRESHOLDS.HIGH) return COLORS.HIGH_RISK;
  if (score >= RISK_THRESHOLDS.MEDIUM) return COLORS.MEDIUM_RISK;
  return COLORS.LOW_RISK;
};

const convertGeoJSONCoordinates = (coordinates: number[][]) => {
  return coordinates.map((coord) => ({
    latitude: coord[1],
    longitude: coord[0],
  }));
};

const StreetSegmentPolyline = memo<{ segment: StreetSegment; index: number }>(
  ({ segment, index }) => {
    if (
      segment.geometry?.type !== "LineString" ||
      !Array.isArray(segment.geometry.coordinates)
    ) {
      return null;
    }

    const coordinates = convertGeoJSONCoordinates(segment.geometry.coordinates);
    const baseColor =
      segment.properties?.color ||
      getColorFromRiskScore(segment.properties?.risk_score || 0);

    // Create a lighter version of the color
    const color = baseColor.includes("rgb")
      ? baseColor.replace("rgb", "rgba").replace(")", ", 0.3)")
      : baseColor;

    return (
      <Polyline
        key={`segment-${index}`}
        coordinates={coordinates}
        strokeColor={color}
        strokeWidth={2}
        lineCap="round"
        lineJoin="round"
        zIndex={1}
      />
    );
  }
);

StreetSegmentPolyline.displayName = "StreetSegmentPolyline";

const RouteSegmentPolyline = memo<{ segment: ColoredSegment; index: number }>(
  ({ segment, index }) => (
    <Polyline
      key={`route-${index}`}
      coordinates={segment.coordinates}
      strokeColor={segment.color}
      strokeWidth={6}
      lineCap="round"
      lineJoin="round"
      zIndex={2}
    />
  )
);

RouteSegmentPolyline.displayName = "RouteSegmentPolyline";

const MapPolylines = memo<MapPolylinesProps>(
  ({ streetSegments, coloredSegments }) => (
    <>
      {streetSegments.map((segment, index) => (
        <StreetSegmentPolyline
          key={`segment-${index}`}
          segment={segment}
          index={index}
        />
      ))}

      {coloredSegments.map((segment, index) => (
        <RouteSegmentPolyline
          key={`route-${index}`}
          segment={segment}
          index={index}
        />
      ))}
    </>
  )
);

MapPolylines.displayName = "MapPolylines";

export default MapPolylines;
