<template>
    <div class="flex flex-col sm:flex-row-reverse justify-start min-h-screen">

        <Header class="sm:hidden pt-8" />
        <main class="p-4 flex-grow max-h-full relative">
            <slot />
        </main>
        <Footer class="" />

    </div>
</template>