import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

@Injectable()
export class FirebaseService {
  private app: admin.app.App;

  constructor() {
    if (!admin.apps.length) {
      const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (!serviceAccountString) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT_KEY no está definido en el .env',
        );
      }

      let serviceAccount: FirebaseServiceAccount;

      try {
        serviceAccount = JSON.parse(
          serviceAccountString,
        ) as FirebaseServiceAccount;
      } catch {
        throw new Error(
          'Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY. Revisa el formato JSON.',
        );
      }

      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        '\n',
      );

      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
      });

      console.log('Firebase Admin inicializado correctamente');
    } else {
      this.app = admin.app();
    }
  }

  getAuth(): admin.auth.Auth {
    return admin.auth(this.app);
  }
}
