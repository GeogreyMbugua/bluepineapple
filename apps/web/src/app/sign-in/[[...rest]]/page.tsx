import { PortalSignInPage } from '@/components/auth/portal-sign-in';

type SignInPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = searchParams ? await searchParams : undefined;
  return <PortalSignInPage searchParams={params} />;
}
