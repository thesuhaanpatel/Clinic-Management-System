import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/add-patient');
  return null;
}