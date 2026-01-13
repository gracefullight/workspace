import 'package:timezone/timezone.dart' as tz;

/// Apply mean solar time correction based on longitude
tz.TZDateTime applyMeanSolarTime(
  tz.TZDateTime dtLocal,
  double longitudeDeg, {
  double tzOffsetHours = 9.0,
}) {
  final deltaMinutes = (4 * (longitudeDeg - 15 * tzOffsetHours)).round();
  return dtLocal.add(Duration(minutes: deltaMinutes));
}

/// Get timezone offset hours from location name
double getTimezoneOffsetHours(tz.Location location, tz.TZDateTime dt) {
  return dt.timeZoneOffset.inMinutes / 60.0;
}
