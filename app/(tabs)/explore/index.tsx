/**
 * Explore tab — full-screen map with clustered markers,
 * search bar, filter sheet, and place preview bottom drawer.
 */
import React, { useCallback, useDeferredValue, useRef, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import MapView, { type Region } from "react-native-maps";
import MapViewClustering from "react-native-map-clustering";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Place, PlaceSearchParams } from "@/types";
import { Colors, MapDefaults, Spacing } from "@/constants/theme";
import { PlaceMarker } from "@/components/map/PlaceMarker";
import { SearchBar } from "@/components/map/SearchBar";
import { FilterSheet } from "@/components/map/FilterSheet";
import { PlacePreviewSheet } from "@/components/map/PlacePreviewSheet";
import { useMapStore } from "@/stores/map";
import { usePlaceSearch } from "@/hooks/usePlaces";
import { useI18n } from "@/hooks/useI18n";

// Flatten all pages of the search result into a single array
function useFlatPlaces(params: PlaceSearchParams) {
  const query = usePlaceSearch(params);
  const places = query.data?.pages.flatMap((p) => p.data) ?? [];
  return { places, query };
}

export default function ExploreScreen() {
  const { t } = useI18n();
  const mapRef = useRef<MapView>(null);

  // Store state — individual selectors to avoid infinite re-renders in React 19
  const city = useMapStore((s) => s.city);
  const region = useMapStore((s) => s.region);
  const filters = useMapStore((s) => s.filters);
  const selectedPlace = useMapStore((s) => s.selectedPlace);
  const isSheetOpen = useMapStore((s) => s.isSheetOpen);
  const setRegion = useMapStore((s) => s.setRegion);
  const selectPlace = useMapStore((s) => s.selectPlace);
  const setFilters = useMapStore((s) => s.setFilters);
  const clearFilters = useMapStore((s) => s.clearFilters);
  const setSheetOpen = useMapStore((s) => s.setSheetOpen);

  // Local UI state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const deferredSearch = useDeferredValue(searchText);

  // Build query params from store + search input
  const searchParams: PlaceSearchParams = {
    ...filters,
    city: filters.city ?? city,
    q: deferredSearch || undefined,
    lat: region.latitude,
    lng: region.longitude,
    radius_km: _regionToRadiusKm(region),
    limit: 100,
  };

  const { places } = useFlatPlaces(searchParams);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleMarkerPress = useCallback((place: Place) => {
    selectPlace(place);
  }, [selectPlace]);

  const handleMapPress = useCallback(() => {
    if (isSheetOpen) {
      selectPlace(null);
    }
  }, [isSheetOpen, selectPlace]);

  const handleRegionChangeComplete = useCallback(
    (r: Region) => setRegion(r),
    [setRegion],
  );

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      <MapViewClustering
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        userInterfaceStyle="light"
        mapType="standard"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={lightMapStyle}
        // Clustering config
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
            onPress={handleMarkerPress}
          />
        ))}
      </MapViewClustering>

      {/* Search bar overlaid on top of map */}
      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onClear={() => setSearchText("")}
          onFilterPress={() => setShowFilters(true)}
          activeFilterCount={activeFilterCount}
        />
      </SafeAreaView>

      {/* Filter sheet */}
      <FilterSheet
        filters={filters}
        visible={showFilters}
        onApply={setFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Place preview drawer */}
      <PlacePreviewSheet
        place={selectedPlace}
        onClose={() => selectPlace(null)}
      />
    </View>
  );
}

function _regionToRadiusKm(region: Region): number {
  // Approx conversion: 1 degree lat ≈ 111 km
  const latKm = (region.latitudeDelta / 2) * 111;
  const lngKm =
    (region.longitudeDelta / 2) * 111 * Math.cos((region.latitude * Math.PI) / 180);
  return Math.min(Math.max(Math.sqrt(latKm ** 2 + lngKm ** 2), 1), 50);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});

// Light editorial map style — cream/olive palette
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
