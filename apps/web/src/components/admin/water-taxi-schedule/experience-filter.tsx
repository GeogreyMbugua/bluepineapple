'use client';

interface ExperienceFilterProps {
  value: string;
  onChange: (value: string) => void;
  experiences: string[];
}

export function ExperienceFilter({ value, onChange, experiences }: ExperienceFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="experience-filter" className="sr-only">Filter by experience</label>
      <select
        id="experience-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-stroke bg-white px-3 py-1.5 text-sm text-dark focus:border-primary focus:outline-none"
      >
        <option value="all">All Experiences</option>
        {experiences.map((exp) => (
          <option key={exp} value={exp}>{exp}</option>
        ))}
      </select>
    </div>
  );
}
