// Test the _regionToRadiusKm logic extracted for unit testing
function regionToRadiusKm(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}): number {
  const latKm = (region.latitudeDelta / 2) * 111;
  const lngKm =
    (region.longitudeDelta / 2) * 111 * Math.cos((region.latitude * Math.PI) / 180);
  return Math.min(Math.max(Math.sqrt(latKm ** 2 + lngKm ** 2), 1), 50);
}

describe("regionToRadiusKm", () => {
  it("returns at least 1km", () => {
    const r = regionToRadiusKm({ latitude: 25.2, longitude: 55.3, latitudeDelta: 0.001, longitudeDelta: 0.001 });
    expect(r).toBeGreaterThanOrEqual(1);
  });

  it("caps at 50km", () => {
    const r = regionToRadiusKm({ latitude: 25.2, longitude: 55.3, latitudeDelta: 5, longitudeDelta: 5 });
    expect(r).toBeLessThanOrEqual(50);
  });

  it("downtown Dubai region gives sensible radius", () => {
    const r = regionToRadiusKm({
      latitude: 25.1972,
      longitude: 55.2744,
      latitudeDelta: 0.18,
      longitudeDelta: 0.18,
    });
    // 0.18 deg ≈ 10 km radius — expect roughly that
    expect(r).toBeGreaterThan(5);
    expect(r).toBeLessThan(20);
  });
});
