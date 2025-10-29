import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MissionFilterState {
  search: string;
  difficulty: string[];
  category: string[];
  xpMin: number;
  xpMax: number;
  sortBy: 'distance' | 'xp' | 'difficulty' | 'deadline';
  nearMe: boolean;
}

interface MissionFiltersProps {
  onFilterChange: (filters: MissionFilterState) => void;
  hasLocation: boolean;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['food', 'culture', 'adventure', 'photography', 'heritage', 'shopping', 'nature', 'spiritual'];

export const MissionFilters = ({ onFilterChange, hasLocation }: MissionFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<MissionFilterState>({
    search: '',
    difficulty: [],
    category: [],
    xpMin: 0,
    xpMax: 500,
    sortBy: 'xp',
    nearMe: false,
  });

  const updateFilters = (updates: Partial<MissionFilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleDifficulty = (diff: string) => {
    const newDifficulty = filters.difficulty.includes(diff)
      ? filters.difficulty.filter(d => d !== diff)
      : [...filters.difficulty, diff];
    updateFilters({ difficulty: newDifficulty });
  };

  const toggleCategory = (cat: string) => {
    const newCategory = filters.category.includes(cat)
      ? filters.category.filter(c => c !== cat)
      : [...filters.category, cat];
    updateFilters({ category: newCategory });
  };

  const clearFilters = () => {
    const defaultFilters: MissionFilterState = {
      search: '',
      difficulty: [],
      category: [],
      xpMin: 0,
      xpMax: 500,
      sortBy: 'xp',
      nearMe: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = 
    filters.difficulty.length + 
    filters.category.length + 
    (filters.search ? 1 : 0) + 
    (filters.nearMe ? 1 : 0);

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Filters & Search</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by location or keywords..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {hasLocation && (
          <Button
            variant={filters.nearMe ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ nearMe: !filters.nearMe })}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Near Me
          </Button>
        )}
        <Select
          value={filters.sortBy}
          onValueChange={(value: any) => updateFilters({ sortBy: value })}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xp">XP (High to Low)</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            {hasLocation && <SelectItem value="distance">Distance</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Difficulty Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Difficulty</Label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((diff) => (
                  <Badge
                    key={diff}
                    variant={filters.difficulty.includes(diff) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleDifficulty(diff)}
                  >
                    {diff}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={filters.category.includes(cat) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* XP Range Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                XP Reward: {filters.xpMin} - {filters.xpMax}
              </Label>
              <div className="flex gap-4 items-center">
                <Slider
                  min={0}
                  max={500}
                  step={50}
                  value={[filters.xpMin, filters.xpMax]}
                  onValueChange={([min, max]) => updateFilters({ xpMin: min, xpMax: max })}
                  className="flex-1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};