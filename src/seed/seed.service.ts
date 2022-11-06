import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { IPokemon } from './interfaces/IPokemon.interface';
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from '../common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  private url = 'https://pokeapi.co/api/v2/pokemon?limit=500';

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) { }

  async execute_seed() {
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>(this.url);
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
