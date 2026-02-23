import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PromptForm({ defaultValues, suggestions, loading, onSubmit }) {
  const [formValues, setFormValues] = useState(defaultValues);

  const handleLocationChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="prompt" className="text-base text-foreground">
          Planning prompt
        </Label>
        <Textarea
          id="prompt"
          required
          rows={4}
          value={formValues.prompt}
          placeholder="Plan my Friday with a brunch spot, a cozy movie, and evening drinks in Bengaluru."
          onChange={(event) => setFormValues((prev) => ({ ...prev, prompt: event.target.value }))}
        />
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Try:</span>
          {suggestions.map((suggestion) => (
            <Badge
              key={suggestion}
              role="button"
              tabIndex={0}
              variant="outline"
              className={cn('cursor-pointer capitalize border-dashed hover:border-primary hover:text-primary', {
                'border-primary text-primary': formValues.prompt === suggestion,
              })}
              onClick={() =>
                setFormValues((prev) => ({
                  ...prev,
                  prompt: suggestion,
                }))
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setFormValues((prev) => ({
                    ...prev,
                    prompt: suggestion,
                  }));
                }
              }}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {['city', 'state', 'country'].map((field) => (
          <div className="space-y-2" key={field}>
            <Label htmlFor={field} className="capitalize">
              {field}
            </Label>
            <Input
              id={field}
              required
              value={formValues.location[field]}
              placeholder={field === 'city' ? 'Bengaluru' : field === 'state' ? 'Karnataka' : 'India'}
              onChange={(event) => handleLocationChange(field, event.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Event date</Label>
          <Input
            id="date"
            type="date"
            value={formValues.date ?? ''}
            onChange={(event) =>
              setFormValues((prev) => ({
                ...prev,
                date: event.target.value || undefined,
              }))
            }
          />
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <Label>Notes</Label>
          <p>
            The backend requires a full location (city, state, country). Dates are optional but help us find precise showtimes and forecasts.
          </p>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
        {loading ? 'Planning your outing…' : 'Generate plan'}
      </Button>
    </form>
  );
}
