import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) { 
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        id_number: 1
      })
      .select('-__v');
  }

  async findOne(query: string) {
    let pokemon: Pokemon;
    if (!isNaN(+query)) {
      pokemon = await this.pokemonModel.findOne({ id_number: query });
    }
    if (!pokemon && isValidObjectId(query)) {
      pokemon = await this.pokemonModel.findById(query);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: query.toLowerCase().trim() })
    }
    if (!pokemon)
      throw new NotFoundException(`Pokemon with id, name or no "${query}" not found`);
    return pokemon;
  }

  async update(query: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(query);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      const updatedPokemen = await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // Querying the db twice
    // const pokemon =  await this.findOne(id);
    // return await pokemon.deleteOne();

    // Querying the db once, but no validating
    // const deletedPokemon = await this.pokemonModel.findByIdAndDelete(id);
    // return deletedPokemon;

    // Querying the db once and validating
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }
    return 'Pokemon deleted successfully';
  }

  private handleExceptions(error: any) {
    switch (error.code) {
      case 11000:
        throw new BadRequestException(`There's a pokemon in db with ${JSON.stringify(error.keyValue)} already`);
      default:
        console.log(error);
        throw new InternalServerErrorException(`Check server logs`);
    }
  }
}
