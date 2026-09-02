UPDATE "route_stops" AS stop
SET "estimatedArrivalMinutes" = CASE stop."code"
  WHEN 'MTW' THEN 0
  WHEN 'SER' THEN 8
  WHEN 'BAM' THEN 16
  WHEN 'WHT' THEN 25
  WHEN 'PIR' THEN 35
  WHEN 'MOM' THEN 60
  WHEN 'NYA' THEN 75
  WHEN 'ENG' THEN 90
  WHEN 'FJ' THEN 120
END
FROM "routes" AS route
WHERE stop."routeId" = route."id"
  AND route."code" = 'FJ-HOHO'
  AND stop."code" IN ('MTW', 'SER', 'BAM', 'WHT', 'PIR', 'MOM', 'NYA', 'ENG', 'FJ');
