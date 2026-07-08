export interface ExperienceCreatedEvent {
  experienceId: string;
  name: string;
  slug: string;
  category: string;
}

export interface ExperienceUpdatedEvent {
  experienceId: string;
}

export interface ExperienceActivatedEvent {
  experienceId: string;
}

export interface ExperienceDeactivatedEvent {
  experienceId: string;
}
