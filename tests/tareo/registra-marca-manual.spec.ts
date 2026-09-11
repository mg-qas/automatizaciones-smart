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

// para poder ejecutarlo tienes que lanzar el siguiente comando en cmd
// npx playwright test tests/tareo/registra-marca-manual.spec.ts --project=chromium --headed


/*
import { test } from '@playwright/test';
import { tareo } from '@data/tareoData';
import { LoginPage, TareoPage } from '@pages';

/**
 * Espera hasta que el reloj alcance o supere la hora objetivo ("HH:mm").
 */

/*
async function esperarHastaHora(horaObjetivo: string): Promise<void> {
    const ahora = new Date();
    const [horaObj, minObj] = horaObjetivo.split(':').map(Number);
    
    const fechaObjetivo = new Date();
    fechaObjetivo.setHours(horaObj, minObj, 0, 0);

    // Si la hora objetivo es menor que la hora actual, programar para el DÍA SIGUIENTE
    if (fechaObjetivo <= ahora) {
        fechaObjetivo.setDate(fechaObjetivo.getDate() + 1);
    }

    const formatoFecha = (d: Date) => 
        `${d.toLocaleDateString('es-PE')} ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

    console.log(`Programado para ejecutar a las: ${horaObjetivo} del día [${formatoFecha(fechaObjetivo)}]`);

    while (true) {
        const momentoActual = new Date();

        if (momentoActual >= fechaObjetivo) {
            console.log(` ¡Hora alcanzada (${horaObjetivo})! Iniciando marcación...`);
            break;
        }

        const horaActualStr = momentoActual.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });

        console.log(`[${horaActualStr}] Esperando ejecución programada para [${formatoFecha(fechaObjetivo)}]...`);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Chequea cada 10 segundos
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

*/

/*
import { test, expect } from '@playwright/test';
import { tareo } from '@data/tareoData';
import { LoginPage, TareoPage } from '@pages';

async function esperarHastaHora(horaObjetivo: string): Promise<void> {
    const ahora = new Date();
    const [horaObj, minObj] = horaObjetivo.split(':').map(Number);
    
    const fechaObjetivo = new Date();
    fechaObjetivo.setHours(horaObj, minObj, 0, 0);

    if (fechaObjetivo <= ahora) {
        fechaObjetivo.setDate(fechaObjetivo.getDate() + 1);
    }

    const formatoFecha = (d: Date) => 
        `${d.toLocaleDateString('es-PE')} ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

    console.log(`Programado para ejecutar a las: ${horaObjetivo} del día [${formatoFecha(fechaObjetivo)}]`);

    while (true) {
        const momentoActual = new Date();

        if (momentoActual >= fechaObjetivo) {
            console.log(`¡Hora alcanzada (${horaObjetivo})! Iniciando marcación...`);
            break;
        }

        const horaActualStr = momentoActual.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });

        console.log(`[${horaActualStr}] Esperando ejecución programada para [${formatoFecha(fechaObjetivo)}]...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
    }
}

// Asegura la ejecución en orden secuencial
test.describe.configure({ mode: 'serial' });

for (const [index, item] of tareo.entries()) {
    test(`[${index + 1}/${tareo.length}] Marca manual de ${item.correo}`, async ({ page }) => {
        // Desactiva el timeout del test para esperas largas de reloj
        test.setTimeout(0); 

        // 1. Espera programada de hora
        if (item.horaEjecucion) {
            await esperarHastaHora(item.horaEjecucion);
        }

        const loginPage = new LoginPage(page);
        const tareoPage = new TareoPage(page);

        console.log(`\n--------------------------------------------------`);
        console.log(` Iniciando proceso QA [${index + 1}/${tareo.length}] para: ${item.correo}`);
        console.log(`--------------------------------------------------`);

        try {
            // 2. Iniciar Sesión
            await loginPage.navegar();
            await loginPage.iniciarSesion(item.correo, item.password);

            // 3. Confirmar carga de la interfaz
            const toolbarCargado = await tareoPage.btnPausar.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
            
            if (!toolbarCargado) {
                throw new Error("No cargó el botón de marcación en la barra superior tras iniciar sesión.");
            }

            // 4. Ejecutar acción de marcación
            const resultado = await tareoPage.gestionarBotonCronometro();
            console.log(` EXITO <${item.correo}>: ${resultado}`);

        } catch (error: any) {
            const mensajeDetalle = ` FALLO EN QA <${item.correo}>: ${error.message}`;
            console.error(mensajeDetalle);

            // Registra la falla sin detener la suite para que el bucle continúe con el siguiente correo
            expect.soft(false, mensajeDetalle).toBe(true);
        }
    });
}
    */

// npx playwright test tests/tareo/registra-marca-manual.spec.ts --project=chromium --headed --workers=1
// para que se ejecute desde gitbash usar el siguiente comando:"./run-test-qa.sh"
// y si se quiere en una hora en especidifco cambiar desde el archivo run-test-qa.sh, se puede modificar la hora en la primera linea
//
import { test, expect } from '@playwright/test';
import { tareo } from '@data/tareoData';
import { LoginPage, TareoPage } from '@pages';

async function esperarHastaHora(horaObjetivo: string): Promise<void> {
    const ahora = new Date();
    const [horaObj, minObj] = horaObjetivo.split(':').map(Number);
    
    const fechaObjetivo = new Date();
    fechaObjetivo.setHours(horaObj, minObj, 0, 0);

    if (fechaObjetivo <= ahora) {
        fechaObjetivo.setDate(fechaObjetivo.getDate() + 1);
    }

    const formatoFecha = (d: Date) => 
        `${d.toLocaleDateString('es-PE')} ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

    console.log(` Programado para ejecutar a las: ${horaObjetivo} del día [${formatoFecha(fechaObjetivo)}]`);

    while (true) {
        const momentoActual = new Date();

        if (momentoActual >= fechaObjetivo) {
            console.log(` ¡Hora alcanzada (${horaObjetivo})! Iniciando marcación...`);
            break;
        }

        const horaActualStr = momentoActual.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });

        console.log(`[${horaActualStr}] Esperando ejecución programada para [${formatoFecha(fechaObjetivo)}]...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
    }
}

//  CAMBIO CLAVE: Se desactiva el modo 'serial' para evitar que cancele los tests siguientes al fallar uno
test.describe.configure({ mode: 'parallel' });

for (const [index, item] of tareo.entries()) {
    test(`[${index + 1}/${tareo.length}] Marca manual de ${item.correo}`, async ({ page }) => {
        // Desactiva el timeout del test para permitir esperas de reloj
        test.setTimeout(0); 

        // 1. Espera programada por reloj
        if (item.horaEjecucion) {
            await esperarHastaHora(item.horaEjecucion);
        }

        const loginPage = new LoginPage(page);
        const tareoPage = new TareoPage(page);

        console.log(`\n--------------------------------------------------`);
        console.log(` Iniciando proceso QA [${index + 1}/${tareo.length}] para: ${item.correo}`);
        console.log(`--------------------------------------------------`);

        try {
            // 2. Iniciar Sesión
            await loginPage.navegar();
            await loginPage.iniciarSesion(item.correo, item.password);

            // 3. Confirmar carga de la interfaz
            const toolbarCargado = await tareoPage.btnPausar.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
            
            if (!toolbarCargado) {
                throw new Error("No cargó el botón de marcación en la barra superior tras iniciar sesión.");
            }

            // 4. Ejecutar acción de marcación
            const resultado = await tareoPage.gestionarBotonCronometro();
            console.log(` EXITO <${item.correo}>: ${resultado}`);

        } catch (error: any) {
            const mensajeDetalle = `FALLO EN QA <${item.correo}>: ${error.message}`;
            console.error(mensajeDetalle);

            // Registra la falla de forma suave para que los demás tests del bucle continúen ejecutándose
            expect.soft(false, mensajeDetalle).toBe(true);
        }
    });
}