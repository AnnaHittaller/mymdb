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
		"./error.vue",
		"./app/spa-loading-template.html",
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
				pumpkin: {
					50: "#fff9ec",
					100: "#fff2d3",
					200: "#ffe1a5",
					300: "#ffca6d",
					400: "#ffa732",
					500: "#ff8c0a",
					600: "#ff7300",
					700: "#cc5302",
					800: "#a1400b",
					900: "#82370c",
					950: "#461904",
				},
				mauve: {
					50: "#fcf6fe",
					100: "#f7ebfc",
					200: "#efdbf9",
					300: "#e1baf2",
					400: "#d296ea",
					500: "#bf6ddf",
					600: "#ad4ecf",
					700: "#953cb4",
					800: "#7d3594",
					900: "#662c77",
					950: "#471556",
				},
				periwinkle: {
					50: "#f0f2fd",
					100: "#e4e8fb",
					200: "#ced4f7",
					300: "#bac1f2",
					400: "#9195e8",
					500: "#7976de",
					600: "#685bd0",
					700: "#594cb6",
					800: "#494093",
					900: "#3e3976",
					950: "#262145",
				},
				saffron: {
					50: "#fefce8",
					100: "#fdf7c4",
					200: "#fcec8c",
					300: "#f9da4b",
					400: "#f5c518",
					500: "#e5ad0d",
					600: "#c68508",
					700: "#9e5f0a",
					800: "#824b11",
					900: "#6f3e14",
					950: "#411f07",
				},
			},
			screens: {
				"3xl": "1800px",
			},
		},
	},
	plugins: [],
};
