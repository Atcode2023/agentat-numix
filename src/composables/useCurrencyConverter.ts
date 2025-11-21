import { ref } from 'vue'
import { formatNumber } from 'src/utils/format'

export function useCurrencyConverter() {
    const dollarValue = ref('1.00')
    const bsValue = ref('30.00')
    const exchangeRate = ref(30)
    const lastUpdate = ref('12-06-2023 01:00 PM')
    const rateChange = ref(0.32)
    const activeRate = ref('paralelo')

    const handleDollarChange = (value: string) => {
        dollarValue.value = value
        const numValue = Number.parseFloat(value) || 0
        bsValue.value = formatNumber(numValue * exchangeRate.value)
    }

    const handleBsChange = (value: string) => {
        bsValue.value = value
        const numValue = Number.parseFloat(value) || 0
        dollarValue.value = formatNumber(numValue / exchangeRate.value)
    }

    const refreshRate = () => {
        // Simular actualización de tasa
        const newRate = 30 + Math.random() * 2
        const oldRate = exchangeRate.value
        exchangeRate.value = newRate
        lastUpdate.value = new Date().toLocaleString()
        rateChange.value = ((newRate - oldRate) / oldRate) * 100

        // Actualizar valores
        const numValue = Number.parseFloat(dollarValue.value) || 0
        bsValue.value = formatNumber(numValue * newRate)
    }

    const setActiveRate = (rate: string) => {
        activeRate.value = rate

        // Actualizar tasa según la selección
        let newRate = exchangeRate.value

        switch (rate) {
            case 'paralelo':
                newRate = 30.75
                break
            case 'dolar-bcv':
                newRate = 29.8
                break
            case 'promedio':
                newRate = 30.25
                break
            case 'personalizada':
                newRate = 32.5
                break
        }

        const oldRate = exchangeRate.value
        exchangeRate.value = newRate
        rateChange.value = ((newRate - oldRate) / oldRate) * 100

        // Actualizar valores
        const numValue = Number.parseFloat(dollarValue.value) || 0
        bsValue.value = formatNumber(numValue * newRate)
    }

    return {
        dollarValue,
        bsValue,
        exchangeRate,
        lastUpdate,
        rateChange,
        activeRate,
        handleDollarChange,
        handleBsChange,
        refreshRate,
        setActiveRate,
    }
}
