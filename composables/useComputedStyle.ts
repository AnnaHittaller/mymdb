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
