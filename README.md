# Pub D2 — Web y carta digital

Web de demostración para Pub D2 (San Fernando, Cádiz). Proyecto comercial **no oficial** hasta su aprobación por el propietario.

## Objetivo
Sitio informativo, mobile-first, con portada visual, carta por categorías, horario actualizado y panel privado muy sencillo. Sin cuentas para visitantes, pedidos ni reservas.

## Horario habitual (Europe/Madrid)
- Lunes, martes y miércoles: sin apertura nueva.
- Jueves: 21:30–03:00 (viernes).
- Viernes: 21:30–04:00 (sábado).
- Sábado: 21:30–04:00 (domingo).
- Domingo: 21:30–03:00 (lunes).

**Las excepciones por fecha prevalecen sobre el horario habitual** y no alteran la programación semanal. Los turnos pueden cruzar medianoche.

## Páginas
- `/`: fotografía principal y logo, descripción breve, botones **Ver carta** y **Ver horarios**, menú hamburguesa, tarjetas fotográficas por categoría, contacto y reseñas Google.
- `/carta`: seis categorías visibles sin búsqueda y botón de carta completa.
- `/carta/[categoria]`: productos visibles con nombre y precio. Chupitos/cócteles con estrellas de 1 a 5.
- `/horarios`: horario habitual, hoy, apertura siguiente y excepciones.
- `/admin`: acceso privado; operaciones legibles y grandes para propietario sin experiencia técnica.

## Categorías
Chupitos · Cócteles · Cervezas · Cubatas · Refrescos · Vinos.

## Principios
- No presentar productos, precios, fotos genéricas ni testimonios de ejemplo como datos oficiales.
- No usar fotos individuales de bebidas por ahora; una imagen representativa por tarjeta de categoría.
- Botón para ocultar temporalmente bebidas agotadas; desaparecen de la web pública.
- Eliminar con confirmación; la alternativa por defecto es ocultar para conservar datos y valoraciones.
- El propietario puede cambiar en pocos clics horario habitual, cerrar un día, abrir un día normalmente cerrado, o adelantar/atrasar apertura/cierre en una fecha.
- El estado abierto/cerrado se calcula con zona horaria `Europe/Madrid`, incluso después de medianoche.
- Identidad visual: logo estrella D2 pendiente de vector original, negro/gris rockero, paredes beige/mostaza y barra de madera.
- El estilo de la referencia elegida por el usuario manda sobre decoraciones adicionales.
- Los accesos administrativos deben ser privados. Nunca usar claves secretas con prefijo NEXT_PUBLIC.
- Uso de datos de demostración claramente identificado mientras no exista autorización del local.

## Próximos pasos
1. Preparar sitio Next.js con base visual.
2. Conectar proyecto propio de Supabase (no reutilizar Soho Alternative).
3. Implementar RLS, acceso administrador, editor de productos, horarios y excepciones.
4. Votaciones sin login público con protección contra abuso y recuento correcto.
5. Pruebas de móvil, accesibilidad, horario nocturno y despliegue de vista previa.
