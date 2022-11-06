import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { IPokemon } from './interfaces/IPokemon.interface';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private url = 'https://pokeapi.co/api/v2/pokemon?limit=500';
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) { }
  
  async execute_seed() {
    this.pokemonModel.deleteMany({});
    const { data } = await this.axios.get<PokeResponse>(this.url);
    const pokemons: IPokemon[] = [];
    data.results.forEach(({ name, url }) => {
      const pokemon: IPokemon = {
        name,
        id_number: this.get_id_number(url)
      }
      pokemons.push(pokemon);
    });
    await this.pokemonModel.insertMany(pokemons);
    return pokemons;
  }

  private get_id_number(url: string) {
    const segments = url.split('/');
    const id_number = +segments[segments.length - 2];
    return id_number;
  }

}
