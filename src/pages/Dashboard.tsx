import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TestCard } from '@/components/TestCard';
import { CreateTestDialog } from '@/components/CreateTestDialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Leaderboard } from '@/components/Leaderboard';
import { CreatorAnalytics } from '@/components/CreatorAnalytics';
import { DailyAITestCard } from '@/components/DailyAITestCard';
import { AITestGeneratorDialog } from '@/components/AITestGeneratorDialog';
import { GamificationStats } from '@/components/GamificationStats';
import { BadgesDisplay } from '@/components/BadgesDisplay';
import { GlobalLeaderboard } from '@/components/GlobalLeaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, BookOpen, Bookmark, FileText, X, Trophy, SlidersHorizontal, Star, BarChart3, GraduationCap, Sparkles, Layers } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { TestWithProfile, Question, TestCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/test';
import { CLASS_STANDARDS } from '@/data/cbseData';

const ALL_CATEGORIES: TestCategory[] = [
  'math', 'science', 'history', 'english', 'geography',
  'languages', 'computer_science', 'arts', 'music', 'sports', 'other'
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch all tests with profiles
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;

      // Fetch saved tests for current user
      const { data: savedData } = await supabase
        .from('saved_tests')
        .select('test_id')
        .eq('user_id', user.id);

      const savedTestIds = new Set(savedData?.map((s) => s.test_id) || []);

      // Fetch ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('test_id, rating');

      // Calculate average ratings
      const ratingsByTest = new Map<string, { total: number; count: number }>();
      ratingsData?.forEach((r) => {
        const existing = ratingsByTest.get(r.test_id) || { total: 0, count: 0 };
        ratingsByTest.set(r.test_id, {
          total: existing.total + r.rating,
          count: existing.count + 1,
        });
      });

      // Fetch profiles for all test creators
      const userIds = [...new Set(testsData?.map((t) => t.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.user_id, p]) || []);

      // Combine all data
      const testsWithProfiles: TestWithProfile[] = (testsData || []).map((test: any) => {
        const ratings = ratingsByTest.get(test.id);
        const profile = profilesMap.get(test.user_id);
        return {
          ...test,
          questions: test.questions as unknown as Question[],
          category: (test.category as TestCategory) || 'other',
          profile: profile ? { full_name: profile.full_name, avatar_url: profile.avatar_url } : null,
          averageRating: ratings ? ratings.total / ratings.count : 0,
          totalRatings: ratings?.count || 0,
          isSaved: savedTestIds.has(test.id),
          // Add new fields
          class_standard: test.class_standard,
          subject: test.subject,
          topic: test.topic,
          difficulty: test.difficulty,
          is_ai_generated: test.is_ai_generated,
        };
      });

      setTests(testsWithProfiles);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test: any) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || test.category === selectedCategory;
    const matchesCreator = !selectedCreator || test.user_id === selectedCreator;
    const matchesClass = !selectedClass || test.class_standard === selectedClass;
    const matchesRating = test.averageRating >= minRating;
    return matchesSearch && matchesCategory && matchesCreator && matchesClass && matchesRating;
  });

  // Get unique creators for filter
  const uniqueCreators = Array.from(
    new Map(
      tests
        .filter(t => t.profile)
        .map(t => [t.user_id, { id: t.user_id, name: t.profile!.full_name }])
    ).values()
  );

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    (selectedCreator ? 1 : 0) + 
    (selectedClass ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedCreator(null);
    setSelectedClass(null);
    setMinRating(0);
  };

  const myTests = filteredTests.filter((t: any) => t.user_id === user?.id);
  const savedTests = filteredTests.filter((t: any) => t.isSaved);
  const exploreTests = filteredTests.filter((t: any) => t.user_id !== user?.id);

  // Get categories that have tests
  const categoriesWithTests = ALL_CATEGORIES.filter((cat) =>
    tests.some((t) => t.category === cat)
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} onProfileUpdate={fetchData} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!</h2>
            <p className="text-muted-foreground">Explore tests or create your own</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <GlowingEffect spread={30} glow={true} disabled={false} proximity={48} inactiveZone={0.01} />
              <Button 
                onClick={() => navigate('/study-tools')} 
                className="relative gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <Sparkles className="h-4 w-4" />
                Study Tools
              </Button>
            </div>
            <div className="relative">
              <GlowingEffect spread={30} glow={true} disabled={false} proximity={48} inactiveZone={0.01} />
              <Button 
                onClick={() => navigate('/saved-content')} 
                variant="outline"
                className="relative gap-2"
              >
                <Layers className="h-4 w-4" />
                Saved Content
              </Button>
            </div>
            <CreateTestDialog onSuccess={fetchData} />
            <AITestGeneratorDialog />
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress
          </h3>
          <GamificationStats />
        </div>

        {/* Daily AI Test Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Today's AI Challenge
          </h3>
          <DailyAITestCard />
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-popover" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear all
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={selectedCategory || 'all'}
                      onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v as TestCategory)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="all">All categories</SelectItem>
                        {ALL_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_LABELS[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class / Standard</label>
                    <Select
                      value={selectedClass?.toString() || 'all'}
                      onValueChange={(v) => setSelectedClass(v === 'all' ? null : parseInt(v))}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="all">All classes</SelectItem>
                        {CLASS_STANDARDS.map((cls) => (
                          <SelectItem key={cls} value={cls.toString()}>
                            Class {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Creator</label>
                    <Select
                      value={selectedCreator || 'all'}
                      onValueChange={(v) => setSelectedCreator(v === 'all' ? null : v)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All creators" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="all">All creators</SelectItem>
                        {uniqueCreators.map((creator) => (
                          <SelectItem key={creator.id} value={creator.id}>
                            {creator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Rating</label>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating)}
                          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            minRating === rating
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {rating === 0 ? (
                            <span className="text-xs">All</span>
                          ) : (
                            <span className="text-xs">{rating}+</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedClass && (
                <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => setSelectedClass(null)}>
                  <GraduationCap className="h-3 w-3" />
                  Class {selectedClass}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => setSelectedCategory(null)}>
                  {CATEGORY_LABELS[selectedCategory]}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedCreator && (
                <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => setSelectedCreator(null)}>
                  {uniqueCreators.find(c => c.id === selectedCreator)?.name}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => setMinRating(0)}>
                  <Star className="h-3 w-3 fill-current" />
                  {minRating}+ stars
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1 p-1 sm:flex-nowrap sm:h-10 sm:gap-0 sm:p-1">
            <TabsTrigger value="explore" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none min-w-0">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="my-tests" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none min-w-0">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">My Tests</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none min-w-0">
              <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none min-w-0">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none min-w-0">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="explore">
                {exploreTests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{selectedCategory ? `No ${CATEGORY_LABELS[selectedCategory]} tests found` : 'No tests from other users yet'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exploreTests.map((test) => (
                      <TestCard key={test.id} test={test} onUpdate={fetchData} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-tests">
                {myTests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{selectedCategory ? `No ${CATEGORY_LABELS[selectedCategory]} tests found` : "You haven't created any tests yet"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTests.map((test) => (
                      <TestCard key={test.id} test={test} onUpdate={fetchData} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved">
                {savedTests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{selectedCategory ? `No ${CATEGORY_LABELS[selectedCategory]} tests found` : "You haven't saved any tests yet"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedTests.map((test) => (
                      <TestCard key={test.id} test={test} onUpdate={fetchData} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="leaderboard">
                <div className="max-w-2xl mx-auto">
                  <Leaderboard />
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <CreatorAnalytics />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
