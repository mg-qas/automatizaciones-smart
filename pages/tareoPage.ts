import { Page, Locator, expect } from '@playwright/test';
import { CalendarComponent } from '@components';
import { TareoData, TareoEliminado } from '@data/tareoData';

export class TareoPage {
  readonly page: Page;
  private calendar: CalendarComponent;

  // Locators
  readonly btnRegistrarActividadInicial: Locator;
  readonly btnAgregarActividad: Locator;
  readonly inputMinutos: Locator;
  readonly inputFecha: Locator;
  readonly lblTiempoDisponible: Locator;
  readonly cboProyecto: Locator;
  readonly cboRequerimiento: Locator;
  readonly cboCategoria: Locator;
  readonly cboTipoHoras: Locator;
  readonly cboRefresh: Locator;
  readonly inputHoraInicio: Locator;
  readonly inputDescripcion: Locator;
  readonly btnRegistrarActividadesFinal: Locator;
  readonly modalConfirmacion: Locator;
  readonly btnGuardarYSalir: Locator;
  readonly btnGuardar: Locator;
  readonly modalExito: Locator;
  readonly btnMenuIzquierdo: Locator;
  readonly btnModuloTareo: Locator;
  readonly btnAceptar: Locator;
  readonly btnCancelar: Locator;
  readonly btnClose: Locator;
  readonly btnPausar: Locator;
  readonly txtMotivoTardanza: Locator;
readonly btnAceptarTardanza: Locator;

  // Locators para la limpieza de Comboboxes (Botones Close)
  readonly btnClearProyecto: Locator;
  readonly btnClearRequerimiento: Locator;
  readonly btnClearCategoria: Locator;
  readonly btnClearTipoHoras: Locator;

  constructor(page: Page) {
    this.page = page;
    this.calendar = new CalendarComponent(page);
    // Se agrega el nuevo boton de pausar o
    //this.btnPausar=page.locator('header button, nav button').first();
    //this.btnPausar = page.locator('button').filter({ hasText: /Pausar/i });
    //this.btnPausar = page.locator('*:has-text("pause_circle")').first();
   //this.btnPausar = page.locator('mg-toolbar').locator('*:has-text("play_circle"), *:has-text("pause_circle")').first();
   /*this.btnPausar = page
  .locator('mg-toolbar')
  .filter({ hasText: /Pausar|Reanudar|Iniciar|Detener/i })
  .first();*/
  /*this.btnPausar = page
  .locator('mg-toolbar')//.getByRole('button',{name: /Pausar/i})
  .getByText(/Pausar/i)
  .first();*/
  this.btnPausar = page
  .locator('mg-toolbar')
  .getByText(/pause_circle|play_circle|stop_circle/i)
  .first();

  this.txtMotivoTardanza = page.getByRole('textbox', { name: 'Ingrese motivo de tardanza' });
  this.btnAceptarTardanza = page.getByRole('button', { name: 'Aceptar' });
  


    this.btnRegistrarActividadInicial = page.locator('button').filter({ hasText: /registrar actividad/i });
    this.btnAgregarActividad = page.getByRole('button', { name: /agregar actividad/i });
    this.inputMinutos = page.locator('input[placeholder="00"]');
    this.inputFecha = page.locator('input[placeholder="DD/MM/AAAA"]').first();
    this.lblTiempoDisponible = page.getByText(/^Disp\./);
    this.cboProyecto = page.getByRole('combobox', { name: 'Proyecto' });
    this.cboRequerimiento = page.getByRole('combobox', { name: 'Requerimiento' });
    this.cboCategoria = page.getByRole('combobox', { name: 'Categoría' });
    this.cboTipoHoras = page.getByRole('combobox', { name: 'Tipo de Horas' });
    this.cboRefresh = page.locator('mg-input-select', { hasText: 'Tipo de Horas' }).getByRole('button');
    this.inputHoraInicio = page.getByRole('textbox', { name: '--:--' });
    this.inputDescripcion = page.getByRole('textbox', { name: 'Describir actividad' });
    this.btnRegistrarActividadesFinal = page.getByRole('button', { name: /registrar actividades/i });
    this.modalConfirmacion = page.getByRole('heading', { name: '¿Que acción desea realizar?' });
    this.btnGuardarYSalir = page.getByRole('button', { name: 'Guardar y salir' });
    this.btnGuardar = page.getByRole('button', { name: 'Guardar' });
    this.modalExito = page.getByRole('heading', { name: '¡Procesado con éxito!' });
    this.btnAceptar = page.getByRole('button', { name: 'Aceptar' });
    this.btnCancelar = page.getByRole('button', { name: 'Cancelar' });
    this.btnClose = page.getByRole('button', { name: 'close' });

    // Botones de Limpieza (Close)
    this.btnClearProyecto = page.locator('mg-input-select-group').getByRole('button', { name: 'close' });
    this.btnClearRequerimiento = page.locator('mg-input-select').filter({ hasText: 'Requerimiento* close' }).getByRole('button');
    this.btnClearCategoria = page.locator('mg-input-select').filter({ hasText: 'Categoría* close' }).getByRole('button');
    this.btnClearTipoHoras = page.locator('mg-input-select').filter({ hasText: 'Tipo de Horas* close' }).getByRole('button');

    // Navegación
    this.btnMenuIzquierdo = page.getByRole('button', { name: 'menu' });
    this.btnModuloTareo = page.getByRole('link', { name: 'task Tareo' });
  }

  // ---------------------------------------------------------------------------
  // MÉTODOS AUXILIARES DE TABLA (FILA Y BÚSQUEDA)
  // ---------------------------------------------------------------------------

  recuperarFila(id: number): Locator {
    return this.page.locator('tr').filter({
      has: this.page.locator('td.cdk-column-nId', {
        hasText: String(id),
      }),
    });
  }

  async recuperarFechaYHora(fila: Locator): Promise<TareoEliminado> {
    const fecha = (await fila.locator('td.cdk-column-dFecha_Registro').innerText()).trim();
    const horas = (await fila.locator('td.cdk-column-bgAmount').innerText()).trim();
    return { fecha, horas };
  }

    /*
    Extrae automáticamente todos los IDs presentes en la tabla actualmente visible.
   */
async obtenerIdsVisiblesEnTabla(): Promise<number[]> {
    const celdasId = this.page.locator('td.cdk-column-nId');
    // Espera a que la primera celda cargue
    await celdasId.first().waitFor({ state: 'visible', timeout: 10000 });

    const textosId = await celdasId.allInnerTexts();
    return textosId
      .map(id => Number(id.trim()))
      .filter(id => !isNaN(id) && id > 0);
  }

  //FUNCION PARA QUE PUEDA REALIZAR E IDENTIFICAR EL BOTON PARA DARLE CLICK
 /*async gestionarBotonCronometro(): Promise<string> {
   await expect(this.btnPausar).toBeVisible({ timeout: 5000 });
   

   const estaHabilitado = await this.btnPausar.isEnabled();

   if (estaHabilitado) {
    const textoActual = (await this.btnPausar.innerText()).trim();
    await this.btnPausar.click();
    return `Acción ejecutada: Clic en botón (${textoActual})`;
   } else {
    console.warn("El botón de control de tiempo está deshabilitado.");
    return "boton deshabilitado";
   }
}*/
/*async gestionarBotonCronometro(): Promise<string> {
  // 1. Verifica si el botón del toolbar está presente en pantalla
  const estaVisible = await this.btnPausar.isVisible({ timeout: 5000 }).catch(() => false);

  if (!estaVisible) {
    console.warn(" El botón del cronómetro no se encuentra disponible en la barra superior.");
    return "boton deshabilitado";
  }

  // 2. Comprueba si está habilitado para hacer clic
  const estaHabilitado = await this.btnPausar.isEnabled();

  if (estaHabilitado) {
    const textoActual = (await this.btnPausar.innerText()).replace(/\n/g, ' ').trim();
    await this.btnPausar.click();
    return `Acción ejecutada con éxito: Clic en [${textoActual}]`;
  } else {
    console.warn(" El botón se encuentra deshabilitado en este momento.");
    return "boton deshabilitado";
  }
}  */

  async gestionarBotonCronometro(): Promise<string> {
  // 1. Verifica si el botón del toolbar está presente en pantalla
  const estaVisible = await this.btnPausar.isVisible({ timeout: 5000 }).catch(() => false);

  if (!estaVisible) {
    console.warn(" El botón del cronómetro no se encuentra disponible en la barra superior.");
    return "boton deshabilitado";
  }

  // 2. Comprueba si está habilitado para hacer clic
  const estaHabilitado = await this.btnPausar.isEnabled();

  if (estaHabilitado) {
    const textoActual = (await this.btnPausar.innerText()).replace(/\n/g, ' ').trim();
    
    // Ejecuta el clic en el botón del cronómetro
    await this.btnPausar.click();

    // 3. Evalúa si se despliega el modal de tardanza (espera hasta 3 segundos)
    const apareceModalTardanza = await this.txtMotivoTardanza
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (apareceModalTardanza) {
      // Ingresa el motivo y confirma la acción
      await this.txtMotivoTardanza.fill('Ingrese tarde porque le pregunte a mis hvos y dijeron Simon');
      await this.btnAceptarTardanza.click();

      // Espera a que el modal se cierre antes de continuar
      await expect(this.txtMotivoTardanza).toBeHidden();

      return `Acción ejecutada con éxito: Clic en [${textoActual}] (Tardanza justificada)`;
    }

    return `Acción ejecutada con éxito: Clic en [${textoActual}]`;
  } else {
    console.warn(" El botón se encuentra deshabilitado en este momento.");
    return "boton deshabilitado";
  }
}










  // ---------------------------------------------------------------------------
  // MÉTODOS DE ACCIÓN Y FORMULARIO
  // ---------------------------------------------------------------------------

  async abrirFormularioRegistro() {
    await this.btnRegistrarActividadInicial.click();
    await expect(this.btnAgregarActividad).toBeVisible();
  }

  async setFecha(fecha: string) {
    await expect(this.inputFecha).toBeVisible();
    await this.inputFecha.click();
    await this.calendar.seleccionarFecha(fecha);
  }

  async setTipoHora(tipoHora: string) {
    await this.cboRefresh.click();
    await this.cboTipoHoras.click();
    const optTipoHora = this.page.getByRole('option', { name: tipoHora, exact: true });
    await optTipoHora.waitFor({ state: 'visible' });
    await optTipoHora.click({ force: true });
  }

  async llenarMinutos(hora: string) {
    await expect(Number(hora)).toBeLessThanOrEqual(await this.obtenerMinutosDisponibles());
    const minutosActuales = await this.inputMinutos.inputValue();
    if (minutosActuales.trim() !== '') {
      await this.inputMinutos.clear();
    }
    await this.inputMinutos.fill(hora);
  }

  /**
   * Llena el formulario limpiando campos previamente cargados de ser necesario.
   */
  async llenarFormulario(fecha: string, item: TareoData) {
    // 1. Minutos y Fecha
    await this.setFecha(fecha);
    await this.llenarMinutos(item.minutosRegulares);

    // 2. Proyecto
    if (await this.btnClearProyecto.isVisible()) {
      await this.btnClearProyecto.click();
    }
    await this.cboProyecto.click();
    await this.page.getByRole('option', { name: item.proyecto }).click();

    // 3. Requerimiento
    if (await this.btnClearRequerimiento.isVisible()) {
      await this.btnClearRequerimiento.click();
    }
    await this.cboRequerimiento.click();
    await this.page.getByRole('option', { name: item.requerimiento }).click();

    // 4. Categoría
    await this.cboCategoria.hover(); // Coloca el mouse sobre el desplegable para activar las reglas CSS (:hover)
    if (await this.btnClearCategoria.isVisible()) {
      await this.btnClearCategoria.click();
    }
    await this.cboCategoria.click();
    await this.page.getByRole('option', { name: item.categoria }).click();

    // 5. Tipo de Hora
    if (await this.btnClearTipoHoras.isVisible()) {
      await this.btnClearTipoHoras.click();
    }
    await this.cboTipoHoras.click();
    await this.page.getByRole('option', { name: item.tipoHora }).click();

    // 5.b. Hora de Inicio (si aplica)
    if (item.tipoHora !== 'HORARIO REGULAR') {
      const horaActual = await this.inputHoraInicio.inputValue();
      if (horaActual.trim() !== '') {
        await this.inputHoraInicio.clear();
      }
      await this.inputHoraInicio.fill(item.hora);
    }

    // 6. Descripción
    const descActual = await this.inputDescripcion.inputValue();
    if (descActual.trim() !== '') {
      await this.inputDescripcion.clear();
    }
    await this.inputDescripcion.fill(item.descripcion);
  }

  // ---------------------------------------------------------------------------
  // CRUD DE TAREOS (REGISTRAR, EDITAR, ELIMINAR, DUPLICAR)
  // ---------------------------------------------------------------------------

  async guardarYEnviar() {
    await this.btnAgregarActividad.click();

    await expect(this.btnRegistrarActividadesFinal).toBeVisible({ timeout: 10000 });
    await this.btnRegistrarActividadesFinal.click();

    await expect(this.modalConfirmacion).toBeVisible();
    await this.btnGuardarYSalir.click();

    await expect(this.modalExito).toBeVisible();
    await this.btnAceptar.click();
  }

  async editarTareo(item: TareoData) {
    if (!item.id || item.id.length === 0) {
      throw new Error('No se encontraron IDs en el objeto de datos para realizar la edición.');
    }

    // El bucle se ejecuta tantas veces como IDs existan en el array item.id
    for (let index = 0; index < item.id.length; index++) {
      const idActual = item.id[index];
      // Obtiene la fecha del índice actual, o usa la primera fecha como fallback
      const fechaDato = item.fecha[index] ?? item.fecha[0];

      // 1. Ubicar la fila por su ID y hacer clic en su botón de editar
      const fila = this.recuperarFila(idActual);
      await fila
        .locator('td.cdk-column-icEditarTarea, td.cdk-column-icEdit')
        .locator('div.cursor-pointer, button, span')
        .filter({ hasText: /edit/i })
        .first()
        .click();

      // 2. Esperar a que el formulario esté listo en pantalla
      await expect(this.cboRequerimiento).toBeVisible();

      // 3. Llenar el formulario con la información del ítem
      await this.llenarFormulario(fechaDato, item);

      // 4. Guardar los cambios
      await this.btnGuardar.click();

      // Breve pausa para asegurar la recarga o actualización de la tabla tras guardar
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Edita tareos buscando la fila específica según el ID numérico suministrado
   */
  /*nc editarTareo(fecha: string[], item: TareoData) {
    for (const [index, fechaDato] of fecha.entries()) {
      const idActual = item.id?.[index];

      if (idActual !== undefined) {
        const fila = this.recuperarFila(idActual);
        await fila.locator('td.cdk-column-icEditarTarea, td.cdk-column-icEdit').locator('div.cursor-pointer, button, span').filter({ hasText: /edit/i }).first().click();
      } else {
        await this.page.getByText('edit').nth(index).click();
      }

      await expect(this.cboRequerimiento).toBeVisible();
      await this.llenarFormulario(fechaDato, item);
      await this.btnGuardar.click();
    }
  }*/


    /*
  async eliminarTareo(id: number[]): Promise<TareoEliminado[]> {
    const datosEliminados: TareoEliminado[] = [];

    for (const id_ of id) {
      const fila = this.recuperarFila(id_);
      datosEliminados.push(await this.recuperarFechaYHora(fila));
      await fila
        .locator('td.cdk-column-icEliminarTarea')
        .locator('div.cursor-pointer')
        .click();
      await this.aceptar();
    }
    return datosEliminados;
  }

  */

  //eliminar tareo masivo actualizado
 async eliminarTareo(id?: number[]): Promise<TareoEliminado[]> {
    const datosEliminados: TareoEliminado[] = [];
    
    // Para asi no colocarlo de forma manual los ID's, captura automáticamente desde la página
    const idsAEliminar = (id && id.length > 0) 
      ? id 
      : await this.obtenerIdsVisiblesEnTabla();

    for (const id_ of idsAEliminar) {
      const fila = this.recuperarFila(id_);
      datosEliminados.push(await this.recuperarFechaYHora(fila));
      await fila
        .locator('td.cdk-column-icEliminarTarea')
        .locator('div.cursor-pointer')
        .click();
      await this.aceptar();
    }
    
    return datosEliminados;
  }





  async duplicarTareo(item: TareoData, id: number[], actualizar: boolean = false) {
    for (const [index, id_] of id.entries()) {
      const fila = this.recuperarFila(id_);
      await fila
        .locator('td.cdk-column-icDuplicarTarea')
        .locator('div.cursor-pointer')
        .click();
      if (actualizar) {
        await this.filtroCalendario(item.fecha[index]);
        await this.llenarMinutos(item.minutosRegulares);
      }
      await this.guardarYEnviar();
    }
  }

  // ---------------------------------------------------------------------------
  // OTROS MÉTODOS DE SOPORTE Y NAVEGACIÓN
  // ---------------------------------------------------------------------------

  async obtenerMinutosDisponibles(): Promise<number> {
    await this.page.waitForTimeout(2000);
    const texto = await this.lblTiempoDisponible.innerText();
    const match = texto.match(/Disp\.\s*(\d+)\s*mins/i);

    if (!match) {
      throw new Error(`No se pudo leer el tiempo disponible: ${texto}`);
    }

    return Number(match[1]);
  }

  async navegarModulo() {
    await this.btnMenuIzquierdo.click();
    await this.btnModuloTareo.click();
    await this.page.waitForURL('**/tareo/lista');
  }

  async filtroCalendario(fechaDesde: string, fechaHasta?: string) {
    await this.calendar.seleccionarFecha(fechaDesde, fechaHasta);
  }

  async aceptar() {
    await expect(this.btnAceptar).toBeVisible({ timeout: 2000 });
    await this.btnAceptar.click();

    const checkProceso = this.page.getByText('check_circle ¡Procesado con éxito!Aceptar');
    await expect(checkProceso).toBeVisible({ timeout: 2000 });
  }

  async cancelar() {
    await expect(this.btnCancelar).toBeVisible({ timeout: 2000 });
    await this.btnCancelar.click();

    const checkProceso = this.page.getByText('help ¿Salir sin Guardar?CancelarAceptar').isVisible({ timeout: 2000 });
    if (await checkProceso) {
      await this.btnCancelar.click();
    }
  }
}