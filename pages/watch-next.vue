<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

await navigateTo("/lists/watch-next", { replace: true });
</script>
