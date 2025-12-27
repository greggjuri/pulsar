import { useAuthStore } from '../../stores/authStore';
import { useCloudStore } from '../../stores/cloudStore';
import { getLoginUrl, getLogoutUrl } from '../../utils/auth';

const AuthPanel = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const userInfo = useAuthStore((s) => s.userInfo);
  const hasUnsavedChanges = useCloudStore((s) => s.hasUnsavedChanges);

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
        <div className="bg-black/80 border border-cyan-500/30 px-4 py-2 font-mono text-sm">
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-cyan-500/20">
            <span className="text-cyan-500 text-xs">CLOUD</span>
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-[10px]">(unsaved)</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="bg-black/80 border border-gray-600/30 px-4 py-2 font-mono text-sm">
        <a
          href={getLoginUrl()}
          className="text-cyan-500 hover:text-cyan-300 transition-colors block"
        >
          Sign In
        </a>
        <div className="text-gray-500 text-xs mt-1.5 pt-1.5 border-t border-gray-600/20">
          LOCAL MODE
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
