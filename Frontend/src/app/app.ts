import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from '../firebaseConfig/firebaseConfig';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Frontend');
}
