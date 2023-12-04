<template>
    <Heading>About</Heading>
    <p>Welcome to your ultimate movie collection app, designed with one goal in mind: making your cinematic journey a
        breeze.
        <UIcon name="i-fluent-emoji-flat-popcorn" />
    </p>
    <p>Have you ever stumbled upon a must-watch movie recommendation only to forget it moments later? We get it! That's why
        our app is here to save the day. You can effortlessly create a personalized movie list, including all those films
        that piqued your interest. </p>
    <p>Feeling overwhelmed by your ever-growing 'Must-Watch' list? MyMDb’s got the solution! Simply hit the star, and the
        movie is on your radar for your next movie night. </p>
    <p>Life's too short to miss out on great movies, and MyMDb is here to ensure you don't. Let’s embark on a cinematic
        adventure where you'll never lose track of your favorite movies again.</p>
    <div class="flex items-center gap-1 my-8">
        <UIcon name="i-fe-github" class="text-primary text-2xl" />
        <span>Anna Hittaller</span>
        <span class="relative flex items-center">
            <span class="before:bg-primary pl-2 flex items-center">@ 2023</span>
        </span>
    </div>
</template>

<style scoped>
p {
    margin-bottom: .5rem;
    max-width: 600px;
    font-weight: 400;
}

span::before {
    content: "";
    display: inline-block;
    position: absolute;
    height: 80%;
    left: 0;
    width: .25rem;
   
}
</style>