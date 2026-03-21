import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { getCurrentSession } from '@/services/auth';
import Dashboard from './(tabs)/dashboard';

const Index = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const session = await getCurrentSession();
      setIsLoggedIn(Boolean(session));
      setCheckingAuth(false);
    };

    void bootstrap();
  }, []);

  if (checkingAuth) {
    return (
    <View style={{ flex: 1, backgroundColor: '#140A2B', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#33D16A" />
    </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/register" />;
  }

  return <Dashboard />;
};

export default Index;
