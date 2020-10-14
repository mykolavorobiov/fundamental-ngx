export const INDICATOR_PREFIX = 'fd-rating-indicator';

export const INDICATOR_CLASSES = {
    halves: `${INDICATOR_PREFIX}--half-star`,
    icon: `${INDICATOR_PREFIX}--icon`,
    hideDynamicText: `${INDICATOR_PREFIX}--hide-dynamic-text`
};

export const INDICATOR_RANGE = {
    min: 3,
    max: 7
};

export type RatingIndicatorSize = 'xs' | 'sm' | 'md' | 'lg' | 'cozy' | 'compact' | 'condensed';
