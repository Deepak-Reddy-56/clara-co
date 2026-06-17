import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (server-side only)
// Uses GOOGLE_APPLICATION_CREDENTIALS env var or the inline service account config
function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Option 1: Use service account JSON from env var (recommended for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount: ServiceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  // Option 2: Use Application Default Credentials (works with gcloud CLI locally)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminApp = initAdmin();

export const adminDb = getFirestore(adminApp);
