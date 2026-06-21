import { useTheme as useNextTheme } from 'next-themes';
import { userSessionState } from './useClientSessionSnapshot';
export default function useTheme() {
    const { theme, setTheme: setNextTheme } = useNextTheme();
    const setTheme = async (theme) => {
        setNextTheme(theme);
        userSessionState.session.settings.theme = theme;
    };
    return { theme, setTheme };
}
//# sourceMappingURL=useTheme.js.map