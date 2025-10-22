import { X } from 'lucide-react';
import { create } from 'zustand';

interface RewardState {
  isOpen: boolean;
  icon: string;
  title: string;
  message: string;
  open: (icon: string, title: string, message: string) => void;
  close: () => void;
}

export const useRewardPopup = create<RewardState>((set) => ({
  isOpen: false,
  icon: '',
  title: '',
  message: '',
  open: (icon, title, message) => set({ isOpen: true, icon, title, message }),
  close: () => set({ isOpen: false }),
}));

export const RewardPopup = () => {
  const { isOpen, icon, title, message, close } = useRewardPopup();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-scale-in">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-7xl mb-4 text-center animate-bounce">{icon}</div>
        <h3 className="text-2xl font-bold text-center mb-2">{title}</h3>
        <p className="text-center text-muted-foreground">{message}</p>
        <button
          onClick={close}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Tamam
        </button>
      </div>
    </div>
  );
};
