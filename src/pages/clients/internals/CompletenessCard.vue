<script setup>
import { computed } from 'vue'

const props = defineProps({
  sections: Array, // [{ label, filled, total }]
  filled: Number,
  total: Number,
})

const pct = computed(() =>
  props.total > 0 ? Math.round((props.filled / props.total) * 100) : 0,
)

const statusLabel = computed(() => {
  const p = pct.value
  if (p === 0) return 'Not started'
  if (p < 34) return 'Getting started'
  if (p < 67) return 'Making progress'
  if (p < 100) return 'Almost there'
  return 'Complete'
})

const RADIUS = 28
const CIRC = 2 * Math.PI * RADIUS

function sectionPct(s) {
  return s.total > 0 ? Math.round((s.filled / s.total) * 100) : 0
}
</script>

<template>
  <div class="completeness-card">
    <h2 class="card-title">Referral completeness</h2>

    <div class="summary-row">
      <div class="donut">
        <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
          <circle
            cx="36"
            cy="36"
            :r="RADIUS"
            fill="none"
            class="donut-track"
            stroke-width="8"
          />
          <circle
            cx="36"
            cy="36"
            :r="RADIUS"
            fill="none"
            class="donut-fill"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="`${(pct / 100) * CIRC} ${CIRC}`"
            transform="rotate(-90 36 36)"
          />
        </svg>
        <span class="donut-pct">{{ pct }}%</span>
      </div>
      <div class="summary-text">
        <span class="status-label">{{ statusLabel }}</span>
        <span class="field-count">{{ filled }} of {{ total }} fields</span>
      </div>
    </div>

    <div class="section-list">
      <div v-for="s in sections" :key="s.label" class="section-item">
        <div class="section-row">
          <span class="section-name">{{ s.label }}</span>
          <span class="section-pct">{{ sectionPct(s) }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: sectionPct(s) + '%' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.completeness-card {
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-3);
}

.summary-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.donut {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut svg {
  position: absolute;
  inset: 0;
}

.donut-track {
  stroke: var(--color-bg-muted);
}

.donut-fill {
  stroke: var(--color-accent);
  transition: stroke-dasharray 0.4s ease;
}

.donut-pct {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  position: relative;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.status-label {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
}

.field-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.section-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.section-pct {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.progress-track {
  height: var(--space-2);
  background: var(--color-bg-muted);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 100px;
  transition: width 0.4s ease;
}
</style>
