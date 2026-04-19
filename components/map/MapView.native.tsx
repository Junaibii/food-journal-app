import React from "react";
import { Platform, StyleSheet } from "react-native";
import MapViewClustering from "react-native-map-clustering";
import type { Region } from "react-native-maps";

import { Colors } from "@/constants/theme";
import { PlaceMarker } from "@/components/map/PlaceMarker";
import type { Place } from "@/types";

export type { Region };

interface Props {
  mapRef: React.RefObject<any>;
  region: Region;
  places: Place[];
  selectedPlace: Place | null;
  onRegionChangeComplete: (r: Region) => void;
  onPress: () => void;
  onMarkerPress: (place: Place) => void;
}

export default function MapView({
  mapRef,
  region,
  places,
  selectedPlace,
  onRegionChangeComplete,
  onPress,
  onMarkerPress,
}: Props) {
  return (
    <MapViewClustering
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      onRegionChangeComplete={onRegionChangeComplete}
      onPress={onPress}
      userInterfaceStyle="light"
      mapType="standard"
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      customMapStyle={lightMapStyle}
      clusterColor={Colors.mapCluster}
      clusterTextColor={Colors.textInverse}
      clusterFontFamily={Platform.OS === "ios" ? "System" : "sans-serif-medium"}
      radius={40}
      maxZoom={18}
      minPoints={4}
      animationEnabled
    >
      {places.map((place) => (
        <PlaceMarker
          key={place.id}
          place={place}
          isSelected={selectedPlace?.id === place.id}
          onPress={onMarkerPress}
        />
      ))}
    </MapViewClustering>
  );
}

const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#F0EBE1" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4A5538" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F7F3EC" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#E8E0D0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#C8D8E8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#3B4A28" }] },
];
