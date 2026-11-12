<template>
    <div class="flex min-h-screen w-full min-w-0 flex-col justify-start sm:flex-row-reverse sm:justify-end" v-auto-animate>
        <main class="relative min-w-0 max-h-full max-w-full flex-grow max-sm:pb-14 p-0">
            <AppSearchToolbar />
            <div class="px-4 pb-8">
                <slot />
            </div>
        </main>
        <NavBar class="nav-sticky-mobile" />
    </div>
</template>
