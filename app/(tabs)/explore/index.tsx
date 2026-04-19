/**
 * Explore tab — full-screen map with clustered markers,
 * search bar, filter sheet, and place preview bottom drawer.
 */
import React, { useCallback, useDeferredValue, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Region } from "react-native-maps";

import ClusteredMapView from "@/components/map/MapView";

import type { Place, PlaceSearchParams } from "@/types";
import { Colors } from "@/constants/theme";
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
  const mapRef = useRef<any>(null);

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
      <ClusteredMapView
        mapRef={mapRef}
        region={region}
        places={places}
        selectedPlace={selectedPlace}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        onMarkerPress={handleMarkerPress}
      />

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
