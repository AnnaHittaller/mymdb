<template>
    <div class="flex flex-col sm:flex-row-reverse justify-end min-h-screen">
        <Header class="sm:hidden pt-8" />
        <div class="p-4 flex-grow">
            <slot  />
        </div>
        <Footer class="sm:min-h-screen " />
    </div>
</template>