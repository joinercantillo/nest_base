import { Category } from './entities/category.entity.js';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const temporalCategory = this.categoryRepository.create(createCategoryDto);
      const newCategory = await this.categoryRepository.save(temporalCategory);

      return newCategory;
    } catch (error: any) {
      const { code, detail } = error;

      if (code === '23505') {
        throw new BadRequestException(detail);
      }

      throw error;
    }
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: string) {
    if (!id) {
      return {
        ok: false,
        message: 'Debe ingresar un ID',
      };
    }

    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      return {
        ok: false,
        message: 'ID no encontrado',
      };
    }

    return {
      ok: true,
      category,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name: newName } = updateCategoryDto;

    if (!newName) {
      return {
        ok: false,
        message: 'Ingrese un nuevo nombre',
      };
    }

    const result = await this.findOne(id);

    if (!result.ok) {
      return {
        ok: false,
        message: 'La categoría no existe',
      };
    }

    const existingCategory = result.category as Category;

    if (existingCategory.name.toLowerCase() === newName.toLowerCase()) {
      return {
        ok: true,
        message: 'No se registran cambios',
      };
    }

    existingCategory.name = newName;
    const updatedCategory = await this.categoryRepository.save(existingCategory);

    return {
      ok: true,
      message: 'Actualizado correctamente',
      category: updatedCategory,
    };
  }

  async remove(id: string) {
    const result = await this.findOne(id);

    if (!result.ok) {
      return {
        ok: false,
        message: 'La categoría no existe',
      };
    }

    await this.categoryRepository.delete(id);

    return {
      ok: true,
      message: `Categoría con id #${id} eliminada correctamente`,
    };
  }
}
  