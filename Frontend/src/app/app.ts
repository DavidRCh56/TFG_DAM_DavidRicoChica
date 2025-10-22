import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from '../firebaseConfig/firebaseConfig';
import { HttpClientModule } from '@angular/common/http';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule],
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Frontend');
}
