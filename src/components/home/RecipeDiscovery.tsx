'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Search,
  Plus,
  X,
  Clock,
  ChefHat,
  Users,
  Star,
  Heart,
  ShoppingCart,
  Printer,
  Share2,
  BookOpen,
  UtensilsCrossed,
  Flame,
  Filter,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  TrendingUp,
  Zap,
  Leaf,
  Wheat,
  MilkOff,
  Egg,
  Globe,
  Timer,
  Award,
  BookmarkPlus,
  XCircle,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

type Difficulty = 'Easy' | 'Medium' | 'Hard'
type Cuisine = 'Brazilian' | 'Italian' | 'Japanese' | 'Mexican' | 'Indian' | 'American'
type MealType = 'Breakfast' | 'Lunch' | 'Dinner'

interface NutritionFact {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

interface RecipeIngredient {
  name: string
  quantity: string
  haveIt: boolean
}

interface RecipeTip {
  icon: string
  text: string
}

interface Recipe {
  id: string
  title: string
  image: string
  cookingTime: number
  difficulty: Difficulty
  servings: number
  rating: number
  cuisine: Cuisine
  dietary: string[]
  description: string
  ingredients: RecipeIngredient[]
  steps: string[]
  nutrition: NutritionFact
  tips: RecipeTip[]
}

interface MealPlanSlot {
  day: string
  meal: MealType
  recipeId: string | null
}

/* ═══════════════════════════════════════════════════════════════
   Constants & Mock Data
   ═══════════════════════════════════════════════════════════════ */

const ALL_INGREDIENTS: string[] = [
  'Chicken', 'Beef', 'Pork', 'Salmon', 'Shrimp', 'Tofu', 'Eggs',
  'Rice', 'Pasta', 'Bread', 'Tortilla', 'Flour', 'Quinoa', 'Oats',
  'Tomato', 'Onion', 'Garlic', 'Bell Pepper', 'Broccoli', 'Spinach',
  'Carrot', 'Potato', 'Sweet Potato', 'Avocado', 'Corn', 'Lettuce',
  'Lime', 'Lemon', 'Banana', 'Mango', 'Strawberry', 'Coconut',
  'Cheese', 'Cream', 'Butter', 'Milk', 'Yogurt',
  'Soy Sauce', 'Olive Oil', 'Coconut Milk', 'Black Beans', 'Chickpeas',
  'Cilantro', 'Basil', 'Ginger', 'Chili', 'Cumin', 'Paprika',
  'Sugar', 'Honey', 'Vinegar', 'Miso', 'Sesame Oil', 'Nori',
  'Mushrooms', 'Zucchini', 'Eggplant', 'Green Beans', 'Peas',
  'White Fish', 'Crab', 'Duck', 'Sausage', 'Bacon', 'Ham',
  'Peanuts', 'Cashews', 'Almonds', 'Walnuts', 'Pineapple',
  'Orange', 'Apple', 'Pear', 'Blueberry', 'Raspberry', 'Cranberry',
]

const CUISINE_CONFIG: Record<Cuisine, { label: string; emoji: string; color: string }> = {
  Brazilian: { label: 'Brazilian', emoji: '🇧🇷', color: '#22c55e' },
  Italian: { label: 'Italian', emoji: '🇮🇹', color: '#ef4444' },
  Japanese: { label: 'Japanese', emoji: '🇯🇵', color: '#e11d48' },
  Mexican: { label: 'Mexican', emoji: '🇲🇽', color: '#f59e0b' },
  Indian: { label: 'Indian', emoji: '🇮🇳', color: '#f97316' },
  American: { label: 'American', emoji: '🇺🇸', color: '#3b82f6' },
}

const DIFFICULTY_STYLES: Record<Difficulty, { bg: string; text: string; label: string }> = {
  Easy: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Easy' },
  Medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Medium' },
  Hard: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Hard' },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEALS: { key: MealType; label: string; icon: string }[] = [
  { key: 'Breakfast', label: 'Breakfast', icon: '☀️' },
  { key: 'Lunch', label: 'Lunch', icon: '🌤️' },
  { key: 'Dinner', label: 'Dinner', icon: '🌙' },
]

const MOCK_RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Feijoada Completa',
    image: '',
    cookingTime: 120,
    difficulty: 'Hard',
    servings: 8,
    rating: 4.8,
    cuisine: 'Brazilian',
    dietary: ['Gluten-Free'],
    description: 'Traditional Brazilian black bean stew with assorted meats, served with rice, farofa, and orange.',
    ingredients: [
      { name: 'Black Beans', quantity: '500g', haveIt: true },
      { name: 'Pork', quantity: '400g', haveIt: true },
      { name: 'Sausage', quantity: '300g', haveIt: true },
      { name: 'Bacon', quantity: '150g', haveIt: false },
      { name: 'Garlic', quantity: '6 cloves', haveIt: true },
      { name: 'Onion', quantity: '2', haveIt: true },
      { name: 'Bay Leaves', quantity: '3', haveIt: false },
      { name: 'Orange', quantity: '2', haveIt: false },
    ],
    steps: [
      'Soak black beans overnight in cold water.',
      'In a large pot, sear the pork ribs, sausage, and bacon until golden.',
      'Add garlic and onions, cook until fragrant.',
      'Drain beans, add to pot with fresh water to cover.',
      'Add bay leaves and simmer for 2 hours until beans are tender.',
      'Adjust seasoning, serve with white rice, farofa, and orange slices.',
    ],
    nutrition: { calories: 520, protein: 38, carbs: 42, fat: 22, fiber: 16 },
    tips: [
      { icon: '⏰', text: 'Start the day before – soaking beans is essential for best texture.' },
      { icon: '🔥', text: 'Low and slow cooking gives the richest flavor.' },
    ],
  },
  {
    id: 'recipe-2',
    title: 'Bruschetta al Pomodoro',
    image: '',
    cookingTime: 20,
    difficulty: 'Easy',
    servings: 4,
    rating: 4.5,
    cuisine: 'Italian',
    dietary: ['Vegetarian'],
    description: 'Classic Italian bruschetta with ripe tomatoes, fresh basil, and garlic on crispy bread.',
    ingredients: [
      { name: 'Bread', quantity: '8 slices', haveIt: true },
      { name: 'Tomato', quantity: '4 large', haveIt: true },
      { name: 'Garlic', quantity: '4 cloves', haveIt: true },
      { name: 'Basil', quantity: 'fresh bunch', haveIt: false },
      { name: 'Olive Oil', quantity: '4 tbsp', haveIt: true },
      { name: 'Vinegar', quantity: '1 tbsp', haveIt: false },
    ],
    steps: [
      'Dice tomatoes and mix with minced garlic, basil, olive oil, and vinegar.',
      'Season with salt and pepper, let rest for 10 minutes.',
      'Toast bread slices until golden and crispy.',
      'Rub each slice with a cut garlic clove.',
      'Spoon tomato mixture generously on top. Serve immediately.',
    ],
    nutrition: { calories: 180, protein: 5, carbs: 24, fat: 8, fiber: 3 },
    tips: [
      { icon: '🍅', text: 'Use the ripest tomatoes you can find for the best flavor.' },
      { icon: '🍞', text: 'A good sourdough or ciabatta makes all the difference.' },
    ],
  },
  {
    id: 'recipe-3',
    title: 'Salmon Teriyaki Bowl',
    image: '',
    cookingTime: 35,
    difficulty: 'Medium',
    servings: 2,
    rating: 4.7,
    cuisine: 'Japanese',
    dietary: ['Dairy-Free'],
    description: 'Glazed salmon fillet over steamed rice with pickled vegetables and sesame.',
    ingredients: [
      { name: 'Salmon', quantity: '2 fillets', haveIt: true },
      { name: 'Rice', quantity: '1.5 cups', haveIt: true },
      { name: 'Soy Sauce', quantity: '3 tbsp', haveIt: true },
      { name: 'Sugar', quantity: '2 tbsp', haveIt: true },
      { name: 'Ginger', quantity: '1 inch', haveIt: false },
      { name: 'Sesame Oil', quantity: '1 tsp', haveIt: false },
      { name: 'Avocado', quantity: '1', haveIt: false },
      { name: 'Nori', quantity: '2 sheets', haveIt: false },
    ],
    steps: [
      'Cook rice according to package instructions.',
      'Mix soy sauce, sugar, and ginger to make teriyaki glaze.',
      'Sear salmon skin-side down for 3 minutes.',
      'Flip and pour glaze over salmon, cook 3 more minutes.',
      'Slice avocado. Assemble bowl with rice, salmon, avocado, and nori.',
      'Drizzle with sesame oil and serve.',
    ],
    nutrition: { calories: 480, protein: 35, carbs: 52, fat: 14, fiber: 4 },
    tips: [
      { icon: '🐟', text: 'Use fresh salmon with bright color and no fishy smell.' },
      { icon: '🍚', text: 'Sushi rice gives the most authentic bowl experience.' },
    ],
  },
  {
    id: 'recipe-4',
    title: 'Chicken Tikka Masala',
    image: '',
    cookingTime: 50,
    difficulty: 'Medium',
    servings: 4,
    rating: 4.9,
    cuisine: 'Indian',
    dietary: ['Gluten-Free'],
    description: 'Tender chicken pieces in a creamy, aromatic tomato-based curry sauce.',
    ingredients: [
      { name: 'Chicken', quantity: '600g', haveIt: true },
      { name: 'Tomato', quantity: '4', haveIt: true },
      { name: 'Cream', quantity: '200ml', haveIt: false },
      { name: 'Garlic', quantity: '5 cloves', haveIt: true },
      { name: 'Ginger', quantity: '2 inch', haveIt: false },
      { name: 'Cumin', quantity: '2 tsp', haveIt: false },
      { name: 'Paprika', quantity: '1 tsp', haveIt: false },
      { name: 'Chili', quantity: '1', haveIt: false },
      { name: 'Rice', quantity: '2 cups', haveIt: true },
    ],
    steps: [
      'Marinate chicken in yogurt, cumin, and paprika for 30 minutes.',
      'Grill or pan-sear chicken until charred on edges.',
      'Sauté garlic, ginger, and chili in oil.',
      'Add tomatoes and spices, simmer for 15 minutes.',
      'Blend sauce until smooth, return to pan.',
      'Add cream and chicken, simmer 10 more minutes.',
      'Serve over basmati rice with naan bread.',
    ],
    nutrition: { calories: 450, protein: 36, carbs: 38, fat: 18, fiber: 5 },
    tips: [
      { icon: '🌶️', text: 'Adjust chili to your heat preference – this dish can be mild or fiery.' },
      { icon: '🥛', text: 'Full-fat cream gives the richest sauce.' },
    ],
  },
  {
    id: 'recipe-5',
    title: 'Fish Tacos al Pastor',
    image: '',
    cookingTime: 30,
    difficulty: 'Easy',
    servings: 4,
    rating: 4.4,
    cuisine: 'Mexican',
    dietary: ['Dairy-Free'],
    description: 'Crispy white fish tacos with fresh slaw, pineapple salsa, and lime crema.',
    ingredients: [
      { name: 'White Fish', quantity: '500g', haveIt: true },
      { name: 'Tortilla', quantity: '8', haveIt: true },
      { name: 'Lime', quantity: '3', haveIt: true },
      { name: 'Cilantro', quantity: '1 bunch', haveIt: false },
      { name: 'Coconut Milk', quantity: '100ml', haveIt: false },
      { name: 'Pineapple', quantity: '1 cup', haveIt: false },
      { name: 'Cabbage', quantity: '2 cups', haveIt: false },
    ],
    steps: [
      'Season fish with lime juice, chili, and cumin.',
      'Pan-fish fish until crispy on both sides.',
      'Make pineapple salsa by dicing pineapple with cilantro and lime.',
      'Shred cabbage for fresh slaw.',
      'Warm tortillas, assemble tacos with fish, slaw, and salsa.',
      'Drizzle with coconut milk crema and extra lime.',
    ],
    nutrition: { calories: 320, protein: 28, carbs: 30, fat: 12, fiber: 4 },
    tips: [
      { icon: '🍋', text: 'Fresh lime is essential – do not substitute with bottled juice.' },
      { icon: '🌮', text: 'Double-stack tortillas to prevent tearing.' },
    ],
  },
  {
    id: 'recipe-6',
    title: 'Classic Cheeseburger',
    image: '',
    cookingTime: 25,
    difficulty: 'Easy',
    servings: 4,
    rating: 4.6,
    cuisine: 'American',
    dietary: [],
    description: 'Juicy beef patties with melted cheese, crisp lettuce, tomato, and special sauce.',
    ingredients: [
      { name: 'Beef', quantity: '500g', haveIt: true },
      { name: 'Cheese', quantity: '4 slices', haveIt: true },
      { name: 'Bread', quantity: '4 buns', haveIt: true },
      { name: 'Lettuce', quantity: '4 leaves', haveIt: true },
      { name: 'Tomato', quantity: '2', haveIt: true },
      { name: 'Onion', quantity: '1', haveIt: true },
      { name: 'Eggs', quantity: '1', haveIt: false },
    ],
    steps: [
      'Mix ground beef with salt, pepper, and a splash of water.',
      'Form into 4 patties, make a small indent in the center.',
      'Grill on high heat for 3-4 minutes per side.',
      'Add cheese in the last minute, cover to melt.',
      'Toast buns lightly on the grill.',
      'Assemble with lettuce, tomato, onion, and your favorite sauce.',
    ],
    nutrition: { calories: 550, protein: 34, carbs: 36, fat: 30, fiber: 2 },
    tips: [
      { icon: '🥩', text: '80/20 lean-to-fat ratio makes the juiciest burgers.' },
      { icon: '🧀', text: 'American cheese melts best, but cheddar adds great sharpness.' },
    ],
  },
  {
    id: 'recipe-7',
    title: 'Açaí Power Bowl',
    image: '',
    cookingTime: 10,
    difficulty: 'Easy',
    servings: 2,
    rating: 4.7,
    cuisine: 'Brazilian',
    dietary: ['Vegan', 'Gluten-Free'],
    description: 'Thick açaí blend topped with granola, banana, honey, and coconut flakes.',
    ingredients: [
      { name: 'Banana', quantity: '3', haveIt: true },
      { name: 'Coconut', quantity: '¼ cup flakes', haveIt: true },
      { name: 'Honey', quantity: '2 tbsp', haveIt: true },
      { name: 'Oats', quantity: '½ cup', haveIt: false },
      { name: 'Strawberry', quantity: '½ cup', haveIt: false },
      { name: 'Blueberry', quantity: '¼ cup', haveIt: false },
    ],
    steps: [
      'Freeze bananas overnight.',
      'Blend frozen bananas with açaí pulp until thick and creamy.',
      'Pour into bowls.',
      'Top with granola, sliced banana, berries, coconut, and a drizzle of honey.',
      'Serve immediately while thick.',
    ],
    nutrition: { calories: 280, protein: 6, carbs: 52, fat: 8, fiber: 7 },
    tips: [
      { icon: '🫐', text: 'The thicker the açaí base, the better. Add frozen berries if too thin.' },
      { icon: '🍯', text: 'Agave works great as a vegan alternative to honey.' },
    ],
  },
  {
    id: 'recipe-8',
    title: 'Risotto ai Funghi',
    image: '',
    cookingTime: 45,
    difficulty: 'Hard',
    servings: 4,
    rating: 4.8,
    cuisine: 'Italian',
    dietary: ['Vegetarian'],
    description: 'Creamy Arborio rice risotto with wild mushrooms, Parmesan, and white wine.',
    ingredients: [
      { name: 'Mushrooms', quantity: '300g', haveIt: true },
      { name: 'Garlic', quantity: '3 cloves', haveIt: true },
      { name: 'Onion', quantity: '1', haveIt: true },
      { name: 'Butter', quantity: '3 tbsp', haveIt: false },
      { name: 'Cheese', quantity: '½ cup', haveIt: false },
      { name: 'Flour', quantity: '1.5 cups Arborio', haveIt: true },
      { name: 'Olive Oil', quantity: '2 tbsp', haveIt: true },
    ],
    steps: [
      'Sauté mushrooms in butter until golden, set aside.',
      'In the same pan, cook onion and garlic in olive oil.',
      'Add Arborio rice, toast for 2 minutes.',
      'Add white wine, stir until absorbed.',
      'Add warm broth one ladle at a time, stirring continuously.',
      'After 18-20 minutes, fold in mushrooms and Parmesan.',
      'Finish with butter for extra creaminess.',
    ],
    nutrition: { calories: 420, protein: 14, carbs: 52, fat: 16, fiber: 3 },
    tips: [
      { icon: '🍄', text: 'Mix wild and cremini mushrooms for the best depth of flavor.' },
      { icon: '⚗️', text: 'Patience is key – risotto needs constant attention and slow broth addition.' },
    ],
  },
  {
    id: 'recipe-9',
    title: 'Spicy Tuna Poke Bowl',
    image: '',
    cookingTime: 15,
    difficulty: 'Easy',
    servings: 2,
    rating: 4.6,
    cuisine: 'Japanese',
    dietary: ['Dairy-Free', 'Gluten-Free'],
    description: 'Fresh raw tuna cubed with spicy mayo, soy, served over sushi rice.',
    ingredients: [
      { name: 'White Fish', quantity: '300g tuna', haveIt: false },
      { name: 'Rice', quantity: '1.5 cups', haveIt: true },
      { name: 'Soy Sauce', quantity: '2 tbsp', haveIt: true },
      { name: 'Avocado', quantity: '1', haveIt: false },
      { name: 'Sesame Oil', quantity: '1 tsp', haveIt: false },
      { name: 'Eggs', quantity: '2', haveIt: false },
      { name: 'Nori', quantity: '1 sheet', haveIt: false },
      { name: 'Cucumber', quantity: '½', haveIt: false },
    ],
    steps: [
      'Cook sushi rice and season with rice vinegar.',
      'Cut tuna into cubes, toss with soy sauce and sesame oil.',
      'Slice avocado, cucumber, and prepare any toppings.',
      'Marinate tuna for 5 minutes in spicy mayo.',
      'Assemble bowls: rice base, tuna, avocado, cucumber.',
      'Top with nori strips, sesame seeds, and soft-boiled egg.',
    ],
    nutrition: { calories: 380, protein: 32, carbs: 44, fat: 10, fiber: 3 },
    tips: [
      { icon: '🐟', text: 'Use sushi-grade tuna from a trusted fish market.' },
      { icon: '🌶️', text: 'Sriracha + Kewpie mayo = the perfect spicy mayo ratio.' },
    ],
  },
  {
    id: 'recipe-10',
    title: 'Chana Masala',
    image: '',
    cookingTime: 40,
    difficulty: 'Medium',
    servings: 4,
    rating: 4.5,
    cuisine: 'Indian',
    dietary: ['Vegan', 'Gluten-Free'],
    description: 'Hearty chickpea curry in spiced tomato sauce, served with flatbread or rice.',
    ingredients: [
      { name: 'Chickpeas', quantity: '2 cans', haveIt: true },
      { name: 'Tomato', quantity: '3', haveIt: true },
      { name: 'Onion', quantity: '1', haveIt: true },
      { name: 'Garlic', quantity: '4 cloves', haveIt: true },
      { name: 'Ginger', quantity: '1 inch', haveIt: false },
      { name: 'Cumin', quantity: '1 tsp', haveIt: false },
      { name: 'Chili', quantity: '1', haveIt: false },
      { name: 'Lime', quantity: '1', haveIt: false },
    ],
    steps: [
      'Sauté onion until golden, add garlic and ginger.',
      'Add cumin, chili, and cook until fragrant.',
      'Add chopped tomatoes, cook down for 10 minutes.',
      'Add chickpeas and simmer for 20 minutes.',
      'Mash some chickpeas for a thicker sauce.',
      'Finish with lime juice and fresh cilantro.',
    ],
    nutrition: { calories: 290, protein: 14, carbs: 42, fat: 8, fiber: 12 },
    tips: [
      { icon: '🫘', text: 'Dried chickpeas soaked overnight give better texture than canned.' },
      { icon: '🧡', text: 'Let it rest 10 minutes before serving – flavors deepen beautifully.' },
    ],
  },
  {
    id: 'recipe-11',
    title: 'BBQ Pulled Pork Sandwiches',
    image: '',
    cookingTime: 180,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.7,
    cuisine: 'American',
    dietary: [],
    description: 'Slow-cooked pulled pork in tangy BBQ sauce on toasted buns with coleslaw.',
    ingredients: [
      { name: 'Pork', quantity: '1.5kg shoulder', haveIt: true },
      { name: 'Bread', quantity: '6 buns', haveIt: true },
      { name: 'Apple', quantity: '1', haveIt: true },
      { name: 'Onion', quantity: '1', haveIt: true },
      { name: 'Vinegar', quantity: '2 tbsp', haveIt: true },
      { name: 'Sugar', quantity: '2 tbsp', haveIt: true },
      { name: 'Cabbage', quantity: '2 cups', haveIt: false },
    ],
    steps: [
      'Season pork shoulder generously with salt, pepper, and spices.',
      'Place in slow cooker with apple, onion, and vinegar.',
      'Cook on low for 6-8 hours until fork-tender.',
      'Shred pork with two forks, discarding fat.',
      'Toss with homemade or store-bought BBQ sauce.',
      'Toast buns, pile on pulled pork, and top with coleslaw.',
    ],
    nutrition: { calories: 520, protein: 38, carbs: 40, fat: 22, fiber: 2 },
    tips: [
      { icon: '🐖', text: 'The collagen breaks down at low temp – resist high heat cooking.' },
      { icon: '🔥', text: 'A quick broil at the end adds caramelized edges.' },
    ],
  },
  {
    id: 'recipe-12',
    title: 'Chicken Parmesan Pasta',
    image: '',
    cookingTime: 40,
    difficulty: 'Medium',
    servings: 4,
    rating: 4.4,
    cuisine: 'Italian',
    dietary: [],
    description: 'Breaded chicken cutlets with marinara sauce and melted mozzarella over pasta.',
    ingredients: [
      { name: 'Chicken', quantity: '4 breasts', haveIt: true },
      { name: 'Pasta', quantity: '400g', haveIt: true },
      { name: 'Tomato', quantity: '400g canned', haveIt: true },
      { name: 'Cheese', quantity: '200g mozzarella', haveIt: true },
      { name: 'Bread', quantity: '1 cup breadcrumbs', haveIt: false },
      { name: 'Eggs', quantity: '2', haveIt: false },
      { name: 'Garlic', quantity: '3 cloves', haveIt: true },
      { name: 'Basil', quantity: 'fresh', haveIt: false },
    ],
    steps: [
      'Pound chicken breasts thin and season well.',
      'Dip in beaten eggs, coat with breadcrumbs.',
      'Pan-fry chicken until golden on both sides.',
      'Top each cutlet with marinara and mozzarella.',
      'Bake at 400°F for 10 minutes until cheese is bubbly.',
      'Cook pasta, serve chicken on top with fresh basil.',
    ],
    nutrition: { calories: 580, protein: 40, carbs: 52, fat: 22, fiber: 3 },
    tips: [
      { icon: '🧀', text: 'Fresh mozzarella melts better than pre-shredded.' },
      { icon: '🍝', text: 'Penne or rigatoni hold sauce better than spaghetti here.' },
    ],
  },
  {
    id: 'recipe-13',
    title: 'Veggie Sushi Roll Platter',
    image: '',
    cookingTime: 45,
    difficulty: 'Hard',
    servings: 4,
    rating: 4.3,
    cuisine: 'Japanese',
    dietary: ['Vegan', 'Dairy-Free'],
    description: 'Colorful homemade sushi rolls with avocado, cucumber, carrot, and mango.',
    ingredients: [
      { name: 'Rice', quantity: '2 cups sushi', haveIt: true },
      { name: 'Nori', quantity: '6 sheets', haveIt: true },
      { name: 'Avocado', quantity: '2', haveIt: false },
      { name: 'Carrot', quantity: '2', haveIt: false },
      { name: 'Mango', quantity: '1', haveIt: false },
      { name: 'Cucumber', quantity: '1', haveIt: false },
      { name: 'Soy Sauce', quantity: 'for dipping', haveIt: true },
      { name: 'Rice', quantity: 'vinegar 3 tbsp', haveIt: false },
    ],
    steps: [
      'Cook and season sushi rice with rice vinegar, sugar, and salt.',
      'Lay nori on bamboo mat, spread rice evenly, leave 1cm border.',
      'Arrange fillings in a line across the center.',
      'Roll tightly using the bamboo mat, seal with water.',
      'Slice each roll into 8 pieces with a sharp, wet knife.',
      'Arrange on a platter and serve with soy sauce, wasabi, and pickled ginger.',
    ],
    nutrition: { calories: 260, protein: 6, carbs: 44, fat: 6, fiber: 4 },
    tips: [
      { icon: '📜', text: 'Keep a bowl of water nearby – wet hands prevent rice sticking.' },
      { icon: '🔪', text: 'Wipe the knife between each cut for clean, beautiful slices.' },
    ],
  },
  {
    id: 'recipe-14',
    title: 'Coxinha de Frango',
    image: '',
    cookingTime: 60,
    difficulty: 'Hard',
    servings: 12,
    rating: 4.9,
    cuisine: 'Brazilian',
    dietary: [],
    description: 'Iconic Brazilian chicken fritters shaped like teardrops, crispy outside, creamy inside.',
    ingredients: [
      { name: 'Chicken', quantity: '500g', haveIt: true },
      { name: 'Flour', quantity: '2 cups', haveIt: true },
      { name: 'Cheese', quantity: '100g', haveIt: true },
      { name: 'Butter', quantity: '2 tbsp', haveIt: false },
      { name: 'Cream', quantity: '200ml', haveIt: false },
      { name: 'Bread', quantity: '2 cups breadcrumbs', haveIt: false },
      { name: 'Eggs', quantity: '3', haveIt: false },
      { name: 'Garlic', quantity: '3 cloves', haveIt: true },
    ],
    steps: [
      'Cook and shred chicken breasts.',
      'Make dough: cook flour in butter and broth until it pulls from the pan.',
      'Add cream to dough, let cool, then knead in eggs.',
      'Mix shredded chicken with cream cheese for filling.',
      'Shape dough around filling into teardrop forms.',
      'Bread in breadcrumbs and deep fry until golden.',
    ],
    nutrition: { calories: 220, protein: 12, carbs: 18, fat: 12, fiber: 1 },
    tips: [
      { icon: '🍗', text: 'Dough must cool completely before shaping – use the fridge.' },
      { icon: '🫓', text: 'Fine breadcrumbs give the crispiest coating.' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 22 },
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const tagRemove: Variants = {
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { type: 'spring' as const, stiffness: 500, damping: 25 },
  },
}

const heartPop: Variants = {
  initial: { scale: 1 },
  active: {
    scale: [1, 1.4, 0.8, 1.15, 1],
    transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
  },
}

const cartBounce: Variants = {
  initial: { y: 0 },
  bounce: {
    y: [0, -12, 0, -6, 0],
    transition: { type: 'spring' as const, stiffness: 500, damping: 10 },
  },
}

const spotlight: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.1 },
  },
}

const difficultyBadgeEnter: Variants = {
  hidden: { opacity: 0, x: -10, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
}

const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalContent: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const numberPop: Variants = {
  initial: { scale: 1.3, color: 'rgba(34,197,94,1)' },
  animate: {
    scale: 1,
    color: 'rgba(255,255,255,1)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function matchRecipeIngredients(recipe: Recipe, userIngredients: string[]): number {
  const lower = userIngredients.map((i) => i.toLowerCase())
  return recipe.ingredients.filter((ing) =>
    lower.some((ui) => ing.name.toLowerCase().includes(ui) || ui.includes(ing.name.toLowerCase()))
  ).length
}

function getRecipeOfDay(recipes: Recipe[]): Recipe {
  const dayIndex = new Date().getDate() % recipes.length
  return recipes[dayIndex]
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ── Ingredient Tag Chip ── */
function IngredientTag({
  name,
  onRemove,
}: {
  name: string
  onRemove: () => void
}) {
  return (
    <motion.div
      layout
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="r55-ingredient-tag inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary"
    >
      <span className="text-xs">{name}</span>
      <motion.div
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
      >
        <button
          onClick={onRemove}
          className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
          aria-label={`Remove ${name}`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── Star Rating Display ── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 500, damping: 20 }}
        >
          <Star
            className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        </motion.div>
      ))}
      <span className="ml-1 text-xs font-semibold text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

/* ── Difficulty Badge ── */
function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFFICULTY_STYLES[difficulty]
  return (
    <motion.span
      variants={difficultyBadgeEnter}
      initial="hidden"
      animate="visible"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
    >
      {difficulty === 'Easy' && <Zap className="h-2.5 w-2.5" />}
      {difficulty === 'Medium' && <Flame className="h-2.5 w-2.5" />}
      {difficulty === 'Hard' && <AlertCircle className="h-2.5 w-2.5" />}
      {cfg.label}
    </motion.span>
  )
}

/* ── Dietary Tag ── */
function DietaryTag({ tag }: { tag: string }) {
  const config: Record<string, { icon: React.ReactNode; className: string }> = {
    Vegan: { icon: <Leaf className="h-2.5 w-2.5" />, className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-500/20' },
    Vegetarian: { icon: <Egg className="h-2.5 w-2.5" />, className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
    'Gluten-Free': { icon: <Wheat className="h-2.5 w-2.5" />, className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-500/20' },
    'Dairy-Free': { icon: <MilkOff className="h-2.5 w-2.5" />, className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-500/20' },
  }
  const c = config[tag] || { icon: <Leaf className="h-2.5 w-2.5" />, className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-500/20' }
  return (
    <Badge variant="outline" className={`text-[9px] font-semibold gap-0.5 border ${c.className}`}>
      {c.icon}
      {tag}
    </Badge>
  )
}

/* ── Ingredient Availability Indicator ── */
function AvailabilityIndicator({ haveIt }: { haveIt: boolean }) {
  return (
    <div className={`flex items-center gap-1 text-[10px] font-medium ${haveIt ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
      >
        {haveIt ? (
          <div className="h-4 w-4 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-emerald-500" />
          </div>
        ) : (
          <div className="h-4 w-4 rounded-full bg-orange-500/15 flex items-center justify-center">
            <AlertCircle className="h-2.5 w-2.5 text-orange-500" />
          </div>
        )}
      </motion.div>
      <span>{haveIt ? 'Have it' : 'Need to buy'}</span>
    </div>
  )
}

/* ── Recipe Card ── */
function RecipeCard({
  recipe,
  userIngredients,
  savedRecipes,
  onToggleSave,
  onViewDetails,
  onAddToCart,
  index,
}: {
  recipe: Recipe
  userIngredients: string[]
  savedRecipes: Set<string>
  onToggleSave: (id: string) => void
  onViewDetails: (id: string) => void
  onAddToCart: (id: string) => void
  index: number
}) {
  const isSaved = savedRecipes.has(recipe.id)
  const matchCount = matchRecipeIngredients(recipe, userIngredients)
  const missingIngredients = recipe.ingredients.filter(
    (ing) =>
      !userIngredients.some(
        (ui) =>
          ing.name.toLowerCase().includes(ui.toLowerCase()) ||
          ui.toLowerCase().includes(ing.name.toLowerCase())
      )
  )
  const cuisineCfg = CUISINE_CONFIG[recipe.cuisine]

  const cuisineGradients: Record<Cuisine, string> = {
    Brazilian: 'from-emerald-500 to-green-600',
    Italian: 'from-red-500 to-rose-600',
    Japanese: 'from-pink-500 to-rose-500',
    Mexican: 'from-amber-500 to-orange-600',
    Indian: 'from-orange-500 to-red-500',
    American: 'from-blue-500 to-indigo-600',
  }

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      initial="hidden"
      animate="visible"
      className="r55-recipe-card group relative rounded-2xl border border-border/50 bg-card overflow-hidden transition-shadow hover:shadow-lg r62-card-lift"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Image placeholder */}
      <div className={`relative h-40 bg-gradient-to-br ${cuisineGradients[recipe.cuisine]} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-3 left-3 text-5xl">{cuisineCfg.emoji}</div>
          <div className="absolute bottom-3 right-3 text-4xl opacity-50">🍽️</div>
        </div>
        <motion.div
          variants={spotlight}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center"
        >
          <span className="text-5xl block mb-1">🍽️</span>
          <span className="text-[10px] font-medium text-white/80 bg-black/20 rounded-full px-2.5 py-0.5">
            {cuisineCfg.emoji} {cuisineCfg.label}
          </span>
        </motion.div>

        {/* Save button overlay */}
        <motion.div className="absolute top-3 right-3 z-20">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation()
              onToggleSave(recipe.id)
            }}
            className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-black/50"
            aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isSaved ? 'saved' : 'unsaved'}
                variants={isSaved ? heartPop : undefined}
                initial={isSaved ? 'initial' : undefined}
                animate={isSaved ? 'active' : undefined}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Match count badge */}
        {userIngredients.length > 0 && matchCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring' as const, stiffness: 400, damping: 20 }}
            className="absolute top-3 left-3 z-20"
          >
            <Badge className="bg-emerald-500/90 text-white text-[9px] font-bold border-0">
              {matchCount}/{recipe.ingredients.length} match
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Meta info row */}
        <div className="flex items-center gap-3 mb-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTime(recipe.cookingTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{recipe.servings}</span>
          </div>
          <DifficultyBadge difficulty={recipe.difficulty} />
        </div>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={recipe.rating} />
        </div>

        {/* Dietary tags */}
        {recipe.dietary.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.dietary.map((tag) => (
              <DietaryTag key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Missing ingredients count */}
        {userIngredients.length > 0 && missingIngredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="r55-missing-info bg-orange-500/5 border border-orange-500/15 rounded-lg p-2 mb-3"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400">
              <ShoppingCart className="h-3 w-3" />
              <span className="font-medium">{missingIngredients.length} missing ingredient{missingIngredients.length > 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button
              size="sm"
              className="w-full text-xs h-8 min-h-[44px]"
              onClick={() => onViewDetails(recipe.id)}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              View Recipe
            </Button>
          </motion.div>
          {missingIngredients.length > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 min-h-[44px]"
                onClick={() => onAddToCart(recipe.id)}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {missingIngredients.length}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Recipe Detail Modal ── */
function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  userIngredients,
  savedRecipes,
  onToggleSave,
  onAddToCart,
}: {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  userIngredients: string[]
  savedRecipes: Set<string>
  onToggleSave: (id: string) => void
  onAddToCart: (id: string) => void
}) {
  const [servings, setServings] = useState(recipe?.servings || 4)
  const [cartBouncing, setCartBouncing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (recipe) setServings(recipe.servings)
  }, [recipe])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!recipe) return null

  const missingIngredients = recipe.ingredients.filter(
    (ing) =>
      !userIngredients.some(
        (ui) =>
          ing.name.toLowerCase().includes(ui.toLowerCase()) ||
          ui.toLowerCase().includes(ing.name.toLowerCase())
      )
  )

  const cuisineCfg = CUISINE_CONFIG[recipe.cuisine]

  const handleAddToCart = () => {
    setCartBouncing(true)
    onAddToCart(recipe.id)
    setTimeout(() => setCartBouncing(false), 600)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`Check out this recipe: ${recipe.title} - ${recipe.description}`)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="r55-modal-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={modalRef}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="r55-modal-content relative w-full max-w-2xl rounded-2xl bg-card border border-border/50 overflow-hidden my-8"
          >
            {/* Header gradient */}
            <div className={`r55-modal-header bg-gradient-to-br ${
              recipe.cuisine === 'Brazilian' ? 'from-emerald-500 to-green-600' :
              recipe.cuisine === 'Italian' ? 'from-red-500 to-rose-600' :
              recipe.cuisine === 'Japanese' ? 'from-pink-500 to-rose-500' :
              recipe.cuisine === 'Mexican' ? 'from-amber-500 to-orange-600' :
              recipe.cuisine === 'Indian' ? 'from-orange-500 to-red-500' :
              'from-blue-500 to-indigo-600'
            } p-6 relative`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="flex items-start gap-3">
                <span className="text-4xl">{cuisineCfg.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{recipe.title}</h2>
                  <p className="text-sm text-white/80 mt-1">{recipe.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <DifficultyBadge difficulty={recipe.difficulty} />
                    <span className="text-xs text-white/80 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatTime(recipe.cookingTime)}
                    </span>
                    <span className="text-xs text-white/80 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {recipe.servings} servings
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.dietary.map((tag) => (
                      <Badge key={tag} className="text-[9px] bg-white/20 text-white border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Servings Adjuster */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground">Servings:</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </motion.button>
                  <motion.span
                    key={servings}
                    variants={numberPop}
                    initial="initial"
                    animate="animate"
                    className="text-sm font-bold tabular-nums w-8 text-center"
                  >
                    {servings}
                  </motion.span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setServings(Math.min(12, servings + 1))}
                    className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </motion.button>
                </div>
                <span className="text-[10px] text-muted-foreground">(max 12)</span>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <UtensilsCrossed className="h-4 w-4" />
                  Ingredients
                  <span className="text-[10px] font-normal text-muted-foreground">
                    ({recipe.ingredients.length} items)
                  </span>
                </h3>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => {
                    const haveIt = userIngredients.some(
                      (ui) =>
                        ing.name.toLowerCase().includes(ui.toLowerCase()) ||
                        ui.toLowerCase().includes(ing.name.toLowerCase())
                    )
                    const scaledQty = servings !== recipe.servings
                      ? `${Math.round((parseFloat(ing.quantity) || 1) * (servings / recipe.servings) * 10) / 10} ${ing.quantity.replace(/[\d.]+/, '').trim()}`
                      : ing.quantity
                    return (
                      <motion.div
                        key={ing.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, type: 'spring' as const, stiffness: 400, damping: 22 }}
                        className={`r55-ingredient-row flex items-center gap-3 p-2 rounded-lg border ${
                          haveIt ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-orange-500/20 bg-orange-500/5'
                        }`}
                      >
                        <AvailabilityIndicator haveIt={haveIt} />
                        <span className="flex-1 text-xs font-medium">{ing.name}</span>
                        <span className="text-[11px] text-muted-foreground">{scaledQty}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4" />
                  Instructions
                </h3>
                <div className="space-y-3">
                  {recipe.steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.06 }}
                      className="flex gap-3"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground pt-0.5">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Nutrition Facts */}
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4" />
                  Nutrition Facts
                  <span className="text-[10px] font-normal text-muted-foreground">(per serving)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'Calories', value: recipe.nutrition.calories, unit: 'kcal', color: '#f97316' },
                    { label: 'Protein', value: recipe.nutrition.protein, unit: 'g', color: '#3b82f6' },
                    { label: 'Carbs', value: recipe.nutrition.carbs, unit: 'g', color: '#eab308' },
                    { label: 'Fat', value: recipe.nutrition.fat, unit: 'g', color: '#ef4444' },
                    { label: 'Fiber', value: recipe.nutrition.fiber, unit: 'g', color: '#22c55e' },
                  ].map((n) => (
                    <div key={n.label} className="r55-nutrition-item rounded-xl bg-muted/50 border border-border/30 p-2.5 text-center">
                      <div className="text-base font-bold" style={{ color: n.color }}>{n.value}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{n.label} ({n.unit})</div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: n.color, width: `${Math.min((n.value / (n.label === 'Calories' ? 800 : 80)) * 100, 100)}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((n.value / (n.label === 'Calories' ? 800 : 80)) * 100, 100)}%` }}
                          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {recipe.tips.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Chef&apos;s Tips
                  </h3>
                  <div className="space-y-2">
                    {recipe.tips.map((tip, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.08 }}
                        className="r55-tip-item flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3"
                      >
                        <span className="text-base">{tip.icon}</span>
                        <p className="text-xs leading-relaxed text-muted-foreground">{tip.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="r55-modal-footer border-t border-border/30 p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleSave(recipe.id)}
                    className="text-xs"
                  >
                    <Heart className={`h-3 w-3 mr-1 ${savedRecipes.has(recipe.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    {savedRecipes.has(recipe.id) ? 'Saved' : 'Save'}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
                    <Printer className="h-3 w-3 mr-1" />
                    Print
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </motion.div>
              </div>

              {missingIngredients.length > 0 && (
                <motion.div
                  variants={cartBounce}
                  animate={cartBouncing ? 'bounce' : 'initial'}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button size="sm" onClick={handleAddToCart} className="text-xs">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add {missingIngredients.length} to Cart
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Recipe of the Day ── */
function RecipeOfDay({
  recipe,
  onClick,
}: {
  recipe: Recipe
  onClick: () => void
}) {
  const [glowPhase, setGlowPhase] = useState(false)
  const cuisineCfg = CUISINE_CONFIG[recipe.cuisine]

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowPhase((prev) => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const cuisineGradients: Record<Cuisine, string> = {
    Brazilian: 'from-emerald-500 to-green-600',
    Italian: 'from-red-500 to-rose-600',
    Japanese: 'from-pink-500 to-rose-500',
    Mexican: 'from-amber-500 to-orange-600',
    Indian: 'from-orange-500 to-red-500',
    American: 'from-blue-500 to-indigo-600',
  }

  return (
    <motion.div
      variants={spotlight}
      initial="hidden"
      animate="visible"
      className={`r55-recipe-of-day relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
        glowPhase ? 'border-primary/50' : 'border-primary/20'
      }`}
      onClick={onClick}
    >
      <div className={`bg-gradient-to-br ${cuisineGradients[recipe.cuisine]} p-6 relative`}>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-amber-300" />
            <span className="text-xs font-bold text-white/90">Recipe of the Day</span>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <motion.span
              className="text-6xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {cuisineCfg.emoji}
            </motion.span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{recipe.title}</h3>
              <p className="text-sm text-white/70 mt-1 line-clamp-2">{recipe.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <Clock className="h-3 w-3" />
              <span>{formatTime(recipe.cookingTime)}</span>
            </div>
            <DifficultyBadge difficulty={recipe.difficulty} />
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-white/90">{recipe.rating}</span>
            </div>
          </div>

          <motion.div
            className="mt-4 flex items-center gap-1.5 text-xs font-medium text-white/90"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <span>View full recipe</span>
            <ChevronRight className="h-3 w-3" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Weekly Meal Planner ── */
function MealPlannerGrid({
  mealPlan,
  onAssignRecipe,
  onClearSlot,
}: {
  mealPlan: MealPlanSlot[]
  onAssignRecipe: (slot: MealPlanSlot) => void
  onClearSlot: (index: number) => void
}) {
  return (
    <div className="r55-meal-planner overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Header row */}
        <div className="grid grid-cols-8 gap-1 mb-1">
          <div className="text-center text-[10px] font-bold text-muted-foreground p-2" />
          {DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Meal rows */}
        {MEALS.map((meal) => (
          <div key={meal.key} className="grid grid-cols-8 gap-1 mb-1">
            <div className="flex items-center justify-center gap-1 p-1.5 text-[10px] font-medium text-muted-foreground">
              <span>{meal.icon}</span>
              <span className="hidden xl:inline">{meal.label}</span>
            </div>
            {DAYS.map((day) => {
              const slotIndex = mealPlan.findIndex(
                (s) => s.day === day && s.meal === meal.key
              )
              const slot = slotIndex >= 0 ? mealPlan[slotIndex] : null
              const recipe = slot?.recipeId
                ? MOCK_RECIPES.find((r) => r.id === slot.recipeId)
                : null

              return (
                <motion.div
                  key={`${day}-${meal.key}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAssignRecipe({ day, meal: meal.key, recipeId: null })}
                  className={`r55-planner-cell rounded-lg border cursor-pointer transition-all p-1.5 min-h-[56px] flex flex-col items-center justify-center ${
                    recipe
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-dashed border-border/50 bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  {recipe ? (
                    <>
                      <span className="text-sm">{CUISINE_CONFIG[recipe.cuisine].emoji}</span>
                      <span className="text-[8px] font-medium truncate max-w-full text-center leading-tight mt-0.5">
                        {recipe.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onClearSlot(slotIndex)
                        }}
                        className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-destructive/80 flex items-center justify-center"
                      >
                        <XCircle className="h-2 w-2 text-white" />
                      </button>
                    </>
                  ) : (
                    <Plus className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function RecipeDiscovery() {
  /* ── State ── */
  const [userIngredients, setUserIngredients] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeTab, setActiveTab] = useState<'matched' | 'popular'>('popular')
  const [selectedCuisines, setSelectedCuisines] = useState<Cuisine[]>([])
  const [cookingTimeRange, setCookingTimeRange] = useState<[number, number]>([0, 180])
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set())
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeSection, setActiveSection] = useState<'discover' | 'planner'>('discover')
  const [mealPlan, setMealPlan] = useState<MealPlanSlot[]>([])
  const [plannerAssignTarget, setPlannerAssignTarget] = useState<MealPlanSlot | null>(null)
  const [showPlannerRecipes, setShowPlannerRecipes] = useState(false)
  const [cartBouncing, setCartBouncing] = useState(false)
  const [addedToCartMsg, setAddedToCartMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const recipeOfDay = useMemo(() => getRecipeOfDay(MOCK_RECIPES), [])

  /* ── Autocomplete suggestions ── */
  const suggestions = useMemo(() => {
    if (!ingredientInput.trim()) return []
    const q = ingredientInput.toLowerCase()
    return ALL_INGREDIENTS.filter(
      (ing) =>
        ing.toLowerCase().includes(q) &&
        !userIngredients.some((ui) => ui.toLowerCase() === ing.toLowerCase())
    ).slice(0, 6)
  }, [ingredientInput, userIngredients])

  /* ── Filtered recipes ── */
  const filteredRecipes = useMemo(() => {
    let recipes = [...MOCK_RECIPES]

    if (activeTab === 'matched' && userIngredients.length > 0) {
      recipes = recipes
        .map((r) => ({
          ...r,
          _matchCount: matchRecipeIngredients(r, userIngredients),
        }))
        .filter((r) => r._matchCount > 0)
        .sort((a, b) => b._matchCount - a._matchCount)
    } else {
      recipes = [...recipes].sort((a, b) => b.rating - a.rating)
    }

    if (selectedCuisines.length > 0) {
      recipes = recipes.filter((r) => selectedCuisines.includes(r.cuisine))
    }

    recipes = recipes.filter(
      (r) => r.cookingTime >= cookingTimeRange[0] && r.cookingTime <= cookingTimeRange[1]
    )

    return recipes
  }, [activeTab, userIngredients, selectedCuisines, cookingTimeRange])

  /* ── Add ingredient ── */
  const addIngredient = useCallback((name: string) => {
    const trimmed = name.trim()
    if (trimmed && !userIngredients.some((ui) => ui.toLowerCase() === trimmed.toLowerCase())) {
      setUserIngredients((prev) => [...prev, trimmed])
      setIngredientInput('')
      setShowSuggestions(false)
    }
  }, [userIngredients])

  /* ── Remove ingredient ── */
  const removeIngredient = useCallback((name: string) => {
    setUserIngredients((prev) => prev.filter((ui) => ui !== name))
  }, [])

  /* ── Toggle cuisine filter ── */
  const toggleCuisine = useCallback((cuisine: Cuisine) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    )
  }, [])

  /* ── Toggle save recipe ── */
  const toggleSaveRecipe = useCallback((id: string) => {
    setSavedRecipes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  /* ── Add to cart ── */
  const addToCart = useCallback((recipeId: string) => {
    const recipe = MOCK_RECIPES.find((r) => r.id === recipeId)
    if (!recipe) return
    setCartBouncing(true)
    setAddedToCartMsg(recipe.title)
    setTimeout(() => setCartBouncing(false), 600)
    setTimeout(() => setAddedToCartMsg(null), 2500)
  }, [])

  /* ── Handle ingredient input keydown ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && ingredientInput.trim()) {
        e.preventDefault()
        addIngredient(ingredientInput)
      }
    },
    [ingredientInput, addIngredient]
  )

  /* ── Meal planner assign ── */
  const handleAssignRecipe = useCallback(
    (target: MealPlanSlot, recipeId: string) => {
      setMealPlan((prev) => {
        const existing = prev.findIndex((s) => s.day === target.day && s.meal === target.meal)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { ...target, recipeId }
          return updated
        }
        return [...prev, { ...target, recipeId }]
      })
      setPlannerAssignTarget(null)
      setShowPlannerRecipes(false)
    },
    []
  )

  const handleClearSlot = useCallback((index: number) => {
    setMealPlan((prev) => prev.filter((_, i) => i !== index))
  }, [])

  /* ── Close suggestions on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ── Selected recipe for detail modal ── */
  const selectedRecipe = useMemo(
    () => MOCK_RECIPES.find((r) => r.id === selectedRecipeId) || null,
    [selectedRecipeId]
  )

  /* ── Available recipes for planner ── */
  const plannerRecipes = useMemo(
    () => plannerAssignTarget ? MOCK_RECIPES : [],
    [plannerAssignTarget]
  )

  return (
    <section className="r55-recipe-discovery relative py-6 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold r62-heading-gradient">Recipe Discovery</h2>
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Find the perfect recipe based on what you have in your fridge. Plan your week and never waste food again.
        </p>
      </motion.div>

      {/* ── Recipe of the Day ── */}
      <div className="mb-8">
        <RecipeOfDay recipe={recipeOfDay} onClick={() => setSelectedRecipeId(recipeOfDay.id)} />
      </div>

      {/* ── Section Toggle ── */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(['discover', 'planner'] as const).map((section) => (
          <motion.div key={section} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant={activeSection === section ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(section)}
              className="text-xs"
            >
              {section === 'discover' ? (
                <>
                  <Search className="h-3 w-3 mr-1" />
                  Discover Recipes
                </>
              ) : (
                <>
                  <Calendar className="h-3 w-3 mr-1" />
                  Weekly Meal Planner
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {activeSection === 'discover' ? (
        /* ═══════════════════════════════════════════════
           DISCOVER SECTION
           ═══════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* ── What's in your Fridge? ── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="r55-fridge-input rounded-2xl border border-border/50 bg-card p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧊</span>
              <h3 className="text-sm font-bold">What&apos;s in your fridge?</h3>
              <span className="text-[10px] text-muted-foreground">Type to add ingredients</span>
            </div>

            {/* Input + autocomplete */}
            <div className="relative mb-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => {
                      setIngredientInput(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search ingredients... (e.g. Chicken, Rice, Tomato)"
                    className="r55-ingredient-input w-full h-10 pl-9 pr-3 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    onClick={() => addIngredient(ingredientInput)}
                    disabled={!ingredientInput.trim()}
                    className="h-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -4 }}
                    className="r55-suggestions-dropdown absolute z-30 top-full left-0 right-12 mt-1 rounded-xl border border-border/60 bg-card overflow-hidden"
                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  >
                    {suggestions.map((sug) => (
                      <motion.button
                        key={sug}
                        whileHover={{ x: 4 }}
                        onClick={() => addIngredient(sug)}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-muted/50 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-3 w-3 text-primary" />
                        <span>{sug}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ingredient tags */}
            <AnimatePresence mode="popLayout">
              {userIngredients.length > 0 && (
                <motion.div
                  layout
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-2"
                >
                  {userIngredients.map((ing) => (
                    <IngredientTag
                      key={ing}
                      name={ing}
                      onRemove={() => removeIngredient(ing)}
                    />
                  ))}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] text-muted-foreground"
                      onClick={() => setUserIngredients([])}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Clear all
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {userIngredients.length === 0 && (
              <div className="r55-empty-fridge text-center py-6">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <span className="text-4xl">🗑️</span>
                </motion.div>
                <p className="text-xs text-muted-foreground mt-2">Your fridge is empty. Add some ingredients to discover recipes!</p>
              </div>
            )}
          </motion.div>

          {/* ── Filter Row ── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Tab toggle + Filter button */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl bg-muted/50 p-0.5 border border-border/30">
                  {(['matched', 'popular'] as const).map((tab) => (
                    <motion.div key={tab} whileTap={{ scale: 0.95 }}>
                      <button
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeTab === tab
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab === 'matched' ? (
                          <span className="flex items-center gap-1.5">
                            <Search className="h-3 w-3" />
                            Using Your Ingredients
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" />
                            Popular Recipes
                          </span>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>

                <span className="text-[10px] text-muted-foreground">
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                </span>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Filters
                  <ChevronDown
                    className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  />
                </Button>
              </motion.div>
            </div>

            {/* Expandable filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="r55-filters-panel overflow-hidden"
                >
                  <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-5">
                    {/* Cuisine filter */}
                    <div>
                      <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Cuisine
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(CUISINE_CONFIG) as Cuisine[]).map((cuisine) => {
                          const cfg = CUISINE_CONFIG[cuisine]
                          const isSelected = selectedCuisines.includes(cuisine)
                          return (
                            <motion.div
                              key={cuisine}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <button
                                onClick={() => toggleCuisine(cuisine)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium border transition-all ${
                                  isSelected
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-muted/50 border-border/40 text-muted-foreground hover:border-primary/20'
                                }`}
                              >
                                <span>{cfg.emoji}</span>
                                <span>{cfg.label}</span>
                                {isSelected && <Check className="h-3 w-3" />}
                              </button>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Cooking time filter */}
                    <div>
                      <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                        <Timer className="h-3.5 w-3.5" />
                        Cooking Time
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({formatTime(cookingTimeRange[0])} – {formatTime(cookingTimeRange[1])})
                        </span>
                      </h4>
                      <Slider
                        value={cookingTimeRange}
                        onValueChange={(val) => setCookingTimeRange(val as [number, number])}
                        min={0}
                        max={180}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">0 min</span>
                        <span className="text-[10px] text-muted-foreground">3h+</span>
                      </div>
                    </div>

                    {/* Clear filters */}
                    {(selectedCuisines.length > 0 || cookingTimeRange[0] > 0 || cookingTimeRange[1] < 180) && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setSelectedCuisines([])
                            setCookingTimeRange([0, 180])
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Clear all filters
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Recipe Grid ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                userIngredients={userIngredients}
                savedRecipes={savedRecipes}
                onToggleSave={toggleSaveRecipe}
                onViewDetails={setSelectedRecipeId}
                onAddToCart={addToCart}
                index={index}
              />
            ))}
          </motion.div>

          {filteredRecipes.length === 0 && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="r55-no-results text-center py-12"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="text-5xl">🍽️</span>
              </motion.div>
              <h3 className="text-sm font-bold mt-4">No recipes found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Try adding more ingredients or adjusting your filters to discover more recipes.
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════
           WEEKLY MEAL PLANNER
           ═══════════════════════════════════════════════ */
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="r55-planner-wrapper rounded-2xl border border-border/50 bg-card p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Meal Planner
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">Click empty cells to assign recipes from your collection</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {mealPlan.length} meals planned
              </Badge>
            </div>

            <MealPlannerGrid
              mealPlan={mealPlan}
              onAssignRecipe={(target) => {
                setPlannerAssignTarget(target)
                setShowPlannerRecipes(true)
              }}
              onClearSlot={handleClearSlot}
            />
          </div>

          {/* Planner recipe picker */}
          <AnimatePresence>
            {showPlannerRecipes && plannerAssignTarget && (
              <motion.div
                variants={modalContent}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="r55-planner-picker rounded-2xl border border-border/50 bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold">
                    Pick a recipe for {plannerAssignTarget.day} {plannerAssignTarget.meal}
                  </h4>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <button
                      onClick={() => {
                        setShowPlannerRecipes(false)
                        setPlannerAssignTarget(null)
                      }}
                      className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {plannerRecipes.map((recipe) => (
                    <motion.div
                      key={recipe.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAssignRecipe(plannerAssignTarget, recipe.id)}
                      className="r55-picker-card rounded-xl border border-border/40 p-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CUISINE_CONFIG[recipe.cuisine].emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate">{recipe.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2 w-2" /> {formatTime(recipe.cookingTime)}
                            </span>
                            <DifficultyBadge difficulty={recipe.difficulty} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Floating Cart Message ── */}
      <AnimatePresence>
        {addedToCartMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="r55-cart-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 shadow-lg"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          >
            <motion.div
              animate={cartBouncing ? { y: [0, -8, 0, -4, 0] } : {}}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 10 }}
            >
              <ShoppingCart className="h-4 w-4" />
            </motion.div>
            <span className="text-xs font-medium">Added missing ingredients!</span>
            <Check className="h-3.5 w-3.5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recipe Detail Modal ── */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipeId}
        onClose={() => setSelectedRecipeId(null)}
        userIngredients={userIngredients}
        savedRecipes={savedRecipes}
        onToggleSave={toggleSaveRecipe}
        onAddToCart={addToCart}
      />
    </section>
  )
}
