<script setup>
definePageMeta({
    middleware: "auth"
})
</script>

<template>
    <div class="text-xl">
        <Heading>About MyMDb</Heading>
        <p>Welcome to your ultimate movie collection app, designed with one goal in mind: making your cinematic journey a
            breeze.
            <UIcon name="i-fluent-emoji-flat-popcorn" />
        </p>
        <div class="flex gap-4 items-start">
            <UIcon name="i-heroicons-list-bullet-20-solid" class="mt-1 text-primary shrink-0" />
            <p>Have you ever stumbled upon a must-watch movie recommendation only to forget it moments later? We get it!
                That's
                why
                our app is here to save the day. You can effortlessly create a personalized watchlist, to always remember
                all of those
                films
                that piqued your interest. </p>
        </div>
        <div class="flex gap-4 items-start">
            <UIcon name="i-heroicons-star" class="mt-1 text-primary shrink-0" />

            <p>Feeling overwhelmed by your ever-growing "I want to watch this next" list? MyMDb’s got the solution! Simply
                hit
                the star, and
                the
                movie is on your radar for your next movie night. </p>
        </div>
        <p class="mt-8">Life's too short to miss out on great movies, and MyMDb is here to ensure you don't. Let’s start
            a cinematic
            adventure where you'll never lose track of your favorite movies again. 🍿</p>
        <div class="flex items-center gap-2 mt-16 leading-6 justify-start">
            <UIcon name="i-fe-github" class="text-primary text-2xl" />
            <span class="text-xl leading-6">Anna Hittaller @ 2024</span>
        </div>
        <div class="text-sm mt-24">
            <h4>Acknowledgement:</h4>
            <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
    </div>
</template>

<style scoped>
p {
    margin-bottom: .5rem;
    max-width: 600px;
    font-weight: 400;
}
</style>