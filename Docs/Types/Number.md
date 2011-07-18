# Moved from Math to Number.prototype:
	abs, acos, asin, atan, atan2, ceil, cos, exp, floor, log, max, min, pow, sin, sqrt, tan

# Static Number methods

### random
	Number.random(int min, int max)
Returns random number between min & max:

	var x = Number.random(5, 40); // 24

# Dynamic Number methods
### between
	number.between(n1, n2, equals)

	(5).between(2, 6); // true
	(6).between(2, 6); // false
	(6).between(2, 6, true); // true

### equals
	number.equals(to, accuracy = 8)

Allows to compare two float numbers (which can't be done with `==`) with
`accuracy` digits after dot

	(1.15124124).equals(1.15124124); // true
	(1.15124124).equals(1.15124001); // false
	(1.15124124).equals(1.15124001, 3); // true (1.151 == 1.151)

### limit(min, max)
### round(precision)
### toFloat()
### toInt(base)
### stop()