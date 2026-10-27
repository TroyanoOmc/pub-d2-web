# Guía de implementación para agentes — Pub D2

Este repositorio corresponde a una demostración comercial de Pub D2. **No declarar que la página es oficial** sin aceptación del titular.

## Fuente de verdad de requisitos
Revisar `README.md`. Si cambia un requisito, actualizar documentación y pruebas.

## Funcionalidades irrenunciables
- Inicio: logo/foto, breve descripción, dos botones visibles sin scroll en móvil: **Ver carta** y **Ver horarios**.
- Menú hamburguesa tipo índice.
- Seis categorías en tarjetas visuales con una imagen representativa por categoría, sin buscador.
- Carta: nombre y precio; fotos individuales opcionales solo si el propietario las aprueba; rating 1–5 para chupitos y cócteles.
- Horarios base en Europe/Madrid con cierre tras medianoche, alteraciones por fecha y regreso automático al patrón semanal.
- Panel simple del dueño: horarios habituales, cerrar/abrir fecha excepcional, ampliar/reducir horas, añadir/editar/ocultar/mostrar/eliminar bebidas; galería mínima.
- Productos ocultos no aparecen públicamente en ningún listado ni resultado.
- Sin cuentas de cliente. Reseñas Google por enlace verificado.

## Seguridad
- Credenciales como variables de entorno; nunca publicar service_role.
- Admin protegido con Auth y autorización explícita (no basta con sesión iniciada).
- Supabase RLS sobre todas las tablas públicas; validación server-side de mutaciones.
- Las valoraciones anónimas requieren rate limits, prevención razonable de voto repetido y almacenamiento sin exponer datos de visitantes.
- No inventar valoraciones, precios, horarios excepcionales ni enlaces de reseñas.

## Implementación
Separar datos de demostración y los oficiales. Los datos provisionales deben verse como provisionales y no ser indexables como información oficial. Preparar tests de lógica horaria: domingo que continúa el lunes 00:00–03:00; sábado al domingo 04:00; excepciones en días cerrados; cambio de horario, cambio de año y horario de verano.
