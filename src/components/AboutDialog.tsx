import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GraduationCap,
  PenTool,
  Clock,
  BarChart3,
  Star,
  Bookmark,
  Share2,
  Trophy,
  History,
  Users,
  Shield,
  Sparkles,
} from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  {
    icon: PenTool,
    title: 'Create Custom Tests',
    description: 'Build your own tests with multiple-choice questions across various categories like Math, Science, History, and more.',
  },
  {
    icon: Clock,
    title: 'Timed Tests',
    description: 'Add time limits to your tests for a more challenging experience and to simulate real exam conditions.',
  },
  {
    icon: BarChart3,
    title: 'Creator Analytics',
    description: 'Track how many people took your tests, view average scores, and monitor completion rates.',
  },
  {
    icon: Star,
    title: 'Ratings & Reviews',
    description: 'Rate tests after completing them and read reviews from other users to find the best content.',
  },
  {
    icon: Bookmark,
    title: 'Save Tests',
    description: 'Bookmark your favorite tests to easily find and retake them later.',
  },
  {
    icon: Share2,
    title: 'Share Tests',
    description: 'Share your tests with friends and classmates via a simple link.',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Compete with other users and see who scores the highest on each test.',
  },
  {
    icon: History,
    title: 'Test History',
    description: 'Review your past attempts, track your progress, and see detailed answer breakdowns.',
  },
  {
    icon: Users,
    title: 'Community Tests',
    description: 'Explore tests created by other users and discover new learning opportunities.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is securely stored and your progress is synced across devices.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful Interface',
    description: 'Enjoy a clean, modern design with dark mode support for comfortable studying.',
  },
];

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl">StudyHub</DialogTitle>
          <DialogDescription className="text-base">
            Your ultimate platform for creating, sharing, and taking interactive tests
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[500px] pr-4">
          <div className="space-y-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                StudyHub is designed to make learning fun and interactive. Whether you're a student preparing for exams,
                a teacher creating assessments, or just someone who loves to learn, StudyHub has everything you need.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Features & Functions</h3>
              <div className="grid gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Version 1.0.0 • Made with ❤️ for learners everywhere
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
