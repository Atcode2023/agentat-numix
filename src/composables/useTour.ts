import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const commonConfig = {
    showProgress: true,
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Listo',
    stageRadius: 6,
    allowClose: true,
    smoothScroll: true,
    popoverClass: 'tour-popover-dark'
} as const;

export function useTour() {
    const startHomeTour = () => {
        const d = driver({
            ...commonConfig,
            steps: [
                {
                    element: '#btn-cycle-rate',
                    popover: {
                        title: 'Moneda Base',
                        description: 'Cambia entre las tasas disponibles o tus favoritas.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '#btn-settings',
                    popover: {
                        title: 'Configuración',
                        description: 'Administra tasas favoritas y cifras rápidas aquí.',
                        side: 'bottom',
                        align: 'end'
                    }
                },
                {
                    element: '#toggle-mode',
                    popover: {
                        title: 'Modo de Entrada',
                        description: 'Decide si introduces Bs o la moneda extranjera.',
                        side: 'bottom',
                        align: 'center'
                    }
                },
                {
                    element: '#field-amount .q-field__control',
                    popover: {
                        title: 'Monto',
                        description: 'Escribe o pulsa un monto rápido para convertir al instante.',
                        side: 'top',
                        align: 'start'
                    }
                },
                {
                    element: '#picker-history',
                    popover: {
                        title: 'Fecha Histórica',
                        description: 'Selecciona una fecha anterior para usar su tasa.',
                        side: 'top',
                        align: 'start'
                    }
                },
                {
                    element: '#btn-share',
                    popover: {
                        title: 'Compartir',
                        description: 'Envía la conversión con o sin tus datos de pago.',
                        side: 'top',
                        align: 'center'
                    }
                }
            ]
        });
        d.drive();
    };

    // (nested export removed)

    const startGlobalTour = (navigateToProfiles?: () => Promise<void> | void) => {
        const d = driver({
            ...commonConfig,
            steps: [
                { element: '#btn-cycle-rate', popover: { title: 'Moneda Base', description: 'Cambia la tasa usada para convertir.', side: 'bottom', align: 'start' } },
                { element: '#btn-settings', popover: { title: 'Configuración', description: 'Gestiona favoritas y montos rápidos.', side: 'bottom', align: 'end' } },
                { element: '#toggle-mode', popover: { title: 'Modo', description: 'Define si introduces Bs o moneda extranjera.', side: 'bottom', align: 'center' } },
                { element: '#field-amount .q-field__control', popover: { title: 'Monto', description: 'Ingresa o selecciona un monto rápido.', side: 'top', align: 'start' } },
                { element: '#picker-history', popover: { title: 'Histórico', description: 'Selecciona una fecha anterior para usar su tasa.', side: 'top', align: 'start' } },
                { element: '#btn-share', popover: { title: 'Compartir', description: 'Abre opciones de compartir conversión y datos.', side: 'top', align: 'center' } },
            ],
            onDestroyed: async () => {
                if (navigateToProfiles) {
                    await navigateToProfiles();
                    setTimeout(() => startProfilesTour(), 200);
                }
            }
        });
        d.drive();
    };
    const startProfilesTour = () => {
        const d = driver({
            ...commonConfig,
            steps: [
                {
                    element: '#btn-create-payment',
                    popover: {
                        title: 'Crear Método',
                        description: 'Haz clic aquí para registrar un nuevo método de pago.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '#card-first-payment',
                    popover: {
                        title: 'Tarjeta de Método',
                        description: 'Cada tarjeta muestra datos del método. Marca uno como principal.',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '#btn-set-main',
                    popover: {
                        title: 'Principal',
                        description: 'Establece un método como principal para usarlo al compartir.',
                        side: 'top',
                        align: 'center'
                    }
                }
            ]
        });
        d.drive();
    };

    return { startProfilesTour, startHomeTour, startGlobalTour };
}
