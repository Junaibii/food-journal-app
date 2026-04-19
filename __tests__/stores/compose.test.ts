import { useComposeStore } from "@/stores/compose";

const photo = {
  uri: "file:///test/photo.jpg",
  mimeType: "image/jpeg" as const,
  width: 1920,
  height: 1080,
};

describe("useComposeStore", () => {
  beforeEach(() => useComposeStore.getState().reset());

  it("starts with empty state", () => {
    const s = useComposeStore.getState();
    expect(s.place).toBeNull();
    expect(s.rating).toBeNull();
    expect(s.body).toBe("");
    expect(s.photos).toHaveLength(0);
  });

  it("sets rating", () => {
    useComposeStore.getState().setRating(4);
    expect(useComposeStore.getState().rating).toBe(4);
  });

  it("adds a photo", () => {
    useComposeStore.getState().addPhoto(photo);
    expect(useComposeStore.getState().photos).toHaveLength(1);
  });

  it("removes a photo by uri", () => {
    useComposeStore.getState().addPhoto(photo);
    useComposeStore.getState().removePhoto(photo.uri);
    expect(useComposeStore.getState().photos).toHaveLength(0);
  });

  it("caps at maxPhotos (3)", () => {
    for (let i = 0; i < 6; i++) {
      useComposeStore.getState().addPhoto({ ...photo, uri: `file:///photo_${i}.jpg` });
    }
    expect(useComposeStore.getState().photos).toHaveLength(3);
  });

  it("updates a photo caption immutably", () => {
    useComposeStore.getState().addPhoto(photo);
    useComposeStore.getState().updatePhotoCaption(photo.uri, "Beautiful dish");
    const p = useComposeStore.getState().photos[0];
    expect(p.caption).toBe("Beautiful dish");
    expect(p.uri).toBe(photo.uri); // other fields unchanged
  });

  it("reset clears everything", () => {
    useComposeStore.getState().setRating(5);
    useComposeStore.getState().addPhoto(photo);
    useComposeStore.getState().reset();
    const s = useComposeStore.getState();
    expect(s.rating).toBeNull();
    expect(s.photos).toHaveLength(0);
  });
});
