# Canalla Inglés

10 minutos al día de inglés práctico para trabajar en un taller de motores de avión. Nivel A1–A2.

**Abrir la app:** https://bontay2003.github.io/canalla-ingles/

## Cómo funciona

- Tarjetas de cuatro tipos: palabras, preposiciones (rellenar el hueco), verbos y frases del taller.
- Dices la respuesta en voz alta, giras la tarjeta y marcas si la has acertado (+1) o fallado (−1).
- El día se cierra al llegar a 10 puntos. La dificultad sube con los puntos: fácil, medio, difícil.
- Las falladas vuelven al día siguiente; las acertadas se repasan cada vez más espaciadas.
- Racha de días seguidos: si te saltas un día, vuelve a 0.
- Chuleta con verbos y preposiciones siempre a mano.

## Instalarla en el móvil

- **Android (Chrome):** pulsa «Descargar app», o menú ⋮ → «Instalar aplicación».
- **iPhone (Safari):** botón Compartir → «Añadir a pantalla de inicio».

Una vez instalada funciona sin conexión. El progreso se guarda en el propio móvil.

## Desarrollo

```
cd C:\Users\bonta\Proyectos\canalla-ingles
claude
```

- `app/index.html`: la app (también se publica como Artifact de Claude).
- `node scripts/build-pwa.mjs`: genera la versión pública en `docs/` (GitHub Pages).
- `scripts/make-icons.ps1`: genera los iconos PNG en `docs/icons/` (Windows).
