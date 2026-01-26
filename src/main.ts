import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {firebaseConfig} from './environments/firebase.config';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
}).catch(err => console.error(err));
