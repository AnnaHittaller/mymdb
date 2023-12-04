/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{vue,js,ts}",
		"./components/**/*.{js,vue,ts}",
		"./layouts/**/*.vue",
		"./pages/**/*.vue",
		"./plugins/**/*.{js,ts}",
		"./nuxt.config.{js,ts}",
		"./app.vue",
	],
	theme: {
		extend: {
			colors: {
				mandy: {
					50: "#fef2f3",
					100: "#fde6e7",
					200: "#fbd0d5",
					300: "#f7aab2",
					400: "#f27a8a",
					500: "#ea546c",
					600: "#d5294d",
					700: "#b31d3f",
					800: "#961b3c",
					900: "#811a39",
					950: "#48091a",
				},
				dusk: {
					50: "#f2f7fb",
					100: "#e7f0f8",
					200: "#d3e2f2",
					300: "#b9cfe8",
					400: "#9cb6dd",
					500: "#839dd1",
					600: "#6a7fc1",
					700: "#6374ae",
					800: "#4a5989",
					900: "#414e6e",
					950: "#262c40",
				},
			},
		},
	},
	plugins: [],
};
 