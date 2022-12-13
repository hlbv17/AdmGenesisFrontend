import { TextField, Button, Card, Grid, InputAdornment, Fade, IconButton, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, esES } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ViewComfyRoundedIcon from '@mui/icons-material/ViewComfyRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArrowCircleLeftRoundedIcon from '@mui/icons-material/ArrowCircleLeftRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import es from 'date-fns/locale/es';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import clsx from 'clsx';
import axios from 'axios';
import { NumericFormat } from 'react-number-format';
import HeaderBreadcrumbs from '../../../../components/HeaderBreadcrumbs';
import CircularProgreso from '../../../../components/Cargando';
import ModalGenerico from '../../../../components/modalgenerico';
import Page from '../../../../components/Page';
import { PATH_AUTH, PATH_PAGE } from '../../../../routes/paths';
import { URLAPIGENERAL, URLAPILOCAL } from '../../../../config';
import { styleActive, styleInactive, estilosdetabla, estilosdatagrid } from '../../../../utils/csssistema/estilos';
import { CustomNoRowsOverlay } from '../../../../utils/csssistema/iconsdatagrid';
import { formaterarFecha, generarCodigo, obtenerMaquina } from '../../../../utils/sistema/funciones';
import { fCurrency } from '../../../../utils/formatNumber';
import RequiredTextField from '../../../../sistema/componentes/formulario/RequiredTextField';
import MensajesGenericos from '../../../../components/sistema/mensajesgenerico';

export default function Empleado() {
  const usuario = JSON.parse(window.localStorage.getItem('usuario'));
  const config = {
    headers: {
      Authorization: `Bearer ${usuario.token}`,
    },
  };
  const navegacion = useNavigate();
  // Hook para mensajes genéricos
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('succes');
  const [openMensaje, setOpenMensaje] = useState(false);
  const [noExisteEmpleado, setNoExisteEmpleado] = useState(false);
  const [noSesion, setNoSesion] = useState(false);
  const mensajeGenerico = (tipo, msj) => {
    setTexto(msj);
    setTipo(tipo);
    setOpenMensaje(true);
  };

  const cerrarMensaje = () => {
    if (noSesion) {
      setOpenMensaje((p) => !p);
      setNoSesion(false);
      navegacion(`${PATH_AUTH.login}`);
    }
    if (noExisteEmpleado) {
      setOpenMensaje((p) => !p);
      setNoExisteEmpleado(false);
      setOpenModal(true);
      setOpenMensaje((p) => !p);
    }
    setOpenMensaje((p) => !p);
  };

  const columns = [
    { field: 'codigo', headerName: 'Codigo', width: 100 },
    { field: 'linea', headerName: 'Linea', width: 80 },
    {
      field: 'capitalAmortizado',
      headerName: 'Capital amortizado',
      width: 150,
      type: 'number',
      valueFormatter: (params) => {
        if (params.value == null) {
          return '----';
        }
        return fCurrency(params.value);
      },
    },
    {
      field: 'dividendo',
      headerName: 'Dividendo',
      width: 150,
      type: 'number',
      valueFormatter: (params) => {
        if (params.value == null) {
          return '----';
        }
        return fCurrency(params.value);
      },
    },
    {
      field: 'interes',
      headerName: 'Interes',
      width: 100,
      cellClassName: () => clsx('yellowCell'),
      type: 'number',
      valueFormatter: (params) => {
        if (params.value == null) {
          return '----';
        }
        return fCurrency(params.value);
      },
    },
    {
      field: 'interesGracia',
      headerName: 'Interes gracia',
      width: 120,
      type: 'number',
      valueFormatter: (params) => {
        if (params.value == null) {
          return '----';
        }
        return fCurrency(params.value);
      },
    },
    {
      field: 'saldoCapital',
      headerName: 'Saldo capital',
      width: 100,
      type: 'number',
      valueFormatter: (params) => {
        if (params.value == null) {
          return '----';
        }
        return fCurrency(params.value);
      },
    },
    {
      field: 'fechaDividendo',
      headerName: 'Fecha dividendo',
      width: 120,
      cellClassName: () => clsx('orangeCell'),
      valueFormatter: (params) => {
        if (params.value == null) {
          return '--/--/----';
        }
        const valueFormatted = formaterarFecha(params.value, '-', '/');
        return valueFormatted;
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      renderCell: (param) =>
        param.row.estado === 'N' ? (
          <Button variant="containded" style={styleActive}>
            Pendiente
          </Button>
        ) : (
          <Button variant="containded" style={styleInactive}>
            Cancelado
          </Button>
        ),
    },
  ];
  // const [, setItems] = React.useState([]);
  const [empleado, setEmpleado] = React.useState([]);
  const [tipoprestamos, setTiposPrestamos] = React.useState([]);
  const [detalleprestamos, setDetallesPrestamos] = React.useState([]);
  const [imprimir, setImprimir] = React.useState(true);
  const [mostrarprogreso, setMostrarProgreso] = React.useState(false);
  const [formulario, setFormulario] = React.useState({
    codigo: '',
    codigoimprime: '',
    codigoempleado: '',
    empleado: '',
    amortizacion: 'ALEMAN',
    nombreempleado: '',
    tipo: 'TP0001',
    monto: 0,
    montoVer: '',
    valorDividendo: 0,
    seguroDesgravamen: 0,
    plazo: 1,
    tasa: 0,
    liquidoRecibir: 0,
    fechaPrimerDividendo: new Date(),
    fechaUltimoDividendo: new Date(),
    fecha_ing: new Date(),
    maquina: '',
    usuario: usuario.codigo,
  });

  // eslint-disable-next-line no-unused-vars
  const [tiposBusquedas, setTiposBusqueda] = React.useState([{ tipo: 'nombre' }, { tipo: 'codigo' }]);
  const [openModal, setOpenModal] = React.useState(false);
  const toggleShow = () => setOpenModal((p) => !p);
  const handleCallbackChild = (e) => {
    const item = e.row;
    console.log(item);
    setFormulario({
      ...formulario,
      empleado: item.id,
      codigoempleado: item.codigo,
      nombreempleado: item.nombre,
    });
    toggleShow();
  };

  const validacion = () => {
    const empleado = formulario.codigoempleado;
    const monto = formulario.monto;
    const plazo = formulario.plazo;
    const tasa = formulario.tasa;
    const seguro = formulario.seguroDesgravamen;

    if (empleado.trim() === '') {
      mensajeGenerico('error', 'Seleccione un empleado');
      return false;
    }
    if (monto === '' || monto === 0) {
      mensajeGenerico('error', 'Ingrese un monto');
      return false;
    }
    if (plazo === '' || plazo <= 0) {
      mensajeGenerico('error', 'El plazo debe ser mayor a cero');
      return false;
    }
    if (tasa === '' || tasa < 0) {
      mensajeGenerico('error', 'La tasa debe ser mayor o igual a cero');
      return false;
    }
    if (seguro === '' || seguro < 0) {
      mensajeGenerico('error', 'El valor de seguro por desgravamen debe ser mayor o igual a cero');
      return false;
    }
  };

  const limpiarCampos = () => {
    setFormulario({
      ...formulario,
      codigoempleado: '',
      empleado: '',
      amortizacion: 'ALEMAN',
      nombreempleado: '',
      tipo: 'TP0001',
      monto: 0,
      valorDividendo: 0,
      seguroDesgravamen: 0,
      plazo: 1,
      tasa: 0,
      liquidoRecibir: 0,
      fechaPrimerDividendo: new Date(),
      fechaUltimoDividendo: new Date(),
      fecha_ing: new Date(),
      maquina: '',
      usuario: usuario.codigo,
    });
    setDetallesPrestamos([]);
    setImprimir(true);
  };
  const calcularAmortizacion = () => {
    if (validacion() === false) {
      return 0;
    }

    const amortizacion = [];
    let contador = 0;
    // eslint-disable-next-line no-restricted-globals
    const deuda = isNaN(parseFloat(formulario.monto)) ? 0 : parseFloat(formulario.monto);
    // eslint-disable-next-line no-restricted-globals
    const plazo = isNaN(parseFloat(formulario.plazo)) ? 0 : parseFloat(formulario.plazo);
    // eslint-disable-next-line no-restricted-globals
    const interes = isNaN(parseFloat(formulario.tasa)) ? 0 : parseFloat(formulario.tasa) / 100 / 12;
    // eslint-disable-next-line no-restricted-globals
    const seguro = isNaN(parseFloat(formulario.seguroDesgravamen)) ? 0 : parseFloat(formulario.seguroDesgravamen);

    // validacion
    if (deuda === 0) {
      mensajeGenerico('error', 'La deuda debe ser mayor a cero');
      return;
    }

    if (formulario.amortizacion === 'ALEMAN') {
      while (contador !== parseFloat(formulario.plazo)) {
        const pagocapital = deuda / plazo;
        const codigo = contador + 1;
        const fecing = new Date();
        fecing.setMonth(fecing.getMonth() + codigo);

        if (amortizacion.length > 0) {
          const ultimopago = amortizacion.length - 1;
          const saldo = amortizacion[ultimopago].saldoCapital - pagocapital;

          amortizacion.push({
            codigo: formulario.codigo,
            linea: codigo,
            capitalAmortizado: pagocapital,
            dividendo: amortizacion[ultimopago].saldoCapital * interes + pagocapital,
            interes: amortizacion[ultimopago].saldoCapital * interes,
            saldoCapital: saldo > 0.001 ? saldo : 0,
            interesGracia: 0,
            fechaDividendo: fecing.toISOString(),
            estado: 'N',
          });
        } else {
          amortizacion.push({
            codigo: formulario.codigo,
            linea: codigo,
            interesGracia: seguro,
            capitalAmortizado: pagocapital,
            dividendo: deuda * interes + pagocapital + seguro,
            interes: deuda * interes,
            saldoCapital: deuda - pagocapital,
            fechaDividendo: fecing.toISOString(),
            estado: 'N',
          });
        }
        contador += 1;
      }
    }
    if (formulario.amortizacion === 'FRANCES') {
      while (contador !== parseFloat(formulario.plazo)) {
        const n = interes * (1 + interes) ** plazo;
        const d = (1 + interes) ** plazo - 1;

        const pagocapital = deuda * (n / d);

        console.log(pagocapital);

        const codigo = contador + 1;
        const fecing = new Date();
        fecing.setMonth(fecing.getMonth() + codigo);

        if (amortizacion.length > 0) {
          const ultimopago = amortizacion.length - 1;
          const saldo =
            amortizacion[ultimopago].saldoCapital - (pagocapital - amortizacion[ultimopago].saldo * interes);
          amortizacion.push({
            codigo: formulario.codigo,
            linea: codigo,
            capitalAmortizado: pagocapital,
            dividendo: pagocapital - amortizacion[ultimopago].saldoCapital * interes,
            interes: amortizacion[ultimopago].saldoCapital * interes,
            saldoCapital: saldo > 0.001 ? saldo : 0,
            interesGracia: 0,
            fechaDividendo: fecing.toISOString(),
            estado: 'N',
          });
        } else {
          amortizacion.push({
            codigo: formulario.codigo,
            linea: codigo,
            interesGracia: seguro,
            capitalAmortizado: pagocapital,
            dividendo: pagocapital - deuda * interes + seguro,
            interes: deuda * interes,
            saldoCapital: deuda - (pagocapital - deuda * interes),
            fechaDividendo: fecing.toISOString(),
            estado: 'N',
          });
        }
        contador += 1;
      }
    }
    console.log(amortizacion);
    setDetallesPrestamos(amortizacion);
    // console.log(amortizacion[amortizacion.length - 1])
  };
  React.useEffect(() => {
    formulario.fechaUltimoDividendo.setMonth(formulario.fechaUltimoDividendo.getMonth() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // grabar operacion
  const grabarPrestamo = async () => {
    if (detalleprestamos.length === 0) {
      mensajeGenerico('error', 'Debe calcular la amortización antes de guardar los datos');
      return 0;
    }
    try {
      const maquina = await obtenerMaquina();
      const enviarjson = {
        codigo: formulario.codigo,
        empleado: formulario.empleado,
        tipo: formulario.tipo,
        monto: formulario.monto,
        valorDividendo: formulario.valorDividendo,
        seguroDesgravamen: formulario.seguroDesgravamen,
        plazo: formulario.plazo,
        tasa: formulario.tasa,
        liquidoRecibir: formulario.liquidoRecibir,
        fechaPrimerDividendo: new Date(formulario.fechaPrimerDividendo),
        fechaUltimoDividendo: new Date(formulario.fechaUltimoDividendo),
        fecha_ing: new Date(),
        maquina,
        usuario: usuario.codigo,
        detalle: [...detalleprestamos],
      };
      const { data } = await axios.post(`${URLAPIGENERAL}/prestamo`, enviarjson, config, setMostrarProgreso(true));
      if (data === 200) {
        mensajeGenerico('succes', 'Datos registrados correctamente');
        setImprimir(false);
        const inicial = await axios(`${URLAPIGENERAL}/iniciales/buscar?opcion=NOM`, config, setMostrarProgreso(true));
        const inicialprestamo = inicial.data.filter((m) => m.usadoEnOpcion === 'NOM_PRESTAMO_CAB');

        // console.log(inicial);
        const codigogenerado = generarCodigo(inicialprestamo[0].inicial, inicialprestamo[0].numero, '0000');
        const codigogeneradoimp = generarCodigo(
          inicialprestamo[0].inicial,
          parseFloat(inicialprestamo[0].numero) - 1,
          '0000'
        );

        setFormulario({
          ...formulario,
          codigo: codigogenerado,
          codigoimprime: codigogeneradoimp,
        });
      }
      console.log(enviarjson);
    } catch (error) {
      if (error.response.status === 401) {
        setNoSesion(true);
        mensajeGenerico('error', 'Su sesión expiró');
      } else if (error.response.status === 500) {
        navegacion(`${PATH_PAGE.page500}`);
      } else {
        mensajeGenerico('error', 'Problemas al guardar verifique si se encuentra registrado');
      }
    } finally {
      setMostrarProgreso(false);
    }
  };

  React.useEffect(() => {
    async function getDatos() {
      try {
        const { data } = await axios(`${URLAPIGENERAL}/empleados/listar`, config, setMostrarProgreso(true));
        const tipoprestamosget = await axios(
          `${URLAPIGENERAL}/mantenimientogenerico/listarportabla?tabla=ADM_TIPO_PRESTAMO`,
          config,
          setMostrarProgreso(true)
        );

        const listaempleado = data.map((m) => ({ id: m.codigo, codigo: m.codigo_Empleado, nombre: m.nombres }));
        const prestamos = tipoprestamosget.data.map((p) => ({ codigo: p.codigo, nombre: p.nombre }));

        const inicial = await axios(`${URLAPIGENERAL}/iniciales/buscar?opcion=NOM`, config, setMostrarProgreso(true));
        const inicialprestamo = inicial.data.filter((m) => m.usadoEnOpcion === 'NOM_PRESTAMO_CAB');

        // console.log(inicial);
        const codigogenerado = generarCodigo(inicialprestamo[0].inicial, inicialprestamo[0].numero, '0000');

        setTiposPrestamos(prestamos);
        setEmpleado(listaempleado);

        setFormulario({
          ...formulario,
          codigo: codigogenerado,
        });
      } catch (error) {
        if (error.response.status === 401) {
          setNoSesion(true);
          mensajeGenerico('error', 'Su sesión expiró');
        } else if (error.response.status === 500) {
          navegacion(`${PATH_PAGE.page500}`);
        } else {
          mensajeGenerico('error', 'Problemas al guardar verifique si se encuentra registrado');
        }
      } finally {
        setMostrarProgreso(false);
      }
    }
    getDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------------------------------------
  async function buscarEmpleados() {
    if (formulario.codigoempleado.trim() === '') {
      setOpenModal(true);
    } else {
      try {
        const { data } = await axios(
          `${URLAPIGENERAL}/empleados/obtenerxcodigo?codigo=${
            formulario.codigoempleado === '' ? 'string' : formulario.codigoempleado
          }`,
          config
        );
        if (data.length === 0) {
          setNoExisteEmpleado(true);
          mensajeGenerico('warning', 'Código no encontrado');
        } else {
          setFormulario({
            ...formulario,
            empleado: data.codigo,
            codigoempleado: data.codigo_Empleado,
            nombreempleado: data.nombres,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  // -----------------------------------------------------------------------------------------------------

  return (
    <>
      <MensajesGenericos openModal={openMensaje} closeModal={cerrarMensaje} texto={texto} tipo={tipo} />
      <CircularProgreso
        open={mostrarprogreso}
        handleClose1={() => {
          setMostrarProgreso(false);
        }}
      />
      <ModalGenerico
        nombre="Empleados"
        openModal={openModal}
        busquedaTipo={tiposBusquedas}
        toggleShow={toggleShow}
        rowsData={empleado}
        parentCallback={handleCallbackChild}
      />
      <Page title="Prestamos">
        <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
          <Box sx={{ ml: 3, mr: 3, p: 1 }}>
            <HeaderBreadcrumbs
              heading="Prestamos"
              links={[{ name: 'Procesos' }, { name: 'Prestamos' }, { name: 'operacion' }]}
              action={
                <Grid container spacing={1}>
                  <Grid item md={4} sm={4} xs={12}>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => {
                        limpiarCampos();
                      }}
                      startIcon={<InsertDriveFileRoundedIcon />}
                    >
                      Nuevo
                    </Button>
                  </Grid>
                  <Grid item md={4} sm={4} xs={12}>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => {
                        grabarPrestamo();
                      }}
                      startIcon={<SaveRoundedIcon />}
                    >
                      Grabar
                    </Button>
                  </Grid>
                  <Grid item md={4} sm={4} xs={12}>
                    <Button
                      disabled={imprimir}
                      fullWidth
                      variant="text"
                      target="_blank"
                      href={`${URLAPIGENERAL}/prestamo/generarpdf?codigo=${formulario.codigoimprime}&operador=${usuario.tipo_Persona}`}
                      startIcon={<PrintRoundedIcon />}
                    >
                      Imprimir
                    </Button>
                  </Grid>
                </Grid>
              }
            />
          </Box>
        </Fade>
        <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
          <Card sx={{ ml: 3, mr: 3, p: 2 }}>
            <Box>
              <Grid container spacing={1}>
                <Grid item md={1.5} sm={6} xs={12}>
                  <RequiredTextField
                    disabled
                    size="small"
                    fullWidth
                    label="Codigo"
                    value={formulario.codigo}
                    sx={{
                      backgroundColor: '#e5e8eb',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#212B36',
                    }}
                  />
                </Grid>
                <Grid item md={1.8} sm={6} xs={12}>
                  <RequiredTextField
                    size="small"
                    fullWidth
                    label="Empleado"
                    value={formulario.codigoempleado}
                    onChange={(e) => {
                      setFormulario({
                        ...formulario,
                        codigoempleado: e.target.value,
                      });
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              buscarEmpleados();
                            }}
                          >
                            <SearchRoundedIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item md={3.2} sm={6} xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Nombre"
                    value={formulario.nombreempleado}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      backgroundColor: '#e5e8eb',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#212B36',
                    }}
                  />
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <RequiredTextField
                    select
                    size="small"
                    fullWidth
                    label="Tipo"
                    value={formulario.tipo}
                    onChange={(e) => {
                      setFormulario({
                        ...formulario,
                        tipo: e.target.value,
                        seguroDesgravamen: e.target.value === 'TP0003' ? 0 : formulario.seguroDesgravamen,
                      });
                    }}
                  >
                    {tipoprestamos.map((t) => (
                      <MenuItem key={t.codigo} value={t.codigo}>
                        {t.nombre}
                      </MenuItem>
                    ))}
                  </RequiredTextField>
                </Grid>
                <Grid item md={1.5} sm={6} xs={12}>
                  <NumericFormat
                    label={'Monto'}
                    customInput={RequiredTextField}
                    value={formulario.montoVer}
                    onValueChange={(e) => {
                      // eslint-disable-next-line no-restricted-globals
                      const monto = isNaN(parseFloat(e.value)) ? 0 : parseFloat(e.value);
                      const montoplazo = monto / parseFloat(formulario.plazo);
                      const portasa = parseFloat(formulario.tasa) / 100;
                      const valorDividendo = montoplazo * portasa + montoplazo;
                      // eslint-disable-next-line no-restricted-globals

                      const liquidacion = monto - parseFloat(formulario.seguro);

                      setFormulario({
                        ...formulario,
                        monto: e.value.trim(),
                        liquidoRecibir: liquidacion > 0 ? liquidacion : 0,
                        // eslint-disable-next-line no-restricted-globals
                        valorDividendo: isNaN(valorDividendo) ? 0 : valorDividendo.toFixed(2),
                      });
                    }}
                    prefix={'$'}
                    size="small"
                    type="text"
                    thousandSeparator
                  />
                </Grid>
                <Grid item md={1.5} sm={6} xs={12}>
                  <RequiredTextField
                    size="small"
                    fullWidth
                    label="Plazo"
                    value={formulario.plazo}
                    onChange={(e) => {
                      // eslint-disable-next-line no-restricted-globals
                      const plazo = isNaN(parseFloat(e.target.value)) ? 1 : parseFloat(e.target.value);
                      const montoplazo = parseFloat(formulario.monto) / plazo;
                      const portasa = parseFloat(formulario.tasa) / 100;
                      const valorDividendo = montoplazo * portasa + montoplazo;

                      // fecha
                      // reiniciando
                      // setFormulario({
                      //     ...formulario,
                      // });
                      const fecha = new Date();
                      fecha.setMonth(fecha.getMonth() + plazo);
                      // console.log(new Date().getMonth()+ plazo)

                      setFormulario({
                        ...formulario,
                        plazo: e.target.value.trim(),
                        fechaUltimoDividendo: fecha,
                        // eslint-disable-next-line no-restricted-globals
                        valorDividendo: isNaN(valorDividendo) ? 0 : valorDividendo.toFixed(2),
                      });
                    }}
                  />
                </Grid>

                <Grid item md={1.5} sm={6} xs={12}>
                  <RequiredTextField
                    size="small"
                    fullWidth
                    label="Tasa"
                    value={formulario.tasa}
                    onChange={(e) => {
                      // eslint-disable-next-line no-restricted-globals
                      const tasa = isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value);
                      const montoplazo = parseFloat(formulario.monto) / parseFloat(formulario.plazo);
                      const portasa = tasa / 100;
                      const valorDividendo = montoplazo * portasa + montoplazo;
                      console.log(valorDividendo);
                      setFormulario({
                        ...formulario,
                        tasa: e.target.value.trim(),
                        // eslint-disable-next-line no-restricted-globals
                        valorDividendo: isNaN(valorDividendo) ? 0 : valorDividendo.toFixed(2),
                      });
                    }}
                  />
                </Grid>
                <Grid item md={1.5} sm={6} xs={12}>
                  <TextField
                    disabled
                    size="small"
                    fullWidth
                    label="Valor dividendo"
                    value={formulario.valorDividendo}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        valorDividendo: e.target.value,
                      })
                    }
                    sx={{
                      backgroundColor: '#e5e8eb',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#212B36',
                    }}
                  />
                </Grid>
                <Grid item md={1.5} sm={6} xs={12}>
                  <RequiredTextField
                    disabled={formulario.tipo === 'TP0003'}
                    size="small"
                    fullWidth
                    label="Seguro"
                    value={formulario.seguroDesgravamen}
                    onChange={(e) => {
                      const seguro =
                        // eslint-disable-next-line no-restricted-globals
                        isNaN(parseFloat(e.target.value)) || parseFloat(e.target.value) < 0
                          ? 0
                          : parseFloat(e.target.value);
                      const liquidacion = parseFloat(formulario.monto) - seguro;
                      setFormulario({
                        ...formulario,
                        liquidoRecibir: liquidacion > 0 ? liquidacion : 0,
                        seguroDesgravamen: e.target.value.trim(),
                      });
                    }}
                  />
                </Grid>

                <Grid item md={1.5} sm={6} xs={12}>
                  <TextField
                    disabled
                    size="small"
                    fullWidth
                    label="Liquidacion"
                    value={formulario.liquidoRecibir}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        liquidoRecibir: e.target.value,
                      })
                    }
                    sx={{
                      backgroundColor: '#e5e8eb',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#212B36',
                    }}
                  />
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                    <MobileDatePicker
                      disabled
                      label="Fecha primer dividendo*"
                      value={formulario.fechaPrimerDividendo}
                      inputFormat="dd/MM/yyyy"
                      onChange={(newValue) => {
                        setFormulario({
                          ...formulario,
                          fechaPrimerDividendo: newValue,
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          sx={{
                            backgroundColor: '#e5e8eb',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#212B36',
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                    <MobileDatePicker
                      disabled
                      label="Fecha ultimo dividendo*"
                      value={formulario.fechaUltimoDividendo}
                      inputFormat="dd/MM/yyyy"
                      onChange={(newValue) => {
                        setFormulario({
                          ...formulario,
                          fechaUltimoDividendo: newValue,
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          sx={{
                            backgroundColor: '#e5e8eb',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#212B36',
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
            <Box mt={2}>
              <Grid container spacing={1}>
                <Grid item md={2} sm={4} xs={12}>
                  <RequiredTextField
                    // disabled
                    select
                    size="small"
                    fullWidth
                    label="Amortizacion"
                    value={formulario.amortizacion}
                    onChange={(e) => {
                      setFormulario({
                        ...formulario,
                        amortizacion: e.target.value,
                      });
                    }}
                  >
                    <MenuItem value="ALEMAN">ALEMAN</MenuItem>
                    <MenuItem value="FRANCES">FRANCES</MenuItem>
                  </RequiredTextField>
                </Grid>
                <Grid item md={1.2} sm={4} xs={12}>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => {
                      calcularAmortizacion();
                    }}
                    startIcon={<AddCircleRoundedIcon />}
                  >
                    Calcular
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box sx={estilosdetabla}>
              <div
                style={{
                  padding: '0.5rem',
                  height: '55vh',
                  width: '100%',
                }}
              >
                <DataGrid
                  density="compact"
                  rowHeight={28}
                  localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                  // onRowDoubleClick={(e) => Editar(e)}
                  sx={estilosdatagrid}
                  rows={detalleprestamos}
                  columns={columns}
                  getRowId={(datosfilas) => datosfilas.linea}
                  components={{
                    NoRowsOverlay: CustomNoRowsOverlay,
                  }}
                />
              </div>
            </Box>
          </Card>
        </Fade>
      </Page>
    </>
  );
}
