import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import LoginButton from '../auth/LoginButton';

export default function BrandHeader() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/munchies-logo.dim_1024x256.png"
            alt="Munchies O'Clock"
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && userProfile && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Hi, {userProfile.name}
            </span>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
