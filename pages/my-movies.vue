<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

await navigateTo("/lists/favorites", { replace: true });
</script>
