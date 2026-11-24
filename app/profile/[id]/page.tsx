import PublicWorkerPassportPage from '@/app/w/[workerId]/page';

// Re-export public passport page for backward compatibility
export default function LegacyProfilePage() {
  return <PublicWorkerPassportPage />;
}
