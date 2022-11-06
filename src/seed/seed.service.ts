import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { IPokemon } from './interfaces/IPokemon.interface';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private url = 'https://pokeapi.co/api/v2/pokemon?limit=500';
  private readonly axios: AxiosInstance = axios;

  async execute_seed() {
    const { data } = await this.axios.get<PokeResponse>(this.url);
    const pokemons: IPokemon[] = [];
    data.results.forEach(({ name, url }) => {
      const pokemon: IPokemon = {
        name,
        id_number: this.get_id_number(url)
      }
      pokemons.push(pokemon);
    });
    return pokemons;
  }

  private get_id_number(url: string) {
    const segments = url.split('/');
    const id_number = +segments[segments.length - 2];
    return id_number;
  }

}
