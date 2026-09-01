import { test, expect } from '../../fixtures/test';

/*
Si se quiere realizar la consulta en este spec.ts se tiene que insertar el siguiente comando en terminal de powershell del VS
-- tiene para poder filtar sea por el ID de colaborador fecha o el nombre
$env:COLABORADOR_ID="286"; $env:FECHA_JORNADA="2026-08-31"; $env:NOMBRE_COLABORADOR=""; npx playwright test reporte-marcaciones.spec.ts

*/


test('reporte consolidado de marcaciones por colaborador', async ({ db }) => {
  // 1. Captura dinámica de variables desde la terminal
  const rawColaborador = process.env.COLABORADOR_ID?.trim();
  const rawFecha = process.env.FECHA_JORNADA?.trim();
  const rawNombre = process.env.NOMBRE_COLABORADOR?.trim();

  const pColaborador = rawColaborador && rawColaborador !== '' ? parseInt(rawColaborador, 10) : null;
  const pFecha = rawFecha && rawFecha !== '' ? rawFecha : null;
  const pNombre = rawNombre && rawNombre !== '' ? rawNombre : '';

  // 2. Consulta SQL avanzada con parámetros $1, $2, $3
  const query = `
    WITH parametros AS (
        SELECT 
            $1::VARCHAR          AS p_nombre_colaborador,
            $2::DATE             AS p_fecha_jornada,
            $3::INT              AS p_nid_colaborador
    ),
    marcaciones_ordenadas AS (
        SELECT 
            m.nid_mark,
            m.nid_colaborador,
            c.persona_nombre::TEXT AS persona_nombre,
            m.dfecha_jornada,
            m.ddate_mark,
            m.ntype_mark,
            m.sjustificacion,
            ROW_NUMBER() OVER (
                PARTITION BY m.nid_colaborador, m.dfecha_jornada 
                ORDER BY m.ddate_mark ASC, m.nid_mark ASC
            ) AS num_marca
        FROM marks m
        CROSS JOIN parametros p
        JOIN fn_find_collaborator(p.p_nombre_colaborador) c 
          ON m.nid_colaborador = c.nid_collaborator
        WHERE (p.p_fecha_jornada IS NULL OR m.dfecha_jornada = p.p_fecha_jornada)
          AND m.nstatus = 1
          AND (p.p_nid_colaborador IS NULL OR m.nid_colaborador = p.p_nid_colaborador)
    )
    SELECT 
        mo.nid_colaborador,
        mo.persona_nombre,
        mo.dfecha_jornada,
        
        MAX(CASE WHEN mo.num_marca = 1 THEN mo.ddate_mark END) AS hora_entrada,
        MAX(CASE WHEN mo.num_marca = 2 THEN mo.ddate_mark END) AS inicio_almuerzo,
        MAX(CASE WHEN mo.num_marca = 3 THEN mo.ddate_mark END) AS fin_almuerzo,
        MAX(CASE WHEN mo.num_marca = 4 THEN mo.ddate_mark END) AS hora_salida,

        MAX(CASE WHEN mo.num_marca = 1 THEN mo.sjustificacion END) AS justificacion_entrada,
        MAX(CASE WHEN mo.num_marca = 2 THEN mo.sjustificacion END) AS justificacion_ini_almuerzo,
        MAX(CASE WHEN mo.num_marca = 3 THEN mo.sjustificacion END) AS justificacion_fin_almuerzo,
        MAX(CASE WHEN mo.num_marca = 4 THEN mo.sjustificacion END) AS justificacion_salida,
        
        ROUND(EXTRACT(EPOCH FROM (
            MAX(CASE WHEN mo.num_marca = 3 THEN mo.ddate_mark END) - 
            MAX(CASE WHEN mo.num_marca = 2 THEN mo.ddate_mark END)
        )) / 60)::NUMERIC AS mins_almuerzo,
        
        ROUND(EXTRACT(EPOCH FROM (
            (MAX(CASE WHEN mo.num_marca = 2 THEN mo.ddate_mark END) - MAX(CASE WHEN mo.num_marca = 1 THEN mo.ddate_mark END)) +
            (MAX(CASE WHEN mo.num_marca = 4 THEN mo.ddate_mark END) - MAX(CASE WHEN mo.num_marca = 3 THEN mo.ddate_mark END))
        )) / 60)::NUMERIC AS mins_trabajados_efectivos,

        ROUND((EXTRACT(EPOCH FROM (
            (MAX(CASE WHEN mo.num_marca = 2 THEN mo.ddate_mark END) - MAX(CASE WHEN mo.num_marca = 1 THEN mo.ddate_mark END)) +
            (MAX(CASE WHEN mo.num_marca = 4 THEN mo.ddate_mark END) - MAX(CASE WHEN mo.num_marca = 3 THEN mo.ddate_mark END))
        )) / 3600)::numeric, 2) AS hrs_trabajadas_efectivas

    FROM marcaciones_ordenadas mo
    GROUP BY mo.nid_colaborador, mo.persona_nombre, mo.dfecha_jornada
    ORDER BY mo.dfecha_jornada DESC, mo.persona_nombre ASC;
  `;

  // 3. Ejecución de la consulta
  const resultado = await db.query(query, [pNombre, pFecha, pColaborador]);

  // Auxiliar para formatear horas en formato local
  const formatHora = (dateStr: any) => 
    dateStr ? new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '---';

  // Auxiliar para recortar textos largos y no desbordar la consola
  const acortarTexto = (texto: string | null, limite: number = 20): string => {
    if (!texto || texto.trim() === '') return 'N/A';
    return texto.length > limite ? `${texto.substring(0, limite)}...` : texto;
  };

  // 4. Mapeo formateado para la consola
  const datosFormateados = resultado.rows.map(row => ({
    'ID': row.nid_colaborador,
    'Colaborador': acortarTexto(row.persona_nombre, 18),
    'Jornada': row.dfecha_jornada ? new Date(row.dfecha_jornada).toLocaleDateString('es-PE') : '---',
    'Entrada': formatHora(row.hora_entrada),
    'Ini Alm.': formatHora(row.inicio_almuerzo),
    'Fin Alm.': formatHora(row.fin_almuerzo),
    'Salida': formatHora(row.hora_salida),
    'Mins Alm.': row.mins_almuerzo ?? '---',
    'Mins Efec.': row.mins_trabajados_efectivos ?? '---',
    'Hrs Efec.': row.hrs_trabajadas_efectivas ?? '---',
    'Justif. Entrada': acortarTexto(row.justificacion_entrada, 20)
    //'Just.In.Alm': acortarTexto(row.justificacion_ini_almuerzo, 20),
    //'Just.Fin.Alm': acortarTexto(row.justificacion_fin_almuerzo, 20),
    //'Just.Salida': acortarTexto(row.justificacion_salida, 20)
    
  }));

  console.log('\n============================== REPORTE DE MARCACIONES ==============================');
  console.log(`Filtros -> Nombre: "${pNombre || 'TODOS'}" | Fecha: ${pFecha || 'TODAS'} | ID: ${pColaborador || 'TODOS'}`);
  console.table(datosFormateados);
  console.log('====================================================================================\n');

  expect(resultado).toBeDefined();
});