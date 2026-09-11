import dotenv from 'dotenv';
dotenv.config();

const defaultPassword = process.env.DEFAULT_QA_PASSWORD || '';

export interface TareoData {
    correo: string;
    password: string;
    fecha: string[];
    fechaInicio: string;
    fechaFin?: string;
    minutosRegulares: string;
    minutosNoRegulares?: string;
    proyecto: string;
    requerimiento: string;
    categoria: string;
    tipoHora: string;
    descripcion: string;
    hora: string;
    horaEjecucion?: string; // Formato "HH:mm" (ej: "16:17", "18:00")
    id?: number[];
}

export interface TareoEliminado {
    fecha: string;
    horas: string;
}

export const TipoHora = {
  REGULAR: "HORARIO REGULAR",
  COMPENSACION: "COMPENSACION",
  EXTRA: "EXTRAS",
  AVANCE: "AVANCE",
  RECUPERACION: "RECUPERACION",
} as const;

export const tareo: TareoData[] = [
    {
        correo: "alfonso.rios@materiagris.pe",
        password: defaultPassword,
        fecha: ['2 de septiembre de 2026'],
        fechaInicio: '1 de septiembre de 2026',
        minutosRegulares: "15",
        proyecto: "PRY - MG (CARLOS)",
        requerimiento: "RQ - CAPACITACIONES INTERNAS",
        categoria: "ASEGURAMIENTO DE LA CALIDAD",
        tipoHora: TipoHora.REGULAR,
        descripcion: "PRUEBAS DE AUTOMATIZACIÓN DE EDICIÓN EN QA",
        hora: "18:01",
        horaEjecucion: "15:55" // <-- Hora específica para este correo
    },
    {
        correo: "shirley.gonzales@materiagris.pe",
        password: defaultPassword,
        fecha: ['2 de septiembre de 2026'],
        fechaInicio: '1 de septiembre de 2026',
        minutosRegulares: "15",
        proyecto: "PRY - MG (CARLOS)",
        requerimiento: "RQ - CAPACITACIONES INTERNAS",
        categoria: "ASEGURAMIENTO DE LA CALIDAD",
        tipoHora: TipoHora.REGULAR,
        descripcion: "PRUEBAS DE AUTOMATIZACIÓN EN QA",
        hora: "18:01",
        horaEjecucion: "15:56" // <-- Hora específica para este otro correo
    },
    {
        correo: "cristhofer.aquino@materiagris.pe",
        password: defaultPassword,
        fecha: ['2 de septiembre de 2026'],
        fechaInicio: '1 de septiembre de 2026',
        minutosRegulares: "15",
        proyecto: "PRY - MG (CARLOS)",
        requerimiento: "RQ - CAPACITACIONES INTERNAS",
        categoria: "ASEGURAMIENTO DE LA CALIDAD",
        tipoHora: TipoHora.REGULAR,
        descripcion: "PRUEBAS DE AUTOMATIZACIÓN EN QA",
        hora: "06:00",
        horaEjecucion: "15:57" // <-- Hora específica para este otro correo
    },
    {
        correo: "kimberly.mendoza@materiagris.pe",
        password: defaultPassword,
        fecha: ['2 de septiembre de 2026'],
        fechaInicio: '1 de septiembre de 2026',
        minutosRegulares: "15",
        proyecto: "PRY - MG (CARLOS)",
        requerimiento: "RQ - CAPACITACIONES INTERNAS",
        categoria: "ASEGURAMIENTO DE LA CALIDAD",
        tipoHora: TipoHora.REGULAR,
        descripcion: "PRUEBAS DE AUTOMATIZACIÓN EN QA",
        hora: "06:01",
        horaEjecucion: "15:58" // <-- Hora específica para este otro correo
    }
];

export const edicion: TareoData[] = [
    {
        correo: "alfonso.rios@materiagris.pe",
        password: defaultPassword,
        fecha: ['2 de septiembre de 2026'],
        fechaInicio: '1 de septiembre de 2026',
        fechaFin: '3 de septiembre de 2026',
        minutosRegulares: "15",
        proyecto: "PRY - MG (CARLOS)",
        requerimiento: "RQ - CAPACITACIONES INTERNAS",
        categoria: "ASEGURAMIENTO DE LA CALIDAD",
        tipoHora: TipoHora.REGULAR,
        descripcion: "PRUEBAS DE AUTOMATIZACIÓN DE EDICIÓN EN QA",
        hora: "18:01",
       // id: [217569,217570,217571]
    }
];