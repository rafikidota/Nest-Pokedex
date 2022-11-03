import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {

  execute_seed() {
    
    return `seed executed`;
  }

}
