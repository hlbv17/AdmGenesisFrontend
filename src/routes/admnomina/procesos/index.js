import { lazy } from 'react';
import { Loadable } from '../../../utils/loadable';
// ***************** DESARROLLADOR => ALLAN HERRERA *********************
// ========================== INICIO ===================================
const Prestamos = Loadable(lazy(() => import('../../../sections/admnomina/procesos/prestamos/prestamos')));

const Beneficiosocial = Loadable(lazy(() => import('../../../sections/admnomina/procesos/beneficiosocial/beneficiosocial')));

const SolicitudDocumentos = Loadable(lazy(() => import('../../../sections/admnomina/procesos/solicituddocumentos/solicituddocumentos')));

const AprobacionSolicitud = Loadable(lazy(() => import('../../../sections/admnomina/procesos/aprobacionsolicitud/aprobacionsolicitud')));

export const PROCESOS = [
    // {
    //     url: '/dashboard',
    //     element: <Inicio />
    // },
    {


        url: '/beneficiosocial',
        element: <Beneficiosocial />

    },
    {

        url: '/prestamos',
        element: <Prestamos />
    },
    {

        url: '/solicituddocumentos',
        element: <SolicitudDocumentos />
    },
    {

        url: '/aprobacionsolicitud',
        element: <AprobacionSolicitud />
    },
]