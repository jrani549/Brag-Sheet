import { useState } from "react";
import { UploadScreen } from "../components/UploadScreen";
import { LoadingScreen } from "../components/LoadingScreen";
import { CareerPage } from "../components/CareerPage";
import type { CareerProfile } from "@workspace/api-client-react";

export type Screen = 'upload' | 'loading' | 'career';

export default function Dashboard() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [profile, setProfile] = useState<CareerProfile | null>(null);

  const handleProfileGenerated = (newProfile: CareerProfile) => {
    setProfile(newProfile);
    setScreen('career');
  };

  const handleStartOver = () => {
    setProfile(null);
    setScreen('upload');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {screen === 'upload' && (
        <UploadScreen 
          onGenerateStart={() => setScreen('loading')} 
          onGenerateSuccess={handleProfileGenerated} 
        />
      )}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'career' && profile && (
        <CareerPage profile={profile} onStartOver={handleStartOver} />
      )}
    </div>
  );
}
