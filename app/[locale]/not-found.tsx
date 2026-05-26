import { Link } from '@/i18n/routing';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="mb-4 font-serif text-6xl">404</h1>
        <p className="mb-6 text-inkdim">The page you are looking for does not exist.</p>
        <Link href="/" className="underline underline-offset-4">
          Back home
        </Link>
      </div>
    </main>
  );
}
