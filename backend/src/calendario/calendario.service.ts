import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Calendario } from './entities/calendario.entity';
import { CreateCalendarioDto } from './dto/create-calendario.dto';

@Injectable()
export class CalendarioService {
  private readonly logger = new Logger(CalendarioService.name);
  private readonly webhookUrl = process.env.WEBHOOK_URL!;

  constructor(
    @InjectRepository(Calendario)
    private calendarioRepository: Repository<Calendario>,
    private readonly httpService: HttpService,
  ) {}

  async crearActualizarCalendario(
    dto: CreateCalendarioDto,
  ): Promise<Calendario> {
    let row = await this.calendarioRepository.findOne({
      where: { uid_firebase: dto.uid_firebase, fecha: dto.fecha },
    });

    if (row) {
      row.desayuno = dto.desayuno ?? null;
      row.comida = dto.comida ?? null;
      row.cena = dto.cena ?? null;
      await this.calendarioRepository.save(row);
    } else {
      row = this.calendarioRepository.create(dto);
      await this.calendarioRepository.save(row);
    }

    await this.procesarWebhooks(dto);

    return row;
  }

  /*
  aqui unos n8n para que cunado se haga un post de las recetas que se añadan en el calendario a n8n
  para recoger primero el body del post, que tiene los datos de uid, id de la receta, fecha y tipo de comida,
  despues filtro lo que recoge para solo usar ese body con esos datos, luego hago un apeticion SQL 
  donde solicito toda la informacion de la receta que tenga el id que se ha recogido, y filtro y parseo
  los ingredientes de la receta para obtener el nombre de cada producto y otros de sus datos,
  luego hago otra peticion SQL que se encargar de buscar en mi base de datos los datos id, nombre,
  precio y supermercado del producto que se ha obtenido de la receta, y luego realizo un insert 
  en sql a la tabla de lista de la compra correspondiendo los datos recibidos con los apartados en los que iria.
  */
  private async procesarWebhooks(dto: CreateCalendarioDto): Promise<void> {
    const webhooks: Array<Promise<void>> = [];

    if (dto.desayuno) {
      webhooks.push(
        this.enviarWebhook(
          dto.uid_firebase,
          dto.desayuno,
          dto.fecha,
          'desayuno',
        ),
      );
    }
    if (dto.comida) {
      webhooks.push(
        this.enviarWebhook(dto.uid_firebase, dto.comida, dto.fecha, 'comida'),
      );
    }
    if (dto.cena) {
      webhooks.push(
        this.enviarWebhook(dto.uid_firebase, dto.cena, dto.fecha, 'cena'),
      );
    }

    if (webhooks.length > 0) {
      await Promise.allSettled(webhooks);
    }
  }

  private async enviarWebhook(
    uid_firebase: string,
    idReceta: number,
    fecha: string,
    tipoComida: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(this.webhookUrl, {
          uid_firebase,
          id_receta: idReceta,
          fecha,
          tipo_comida: tipoComida,
        }),
      );
      this.logger.log(
        `Webhook n8n enviado para ${tipoComida} (receta ${idReceta}) en la fecha: ${fecha}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Webhook n8n falló para ${tipoComida}: ${error?.message ?? error} en la fecha: ${fecha}`,
      );
    }
  }

  findByUser(uid_firebase: string): Promise<Calendario[]> {
    return this.calendarioRepository.find({ where: { uid_firebase } });
  }
}
