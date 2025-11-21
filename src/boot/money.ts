import { Money3Component, Money3Directive } from 'v-money3';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
    // Registra el componente globalmente
    app.component('money', Money3Component);

    // Registra la directiva globalmente
    app.directive('money3', Money3Directive);
});
