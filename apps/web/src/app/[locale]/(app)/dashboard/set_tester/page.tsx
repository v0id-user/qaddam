import { redirect } from 'next/navigation';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@qaddam/backend/convex/_generated/api';
export default async function SetTesterPage() {
  if (process.env.NEXT_PUBLIC_ENV !== 'development') {
    redirect('/dashboard');
  }

  const me = await fetchQuery(api.users.getMe);

  if (me?.role === 'tester') {
    redirect('/dashboard');
  }

  await fetchMutation(api.usersConfig.changeMyRole, { role: 'tester' });

  redirect('/dashboard');

  return <div>...</div>;
}
