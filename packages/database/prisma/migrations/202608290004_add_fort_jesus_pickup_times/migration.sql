-- Keep pickup times available for existing Fort Jesus route records.
UPDATE "route_stops" AS stop
SET "estimatedArrivalMinutes" = CASE stop."code"
  WHEN 'MTW' THEN 0
  WHEN 'SER' THEN 12
  WHEN 'BAM' THEN 24
  WHEN 'WHT' THEN 36
  WHEN 'PIR' THEN 48
  WHEN 'MOM' THEN 60
  WHEN 'NYA' THEN 80
  WHEN 'ENG' THEN 100
  WHEN 'FJ' THEN 120
END
FROM "routes" AS route
WHERE stop."routeId" = route."id"
  AND route."code" = 'FJ-HOHO'
  AND stop."code" IN ('MTW', 'SER', 'BAM', 'WHT', 'PIR', 'MOM', 'NYA', 'ENG', 'FJ');
