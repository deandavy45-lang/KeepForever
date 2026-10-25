-- Customizable, unbranded covers: family-defined spine text and emblem.
alter table public.books add column spine_text text check (char_length(spine_text) <= 80);
alter table public.books add column emblem_path text; -- storage key in vault-media
