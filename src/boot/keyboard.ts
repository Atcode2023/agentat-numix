import { boot } from 'quasar/wrappers';
import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardInfo, KeyboardResize } from '@capacitor/keyboard';

export default boot(async () => {
    // Solo en plataforma nativa (no web pura)
    if (!Capacitor.isNativePlatform()) return;

    try {
        await Keyboard.setResizeMode({ mode: KeyboardResize.None });
    } catch (e) {
        console.warn('No se pudo establecer resize none', e);
    }

    const applyHeight = (info?: KeyboardInfo) => {
        document.body.classList.add('kb-open');
        if (info && typeof info.keyboardHeight === 'number') {
            document.body.style.setProperty('--kb-height', info.keyboardHeight + 'px');
        }
    };

    const hideHandler = () => {
        document.body.classList.remove('kb-open');
        document.body.style.removeProperty('--kb-height');
    };

    Keyboard.addListener('keyboardWillShow', applyHeight);
    Keyboard.addListener('keyboardDidShow', applyHeight); // fallback
    Keyboard.addListener('keyboardWillHide', hideHandler);
    Keyboard.addListener('keyboardDidHide', hideHandler);
});
