# The Euclidian algorithm

The Euclidian algorithm is a simple algorithm to compute the greatest common divisor (or simply *gcd*) of two numbers. While the Euclidian algorithm is very simple, it is also very efficient.


### Theory

The greatest common divisor $\gcd(a, b)$ of two numbers $a, b$ is the greatest number that divides both numbers. The Euclidian algorithm is based on two simple observations:

$$\gcd(a, 0) = a$$

$$\gcd(a, b) = \gcd(b, \text{mod}_b(a))$$

where $\text{mod}_b(a)$ reduces $a$ modulo $b$ to some number $0, 1, 2, ..., b - 1$

When we assume that $a \geq b$, we can use the second step to reduce the problem to computing the gcd of two numbers, where one of the numbers is smaller.


### Implementation

Usually, we have a wrapper function which swaps the arguments if we have $a < b$, and then calls some helper function which assumes that $a \geq b$:

	def gcd(a, b):
	if (a < b): return gcd_helper(b, a)
	  else: return gcd_helper(a, b)

Then the implementation can be done recursively in an elegant way:

	def gcd_helper(a, b):
		if b == 0: return a
		return gcd_helper(b, a % b)

Note that `gcd_helper` assumes that $a \geq b$. The `gcd` function ensures this the first time that `gcd_helper` is called. For every call of `gcd_helper` to itself, we can use that $\text{mod}_b(a) < b$ to see that this condition is fulfilled.

If we call the values of $a$ and $b$ with which the `gcd_helper` function is first called $a_0$ and $b_0$, and the values in the next call $a_1$ and $b_1$, and so on, we obtain:

$$a_{n + 1} = b_n$$

$$b_{n + 1} = \text{mod}_{b_n}(a_n)$$

which motivates the following implementation:

	def gcd_helper(a, b):
		while b != 0:
			(a, b) = (b, a % b)
		return a

Note that `gcd(0, 0)` is not defined, but this implementation will return 0. Calling `gcd` with negative arguments might give a negative result. Depending on your application, you might want to fix this. For example, you might want to throw an error when `gcd(0, 0)` is called, or call `gcd_helper` with the absolute value of the arguments in the `gcd` function.


### Analysis

Take the Fibonacci sequence $$0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, ...$$

which is defined as $F_0 = 0, F_1 = 1$, and $F_{n + 1} = F_n + F_{n - 1}$ for $n > 1$. 

When we use the Euclidian algorithm to compute $\gcd(F_{n + 1}, F_n)$, it will finish after $n$ steps. If we use the Euclidian algorithm to compute $\gcd(a, b)$ with $a \leq F_{n + 1}$ and $b \leq F_n$, the Euclidian algorithm will terminate in less than $n$ steps. So, two successive Fibonacci numbers are the worst case input for the Euclidian algorithm, in some sense.

This is a consequence of the fact that we have $F_{n + 1}\ \%\ F_n = F_{n + 1} - F_n = F_{n - 1}$. So in this case, the modulo operator will subtract $F_n$ from $F_{n + 1}$ only once, which is the worst case.

Since the Fibonacci sequence satisfies
$$ F_n = \lfloor \left( \frac{1 + \sqrt{5}}{2} \right)^n \rfloor $$

we can deduce that the number of steps that the Euclidian algorithm will take is bounded by $\frac{\log(a)}{\log(\frac{1 + \sqrt{5}}{2})} = O(\log(a))$.
