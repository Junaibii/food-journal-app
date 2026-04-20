/**
 * Review compose wizard — 4 steps:
 *   1. Place search/select  (skipped when placeId query-param is pre-filled)
 *   2. Star rating          (required, 1-5)
 *   3. Text review + visit date (optional)
 *   4. Photo attach         (up to 3, optional)
 *
 * Triggered from:
 *   - Place detail FAB     → /review/compose?placeId=<id>  (starts at step 2)
 *   - Explore/add FAB      → /review/compose               (starts at step 1)
 */
import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { RatingPicker } from "@/components/review/RatingPicker";
import { PhotoAttacher } from "@/components/review/PhotoAttacher";
import { PlaceSearchInput } from "@/components/review/PlaceSearchInput";
import { useComposeStore } from "@/stores/compose";
import { useCreateReview } from "@/hooks/useReviewMutations";
import { getPlace } from "@/services/places";
import { CUISINE_OPTIONS } from "@/constants/cuisines";
import { useI18n } from "@/hooks/useI18n";
import type { Place } from "@/types";

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i + 1 === current && dotStyles.dotActive,
            i + 1 < current && dotStyles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.accentGold,
    borderRadius: 3,
  },
  dotDone: {
    backgroundColor: Colors.accentDim,
  },
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ComposeScreen() {
  const { placeId: placeIdParam } = useLocalSearchParams<{ placeId?: string }>();
  const router = useRouter();
  const { t, locale, isRTL } = useI18n();

  // Individual selectors to avoid infinite re-renders in React 19
  const storePlaceParam = useComposeStore((s) => s.place);
  const rating = useComposeStore((s) => s.rating);
  const body = useComposeStore((s) => s.body);
  const visitDate = useComposeStore((s) => s.visitDate);
  const photos = useComposeStore((s) => s.photos);
  const setPlace = useComposeStore((s) => s.setPlace);
  const setRating = useComposeStore((s) => s.setRating);
  const setBody = useComposeStore((s) => s.setBody);
  const setVisitDate = useComposeStore((s) => s.setVisitDate);
  const addPhoto = useComposeStore((s) => s.addPhoto);
  const removePhoto = useComposeStore((s) => s.removePhoto);
  const updatePhotoCaption = useComposeStore((s) => s.updatePhotoCaption);
  const reset = useComposeStore((s) => s.reset);

  // When we arrive with a placeId param, start at step 2; otherwise step 1
  const startStep = placeIdParam ? 2 : 1;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(startStep as 1 | 2 | 3 | 4);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Resolve active placeId: from query param or store
  const activePlaceId = placeIdParam ?? storePlaceParam?.id ?? null;

  const { data: fetchedPlace, isLoading: placeLoading } = useQuery({
    queryKey: ["place", activePlaceId],
    queryFn: () => getPlace(activePlaceId!),
    enabled: !!activePlaceId,
  });

  const activePlace: Place | null = fetchedPlace ?? storePlaceParam;

  const createReview = useCreateReview();

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const isDirty = rating !== null || body.trim().length > 0 || photos.length > 0;

  const handleClose = () => {
    if (isDirty) {
      Alert.alert(
        t("review.discardTitle" as any),
        t("review.discardMessage" as any),
        [
          { text: t("review.keepEditing" as any), style: "cancel" },
          {
            text: t("review.discardAction" as any),
            style: "destructive",
            onPress: () => { reset(); router.back(); },
          },
        ],
      );
    } else {
      reset();
      router.back();
    }
  };

  const goBack = () => {
    if (step === startStep) {
      handleClose();
    } else {
      setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
    }
  };

  const goNext = () => {
    if (step === 2 && rating === null) {
      Alert.alert("", t("review.ratingRequired" as any));
      return;
    }
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!activePlaceId || rating === null || createReview.isPending) return;
    setSubmitError("");
    try {
      await createReview.mutateAsync({
        review: {
          place_id: activePlaceId,
          body: body.trim() || undefined,
          rating,
          visit_date: visitDate ?? undefined,
        },
        photos,
      });
      setSubmitSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reset();
      router.replace(`/place/${activePlaceId}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : t("common.error" as any));
    }
  }, [activePlaceId, rating, body, visitDate, photos, createReview, reset, router, t]);

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const totalSteps = startStep === 1 ? 4 : 3;
  const displayStep = step - startStep + 1; // 1-indexed relative to start

  const stepTitles: Record<number, string> = {
    1: t("review.stepPlace" as any),
    2: t("review.stepRating" as any),
    3: t("review.stepText" as any),
    4: t("review.stepPhotos" as any),
  };

  const placeEmoji = activePlace
    ? (CUISINE_OPTIONS.find((c) => activePlace.cuisine_tags.includes(c.tag))?.emoji ?? "🍽️")
    : "🍽️";
  const placeName = activePlace
    ? (locale === "ar" && activePlace.name_ar ? activePlace.name_ar : activePlace.name_en)
    : "…";

  const isLastStep = step === 4;
  const canProceed = step !== 2 || rating !== null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowRTL]}>
        <TouchableOpacity onPress={goBack} style={styles.iconBtn}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={22}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text size="sm" weight="semibold" style={styles.stepTitle}>
            {stepTitles[step]}
          </Text>
          <StepDots total={totalSteps} current={displayStep} />
        </View>

        {step < 4 ? (
          <Button
            label={t("review.nextButton" as any)}
            size="sm"
            variant="outline"
            onPress={goNext}
            disabled={!canProceed}
          />
        ) : (
          <Button
            label={t("review.postButton" as any)}
            size="sm"
            onPress={handleSubmit}
            disabled={rating === null || createReview.isPending}
            loading={createReview.isPending}
          />
        )}
      </View>

      {/* Submit feedback */}
      {submitSuccess && (
        <View style={styles.feedbackBanner}>
          <Text size="sm" style={styles.feedbackSuccess}>Review posted! ✓</Text>
        </View>
      )}
      {submitError.length > 0 && (
        <View style={styles.feedbackBanner}>
          <Text size="sm" style={styles.feedbackError}>{submitError}</Text>
        </View>
      )}

      {/* Place summary row (steps 2-4) */}
      {step >= 2 && (
        <View style={[styles.placeBar, isRTL && styles.rowRTL]}>
          {placeLoading ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <>
              <Text style={styles.placeEmoji}>{placeEmoji}</Text>
              <View style={{ flex: 1 }}>
                <Text size="sm" weight="semibold" numberOfLines={1}>
                  {placeName}
                </Text>
                {activePlace?.neighborhood ? (
                  <Text size="xs" muted>{activePlace.neighborhood}</Text>
                ) : null}
              </View>
            </>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ---- STEP 1: Place search ---- */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <PlaceSearchInput
              onSelect={(place) => {
                setPlace(place);
                setStep(2);
              }}
            />
          </View>
        )}

        {/* ---- STEP 2: Rating ---- */}
        {step === 2 && (
          <View style={styles.centeredStep}>
            <RatingPicker value={rating} onChange={setRating} />
            {rating === null && (
              <Text size="xs" muted style={styles.hint}>
                {t("review.ratingRequired" as any)}
              </Text>
            )}
          </View>
        )}

        {/* ---- STEP 3: Text + date ---- */}
        {step === 3 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              style={[
                styles.bodyInput,
                isRTL && styles.bodyInputRTL,
              ]}
              placeholder={t("review.placeholder" as any)}
              placeholderTextColor={Colors.textMuted}
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={5000}
              textAlignVertical="top"
              textAlign={isRTL ? "right" : "left"}
              autoFocus
            />
            <Text size="xs" muted style={[styles.charCount, isRTL && styles.charCountRTL]}>
              {body.length}/5000
            </Text>

            <View style={styles.divider} />

            {/* Visit date */}
            <Text size="sm" weight="semibold" secondary style={styles.sectionLabel}>
              {t("review.visitDate" as any).toUpperCase()}
            </Text>
            <View style={[styles.dateRow, isRTL && styles.rowRTL]}>
              {visitDate ? (
                <View style={[styles.dateChip, isRTL && styles.rowRTL]}>
                  <Text size="sm">{format(new Date(visitDate), "d MMM yyyy")}</Text>
                  <TouchableOpacity onPress={() => setVisitDate(null)} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.dateBtn, isRTL && styles.rowRTL]}
                  onPress={() => setVisitDate(format(new Date(), "yyyy-MM-dd"))}
                >
                  <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                  <Text size="sm" secondary style={{ marginStart: Spacing.xs }}>
                    {t("review.setVisitDate" as any)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ height: Spacing["3xl"] }} />
          </ScrollView>
        )}

        {/* ---- STEP 4: Photos ---- */}
        {step === 4 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <PhotoAttacher
              photos={photos}
              onAdd={addPhoto}
              onRemove={removePhoto}
              onCaptionChange={updatePhotoCaption}
              maxPhotos={3}
            />
            <View style={{ height: Spacing["3xl"] }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  rowRTL: { flexDirection: "row-reverse" },
  iconBtn: { padding: Spacing.xs },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  stepTitle: {},

  placeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  placeEmoji: { fontSize: 24 },

  stepContainer: { flex: 1, padding: Spacing.base },

  centeredStep: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
  },
  hint: { textAlign: "center", marginTop: Spacing.xs },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.md },

  bodyInput: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    padding: Spacing.sm,
    minHeight: 140,
    lineHeight: 22,
  },
  bodyInputRTL: { textAlign: "right" },
  charCount: { textAlign: "right" },
  charCountRTL: { textAlign: "left" },
  divider: { height: 1, backgroundColor: Colors.border },
  sectionLabel: { letterSpacing: 0.8 },

  dateRow: { flexDirection: "row" },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.accentGold,
    backgroundColor: Colors.accentGoldBg,
  },
  feedbackBanner: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  feedbackSuccess: { color: "#4CAF50", textAlign: "center" },
  feedbackError: { color: "#F44336", textAlign: "center" },

  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
});
