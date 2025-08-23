
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';
import CashTrackerWithAuth from '@/components/CashTrackerWithAuth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return user ? <CashTrackerWithAuth /> : <Auth />;
};

export default Index;
