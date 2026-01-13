/// Calculate Julian Day Number from date
int jdnFromDate(int year, int month, int day) {
  var y = year;
  var m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  final a = y ~/ 100;
  final b = 2 - a + (a ~/ 4);
  final jd =
      (365.25 * (y + 4716)).floor() + (30.6001 * (m + 1)).floor() + day + b - 1524.5;

  return jd.round();
}
