# Gerenciamento de Fotos - J&J Organizational Chart

## ✅ Opção 1: API Random User (Implementada)

Usa a API [randomuser.me](https://randomuser.me) para obter fotos de pessoas reais.

### Como usar:
```bash
npm run db:photos
```

### Como funciona:
1. Busca 100 fotos da API randomuser.me
2. Atualiza o campo `photoPath` de cada pessoa no banco
3. As URLs são diretas para fotos hospedadas externamente

### Vantagens:
- ✅ Rápido e fácil
- ✅ Fotos de pessoas reais
- ✅ Sem custo de storage
- ✅ Ideal para desenvolvimento e demos

### Desvantagens:
- ❌ Dependência de API externa
- ❌ Não permite upload de fotos customizadas

---

## 🚀 Opção 2: Supabase Storage (Produção)

Para produção, configure o Supabase Storage para uploads de fotos.

### Passo 1: Configurar Storage no Supabase

1. Acesse o dashboard do Supabase
2. Vá em **Storage** → **New Bucket**
3. Crie um bucket chamado `people-photos`
4. Configure políticas públicas:

```sql
-- Permitir leitura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'people-photos');

-- Permitir upload autenticado (ajustar conforme necessidade)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'people-photos');
```

### Passo 2: Instalar Supabase Client

```bash
npm install @supabase/supabase-js
```

### Passo 3: Configurar variáveis de ambiente

Adicione no `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=people-photos
```

### Passo 4: Criar service de upload

```typescript
// src/services/photoUpload.service.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class PhotoUploadService {
  async upload(personId: string, file: File): Promise<string> {
    const fileName = `${personId}-${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(fileName, file);

    if (error) throw error;

    // Retorna URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async delete(photoPath: string): Promise<void> {
    const fileName = photoPath.split('/').pop()!;

    await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .remove([fileName]);
  }
}
```

### Passo 5: Adicionar endpoint de upload

```typescript
// src/routes/people.routes.ts
fastify.post('/people/:id/photo', async (request, reply) => {
  const { id } = request.params;
  const file = await request.file(); // Usar @fastify/multipart

  const photoService = new PhotoUploadService();
  const photoUrl = await photoService.upload(id, file);

  // Atualizar banco
  await prisma.person.update({
    where: { id },
    data: { photoPath: photoUrl }
  });

  return { success: true, photoUrl };
});
```

---

## 📊 Comparação

| Característica | Random User API | Supabase Storage |
|----------------|-----------------|------------------|
| **Velocidade setup** | ⚡ Imediato | 🔧 ~30min |
| **Custo** | 🆓 Grátis | 💰 ~$0.021/GB/mês |
| **Fotos customizadas** | ❌ Não | ✅ Sim |
| **Controle** | ❌ Limitado | ✅ Total |
| **Ideal para** | Dev/Demo | Produção |

---

## 🎯 Recomendação

- **Desenvolvimento/Demo**: Use Random User API (já implementado!)
- **Produção**: Configure Supabase Storage

---

## 🔄 Script de Migração (Random User → Supabase)

Quando precisar migrar de Random User para Supabase Storage:

```typescript
// scripts/migratePhotosToSupabase.ts
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const supabase = createClient(/* ... */);

async function migratePhotos() {
  const people = await prisma.person.findMany();

  for (const person of people) {
    if (!person.photoPath) continue;

    // 1. Download foto da URL atual
    const response = await axios.get(person.photoPath, {
      responseType: 'arraybuffer'
    });

    // 2. Upload para Supabase
    const fileName = `${person.id}.jpg`;
    const { data } = await supabase.storage
      .from('people-photos')
      .upload(fileName, response.data);

    // 3. Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('people-photos')
      .getPublicUrl(fileName);

    // 4. Atualizar banco
    await prisma.person.update({
      where: { id: person.id },
      data: { photoPath: publicUrl }
    });

    console.log(`✓ Migrated ${person.name}`);
  }
}
```

---

## 📝 Notas

- URLs do Random User são sempre https (HTTPS)
- Supabase oferece CDN global para performance
- Considere implementar cache/CDN (Cloudflare) para otimização
- Implemente validação de tamanho/formato de imagens
