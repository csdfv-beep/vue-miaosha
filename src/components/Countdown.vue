<template>
  <span>{{ displayTime }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps<{
  targetTime: string
}>()

const emit = defineEmits<{
  finish: []
}>()

const now = ref(Date.now())
let timer: number | null = null

const targetTimestamp = computed(() => new Date(props.targetTime).getTime())

const diffSeconds = computed(() => {
  const diff = (targetTimestamp.value - now.value) / 1000
  return Math.max(0, Math.floor(diff))
})

const displayTime = computed(() => {
  const seconds = diffSeconds.value
  if (seconds <= 0) return '00:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const updateTime = () => {
  now.value = Date.now()
  if (diffSeconds.value <= 0) {
    emit('finish')
    stopTimer()
  }
}

const startTimer = () => {
  stopTimer()
  timer = window.setInterval(updateTime, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(startTimer)
onUnmounted(stopTimer)
watch(() => props.targetTime, startTimer)
</script>