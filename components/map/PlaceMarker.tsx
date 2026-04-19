import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Marker } from "react-native-maps";
import type { Place } from "@/types";
import { Colors, Radii, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { CUISINE_OPTIONS } from "@/constants/cuisines";

interface Props {
  place: Place;
  isSelected: boolean;
  onPress: (place: Place) => void;
}

function _PlaceMarker({ place, isSelected, onPress }: Props) {
  const emoji =
    CUISINE_OPTIONS.find((c) => place.cuisine_tags.includes(c.tag))?.emoji ?? "🍽️";

  if (!place.latitude || !place.longitude) return null;

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      onPress={() => onPress(place)}
      tracksViewChanges={isSelected} // only redraw when selected state changes
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={[styles.pin, isSelected && styles.pinSelected]}>
        <Text style={[styles.emoji, isSelected && styles.emojiSelected]}>{emoji}</Text>
      </View>
      <View style={[styles.stem, isSelected && styles.stemSelected]} />
    </Marker>
  );
}

export const PlaceMarker = memo(_PlaceMarker);

const styles = StyleSheet.create({
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pinSelected: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bg,
    borderColor: Colors.accentGold,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 18,
  },
  emojiSelected: {
    fontSize: 22,
  },
  stem: {
    width: 2,
    height: 6,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: -1,
  },
  stemSelected: {
    backgroundColor: Colors.accentGold,
    height: 8,
  },
});
