/*import { test } from '@playwright/test';
import { edicion } from '@data/tareoData';
import { LoginPage, TareoPage } from '@pages';
/*
Comando para que se pueda ejecutar a tal hora determinada, terminal powershell
while ((Get-Date -Format "HH:mm") -ne "16:17") { Start-Sleep -Seconds 10 }; node node_modules/@playwright/test/cli.js test tests/tareo/registra-marca-manual.spec.ts --project=chromium --headed
*/
/*
comando para solo ejecutarla en termina, cmd
npx playwright test tests/tareo/registra-marca-manual.spec.ts --ui

*/


/*

for (const [index, item] of edicion.entries()) {
  test(`Marca manual de ${item.correo}`, async ({ page }) => {
    test.setTimeout(60000);

    const loginPage = new LoginPage(page);
    const tareoPage = new TareoPage(page);

    // 1. Iniciar Sesión
    await loginPage.navegar();
    await loginPage.iniciarSesion(item.correo, item.password);

    //  esta funcion sirve parasperar a que la página cargue completamente tras el login
    await tareoPage.btnPausar.waitFor({ state: 'visible', timeout: 15000 });
    
    // Si la acción requiere estar dentro del módulo Tareo, navega primero:
    // await tareoPage.navegarModulo(); 

    // 2. usar la funcion creada en tareoPage
    const resultado = await tareoPage.gestionarBotonCronometro();

    if (resultado === 'boton deshabilitado') {
      console.log(`El proceso terminó para ${item.correo}: El botón se encuentra deshabilitado.`);
    } else {
      console.log(resultado);
    }
  });
}*/

import { test } from '@playwright/test';
import { tareo } from '@data/tareoData';
import { LoginPage, TareoPage } from '@pages';

/**
 * Espera hasta que el reloj alcance o supere la hora objetivo ("HH:mm").
 */
async function esperarHastaHora(horaObjetivo: string): Promise<void> {
    console.log(` Evaluando tiempo de espera para las: ${horaObjetivo}...`);

    while (true) {
        const ahora = new Date();
        const [horaObj, minObj] = horaObjetivo.split(':').map(Number);
        
        const fechaObjetivo = new Date();
        fechaObjetivo.setHours(horaObj, minObj, 0, 0);

        // Si la hora programada ya pasó para el día de hoy, continuar de inmediato
        if (ahora >= fechaObjetivo) {
            console.log(`La hora (${horaObjetivo}) ya se alcanzó o se superó. Continuando...`);
            break;
        }

        const horaActualStr = ahora.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });

        console.log(`[${horaActualStr}] Esperando a las ${horaObjetivo}...`);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Chequea cada 10 seg
    }
}

// Desactivar ejecución en paralelo para este archivo
test.describe.configure({ mode: 'serial' });

for (const [index, item] of tareo.entries()) {
    test(`[${index + 1}/${tareo.length}] Marca manual de ${item.correo}`, async ({ page }) => {
        // Desactiva el timeout del test para permitir esperas largas entre horarios
        test.setTimeout(0); 

        // 1. Espera programada antes de abrir navegador / iniciar sesión
        if (item.horaEjecucion) {
            await esperarHastaHora(item.horaEjecucion);
        }

        const loginPage = new LoginPage(page);
        const tareoPage = new TareoPage(page);

        // 2. Iniciar Sesión
        console.log(`Iniciando proceso para: ${item.correo}`);
        await loginPage.navegar();
        await loginPage.iniciarSesion(item.correo, item.password);

        // 3. Confirmar carga de interfaz
        await tareoPage.btnPausar.waitFor({ state: 'visible', timeout: 30000 });

        // 4. Ejecutar acción del cronómetro
        const resultado = await tareoPage.gestionarBotonCronometro();

        if (resultado === 'boton deshabilitado') {
            console.warn(`El proceso terminó para ${item.correo}: Botón deshabilitado.`);
        } else {
            console.log(` ${resultado}`);
        }
    });
}