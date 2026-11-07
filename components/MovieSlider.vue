<script setup>
const props = defineProps({ movies: Array })
const { movies } = toRefs(props)

const scroller = ref(null)
const canScroll = ref(false)

function updateOverflow() {
  const el = scroller.value
  canScroll.value = !!el && el.scrollWidth > el.clientWidth + 1
}

function scrollByDir(direction) {
  const el = scroller.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
}

watch(() => movies.value?.length, () => nextTick(updateOverflow))

onMounted(() => {
  updateOverflow()
  window.addEventListener('resize', updateOverflow)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateOverflow)
})
</script>

<template>
  <div class="relative px-6">
    <div ref="scroller" class="movie-row scrollbar-none flex snap-x snap-mandatory gap-2.5 overflow-x-auto">
      <div v-for="movie in movies" :key="movie.id" class="w-[11rem] shrink-0 snap-start">
        <MovieCard :movie="movie" />
      </div>
    </div>
    <button v-show="canScroll" type="button" aria-label="Previous movies"
      class="absolute left-0 top-[40%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-fg-on-accent transition hover:scale-110"
      @click="scrollByDir(-1)">
      <UIcon name="i-heroicons-arrow-left-circle-20-solid" class="text-2xl" />
    </button>
    <button v-show="canScroll" type="button" aria-label="Next movies"
      class="absolute right-2 top-[40%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-fg-on-accent transition hover:scale-110"
      @click="scrollByDir(1)">
      <UIcon name="i-heroicons-arrow-right-circle-20-solid" class="text-2xl" />
    </button>
  </div>
</template>

