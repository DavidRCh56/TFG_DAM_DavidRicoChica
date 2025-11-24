import { Component, OnInit } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { ScraperService } from '../../services/scraper.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { getAuth } from 'firebase/auth';

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
  foroRecetas: boolean = false;
  produtos: boolean = false;

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

  todosProductos: any[] = [];
  paginaActiva: number = 1;
  productosPorPagina: number = 40;
  totalPaginas: number = 1;

  readonly SUPERMERCADOS: string[] = ['Mercadona', 'Dia'];

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
    if (this.listaCompra) {
      await this.cargarListaCompra();
    }

    const res = await this.getUserRoleAsync();
    this.userRole = res.rol;

    this.uid_firebase = await this.getUidFirebase();

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
    this.foroRecetas = false;
    this.produtos = false;

    switch (nombre) {
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

  async cargarRecetasUsuario() {
    try {
      const recetas = await firstValueFrom(
        this.http.get<any[]>(`${this.backendUrl}/recetas?uid_firebase=${this.uid_firebase}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      this.recetasDisponibles = recetas.map(r => ({ id: r.id, titulo: r.titulo }));
    } catch (err) {
      this.recetasDisponibles = [];
    }
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
  async guardarTodoCalendario() {
    const peticiones = [];
    for (const fecha in this.seleccionesRecetasPorDia) {
      const selec = this.seleccionesRecetasPorDia[fecha];
      const payload = {
        uid_firebase: this.uid_firebase,
        fecha: fecha,
        desayuno: selec.desayuno || null,
        comida: selec.comida || null,
        cena: selec.cena || null
      };
      
      peticiones.push(this.http.post(
        `${this.backendUrl}/calendario/crear-actualizar`,
        payload,
        { headers: { Authorization: `Bearer ${this.token}` } }
      ).toPromise());
    }
    try {
      await Promise.all(peticiones);
      this.mensajeScraper = 'Calendario guardado correctamente.';
    } catch (e) {
      this.mensajeScraper = 'Error al guardar el calendario.';
    }
  }

  async cargarListaCompra() {
    this.cargandoLista = true;
    try {
      this.listaCompraDatos = await firstValueFrom(this.http.get<any[]>(
        `${this.backendUrl}/lista-compra/semana`, {
          params: {
            uid_firebase: this.uid_firebase,
            fecha: this.fechaActual,
            ...(this.supermercado ? { supermercado: this.supermercado } : {})
          },
          headers: { Authorization: `Bearer ${this.token}` }
        }
      ));
    } finally {
      this.cargandoLista = false;
    }
  }

  async buscarProductos() {
    if (!this.buscador.trim()) {
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
  }

  async anadirProductoManual(prod: any) {
    await firstValueFrom(this.http.post(
      `${this.backendUrl}/lista-compra/manual`,
      { uid_firebase: this.uid_firebase, id_producto: prod.Id, cantidad: 1 },
      { headers: { Authorization: `Bearer ${this.token}` } }
    ));
    this.resultadosBuscador = [];
    this.buscador = '';
    await this.cargarListaCompra();
  }

  async eliminarProductoManual(producto: any) {
    await firstValueFrom(this.http.delete(
      `${this.backendUrl}/lista-compra/manual`, {
        params: {
          uid_firebase: this.uid_firebase,
          id_producto: producto.id_producto
        },
        headers: { Authorization: `Bearer ${this.token}` }
      }
    ));
    await this.cargarListaCompra();
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
    const user = await getAuth().currentUser;
    const token = user ? await user.getIdToken() : '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await firstValueFrom(
      this.http.get<{ rol: string | null }>(
        `${this.backendUrl}/usuarios/rol`,
        { headers }
      )
    );
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
}
