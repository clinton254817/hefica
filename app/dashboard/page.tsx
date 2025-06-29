'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Utensils, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  User,
  Calendar,
  Target,
  TrendingUp,
  Dumbbell,
  Apple,
  Clock,
  ChevronRight,
  Plus,
  Flame,
  Scale,
  Timer
} from 'lucide-react';

// Mock session hook - replace with actual useSession from next-auth/react
const useSession = () => {
  const [session, setSession] = useState({
    user: {
      id: "1",
      email: "clinton.nyagwaya@example.com",
      firstName: "Clinton",
      lastName: "Nyagwaya",
      avatar: null
    }
  });
  
  return { data: session };
};

// Mock signOut function - replace with actual signOut from next-auth/react
const signOut = () => {
  console.log('Signing out...');
  // Redirect to sign in page
  window.location.href = '/';
};

// Mock data for dashboard - replace with actual API calls
const mockData = {
  weeklyProgress: [
    { day: 'Mon', workouts: 1, meals: 3 },
    { day: 'Tue', workouts: 0, meals: 4 },
    { day: 'Wed', workouts: 2, meals: 3 },
    { day: 'Thu', workouts: 1, meals: 4 },
    { day: 'Fri', workouts: 1, meals: 3 },
    { day: 'Sat', workouts: 0, meals: 2 },
    { day: 'Sun', workouts: 1, meals: 3 },
  ],
  stats: {
    totalWorkouts: 18,
    totalMeals: 95,
    currentWeight: 75.5,
    targetWeight: 70.0,
    todayCalories: 1850,
    calorieGoal: 2200
  },
  todaysMeals: [
    { id: 1, name: "Greek Yogurt Bowl", type: "BREAKFAST", calories: 320, completed: true },
    { id: 2, name: "Grilled Chicken Salad", type: "LUNCH", calories: 450, completed: true },
    { id: 3, name: "Protein Smoothie", type: "SNACK", calories: 280, completed: false },
    { id: 4, name: "Salmon & Vegetables", type: "DINNER", calories: 520, completed: false },
  ],
  todaysWorkout: {
    name: "Upper Body Strength",
    duration: 45,
    exercises: [
      { name: "Push-ups", sets: 3, reps: 15, completed: true },
      { name: "Pull-ups", sets: 3, reps: 8, completed: true },
      { name: "Dumbbell Press", sets: 3, reps: 12, completed: false },
      { name: "Bicep Curls", sets: 3, reps: 15, completed: false },
    ]
  }
};

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);

  const { data: session } = useSession();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);

    // Animate stats cards on load
    if (statsRef.current) {
      statsRef.current.forEach((card, index) => {
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }
  }, []);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-600' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, color: 'text-green-600' },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell, color: 'text-purple-600' },
    { id: 'meals', label: 'Meal Plans', icon: Utensils, color: 'text-orange-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    
    // Animate content change
    if (contentRef.current) {
      contentRef.current.style.opacity = '0.7';
      contentRef.current.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = 'all 0.3s ease-in-out';
          contentRef.current.style.opacity = '1';
          contentRef.current.style.transform = 'translateY(0)';
        }
      }, 100);
    }
  };

  type StatCardProps = {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: number;
    color: string;
    index: number;
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend, color, index }) => (
    <div 
      ref={el => { statsRef.current[index] = el; }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">{value}</h3>
      <p className="text-xs text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  type Meal = {
    id: number;
    name: string;
    type: string;
    calories: number;
    completed: boolean;
  };

  type MealCardProps = {
    meal: Meal;
    index: number;
  };

  const MealCard: React.FC<MealCardProps> = ({ meal, index }) => (
    <div 
      className={`bg-white rounded-lg p-3 border transition-all duration-300 hover:shadow-sm hover:scale-102 cursor-pointer ${
        meal.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{meal.name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded-full">
              {meal.type.toLowerCase().replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <Flame className="w-3 h-3 mr-1 text-orange-500" />
              {meal.calories}
            </span>
          </div>
        </div>
        <div 
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            meal.completed ? 'bg-green-500 border-green-500 scale-110' : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {meal.completed && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
    </div>
  );

  type Exercise = {
    name: string;
    sets: number;
    reps: number;
    completed: boolean;
  };

  type ExerciseCardProps = {
    exercise: Exercise;
    index: number;
  };

  const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index }) => (
    <div 
      className={`bg-white rounded-lg p-3 border transition-all duration-300 hover:shadow-sm hover:scale-102 cursor-pointer ${
        exercise.completed ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{exercise.name}</h4>
          <p className="text-xs text-gray-600 mt-1">{exercise.sets} sets × {exercise.reps} reps</p>
        </div>
        <div 
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            exercise.completed ? 'bg-blue-500 border-blue-500 scale-110' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {exercise.completed && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">FitTracker</h1>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 hidden lg:flex"
              >
                <Menu className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 lg:hidden"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group hover:scale-105 ${
                        isActive 
                          ? 'bg-gray-900 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : item.color}`} />
                      {!sidebarCollapsed && (
                        <span className="font-medium text-sm">{item.label}</span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {session?.user?.firstName?.[0] || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.firstName} {session?.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-105 group ${
                  sidebarCollapsed ? 'w-full' : ''
                }`}
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="w-9" />
          </div>
        </div>

        {/* Content */}
        <main ref={contentRef} className="flex-1 p-4 lg:p-6 overflow-auto">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {session?.user?.firstName}!
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">Here's your fitness progress today</p>
                </div>
                <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                  <div className="flex items-center text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border">
                    <Calendar className="w-3 h-3 mr-2" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Workouts"
                  value={mockData.stats.totalWorkouts}
                  subtitle="This month"
                  icon={Dumbbell}
                  color="text-purple-600"
                  trend={12}
                  index={0}
                />
                <StatCard
                  title="Meals"
                  value={mockData.stats.totalMeals}
                  subtitle="This month"
                  icon={Apple}
                  color="text-green-600"
                  trend={8}
                  index={1}
                />
                <StatCard
                  title="Weight"
                  value={`${mockData.stats.currentWeight}kg`}
                  subtitle="Current"
                  icon={Scale}
                  color="text-blue-600"
                  trend={-3}
                  index={2}
                />
                <StatCard
                  title="Calories"
                  value={`${mockData.stats.todayCalories}`}
                  subtitle={`/${mockData.stats.calorieGoal}`}
                  icon={Flame}
                  color="text-orange-600"
                  index={3}
                />
              </div>

              {/* Today's Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Meals */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Today's Meals</h2>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105">
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mockData.todaysMeals.map((meal, index) => (
                      <MealCard key={meal.id} meal={meal} index={index} />
                    ))}
                  </div>
                </div>

                {/* Today's Workout */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Today's Workout</h2>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      <Timer className="w-3 h-3 mr-1 text-blue-500" />
                      {mockData.todaysWorkout.duration}m
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{mockData.todaysWorkout.name}</h3>
                  </div>
                  <div className="space-y-3">
                    {mockData.todaysWorkout.exercises.map((exercise, index) => (
                      <ExerciseCard key={index} exercise={exercise} index={index} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'dashboard' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🚧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {sidebarItems.find(item => item.id === activeSection)?.label}
              </h2>
              <p className="text-gray-600 text-sm">This section is under development</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;