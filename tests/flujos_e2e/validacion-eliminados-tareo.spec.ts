import { test,expect } from '@playwright/test';
import { edicion } from '@data/tareoData';
import { LoginPage, TareoPage } from '@pages';
import { parseHoursToMinutes } from '../../utils/numberUtils';


for (const [index, item] of edicion.entries()) {
  test(`Eliminar tareo de ${item.correo}`, async ({ page }) => {
    test.setTimeout(60000);

    const loginPage = new LoginPage(page);
    const tareoPage = new TareoPage(page);
    const minutosAntes: number[] = [];
    
    // 1. Iniciar Sesión
    await loginPage.navegar();
    await loginPage.iniciarSesion(item.correo, item.password);

    // 2. Va al tareo, filtra por fecha y recupera los minutos antes de borrar
    await tareoPage.navegarModulo();
    await tareoPage.filtroCalendario(item.fechaInicio, item.fechaFin);
    for(const id_ of item.id!){
      const fila = await tareoPage.recuperarFila(id_);
      const tareo = await tareoPage.recuperarFechaYHora(fila);
      await tareoPage.abrirFormularioRegistro();
      await tareoPage.filtroCalendario(tareo.fecha);
      await minutosAntes.push(await tareoPage.obtenerMinutosDisponibles());
      await tareoPage.btnClose.first().click();
    }
    /*

    // 3. Eliminar actividad
    const validarEliminados = await tareoPage.eliminarTareo(item.id!);
    
    // 3. Valida que el tiempo se restaure correctamente
    await tareoPage.abrirFormularioRegistro();
    for(const [index, eliminado] of validarEliminados.entries()){
        await tareoPage.filtroCalendario(eliminado.fecha);
        const minutosEsperados = await tareoPage.obtenerMinutosDisponibles();
        const minutosRecuperados = minutosAntes[index] + parseHoursToMinutes(eliminado.horas);
        await expect(minutosRecuperados).toEqual(minutosEsperados);
    }*/

        // 1. Obtener IDs dinámicamente para leer minutos antes de borrar
        const idsDinamicos = await tareoPage.obtenerIdsVisiblesEnTabla();

            for (const id_ of idsDinamicos) {
              const fila = tareoPage.recuperarFila(id_);
              const tareo = await tareoPage.recuperarFechaYHora(fila);
              await tareoPage.abrirFormularioRegistro();
              await tareoPage.filtroCalendario(tareo.fecha);
              minutosAntes.push(await tareoPage.obtenerMinutosDisponibles());
              await tareoPage.btnClose.first().click();
}

                // 2. Eliminar sin enviarle IDs (los detectará solo en pantalla)
                  const validarEliminados = await tareoPage.eliminarTareo();


  });
}