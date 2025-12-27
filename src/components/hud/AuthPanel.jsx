import { useAuthStore } from '../../stores/authStore';
import { getLoginUrl, getLogoutUrl } from '../../utils/auth';

const AuthPanel = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const userInfo = useAuthStore((s) => s.userInfo);

  if (isLoading) {
    return (
      <div className="absolute top-4 right-4 z-50">
        <div
          className="bg-black/80 border border-cyan-500/30 px-4 py-2
                     font-mono text-sm text-cyan-400"
        >
          Signing in...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="absolute top-4 right-4 z-50">
        <div
          className="bg-black/80 border border-cyan-500/30 px-4 py-2
                     font-mono text-sm flex items-center gap-3"
        >
          <span className="text-cyan-400 truncate max-w-[200px]">
            {userInfo?.email}
          </span>
          <a
            href={getLogoutUrl()}
            className="text-cyan-500 hover:text-cyan-300 transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-50">
      <a
        href={getLoginUrl()}
        className="bg-black/80 border border-cyan-500/30 px-4 py-2
                   font-mono text-sm text-cyan-500 hover:text-cyan-300
                   hover:border-cyan-400/50 transition-colors block"
      >
        Sign In
      </a>
    </div>
  );
};

export default AuthPanel;
