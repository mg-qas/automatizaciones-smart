import { test, expect } from '../../fixtures/test';

/*
Comando para ejecutar en PowerShell filtrando por ID de Colaborador (además de los filtros anteriores):
$env:TAREA_ID=""; $env:USUARIO_CREADOR=""; $env:COLABORADOR_ID="286"; $env:FECHA_INICIO="2026-08-01"; $env:FECHA_FIN="2026-08-31"; $env:NOMBRE_COLABORADOR=""; npx playwright test filtro-tareo.spec.ts
*/

test('Filtro de tareo', async ({ db }) => {
  // 1. Captura dinámica de variables desde la terminal
  const rawTareaId = process.env.TAREA_ID?.trim();
  const rawUsuarioCreador = process.env.USUARIO_CREADOR?.trim();
  const rawColaboradorId = process.env.COLABORADOR_ID?.trim(); // Nueva variable
  const rawFechaInicio = process.env.FECHA_INICIO?.trim();
  const rawFechaFin = process.env.FECHA_FIN?.trim();
  const rawNombre = process.env.NOMBRE_COLABORADOR?.trim();

  const pTareaId = rawTareaId && rawTareaId !== '' ? parseInt(rawTareaId, 10) : null;
  const pUsuarioCreador = rawUsuarioCreador && rawUsuarioCreador !== '' ? parseInt(rawUsuarioCreador, 10) : null;
  const pColaboradorId = rawColaboradorId && rawColaboradorId !== '' ? parseInt(rawColaboradorId, 10) : null;
  const pFechaInicio = rawFechaInicio && rawFechaInicio !== '' ? rawFechaInicio : null;
  const pFechaFin = rawFechaFin && rawFechaFin !== '' ? rawFechaFin : null;
  const pNombre = rawNombre && rawNombre !== '' ? rawNombre : null;

  // 2. se realizan los filtros desde ($1 a $6)
  const query = `
    WITH parametros AS (
        SELECT 
            $1::INT     AS p_nid_tarea,
            $2::INT     AS p_nusuario_creador,
            $3::INT     AS p_nid_colaborador,
            $4::DATE    AS p_fecha_inicio,
            $5::DATE    AS p_fecha_fin,
            $6::VARCHAR AS p_nombre_colaborador
    ),
    usuario_colaborador_map AS (
        SELECT DISTINCT 
            m.nusuario_creador, 
            m.nid_colaborador
        FROM marks m
        WHERE m.nusuario_creador IS NOT NULL
    )
    SELECT 
        t.nid_tarea,
        t.nusuario_creador,
        uc.nid_colaborador,
        col.persona_nombre AS snombre_colaborador,
        col.rol            AS srol_colaborador,
        t.sdetalle,
        t.dfecha_registro,
        t.ddatetime_creador
    FROM tareas t
    CROSS JOIN parametros p
    LEFT JOIN usuario_colaborador_map uc ON uc.nusuario_creador = t.nusuario_creador
    LEFT JOIN LATERAL fn_find_collaborator(
        p_name            => p.p_nombre_colaborador, 
        p_collaborator_id => COALESCE(p.p_nid_colaborador, uc.nid_colaborador)
    ) col ON TRUE
    WHERE t.sdetalle IS NOT NULL
      AND (p.p_nid_tarea IS NULL OR t.nid_tarea = p.p_nid_tarea)
      AND (p.p_nusuario_creador IS NULL OR t.nusuario_creador = p.p_nusuario_creador)
      AND (p.p_nid_colaborador IS NULL OR uc.nid_colaborador = p.p_nid_colaborador)
      AND (
          (p.p_fecha_inicio IS NOT NULL AND p.p_fecha_fin IS NOT NULL 
           AND t.dfecha_registro::DATE BETWEEN p.p_fecha_inicio AND p.p_fecha_fin)
          OR
          (p.p_fecha_inicio IS NOT NULL AND p.p_fecha_fin IS NULL 
           AND t.dfecha_registro::DATE >= p.p_fecha_inicio)
          OR
          (p.p_fecha_inicio IS NULL AND p.p_fecha_fin IS NOT NULL 
           AND t.dfecha_registro::DATE <= p.p_fecha_fin)
          OR
          (p.p_fecha_inicio IS NULL AND p.p_fecha_fin IS NULL)
      )
      AND (p.p_nombre_colaborador IS NULL OR col.persona_nombre ILIKE '%' || p.p_nombre_colaborador || '%')
    ORDER BY t.dfecha_registro DESC;
  `;

  // 3. Ejecución enviando los 6 parámetros en orden
  const resultado = await db.query(query, [
    pTareaId,
    pUsuarioCreador,
    pColaboradorId,
    pFechaInicio,
    pFechaFin,
    pNombre
  ]);

  const acortarTexto = (texto: string | null, limite: number = 25): string => {
    if (!texto || texto.trim() === '') return 'N/A';
    return texto.length > limite ? `${texto.substring(0, limite)}...` : texto;
  };

  const formatFechaHora = (dateStr: any) => 
    dateStr ? new Date(dateStr).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '---';

  // 4. Mapeo para consola
  const datosFormateados = resultado.rows.map(row => ({
    'ID Tarea': row.nid_tarea,
    'ID Creador': row.nusuario_creador,
    'ID Colaborador': row.nid_colaborador ?? '---',
    'Colaborador': acortarTexto(row.snombre_colaborador, 20),
    'Rol': acortarTexto(row.srol_colaborador, 15),
    'Detalle Tareo': acortarTexto(row.sdetalle, 30),
    'Fecha Registro': row.dfecha_registro ? new Date(row.dfecha_registro).toLocaleDateString('es-PE') : '---',
    'Fecha/Hora Creado': formatFechaHora(row.ddatetime_creador)
  }));

  console.log('\n================================ FILTRO DE TAREO ================================');
  console.log(`Filtros -> Tarea ID: ${pTareaId || 'TODAS'} | Creador ID: ${pUsuarioCreador || 'TODOS'} | Colaborador ID: ${pColaboradorId || 'TODOS'} | Rango: ${pFechaInicio || 'INICIO'} al ${pFechaFin || 'FIN'} | Nombre: "${pNombre || 'TODOS'}"`);
  console.table(datosFormateados);
  console.log('=================================================================================\n');

  expect(resultado).toBeDefined();
});