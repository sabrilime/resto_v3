import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Speciality } from '../specialities/entities/speciality.entity';

interface ChatbotQuery {
  speciality?: string;
  city?: string;
  query?: string;
}

@Injectable()
export class ChatbotService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Speciality)
    private specialityRepository: Repository<Speciality>,
  ) {}

  async processQuery(userQuery: string): Promise<{ restaurants: Restaurant[]; message: string }> {
    const parsedQuery = this.parseNaturalLanguage(userQuery);
    
    let restaurants: Restaurant[] = [];
    let message = '';

    if (parsedQuery.speciality && parsedQuery.city) {
      // Search by speciality and city
      restaurants = await this.findBySpecialityAndCity(parsedQuery.speciality, parsedQuery.city);
      message = `Voici les restaurants ${parsedQuery.speciality} à ${parsedQuery.city}`;
    } else if (parsedQuery.speciality) {
      // Search by speciality only
      restaurants = await this.findBySpeciality(parsedQuery.speciality);
      message = `Voici tous les restaurants ${parsedQuery.speciality}`;
    } else if (parsedQuery.city) {
      // Search by city only
      restaurants = await this.findByCity(parsedQuery.city);
      message = `Voici tous les restaurants à ${parsedQuery.city}`;
    } else if (parsedQuery.query) {
      // General search
      restaurants = await this.search(parsedQuery.query);
      message = `Résultats pour "${parsedQuery.query}"`;
    } else {
      // No specific criteria found, return all restaurants
      restaurants = await this.findAll();
      message = 'Voici tous les restaurants disponibles';
    }

    return { restaurants, message };
  }

  private parseNaturalLanguage(query: string): ChatbotQuery {
    const lowerQuery = query.toLowerCase().trim();
    
    // Common speciality keywords in French
    const specialityKeywords = {
      'italien': 'Italien',
      'italienne': 'Italien',
      'italiennes': 'Italien',
      'italiens': 'Italien',
      'pizza': 'Italien',
      'pasta': 'Italien',
      'pâtes': 'Italien',
      'français': 'Français',
      'française': 'Français',
      'françaises': 'Français',
      'chinois': 'Chinois',
      'chinoise': 'Chinois',
      'chinoises': 'Chinois',
      'japonais': 'Japonais',
      'japonaise': 'Japonais',
      'japonaises': 'Japonais',
      'sushi': 'Japonais',
      'thaï': 'Thaï',
      'thaïlandais': 'Thaï',
      'thaïlandaise': 'Thaï',
      'indien': 'Indien',
      'indienne': 'Indien',
      'indiennes': 'Indien',
      'mexicain': 'Mexicain',
      'mexicaine': 'Mexicain',
      'mexicaines': 'Mexicain',
      'tacos': 'Mexicain',
      'libanais': 'Libanais',
      'libanaise': 'Libanais',
      'libanaises': 'Libanais',
      'grec': 'Grec',
      'grecque': 'Grec',
      'grecques': 'Grec',
      'espagnol': 'Espagnol',
      'espagnole': 'Espagnol',
      'espagnoles': 'Espagnol',
      'tapas': 'Espagnol',
      'portugais': 'Portugais',
      'portugaise': 'Portugais',
      'portugaises': 'Portugais',
      'marocain': 'Marocain',
      'marocaine': 'Marocain',
      'marocaines': 'Marocain',
      'tunisien': 'Tunisien',
      'tunisienne': 'Tunisien',
      'tunisiennes': 'Tunisien',
      'algérien': 'Algérien',
      'algérienne': 'Algérien',
      'algériennes': 'Algérien',
      'turc': 'Turc',
      'turque': 'Turc',
      'turques': 'Turc',
      'vietnamien': 'Vietnamien',
      'vietnamienne': 'Vietnamien',
      'vietnamiennes': 'Vietnamien',
      'coréen': 'Coréen',
      'coréenne': 'Coréen',
      'coréennes': 'Coréen',
      'fast-food': 'Fast-food',
      'burger': 'Fast-food',
      'hamburger': 'Fast-food',
      'kebab': 'Kebab',
      'kebabs': 'Kebab',
      'pâtisserie': 'Pâtisserie',
      'boulangerie': 'Boulangerie',
      'café': 'Café',
      'bar': 'Bar',
      'brasserie': 'Brasserie',
      'bistrot': 'Bistrot',
      'gastronomique': 'Gastronomique',
      'haute cuisine': 'Gastronomique',
      'cuisine traditionnelle': 'Traditionnel',
      'traditionnel': 'Traditionnel',
      'traditionnelle': 'Traditionnel',
      'traditionnelles': 'Traditionnel',
      'traditionnels': 'Traditionnel',
    };

    // Common city keywords
    const cityKeywords = [
      'paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 
      'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'saint-étienne',
      'toulon', 'angers', 'grenoble', 'dijon', 'nîmes', 'saint-denis',
      'le havre', 'villeurbanne', 'saint-paul', 'metz', 'besançon',
      'caen', 'orléans', 'mulhouse', 'rouen', 'boulogne-billancourt',
      'perpignan', 'nancy', 'argenteuil', 'montreuil', 'roubaix',
      'tourcoing', 'nanterre', 'avignon', 'vitry-sur-seine', 'créteil',
      'dunkerque', 'poitiers', 'asnières-sur-seine', 'colombes', 'versailles',
      'aulnay-sous-bois', 'courbevoie', 'cherbourg-en-cotentin', 'rueil-malmaison',
      'bourges', 'fort-de-france', 'cannes', 'aubervilliers', 'calais',
      'béziers', 'antibes', 'saint-ouen', 'colmar', 'saint-denis',
      'mérignac', 'valence', 'quimper', 'drancy', 'noisy-le-grand',
      'la rochelle', 'beauvais', 'sevran', 'clichy-sous-bois', 'bondy',
      'vannes', 'sartrouville', 'massy', 'limoges', 'meaux',
      'albi', 'tarbes', 'martigues', 'bayonne', 'belfort',
      'brive-la-gaillarde', 'chambéry', 'niort', 'chalon-sur-saône', 'sète',
      'saint-brieuc', 'pau', 'haguenau', 'annecy', 'caluire-et-cuire',
      'saint-malo', 'boulogne-sur-mer', 'blois', 'carcassonne', 'châteauroux',
      'cholet', 'charleville-mézières', 'évreux', 'agen', 'laval',
      'troyes', 'clermont-ferrand', 'tours', 'limoges', 'dijon',
      'angers', 'le mans', 'brest', 'amiens', 'nîmes',
      'toulon', 'grenoble', 'reims', 'lille', 'saint-étienne',
      'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier',
      'bordeaux', 'lyon', 'marseille', 'paris'
    ];

    let foundSpeciality: string | undefined;
    let foundCity: string | undefined;
    let remainingQuery = lowerQuery;

    // Find speciality
    for (const [keyword, speciality] of Object.entries(specialityKeywords)) {
      if (lowerQuery.includes(keyword)) {
        foundSpeciality = speciality;
        remainingQuery = remainingQuery.replace(new RegExp(keyword, 'g'), '').trim();
        break;
      }
    }

    // Find city
    for (const city of cityKeywords) {
      if (lowerQuery.includes(city)) {
        foundCity = city.charAt(0).toUpperCase() + city.slice(1);
        remainingQuery = remainingQuery.replace(new RegExp(city, 'g'), '').trim();
        break;
      }
    }

    return {
      speciality: foundSpeciality,
      city: foundCity,
      query: remainingQuery || undefined
    };
  }

  private async findBySpecialityAndCity(specialityName: string, cityName: string): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.postedBy', 'postedBy')
      .leftJoinAndSelect('restaurant.address', 'address')
      .leftJoinAndSelect('restaurant.specialities', 'specialities')
      .where('LOWER(address.city) = LOWER(:city)', { city: cityName })
      .andWhere('specialities.name ILIKE :speciality', { speciality: `%${specialityName}%` })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }

  private async findBySpeciality(specialityName: string): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.postedBy', 'postedBy')
      .leftJoinAndSelect('restaurant.address', 'address')
      .leftJoinAndSelect('restaurant.specialities', 'specialities')
      .where('specialities.name ILIKE :speciality', { speciality: `%${specialityName}%` })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }

  private async findByCity(cityName: string): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.postedBy', 'postedBy')
      .leftJoinAndSelect('restaurant.address', 'address')
      .leftJoinAndSelect('restaurant.specialities', 'specialities')
      .where('LOWER(address.city) = LOWER(:city)', { city: cityName })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }

  private async search(query: string): Promise<Restaurant[]> {
    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.postedBy', 'postedBy')
      .leftJoinAndSelect('restaurant.address', 'address')
      .leftJoinAndSelect('restaurant.specialities', 'specialities')
      .where('restaurant.name ILIKE :query', { query: `%${query}%` })
      .orWhere('restaurant.description ILIKE :query', { query: `%${query}%` })
      .andWhere('restaurant.status = :status', { status: 'active' })
      .orderBy('restaurant.rating', 'DESC')
      .getMany();
  }

  private async findAll(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      where: { status: 'active' },
      relations: ['postedBy', 'address', 'specialities'],
      order: { rating: 'DESC' },
    });
  }
}
