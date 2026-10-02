export const aiPolicy = {
  title: 'Política de uso de IA',
  intro:
    'En este portfolio la IA asiste y nunca decide. Aplica a una demo los principios del borrador del Anexo 22 de las GMP europeas (IA en aplicaciones críticas) y de la guía GAMP de ISPE sobre IA.',
  sections: [
    {
      title: 'Dónde NO hay IA',
      items: [
        'Evaluación de reglas de Westgard, calibración, límites de detección, incertidumbre, reglas de firma y liberación.',
        'Todo eso es código determinista, con tests contra referencias publicadas (NIST, EURACHEM, Westgard) y una matriz de trazabilidad pública.',
      ],
    },
    {
      title: 'Dónde SÍ hay IA',
      items: [
        'Explicar por qué una corrida violó una regla y redactar un borrador de CAPA.',
        'La salida siempre se etiqueta como borrador y requiere aprobación humana.',
        'Al aprobar se registran en el audit trail el modelo, el hash del prompt, el hash del texto, quién aprobó y cuándo.',
      ],
    },
    {
      title: 'Modo sin conexión',
      items: [
        'Si el servidor no tiene credenciales de IA configuradas, o la IA falla, se usa un texto automático por reglas.',
        'Ese texto se etiqueta «sin IA» y queda registrado como modelo «offline-rules».',
      ],
    },
    {
      title: 'Datos',
      items: [
        'La demo no usa datos de pacientes reales.',
        'Al asistente solo se envían el analito, la corrida, las reglas, los valores y los z, validados y con tamaño limitado.',
        'Hay límite de pedidos por IP.',
      ],
    },
  ],
  refsTitle: 'Referencias',
  refs: [
    'EU GMP Anexo 22 «Artificial Intelligence», borrador para consulta (2025).',
    'ISPE GAMP® Guide: Artificial Intelligence (2025).',
    'FDA y EMA: principios de Good AI Practice para el desarrollo de medicamentos (2026).',
    'FDA: borrador de guía sobre credibilidad de modelos de IA por contexto de uso (2025).',
  ],
};
