import {
  Sparkles, Rocket, DoorOpen, Palette, Layers, Images, Camera, Wand,
  Award, Home, Building, MessageSquareHeart, Flame, Moon, CheckCheck,
  Trophy, Lock,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Sparkles, Rocket, DoorOpen, Palette, Layers, Images, Camera, Wand,
  Award, Home, Building, MessageSquareHeart, Flame, Moon, CheckCheck,
  Trophy, Lock,
};

export function AchievementIcon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = ICONS[name] ?? Trophy;
  return <Cmp {...props} />;
}
