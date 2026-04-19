import { useMapStore } from "@/stores/map";
import { MapDefaults } from "@/constants/theme";

describe("useMapStore", () => {
  beforeEach(() => {
    useMapStore.setState({
      city: "dubai",
      region: MapDefaults.dubai,
      selectedPlace: null,
      filters: {},
      isSheetOpen: false,
    });
  });

  it("switches city and resets region + selection", () => {
    useMapStore.getState().setCity("abu_dhabi");
    const state = useMapStore.getState();
    expect(state.city).toBe("abu_dhabi");
    expect(state.region).toEqual(MapDefaults.abu_dhabi);
    expect(state.selectedPlace).toBeNull();
    expect(state.isSheetOpen).toBe(false);
  });

  it("opens sheet when place is selected", () => {
    const fakePlace = { id: "abc", name_en: "Test" } as any;
    useMapStore.getState().selectPlace(fakePlace);
    expect(useMapStore.getState().selectedPlace).toEqual(fakePlace);
    expect(useMapStore.getState().isSheetOpen).toBe(true);
  });

  it("closes sheet when place set to null", () => {
    useMapStore.getState().selectPlace(null);
    expect(useMapStore.getState().isSheetOpen).toBe(false);
  });

  it("merges filters without overwriting unrelated keys", () => {
    useMapStore.getState().setFilters({ city: "dubai" });
    useMapStore.getState().setFilters({ cuisine: "japanese" });
    const { filters } = useMapStore.getState();
    expect(filters.city).toBe("dubai");
    expect(filters.cuisine).toBe("japanese");
  });

  it("clears all filters", () => {
    useMapStore.getState().setFilters({ city: "dubai", cuisine: "japanese" });
    useMapStore.getState().clearFilters();
    expect(useMapStore.getState().filters).toEqual({});
  });
});
