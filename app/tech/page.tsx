// app/tech/page.tsx  (Server Component)
import { redirect } from 'next/navigation';

export default function TechIndex() {
  // Alias corto: /tech → /tecnologo
  redirect('/tecnologo');
}
