import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ScraperService } from '../../services/scraper.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.html',
  providers: [ScraperService],
  imports: [CommonModule, HttpClientModule, FormsModule],
})
export class Principal implements OnInit {
  resumenSemanal: boolean = true;
  miCalendario: boolean = false;
  listaCompra: boolean = false;
  recetas: boolean = false;
  recetasFavoritas: boolean = false;
  foroRecetas: boolean = false;
  produtos: boolean = false;
  gestionUsuario: boolean = false;

  token: string | null = localStorage.getItem('userToken');
  tokenValido: boolean | null = null;
  uid_firebase: string = '';
  userRole: string | null = null;

  ejecutando: boolean = false;
  mensajeScraper: string = '';

  preguntaIA: string = '';
  respuestaIA: string = '';
  cargandoIA: boolean = false;
  errorIA: string = '';
  n8nUrl = environment.n8nUrl;

  backendUrl = environment.backendUrl;

  diasSemana: { fecha: Date; nombre: string; numero: number; esHoy: boolean }[] = [];
  mesesES: string[] = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  diasES: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  mesActual: string = '';
  anoActual: number = 0;

  mesActivo: number = 0;
  anoActivo: number = 0;
  diasDelMesArray: { numero: number; esHoy: boolean; diaSemana: number }[] = [];
  diasSemanaNombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  recetasDisponibles: { id: number; titulo: string }[] = [];
  tiposComida = ['desayuno', 'comida', 'cena'] as const;

  seleccionesRecetasPorDia: {
    [fecha: string]: { desayuno: number, comida: number, cena: number }
  } = {};

  listaCompraDatos: any[] = [];
  buscador: string = '';
  resultadosBuscador: any[] = [];
  supermercado: string = '';
  fechaActual: string = '';
  cargandoLista: boolean = false;

  noDisponibleImg: string = 'https://ia601909.us.archive.org/8/items/no-disponible_202511/no%20disponible.png';
  usuarioSinFoto: string = 'https://archive.org/download/foto-perfil-base/foto-perfil-base.png';

  todosProductos: any[] = [];
  paginaActiva: number = 1;
  productosPorPagina: number = 40;
  totalPaginas: number = 1;

  readonly SUPERMERCADOS: string[] = ['Mercadona', 'Dia'];

  inputBusquedaValue = '';
  historialBusquedas: { id: number; termino_busqueda: string }[] = [];

  usuarios: any[] = [];
  formulario: any = {
    uid_firebase: '',
    email: '',
    nombre_usuario: '',
    rol: 'cliente' as 'cliente' | 'admin',
    foto_url: '',
    password_actual: '',
    nueva_password: ''
  };
  editandoUid: string | null = null;
  cargando: boolean = false;
  mensajeUsuario: string = '';
  exitoUsuario: boolean = true;

  listaCompraDiaSeleccionado: string = '';
  listaCompraSemanaSeleccionada: number = 0;
  vistaListaCompra: 'dia' | 'semana' = 'dia';
  cargandoListaCompra: boolean = false;

  recetasCompletas: Array<any & { esFavorita?: boolean }> = [];
  recetasFavoritasLista: any[] = [];
  recetasCompartidasLista: any[] = [];
  detalleRecetaVisible: boolean = false;
  recetaSeleccionada: any | null = null;
  ingredientesDetalle: any[] = [];
  pasosDetalle: string[] = [];
  editandoReceta: boolean = false;
  formReceta: {
    id: number | null;
    titulo: string;
    descripcion: string;
    url_imagen: string;
    ingredientes: any[];
    pasos: string;
    predeterminada: boolean;
    compartida: boolean;
  } = {
    id: null,
    titulo: '',
    descripcion: '',
    url_imagen: '',
    ingredientes: [],
    pasos: '',
    predeterminada: false,
    compartida: false,
  };

  mostrarIAInput: boolean = false;
  buscandoIngredientes: boolean = false;
  queryIngredientes: string = '';
  resultadosIngredientes: any[] = [];
  modalRecetaAbierto: boolean = false;
  creandoReceta: boolean = false;
  formRecetaCrea = {
    titulo: '',
    descripcion: '',
    urlimagen: '',
    ingredientes: [] as {nombre: string, cantidad: string, idProducto?: number}[],
    pasos: '',
    predeterminada: false,
    compartida: false
  };

  constructor(
    private http: HttpClient,
    private scraperService: ScraperService,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.tokenValido = await this.validarToken();
    //creo una fecha formateada unsando la zona horaria UTC, esto me devolveria algo asi: 2025-11-24T07:30:00.000Z
    //mas o menos, asique cojo solo la parte de la fecha usando slice
    this.fechaActual = new Date().toISOString().slice(0,10);
    if (!this.tokenValido) {
      localStorage.removeItem('userToken');
      this.router.navigate(['/login']);
      return;
    }

    const auth = getAuth();
    await new Promise<void>((resolve) => {
      const unsub = auth.onAuthStateChanged((user) => {
        unsub();
        resolve();
      });
    });

    const res = await this.getUserRoleAsync();
    this.userRole = res.rol;

    this.uid_firebase = await this.getUidFirebase();

    //cargar datos del usuario actual para el formulario
    await this.cargarDatosUsuario();

    //cargar usuarios si es admin
    if (this.userRole === 'admin') {
      await this.cargarUsuarios();
    }

    this.calcularSemanaActual();

    //inicializa calendario mensual
    const hoy = new Date();
    this.mesActivo = hoy.getMonth();
    this.anoActivo = hoy.getFullYear();
    this.calcularDiasDelMes(this.anoActivo, this.mesActivo);

    //cargar recetas reales del usuario
    await this.cargarRecetasUsuario();
    //cargar selecciones previas guardadas en BD
    await this.cargarSeleccionesBD();
    await this.cargarTodosProductos();
    await this.cargarHistorialBusquedas();
    this.listaCompraDiaSeleccionado = this.fechaActual;
    await this.cargarListaCompraDia(this.fechaActual);
    await this.cargarRecetasFavoritas();
    await this.cargarRecetasCompartidas();
  }

  async cargarUsuarios() {
    if (this.userRole !== 'admin') return;

    try {
      this.usuarios = await firstValueFrom(
        this.http.get<any[]>(`${this.backendUrl}/usuarios`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      this.mensajeUsuario = 'Error al cargar usuarios';
      this.exitoUsuario = false;
    }
  }

  async cargarDatosUsuario(uid?: string) {

    try {
      const targetUid = uid || this.uid_firebase;
      const usuario = await firstValueFrom(
        this.http.get<any>(`${this.backendUrl}/usuarios/${targetUid}`, {
          headers: { Authorization: `Bearer ${this.token || localStorage.getItem('userToken')!}` }
        })
      );
      this.formulario = {
        uid_firebase: usuario.uid_firebase,
        email: usuario.email,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol,
        foto_url: usuario.foto_url || '',
        password_actual: '',
        nueva_password: ''
      };
      console.log('Datos usuario cargados:', this.formulario);
    } catch (error) {
      console.error('Error cargando datos usuario:', error);
      this.formulario = {
        uid_firebase: this.uid_firebase,
        email: 'usuario@ejemplo.com',
        nombre_usuario: 'Usuario',
        rol: (this.userRole as 'cliente' | 'admin') || 'cliente',
        foto_url: '',
        password_actual: '',
        nueva_password: ''
      };
    }
  }

  private async cambiarPasswordEnFirebase(email: string, passwordActual: string, nuevaPassword: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No hay usuario autenticado');
    }
    const cred = EmailAuthProvider.credential(email, passwordActual);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, nuevaPassword);
  }

  async guardarCambios() {

    if (this.cargando) return;

    this.cargando = true;
    this.mensajeUsuario = '';

    try {
      const esPropio = !this.editandoUid || this.editandoUid === this.uid_firebase;

      if (esPropio && this.formulario.nueva_password) {
        if (!this.formulario.password_actual) {
          throw new Error('Debes introducir la contraseña actual para cambiar la contraseña.');
        }
        await this.cambiarPasswordEnFirebase(
          this.formulario.email,
          this.formulario.password_actual,
          this.formulario.nueva_password
        );
      }
      const payload: any = {
        email: this.formulario.email,
        nombre_usuario: this.formulario.nombre_usuario,
        foto_url: this.formulario.foto_url || null
      };

      if (this.userRole === 'admin' && this.editandoUid) {
        payload.rol = this.formulario.rol;
      }
      await firstValueFrom(
        this.http.patch(
          `${this.backendUrl}/usuarios/${this.formulario.uid_firebase}`,
          payload,
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
      );
      this.mensajeUsuario = 'Usuario actualizado correctamente';
      this.exitoUsuario = true;
      await this.cargarDatosUsuario();

      if (this.userRole === 'admin') {
        await this.cargarUsuarios();
      }

      if (this.editandoUid && this.editandoUid !== this.uid_firebase) {
        this.cancelarEdicion();
      }

      //limpiar campos de contraseña
      this.formulario.password_actual = '';
      this.formulario.nueva_password = '';

    } catch (error: any) {
      console.error('Error guardando cambios:', error);
      this.mensajeUsuario = error.message || error.error?.message || 'Error al guardar cambios';
      this.exitoUsuario = false;
    } finally {
      this.cargando = false;
    }
  }

  editarUsuario(usuario: any) {
    this.editandoUid = usuario.uid_firebase;
    this.formulario = {
      uid_firebase: usuario.uid_firebase,
      email: usuario.email,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      foto_url: usuario.foto_url || '',
      password_actual: '',
      nueva_password: ''
    };
  }

  cancelarEdicion() {
    this.editandoUid = null;
    this.formulario.password_actual = '';
    this.formulario.nueva_password = '';
    this.cargarDatosUsuario();
    this.mensajeUsuario = '';
  }

  async eliminarUsuario(uid: string) {
    if (!confirm(`¿Eliminar usuario ${uid}? Esta acción no se puede deshacer.`)) return;

    try {
      await firstValueFrom(
        this.http.delete(`${this.backendUrl}/usuarios/${uid}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );

      this.usuarios = this.usuarios.filter(u => u.uid_firebase !== uid);
      this.mensajeUsuario = 'Usuario eliminado correctamente';
      this.exitoUsuario = true;

    } catch (error: any) {
      console.error('Error eliminando usuario:', error);
      this.mensajeUsuario = error.error?.message || 'Error al eliminar usuario';
      this.exitoUsuario = false;
    }
  }

  trackByUid(index: number, usuario: any): string {
    return usuario.uid_firebase;
  }

  async eliminarMiCuenta() {
    if (!confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción es irreversible.')) return;

    this.cargando = true;
    this.mensajeUsuario = '';

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No hay usuario autenticado.');
      }
      await firstValueFrom(
        this.http.delete(`${this.backendUrl}/usuarios/${this.uid_firebase}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      await this.eliminarUsuario(user.uid);
      localStorage.removeItem('userToken');
      this.mensajeUsuario = 'Cuenta eliminada correctamente.';
      this.exitoUsuario = true;
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Error eliminando la cuenta:', error);
      this.mensajeUsuario = error.message || error.error?.message || 'Error al eliminar la cuenta.';
      this.exitoUsuario = false;
    }
  }

  // validacion de token con el backend
  async validarToken(): Promise<boolean> {
    const token = localStorage.getItem('userToken');
    if (!token) return false;
    try {
      await firstValueFrom(
        this.http.post(`${this.backendUrl}/usuarios/verificacion-token`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async enviarPreguntaIA() {
    if (await this.validarToken() === true) {
      if (!this.preguntaIA.trim())
        return;
      this.cargandoIA = true;
      this.respuestaIA = '';
      this.errorIA = '';

      try {
        const resp: any = await firstValueFrom(
          this.http.post(this.n8nUrl, { pregunta: this.preguntaIA })
        );
        this.respuestaIA = (resp.respuesta !== undefined ? resp.respuesta : JSON.stringify(resp));
      } catch (err: any) {
        this.errorIA = 'No se pudo consultar la IA. Intenta de nuevo.';
        console.error('Error en consulta IA:', err);
        if (err.error) {
          console.error('Detalle del error:', err.error);
        }
      } finally {
        this.cargandoIA = false;
      }
    } else {
      this.alert('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('userToken');
      this.router.navigate(['/login']);
    }
  }

  setActiveSection(nombre: string) {
    this.resumenSemanal = false;
    this.miCalendario = false;
    this.listaCompra = false;
    this.recetas = false;
    this.recetasFavoritas = false;
    this.foroRecetas = false;
    this.produtos = false;
    this.gestionUsuario = false;

    switch (nombre) {
      case 'gestionUsuario':
        this.gestionUsuario = true;
        if (this.userRole === 'admin') {
          this.cargarUsuarios();
        }
        break;
      case 'resumenSemanal':
        this.resumenSemanal = true;
        break;
      case 'miCalendario':
        this.miCalendario = true;
        break;
      case 'listaCompra':
        this.listaCompra = true;
        break;
      case 'produtos':
        this.produtos = true;
        break;
      case 'recetas':
        this.recetas = true;
        break;
      case 'recetasFavoritas':
        this.recetasFavoritas = true;
        break;
      case 'foroRecetas':
        this.foroRecetas = true;
        break;
    }
  }

  async ejecutarScraper() {
    if (await this.validarToken() === true) {
      this.ejecutando = true;
      this.mensajeScraper = '';
      try {
        const resp: any = await firstValueFrom(this.scraperService.ejecutarScraper());
        this.mensajeScraper = resp.message || 'Scraper ejecutado con éxito.';
      } catch (err) {
        this.mensajeScraper = 'Error al ejecutar el scraper.';
      } finally {
        this.ejecutando = false;
      }
    } else {
      this.alert('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('userToken');
      this.router.navigate(['/login']);
    }
  }

  alert(mensaje: string) {
    window.alert(mensaje);
  }

  async bearerTokenAuth() {
    const user = await getAuth().currentUser;
    const token = user ? await user.getIdToken() : null;
    console.log('Usando token para autorización:', token);
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  async getUidFirebase(): Promise<string> {
    const user = await getAuth().currentUser;
    return user ? user.uid : '';
  }

  async logout() {
    if (await this.validarToken() === true) {
      console.log('Iniciando cierre de sesión...');
      this.http.post(`${this.backendUrl}/usuarios/logout`, {}, await this.bearerTokenAuth())
        .subscribe({
          next: () => {
            console.log('Token revocado.');
            localStorage.removeItem('userToken');
            console.log('Redirigido a la página de login.');
            this.router.navigate(['/login']);
            console.log('Cierre de sesión exitoso.');
          },
          error: (err) => {
            console.error('Error durante el logout:', err);
            window.alert('Error al cerrar sesión. Inténtalo de nuevo.');
          }
        });
      } else {
        this.alert('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('userToken');
        this.router.navigate(['/login']);
      }
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }

  async cargarSeleccionesBD() {
    try {
      const datos: any = await firstValueFrom(
        this.http.get<any[]>(`${this.backendUrl}/calendario?uid_firebase=${this.uid_firebase}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      datos.forEach((item: any) => {
        this.seleccionesRecetasPorDia[item.fecha] = {
          desayuno: item.desayuno || 0,
          comida: item.comida || 0,
          cena: item.cena || 0
        };
      });
    } catch (err) {}
  }

  calcularSemanaActual() {
    const hoy = new Date();
    this.mesActual = this.mesesES[hoy.getMonth()];
    this.anoActual = hoy.getFullYear();
    const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
    const primerDiaSemana = new Date(hoy);
    primerDiaSemana.setDate(hoy.getDate() - diaSemana);

    this.diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(primerDiaSemana);
      fecha.setDate(primerDiaSemana.getDate() + i);
      this.diasSemana.push({
        fecha,
        nombre: this.diasES[i],
        numero: fecha.getDate(),
        esHoy: fecha.toDateString() === hoy.toDateString()
      });
    }
  }

  calcularDiasDelMes(anio: number, mes: number) {
    this.diasDelMesArray = [];
    const hoy = new Date();
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const primerDiaSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

    for (let i = 0; i < primerDiaSemana; i++) {
      this.diasDelMesArray.push({ numero: 0, esHoy: false, diaSemana: i });
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(anio, mes, dia);
      const diaSemana = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1;
      const esHoy = fecha.toDateString() === hoy.toDateString();
      const fechaKey = fecha.toISOString().slice(0, 10);
      if (!this.seleccionesRecetasPorDia[fechaKey]) {
        this.seleccionesRecetasPorDia[fechaKey] = { desayuno: 0, comida: 0, cena: 0 };
      }
      this.diasDelMesArray.push({ numero: dia, esHoy, diaSemana });
    }
  }

  mesAnterior() {
    if (this.mesActivo === 0) {
      this.mesActivo = 11;
      this.anoActivo--;
    } else {
      this.mesActivo--;
    }
    this.calcularDiasDelMes(this.anoActivo, this.mesActivo);
  }

  mesSiguiente() {
    if (this.mesActivo === 11) {
      this.mesActivo = 0;
      this.anoActivo++;
    } else {
      this.mesActivo++;
    }
    this.calcularDiasDelMes(this.anoActivo, this.mesActivo);
  }

  async cambiarSeleccion(fechaKey: string, tipo: 'desayuno' | 'comida' | 'cena', recetaId: number) {
    this.seleccionesRecetasPorDia[fechaKey][tipo] = recetaId;

    const payload = {
      uid_firebase: this.uid_firebase,
      fecha: fechaKey,
      desayuno: this.seleccionesRecetasPorDia[fechaKey].desayuno || null,
      comida: this.seleccionesRecetasPorDia[fechaKey].comida || null,
      cena: this.seleccionesRecetasPorDia[fechaKey].cena || null
    };

    await firstValueFrom(
      this.http.post(`${this.backendUrl}/calendario/crear-actualizar`, payload, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
    );
  }

  async buscarProductos() {
    this.buscador = this.inputBusquedaValue.trim();
    if (!this.buscador) {
      this.resultadosBuscador = [];
      await this.cargarTodosProductos();
      return;
    }
    this.resultadosBuscador = await firstValueFrom(this.http.get<any[]>(
      `${this.backendUrl}/productos/buscar`, {
        params: {
          nombre: this.buscador,
          supermercado: this.supermercado
        },
        headers: { Authorization: `Bearer ${this.token}` }
      }
    ));

    //guarda lo buscado
    await this.http.post(
      `${this.backendUrl}/historial-busquedas`,
      { termino_busqueda: this.buscador },
      { headers: { Authorization: `Bearer ${this.token}` } }
    ).toPromise();

    //actualiza historial
    await this.cargarHistorialBusquedas();
  }

  async cargarHistorialBusquedas() {
    this.historialBusquedas = await firstValueFrom(
      this.http.get<{ id: number; termino_busqueda: string }[]>(
        `${this.backendUrl}/historial-busquedas/listar`, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
    );
  }

  buscarDesdeHistorial(termino: string) {
    this.inputBusquedaValue = termino;
    this.buscador = termino;
    this.buscarProductos();
  }

  async eliminarBusqueda(id: number) {
    try {
      await firstValueFrom(
        this.http.delete(`${this.backendUrl}/historial-busquedas/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      await this.cargarHistorialBusquedas();
    } catch (error) {
      console.error('Error eliminando búsqueda:', error);
    }
  }

  async eliminarTodoHistorial() {
    try {
      await firstValueFrom(
        this.http.delete(`${this.backendUrl}/historial-busquedas`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      await this.cargarHistorialBusquedas();
    } catch (error) {
      console.error('Error eliminando todo el historial:', error);
    }
  }

  onInputChange(event: Event) {
    this.inputBusquedaValue = (event.target as HTMLInputElement).value;
  }

  //utilidad para filtro de supermercados
  get supermercadosLista(): string[] {
    return this.SUPERMERCADOS;
  }
  get totalListaCompra(): number {
    return this.listaCompraDatos.reduce(
      (sum, item) =>
        sum + ((item.subtotal != null ? item.subtotal : (item.precio || 0) * (item.cantidad || 1))),
      0
    );
  }

  async getUserRoleAsync(): Promise<{ rol: string | null }> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.warn('getUserRoleAsync: no hay usuario de Firebase aún');
        return { rol: null };
      }

      const token = await user.getIdToken();
      if (!token) {
        console.warn('getUserRoleAsync: token vacío');
        return { rol: null };
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const perfil = await firstValueFrom(
        this.http.get<any>(`${this.backendUrl}/usuarios/perfil`, { headers })
      );

      this.formulario = {
        uid_firebase: this.uid_firebase,
        email: perfil.email,
        nombre_usuario: perfil.nombre_usuario,
        rol: perfil.rol,
        foto_url: perfil.foto_url || '',
        password_actual: '',
        nueva_password: ''
      };

      return { rol: perfil.rol };

    } catch (error) {
      console.error('Error getUserRole:', error);
      return { rol: null };
    }
  }

  async cargarTodosProductos() {
    const res = await firstValueFrom(
      this.http.get<any[]>(`${this.backendUrl}/productos`, {
        params: { supermercado: this.supermercado },
        headers: { Authorization: `Bearer ${this.token}` }
      })
    );
    this.todosProductos = res;
    this.totalPaginas = Math.ceil(this.todosProductos.length / this.productosPorPagina);
    this.paginaActiva = 1;
  }

  irAnterior() {
    if (this.paginaActiva > 1) {
      this.paginaActiva--;
    }
  }
  irSiguiente() {
    if (this.paginaActiva < this.totalPaginas) {
      this.paginaActiva++;
    }
  }

  async cargarListaCompraDia(fecha: string) {
    this.cargandoListaCompra = true;
    this.listaCompraDiaSeleccionado = fecha;
    try {
      this.listaCompraDatos = await firstValueFrom(
        this.http.get<any[]>(`${this.backendUrl}/lista-compra?uid_firebase=${this.uid_firebase}`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { fecha }
        })
      );
    } catch (error) {
      this.listaCompraDatos = [];
      console.error('Error cargando lista compra día:', error);
    } finally {
      this.cargandoListaCompra = false;
    }
  }

  async cargarListaCompraSemana(semanaOffset: number) {
    this.cargandoListaCompra = true;
    this.listaCompraSemanaSeleccionada = semanaOffset;
    try {
      //calculo fechas de la semana
      const hoy = new Date();
      const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
      const primerDiaSemana = new Date(hoy);
      primerDiaSemana.setDate(hoy.getDate() - diaSemana - (semanaOffset * 7));
      const ultimoDiaSemana = new Date(primerDiaSemana);
      ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);

      const fechaInicio = primerDiaSemana.toISOString().slice(0, 10);
      const fechaFin = ultimoDiaSemana.toISOString().slice(0, 10);

      this.listaCompraDatos = await firstValueFrom(
        this.http.get<any[]>(`${this.backendUrl}/lista-compra?uid_firebase=${this.uid_firebase}`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
        })
      );
    } catch (error) {
      this.listaCompraDatos = [];
      console.error('Error cargando lista compra semana:', error);
    } finally {
      this.cargandoListaCompra = false;
    }
  }

  cambiarVistaListaCompra(vista: 'dia' | 'semana') {
    this.vistaListaCompra = vista;
    if (vista === 'dia') {
      this.cargarListaCompraDia(this.fechaActual);
    } else {
      this.cargarListaCompraSemana(0);
    }
  }

  cambiarDiaListaCompra(fecha: string) {
    this.cargarListaCompraDia(fecha);
  }

  cambiarSemanaListaCompra(offset: number) {
    this.cargarListaCompraSemana(offset);
  }

  getFechaInicioSemana(offset: number): Date {
    const hoy = new Date();
    const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() - diaSemana - (offset * 7));
    return primerDia;
  }

  getFechaFinSemana(offset: number): Date {
    const inicio = this.getFechaInicioSemana(offset);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    return fin;
  }

  async cargarRecetasUsuario() {
    try {
      const [recetas, favoritas] = await Promise.all([
        firstValueFrom(
          this.http.get<any[]>(`${this.backendUrl}/recetas?uid_firebase=${this.uid_firebase}`, {
            headers: { Authorization: `Bearer ${this.token}` }
          })
        ),
        firstValueFrom(
          this.http.get<any[]>(`${this.backendUrl}/favoritas`, {
            params: { uid_firebase: this.uid_firebase },
            headers: { Authorization: `Bearer ${this.token}` }
          })
        ),
      ]);

      const idsFavoritas = new Set(favoritas.map(r => r.id));

      //base única de recetas
      this.recetasCompletas = recetas.map(r => ({
        ...r,
        esFavorita: idsFavoritas.has(r.id),
      }));

      this.recetasFavoritasLista = this.recetasCompletas.filter(r => r.esFavorita);
      this.recetasDisponibles = this.recetasCompletas.map(r => ({ id: r.id, titulo: r.titulo }));
      this.recetasCompartidasLista = this.recetasCompletas.filter(r => r.compartida);
    } catch (err) {
      console.error('Error cargando recetas/favoritas:', err);
      this.recetasCompletas = [];
      this.recetasFavoritasLista = [];
      this.recetasCompartidasLista = [];
      this.recetasDisponibles = [];
    }
  }

  editarReceta(receta: any): void {
    this.recetaSeleccionada = receta;

    //Parseo ingredientes a array
    try {
      const limpio = this.sanitizeIngredientesJson(receta.ingredientes);
      const ingredientes = JSON.parse(limpio);

      //adapto al formato del formulario
      this.formRecetaCrea.ingredientes = ingredientes.map((ing: any) => ({
        nombre: String(ing.nombre ?? '').trim(),
        cantidad: ing.cantidad ? String(ing.cantidad).trim() : '',
        idProducto: ing.idProducto ?? undefined,
      }));
    } catch {
      this.formRecetaCrea.ingredientes = [];
    }

    //relleno resto de campos
    this.formRecetaCrea = {
      ...this.formRecetaCrea,
      titulo: receta.titulo || '',
      descripcion: receta.descripcion || '',
      urlimagen: receta.urlimagen || '',
      pasos: receta.pasos || '',
      predeterminada: receta.predeterminada || false,
      compartida: receta.compartida || false,
    };

    this.creandoReceta = false;
    this.modalRecetaAbierto = true;
    this.editandoReceta = true;
    this.queryIngredientes = '';
    this.resultadosIngredientes = [];
  }

  async guardarRecetaEditada() {
    if (!this.recetaSeleccionada?.id) return;

    const payload: any = {
      titulo: this.formRecetaCrea.titulo,
      descripcion: this.formRecetaCrea.descripcion,
      urlimagen: this.formRecetaCrea.urlimagen,
      pasos: this.formRecetaCrea.pasos,
      ingredientes: this.formRecetaCrea.ingredientes,
      compartida: this.formRecetaCrea.compartida,
    };

    if (this.userRole === 'admin') {
      payload.predeterminada = this.formRecetaCrea.predeterminada;
    }


    try {
      const res = await firstValueFrom(
        this.http.patch<any>(`${this.backendUrl}/recetas/${this.recetaSeleccionada.id}`, payload, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
      );

      //actualizo receta en memoria
      const idx = this.recetasCompletas.findIndex(
        r => r.id === this.recetaSeleccionada.id
      );
      if (idx !== -1) {
        this.recetasCompletas[idx] = {
          ...this.recetasCompletas[idx],
          ...res,
          ingredientes: res.ingredientes,
        };
      }

      this.recetasFavoritasLista = this.recetasCompletas.filter(r => r.esFavorita);
      this.recetasCompartidasLista = this.recetasCompletas.filter(r => r.compartida);
      this.recetasDisponibles = this.recetasCompletas.map(r => ({
        id: r.id,
        titulo: r.titulo,
      }));

      this.cerrarModalReceta();
    } catch (e: any) {
      console.error('Error guardando receta', e);
      alert(e?.error?.message || 'No se pudo guardar la receta.');
    }
  }

  async eliminarReceta(receta: any) {
    try {
      await firstValueFrom(
        this.http.delete(`${this.backendUrl}/recetas/${receta.id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );

      this.recetasCompletas = this.recetasCompletas.filter(r => r.id !== receta.id);
      this.recetasFavoritasLista = this.recetasCompletas.filter(r => r.esFavorita);
      this.recetasCompartidasLista = this.recetasCompletas.filter(r => r.compartida);
      this.recetasDisponibles = this.recetasCompletas.map(r => ({ id: r.id, titulo: r.titulo }));

      if (this.recetaSeleccionada && this.recetaSeleccionada.id === receta.id) {
        this.cerrarDetalleReceta();
      }

    } catch (e: any) {
      console.error('Error eliminando receta:', e);
      alert(e.error?.message || 'No se pudo eliminar la receta.');
    }
  }

  async togglePredeterminada(receta: any) {
    if (this.userRole !== 'admin') return;

    const url = `${this.backendUrl}/recetas/${receta.id}`;
    const payload = { predeterminada: !receta.predeterminada };

    try {
      const res = await firstValueFrom(
        this.http.patch<any>(url, payload, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      receta.predeterminada = res.predeterminada;
    } catch (e: any) {
      console.error('Error cambiando predeterminada:', e);
      alert(e.error?.message || 'No se pudo cambiar el estado predeterminado.');
    }
  }

  trackByRecetaId(index: number, receta: any): number {
    return receta.id;
  }

  private sanitizeIngredientesJson(ingredientesJson: string): string {
    if (!ingredientesJson) return '[]';
    return ingredientesJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }

  getPrimerosIngredientes(ingredientesJson: string): any[] {
    try {
      const limpio = this.sanitizeIngredientesJson(ingredientesJson);
      const ingredientes = JSON.parse(limpio || '[]');
      return ingredientes.slice(0, 3);
    } catch (error) {
      console.error('Error parseando ingredientes:', error, ingredientesJson);
      return [];
    }
  }

  getTotalIngredientes(ingredientesJson: string): number {
    try {
      const limpio = this.sanitizeIngredientesJson(ingredientesJson);
      return JSON.parse(limpio || '[]').length;
    } catch (error) {
      return 0;
    }
  }

  onImageError(event: any): void {
    event.target.src = this.noDisponibleImg;
  }

  async cargarRecetasFavoritas() {
    try {
      const favoritas = await firstValueFrom(
        this.http.get<any[]>(`${this.backendUrl}/favoritas`, {
          params: { uid_firebase: this.uid_firebase },
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      this.recetasFavoritasLista = favoritas;
    } catch (err) {
      console.error('Error cargando recetas favoritas:', err);
      this.recetasFavoritasLista = [];
    }
  }

  async toggleFavorita(receta: any) {
    const url = `${this.backendUrl}/favoritas`;
    const params = { uid_firebase: this.uid_firebase, receta_id: receta.id };

    try {
      if (receta.esFavorita) {
        await firstValueFrom(
          this.http.delete(url, {
            params,
            headers: { Authorization: `Bearer ${this.token}` },
          })
        );
        receta.esFavorita = false;
      } else {
        await firstValueFrom(
          this.http.post(url, null, {
            params,
            headers: { Authorization: `Bearer ${this.token}` },
          })
        );
        receta.esFavorita = true;
      }

      const idx = this.recetasCompletas.findIndex(r => r.id === receta.id);
      if (idx !== -1) {
        this.recetasCompletas[idx].esFavorita = receta.esFavorita;
      } else if (receta.esFavorita) {
        this.recetasCompletas.push({ ...receta });
      }

      this.recetasFavoritasLista = this.recetasCompletas.filter(r => r.esFavorita);
    } catch (e: any) {
      console.error('Error cambiando favorita', e);
    }
  }

  async cargarRecetasCompartidas() {
    try {
      this.recetasCompartidasLista = await firstValueFrom(
        this.http.get<any[]>(`${this.backendUrl}/recetas/foro`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
      );
    } catch (err) {
      console.error('Error cargando foro de recetas', err);
      this.recetasCompartidasLista = [];
    }
  }

  async toggleCompartida(receta: any) {
    const url = `${this.backendUrl}/recetas/${receta.id}`;
    const payload = { compartida: !receta.compartida };

    try {
      const res = await firstValueFrom(
        this.http.patch<any>(url, payload, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
      );

      receta.compartida = res.compartida;
      this.recetasCompartidasLista = this.recetasCompletas.filter(r => r.compartida);
    } catch (e: any) {
      console.error('Error cambiando compartida', e);
      alert(e?.error?.message || 'No se pudo cambiar el estado compartida.');
    }
  }

  mostrarDetallesReceta(receta: any): void {
    this.recetaSeleccionada = receta;

    //parseo ingredientes completos
    try {
      const limpio = this.sanitizeIngredientesJson(receta.ingredientes);
      this.ingredientesDetalle = JSON.parse(limpio || '[]');
    } catch {
      this.ingredientesDetalle = [];
    }

    //pasos que el backend guarda como texto con saltos de línea
    if (receta.pasos) {
      this.pasosDetalle = receta.pasos
        .split(/\r?\n/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);
    } else {
      this.pasosDetalle = [];
    }

    this.detalleRecetaVisible = true;
  }

  cerrarDetalleReceta(): void {
    this.detalleRecetaVisible = false;
    this.recetaSeleccionada = null;
    this.ingredientesDetalle = [];
    this.pasosDetalle = [];
    this.editandoReceta = false;
  }

  toggleIAInput() {
    this.mostrarIAInput = !this.mostrarIAInput;
    if (this.mostrarIAInput) {
      this.preguntaIA = '';
      this.respuestaIA = '';
      this.errorIA = '';
    }
  }

  buscarIngredientes(query: string) {
    this.queryIngredientes = query;

    if (query.length < 2) {
      this.resultadosIngredientes = [];
      return;
    }

    this.buscandoIngredientes = true;
    this.inputBusquedaValue = query;
    this.buscarProductos()
      .then(() => {
        this.resultadosIngredientes = (this.resultadosBuscador || []).slice(0, 6).map((p: any) => ({
          id_producto: p.Id ?? p.id ?? p.id_producto,
          nombre: p.Nombre,
          precio: p.Precio,
          supermercado: p.Supermercado,
        }));
      })
      .finally(() => {
        this.buscandoIngredientes = false;
      });
  }

  seleccionarIngrediente(producto: any) {
    if (!producto) return;

    this.formRecetaCrea.ingredientes.push({
      nombre: producto.nombre,
      cantidad: '',
      idProducto: producto.id_producto,
    });

    this.queryIngredientes = '';
    this.resultadosIngredientes = [];
  }

  anadirIngredienteManual() {
    this.formRecetaCrea.ingredientes.push({ nombre: '', cantidad: '' });
  }

  removerIngrediente(index: number) {
    this.formRecetaCrea.ingredientes.splice(index, 1);
  }

  abrirCrearReceta() {
    this.formRecetaCrea = {
      titulo: '', descripcion: '', urlimagen: '',
      ingredientes: [],
      pasos: '', predeterminada: false, compartida: false
    };
    this.creandoReceta = true;
    this.modalRecetaAbierto = true;
    this.queryIngredientes = '';
    this.resultadosIngredientes = [];
  }

  async guardarNuevaReceta() {
    if (this.cargando || !this.formRecetaCrea.titulo.trim()) return;

    this.cargando = true;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert('Token no encontrado, inicia sesión de nuevo.');
        this.router.navigate(['login']);
        return;
      }

      const payload = {
        uidfirebase: this.uid_firebase,
        titulo: this.formRecetaCrea.titulo,
        descripcion: this.formRecetaCrea.descripcion || '',
        urlimagen: this.formRecetaCrea.urlimagen || '',
        ingredientes: this.formRecetaCrea.ingredientes,
        pasos: this.formRecetaCrea.pasos || '',
        predeterminada: this.formRecetaCrea.predeterminada,
        compartida: this.formRecetaCrea.compartida,
      };

      console.log('Payload creación receta:', payload);


      const res = await firstValueFrom(
        this.http.post<any>(
          `${this.backendUrl}/recetas`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      console.log('Respuesta creación receta:', res);

      this.recetasCompletas.unshift({ ...res, esFavorita: false });
      this.cerrarModalReceta();
      await this.cargarRecetasUsuario();

    } catch (e: any) {
      console.error('Error al crear receta (detalle):', e);
      console.error('Error.body:', e?.error);
      alert(e?.error?.message || e?.message || 'Error al crear receta');
    } finally {
      this.cargando = false;
    }
  }

  cerrarModalReceta() {
    this.modalRecetaAbierto = false;
    this.creandoReceta = false;
    this.editandoReceta = false;
    this.queryIngredientes = '';
    this.resultadosIngredientes = [];
    this.formRecetaCrea = {
      titulo: '',
      descripcion: '',
      urlimagen: '',
      ingredientes: [],
      pasos: '',
      predeterminada: false,
      compartida: false,
    };
  }

  private componerCantidad(ing: any): string {
    const cantidad = ing.cantidad ? String(ing.cantidad).trim() : '';
    const unidad = ing.unidad ? String(ing.unidad).trim() : '';
    if (cantidad && unidad) return `${cantidad} ${unidad}`;
    if (cantidad) return cantidad;
    if (unidad) return unidad;
    return '';
  }

  //convierto la respuesta de IA en una receta editable
  usarRespuestaIAComoReceta() {
    if (!this.respuestaIA) return;

    const texto = this.respuestaIA as string;

    let titulo = 'Receta IA';
    const matchTitulo = texto.match(/Nombre del plato\s*:\s*(.+)/i);
    if (matchTitulo && matchTitulo[1]) {
      titulo = matchTitulo[1].trim();
    }

    let descripcion = '';
    const matchDescripcion = texto.match(/Descripción:\s*([\s\S]*?)\n\s*Ingredientes\s*\(JSON\)\s*:/i);
    if (matchDescripcion && matchDescripcion[1]) {
      descripcion = matchDescripcion[1].trim();
    }

    let urlimagen = '';
    const matchUrl = texto.match(/https?:\/\/\S+/i);
    if (matchUrl) {
      urlimagen = matchUrl[0].trim();
    }

    let ingredientes: any[] = [];
    const matchJson = texto.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (matchJson) {
      try {
        ingredientes = JSON.parse(matchJson[0]);
      } catch {
        ingredientes = [];
      }
    }

    const ingredientesNormalizados = ingredientes
      .map((ing: any) => ({
        nombre: String(ing.nombre ?? '').trim(),
        cantidad: this.componerCantidad(ing),
        idProducto: undefined,
      }))
      .filter((ing: any) => ing.nombre);

    let pasos = '';
    const idxPrep = texto.toLowerCase().indexOf('preparación:');
    if (idxPrep !== -1) {
      pasos = texto.substring(idxPrep + 'preparación:'.length).trim();
    }

    this.formRecetaCrea = {
      titulo,
      descripcion,
      urlimagen,
      ingredientes: ingredientesNormalizados,
      pasos,
      predeterminada: false,
      compartida: false,
    };

    this.creandoReceta = true;
    this.modalRecetaAbierto = true;
    this.queryIngredientes = '';
    this.resultadosIngredientes = [];
  }

  getRecetasDiaSemana(fecha: Date): any[] {
    if (!fecha) return [];
    const fechaKey = fecha.toISOString().slice(0, 10);
    const selec = this.seleccionesRecetasPorDia[fechaKey];
    if (!selec) return [];

    const ids: number[] = [];
    if (selec.desayuno) ids.push(selec.desayuno);
    if (selec.comida) ids.push(selec.comida);
    if (selec.cena) ids.push(selec.cena);

    return this.recetasCompletas.filter(r => ids.includes(r.id));
  }

  //devuelve un string tipo "pollo, arroz, tomate" a partir del JSON de ingredientes
  getIngredientesResumen(ingredientesJson: string): string {
    const primeros = this.getPrimerosIngredientes(ingredientesJson);
    if (!primeros || primeros.length === 0) return 'Sin ingredientes';
    return primeros.map((ing: any) => ing.nombre).join(', ');
  }

  getTipoComidaResumen(fecha: Date, recetaId: number): string {
    if (!fecha) return '';
    const fechaKey = fecha.toISOString().slice(0, 10);
    const selec = this.seleccionesRecetasPorDia[fechaKey];
    if (!selec) return '';

    const tipos: string[] = [];
    if (selec.desayuno === recetaId) tipos.push('Desayuno');
    if (selec.comida === recetaId) tipos.push('Comida');
    if (selec.cena === recetaId) tipos.push('Cena');

    return tipos.join(' · ');
  }

  abrirDetalleDesdeResumen(receta: any, fecha: Date): void {
    this.mostrarDetallesReceta(receta);
  }

  getRecetaPorTipo(fecha: Date, tipo: 'desayuno' | 'comida' | 'cena'): any | null {
    if (!fecha) return null;
    const fechaKey = fecha.toISOString().slice(0, 10);
    const selec = this.seleccionesRecetasPorDia[fechaKey];
    if (!selec || !selec[tipo]) return null;

    const id = selec[tipo];
    return this.recetasCompletas.find(r => r.id === id) || null;
  }

  async anadirProductoListaCompra(event: Event, prod: any) {
    event.stopPropagation();
    event.preventDefault();

    console.log('Producto recibido en anadirProductoListaCompra:', prod);

    const idProducto = prod.Id ?? prod.id ?? prod.id_producto;

    const body = {
      fecha: this.fechaActual,
      id_producto: String(idProducto),
      nombre_producto: prod.Nombre,
      precio: String(prod.Precio),
      supermercado: prod.Supermercado,
      cantidad: 1,
    };

    console.log('POST /lista-compra body:', body);

    try {
      await firstValueFrom(
        this.http.post<any>(`${this.backendUrl}/lista-compra`, body, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
      );
      await this.cargarListaCompraDia(this.fechaActual);
    } catch (error) {
      console.error('Error añadiendo producto a la lista de la compra', error);
      this.alert('No se pudo añadir el producto a la lista de la compra.');
    }
  }



  async eliminarItemListaCompra(id: number) {
    if (!confirm('¿Eliminar este producto de la lista de la compra?')) return;
    try {
      await firstValueFrom(
        this.http.delete(`${this.backendUrl}/lista-compra/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );

      this.listaCompraDatos = this.listaCompraDatos.filter(item => item.id !== id);

    } catch (error) {
      console.error('Error eliminando elemento de la lista de la compra:', error);
      this.alert('No se pudo eliminar el elemento de la lista de la compra.');
    }
  }

  async actualizarCantidadListaCompra(itemId: number, nuevaCantidad: number) {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.backendUrl}/lista-compra/${itemId}`,
          { cantidad: nuevaCantidad },
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
      );

      //actualizo en memoria
      const item = this.listaCompraDatos.find(i => i.id === itemId);
      if (item) {
        item.cantidad = nuevaCantidad;
      }

    } catch (error) {
      console.error('Error actualizando cantidad en lista de la compra:', error);
      this.alert('No se pudo actualizar la cantidad del producto.');
    }
  }

  cambiarCantidadItem(item: any, delta: number) {
    const nuevaCantidad = (item.cantidad || 0) + delta;

    //si baja a 0, lo elimino directamente
    if (nuevaCantidad <= 0) {
      this.eliminarItemListaCompra(item.id);
      return;
    }

    this.actualizarCantidadListaCompra(item.id, nuevaCantidad);
  }

  onClickCompartir(receta: any): void {
    console.log('CLICK COMPARTIR', receta.id, receta.uid_firebase, this.uid_firebase);
    this.toggleCompartida(receta);
  }
}
