
<template>
    <div class="relative">
        <h2 class="before:bg-primary pl-2">
            <slot/>
        </h2>
    </div>
</template>

<style scoped>
h2::before {
    content: "";
    display: inline-block;
    position: absolute;
    height: 100%;
    left: 0;
    width: 4px;
}
</style>