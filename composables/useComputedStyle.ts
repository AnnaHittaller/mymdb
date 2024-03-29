import { computed } from 'vue';
import {useUiColorStore} from '@/stores/uiColorStore'

export const useComputedStyle = () => {

    const colorStore = useUiColorStore()
    
    const computedStyle = computed(() => {
        if (colorStore.uiColor) {
            let colorValue = '';
            switch (colorStore.uiColor) {
                case 'mandy':
                    colorValue = "#ea546c";
                    break;
                case 'dusk':
                    colorValue = "#839dd1";
                    break;
                case 'emerald':
                    colorValue = "#10b981";
                    break;
                case 'pumpkin':
                    colorValue = "#ff8c0a";
                    break;
                case 'mauve':
                    colorValue = "#bf6ddf";
                    break;
                case 'periwinkle':
                    colorValue = "#7976de";
                    break;
                case 'saffron':
                    colorValue = "#f5c518";
                    break;
                default:
                    colorValue = '';
            }
            return {
                '--computed-style': colorValue,
            };
        }
        return {}; // Return an empty object if the value is not yet available
    });

    return {
        computedStyle
    }
}
