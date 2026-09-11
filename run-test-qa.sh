#!/bin/bash


# Configura la hora exacta de inicio en formato HH:MM (24 horas)
HORA_OBJETIVO="15:53"

echo "Esperando a que el reloj marque las $HORA_OBJETIVO para lanzar la suite..."

while [ "$(date +%H:%M)" != "$HORA_OBJETIVO" ]; do
    sleep 10
done

echo "¡Hora alcanzada ($HORA_OBJETIVO)! Lanzando Playwright..."
echo "--------------------------------------------------"

npx playwright test tests/tareo/registra-marca-manual.spec.ts \
  --project=chromium \
  --headed \
  --workers=1

echo "--------------------------------------------------"
echo "Generando y abriendo el reporte visual HTML..."
npx playwright show-report