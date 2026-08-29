import { Dashboard, type DashboardApplication } from './dashboard';
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from './chatgpt-auth';
import { listApplications } from '@/db/applications';

export const dynamic = 'force-dynamic';

const demoApplications: DashboardApplication[] = [
  {
    id: -1,
    company: 'Nova Systems',
    role: 'Backend Engineer',
    status: 'interviewing',
    location: 'Remote',
    appliedOn: '2026-08-21',
    notes: '',
    updatedAt: '2026-08-28T09:00:00.000Z',
  },
  {
    id: -2,
    company: 'Sable Analytics',
    role: 'Python Developer',
    status: 'applied',
    location: 'Bengaluru',
    appliedOn: '2026-08-24',
    notes: '',
    updatedAt: '2026-08-26T09:00:00.000Z',
  },
  {
    id: -3,
    company: 'Northstar Labs',
    role: 'Software Engineer',
    status: 'offered',
    location: 'Hybrid',
    appliedOn: '2026-08-12',
    notes: '',
    updatedAt: '2026-08-22T09:00:00.000Z',
  },
  {
    id: -4,
    company: 'Vertex Cloud',
    role: 'API Engineer',
    status: 'saved',
    location: 'Remote',
    appliedOn: null,
    notes: '',
    updatedAt: '2026-08-20T09:00:00.000Z',
  },
];

export default async function Home() {
  const user = await getChatGPTUser();
  const records = user ? await listApplications(user.userId) : [];
  const applications: DashboardApplication[] = user
    ? records.map((record) => ({
        id: record.id,
        company: record.company,
        role: record.role,
        status: record.status,
        location: record.location,
        appliedOn: record.appliedOn,
        notes: record.notes,
        updatedAt: record.updatedAt.toISOString(),
      }))
    : demoApplications;

  return (
    <Dashboard
      applications={applications}
      signedIn={Boolean(user)}
      displayName={user?.displayName ?? 'Guest'}
      signInPath={chatGPTSignInPath('/')}
      signOutPath={chatGPTSignOutPath('/')}
    />
  );
}
