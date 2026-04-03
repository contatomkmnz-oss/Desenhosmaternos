/**
 * Cliente de dados local (substitui @base44/sdk).
 * Todo o app usa `base44` como antes; a implementação é 100% mock + localStorage.
 */
import { localMockClient } from '@/api/localMockClient';
import { firestoreClient } from '@/api/firestoreClient';
import { useFirestoreData } from '@/config/appConfig';

const firestoreEntities = useFirestoreData
  ? {
      ...localMockClient.entities,
      ...firestoreClient.entities,
    }
  : localMockClient.entities;

export const base44 = {
  ...localMockClient,
  entities: firestoreEntities,
};
