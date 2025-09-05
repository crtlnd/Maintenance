import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Asset } from '../../types';

// Filter and Sort Types
export interface FilterState {
  search: string;
  condition: string;
  type: string;
  location: string;
  manufacturer: string;
  operatingHoursMin: string;
  operatingHoursMax: string;
}

export interface SortState {
  field: 'name' | 'type' | 'condition' | 'location' | 'operatingHours' | 'lastMaintenance';
  direction: 'asc' | 'desc';
}

interface FilterOptions {
  conditions: string[];
  types: string[];
  locations: string[];
  manufacturers: string[];
}

interface AssetFiltersPanelProps {
  filters: FilterState;
  sort: SortState;
  filterOptions: FilterOptions;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortState) => void;
  onClearFilters: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
  totalCount: number;
}

export function AssetFiltersPanel({
  filters,
  sort,
  filterOptions,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  isVisible,
  onToggleVisibility,
  hasActiveFilters,
  resultCount,
  totalCount
}: AssetFiltersPanelProps) {

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateSort = (field?: string, direction?: 'asc' | 'desc') => {
    if (field) {
      onSortChange({
        field: field as SortState['field'],
        direction: direction || sort.direction
      });
    } else if (direction) {
      onSortChange({
        ...sort,
        direction
      });
    }
  };

  const toggleSortDirection = () => {
    updateSort(undefined, sort.direction === 'asc' ? 'desc' : 'asc');
  };

  return (
    <>
      {/* Filter Toggle and Summary */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleVisibility}
            className={hasActiveFilters ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {Object.values(filters).filter(v => v && v !== 'all').length}
              </span>
            )}
          </Button>

          {/* Results Summary */}
          <span className="text-sm text-muted-foreground">
            Showing {resultCount} of {totalCount} assets
          </span>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isVisible && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Filter Assets</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={onClearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onToggleVisibility}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select
                  value={filters.condition}
                  onValueChange={(value) => updateFilter('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    {filterOptions.conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {filterOptions.types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => updateFilter('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {filterOptions.locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manufacturer */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Manufacturer</label>
                <Select
                  value={filters.manufacturer}
                  onValueChange={(value) => updateFilter('manufacturer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Manufacturers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Manufacturers</SelectItem>
                    {filterOptions.manufacturers.map(manufacturer => (
                      <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operating Hours Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Operating Hours</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.operatingHoursMin}
                  onChange={(e) => updateFilter('operatingHoursMin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Operating Hours</label>
                <Input
                  type="number"
                  placeholder="999999"
                  value={filters.operatingHoursMax}
                  onChange={(e) => updateFilter('operatingHoursMax', e.target.value)}
                />
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <div className="flex gap-2">
                  <Select
                    value={sort.field}
                    onValueChange={(value) => updateSort(value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="condition">Condition</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="operatingHours">Operating Hours</SelectItem>
                      <SelectItem value="lastMaintenance">Last Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSortDirection}
                    className="px-3"
                  >
                    {sort.direction === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
