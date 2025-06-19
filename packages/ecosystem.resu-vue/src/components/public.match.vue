<template>
	<slot
		v-bind="props.result"
		:name="(slotNameByMatchResult as SlotNames)"
	></slot>
</template>

<script setup lang="ts" generic="Result extends Result.Any">
import { computed } from 'vue'
import type { Result } from '@wambata/resu'

// Define component params:
import type { MatchTypes } from './public.match-types'
const props = defineProps<MatchTypes.Props<Result>>()
const slots = defineSlots<MatchTypes.Slots<Result>>()

// All slot names:
type SlotNames = keyof typeof slots

// Determine the correct slot name for rendering:
const slotNameByMatchResult = computed((): SlotNames => {
	const { status, tag } = props.result

	// If `tag` is `null`:
	if (!tag) return status in slots ? status as SlotNames : 'default'

	// Pattern search:
	const pattern = `${status}:${tag}`
	return pattern in slots ? pattern as SlotNames : 'default'
})
</script>