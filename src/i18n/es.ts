/** Every text shown in the app. Spanish (Argentina). */
export const es = {
  appName: 'Circuito',
  picker: {
    label: 'Puntos de control',
    option: (points: number) => `${points} puntos`,
  },
  schematic: {
    label: (title: string) => `Esquema: ${title}`,
    phase: 'Fase (L)',
    neutral: 'Neutro (N)',
    lamp: 'Lámpara',
    tapToChange: (name: string, state: string) => `${name}, ${state}. Tocar para cambiar.`,
  },
  device: {
    combinacion: (side: string) => `Posición ${side.toUpperCase()}`,
    cruce: (position: number) => (position === 0 ? 'Directo' : 'Cruzado'),
  },
  message: {
    moved: (name: string, state: string) =>
      `${name}: ${state.charAt(0).toLowerCase()}${state.slice(1)}.`,
    closed: 'Circuito cerrado: la corriente va de la fase a la lámpara y vuelve por el neutro.',
    open: (device: string, via: string, setTo: string) =>
      `La fase llega a la ${device} por el ${via}, pero la llave está en ${setTo.toUpperCase()}. Circuito abierto.`,
    stillLive: (via: string) => `Ojo: el ${via} sigue con tensión.`,
    openUnknown: 'Circuito abierto.',
    hint: 'Tocá una llave para cambiarla.',
  },
  status: {
    lampOn: 'Lámpara encendida',
    lampOff: 'Lámpara apagada',
    reset: 'Reiniciar',
    demo: 'Demo',
    stopDemo: 'Parar',
  },
  legend: {
    showTension: 'Ver tensión',
    live: 'Con tensión',
    current: 'Corriente',
  },
  settings: {
    open: 'Ajustes',
    title: 'Ajustes',
    close: 'Cerrar',
    theme: 'Tema',
    themes: { night: 'Noche', day: 'Día' },
    toggleTheme: (next: string) => `Cambiar a tema ${next.toLowerCase()}`,
    textSize: 'Tamaño de letra',
    textSizes: { normal: 'Normal', large: 'Grande', huge: 'Muy grande' },
    tension: 'Cables con tensión',
    tensionOptions: { show: 'Mostrar', hide: 'Ocultar' },
    wireColors: 'Colores de los cables',
    roles: { phase: 'Fase', neutral: 'Neutro', return: 'Retorno', bridge: 'Puentes' },
    reset: 'Volver a los valores de fábrica',
  },
  colors: {
    rojo: 'Rojo',
    marron: 'Marrón',
    naranja: 'Naranja',
    amarillo: 'Amarillo',
    verde: 'Verde',
    celeste: 'Celeste',
    azul: 'Azul',
    violeta: 'Violeta',
    gris: 'Gris',
  },
} as const;
