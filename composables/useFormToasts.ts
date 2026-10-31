type FormToastState = {
	error?: string
	success: boolean
}

export const FORM_ERROR_TOAST_DURATION = 10_000
export const FORM_SUCCESS_TOAST_DURATION = 5_000

export function useFormToasts(
	state: FormToastState,
	options: { successTitle: string; successDuration?: number },
) {
	const toast = useToast()
	const successDuration = options.successDuration ?? FORM_SUCCESS_TOAST_DURATION

	function clearFormToasts() {
		toast.clear()
		state.error = undefined
		state.success = false
	}

	onBeforeRouteLeave(() => {
		clearFormToasts()
	})

	watch(
		() => state.error,
		(error) => {
			if (!error) return
			toast.add({
				id: "form-error",
				title: "Error:",
				description: error,
				icon: "i-heroicons-exclamation-circle",
				color: "error",
				duration: FORM_ERROR_TOAST_DURATION,
				progress: true,
				"onUpdate:open"(open: boolean) {
					if (!open) state.error = undefined
				},
			})
		},
	)

	watch(
		() => state.success,
		(success) => {
			if (!success) return
			toast.add({
				id: "form-success",
				title: options.successTitle,
				icon: "i-heroicons-check-circle",
				color: "success",
				duration: successDuration,
				progress: true,
				"onUpdate:open"(open: boolean) {
					if (!open) state.success = false
				},
			})
		},
	)

	return { clearFormToasts }
}
