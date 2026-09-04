import { test } from '@playwright/test';
import { LoginPage, TesoreriaPage } from '@pages';
import { solicitudesReembolso } from '@data/tesoreriaData';

test.describe('Tesorería - Solicitudes de reembolso - Rechazo', () => {
  for (const datos of solicitudesReembolso) {
    test(`Rechazar y validar solicitud - ${datos.tipoSolicitud.trim()} - ${datos.motivo}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const tesoreria = new TesoreriaPage(page);

      // 1. Iniciar sesión y navegar al módulo Tesorería
      await loginPage.navegar();
      await loginPage.iniciarSesion(datos.correo, datos.password);
      await tesoreria.navegarATesoreria();

      // 2. Filtrar por rango de fechas
      await tesoreria.filtrarPorRangoFechas('1 de septiembre de 2026', '3 de septiembre de 2026');

      // 3. Rechazar la solicitud pendiente
      await tesoreria.rechazarSolicitud(
        'se rechaza por motivo de fuerza mayor',
        '10000'
      );

      // 4. Verificar presencia del estado RECHAZADO y validar que el monto no sea 'null'
      await tesoreria.validarMontoReembolsoSinNull('RECHAZADO');
    });
  }
});