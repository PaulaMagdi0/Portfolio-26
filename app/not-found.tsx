import { instrumentSerif, inter, jetbrainsMono } from './fonts';
import './globals.css';

export default function GlobalNotFound() {
  return (
    <html
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <h1 className="mb-4 font-serif text-6xl">404</h1>
          <p>Not found</p>
        </div>
      </body>
    </html>
  );
}
