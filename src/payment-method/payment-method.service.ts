import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Las importaciones de arriba se mueven aquí para que el servicio sea autocontenido
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const newPaymentMethod = this.paymentMethodRepository.create(createDto);
    try {
      return await this.paymentMethodRepository.save(newPaymentMethod);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`El método de pago con descripción "${createDto.description}" ya existe.`);
      }
      throw new InternalServerErrorException('Error al crear el método de pago.');
    }
  }

  findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find();
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({ idpayment_method: id });
    if (!paymentMethod) {
      throw new NotFoundException(`Método de pago con ID #${id} no encontrado.`);
    }
    return paymentMethod;
  }

  async update(id: number, updateDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id); // Reutiliza findOne para validar si existe
    this.paymentMethodRepository.merge(paymentMethod, updateDto);
    try {
      return await this.paymentMethodRepository.save(paymentMethod);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`El método de pago con descripción "${updateDto.description}" ya existe.`);
      }
      throw new InternalServerErrorException('Error al actualizar el método de pago.');
    }
  }

  async remove(id: number): Promise<PaymentMethod> {
    const methodToRemove = await this.findOne(id);
    await this.paymentMethodRepository.remove(methodToRemove);
    return methodToRemove;
  }
}
