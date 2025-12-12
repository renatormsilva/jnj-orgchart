import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface RandomUserPhoto {
  results: Array<{
    picture: {
      large: string;
      medium: string;
      thumbnail: string;
    };
  }>;
}

/**
 * Infere o gênero baseado no primeiro nome (nomes brasileiros comuns)
 */
function inferGender(fullName: string): 'male' | 'female' {
  const firstName = fullName.split(' ')[0].toLowerCase();

  const femaleNames = [
    'maria', 'ana', 'juliana', 'carla', 'fernanda', 'helena', 'mariana',
    'olivia', 'renata', 'sofia', 'beatriz', 'carolina', 'gabriela',
    'julia', 'larissa', 'patricia', 'vanessa', 'adriana', 'camila',
    'daniela', 'leticia', 'natalia', 'paula', 'roberta', 'tatiana'
  ];

  const maleNames = [
    'joão', 'bruno', 'diego', 'gustavo', 'igor', 'lucas', 'nicolas',
    'paulo', 'thiago', 'alex', 'carlos', 'eduardo', 'felipe',
    'henrique', 'leonardo', 'marcelo', 'pedro', 'rafael', 'rodrigo',
    'sergio', 'vinicius', 'anderson', 'fabio', 'guilherme', 'joaquin'
  ];

  if (femaleNames.includes(firstName)) {
    return 'female';
  }

  if (maleNames.includes(firstName)) {
    return 'male';
  }

  // Default: inferir por terminação do nome
  if (firstName.endsWith('a')) {
    return 'female';
  }

  return 'male';
}

/**
 * Popula o banco de dados com fotos de pessoas reais da API randomuser.me
 * Busca fotos de acordo com o gênero inferido do nome
 */
async function populatePhotos() {
  try {
    console.log('🚀 Iniciando população de fotos com reconhecimento de gênero...\n');

    // Buscar todas as pessoas
    const people = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
        photoPath: true,
      },
    });

    console.log(`📊 Total de pessoas no banco: ${people.length}\n`);

    // Separar por gênero
    const peopleWithGender = people.map(person => ({
      ...person,
      gender: inferGender(person.name)
    }));

    const males = peopleWithGender.filter(p => p.gender === 'male');
    const females = peopleWithGender.filter(p => p.gender === 'female');

    console.log(`👨 Homens: ${males.length}`);
    console.log(`👩 Mulheres: ${females.length}\n`);

    // Buscar fotos de homens
    console.log('🌐 Buscando fotos de homens...');
    const malePhotosResponse = await axios.get<RandomUserPhoto>(
      `https://randomuser.me/api/?results=${males.length}&gender=male&inc=picture`
    );
    const malePhotos = malePhotosResponse.data.results;
    console.log(`✅ ${malePhotos.length} fotos de homens obtidas!`);

    // Buscar fotos de mulheres
    console.log('🌐 Buscando fotos de mulheres...');
    const femalePhotosResponse = await axios.get<RandomUserPhoto>(
      `https://randomuser.me/api/?results=${females.length}&gender=female&inc=picture`
    );
    const femalePhotos = femalePhotosResponse.data.results;
    console.log(`✅ ${femalePhotos.length} fotos de mulheres obtidas!\n`);

    // Atualizar banco de dados
    console.log('💾 Atualizando banco de dados...\n');

    let updated = 0;

    // Atualizar homens
    for (let i = 0; i < males.length; i++) {
      const person = males[i];
      const photo = malePhotos[i];

      await prisma.person.update({
        where: { id: person.id },
        data: {
          photoPath: photo.picture.large,
        },
      });

      updated++;
      console.log(`  👨 ${updated}/${people.length} - ${person.name}`);
    }

    // Atualizar mulheres
    for (let i = 0; i < females.length; i++) {
      const person = females[i];
      const photo = femalePhotos[i];

      await prisma.person.update({
        where: { id: person.id },
        data: {
          photoPath: photo.picture.large,
        },
      });

      updated++;
      console.log(`  👩 ${updated}/${people.length} - ${person.name}`);
    }

    console.log('\n✨ Migração concluída com sucesso!');
    console.log(`📸 ${updated} fotos adicionadas (${males.length} homens, ${females.length} mulheres)\n`);

  } catch (error) {
    console.error('❌ Erro ao popular fotos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
populatePhotos();
