# The extended Euclidian algorithm

The extended Euclidian algorithm is based on the Euclidian algorithm, which finds the greatest common divisor of two numbers $a, b$. The extended Euclidian algorithm also does some bookkeeping, which allows it to express the greatest common divisor as a linear combination of $a$ and $b$. For example, if we run the Euclidian algorithm for $a = 112, b = 42$, we find that $\gcd(112, 42) = 14$. Now, running the Euclidian algorithm tells us that $\gcd(112, 42) = 14$ and additionally tells us that $14 = -1 \cdot 112 + 3 \cdot 42$.


### Theory

If we suppose that the Euclidian algorithm is used to find the greatest common divisor of $a_0, b_0$ where $a_0 \geq b_0$, we can formulate the algorithm as a recurrent relation
$$a_{n + 1} = b_n$$

$$b_{n + 1} = \text{mod}_{b_n}(a_n)$$

which is then applied until $b_n = 0$, in which case $a_n$ is the greatest common divisor $\gcd(a_0, b_0)$ of $a_0$ and $b_0$.

The extended Euclidian algorithm now keeps numbers $p_n, q_n, r_n, s_n$ such that
$$ a_n = p_n a_0 + q_n b_0 $$

$$ b_n = r_n a_0 + s_n b_0 $$

Obviously, we have $p_0 = 1, q_0 = 0$ and $r_0 = 0, s_0 = 1$. Using that $a_{n + 1} = b_n$, we see that
$$p_{n + 1} = r_n$$

$$q_{n + 1} = s_n$$

To find $r_{n + 1}$ and $s_{n + 1}$, use that $b_{n + 1} = \text{mod}_{b_n}(a_n) = a_n - \lfloor \frac{a_n}{b_n} \rfloor b_n$. Using $a_n = p_n a_0 + q_n b_0$ and $b_n = r_n a_0 + s_n b_0$ we see that
$$b_{n + 1} = a_n - \lfloor \frac{a_n}{b_n} \rfloor b_n = (p_n a_0 + q_n b_0) - \lfloor \frac{a_n}{b_n} \rfloor (r_n a_0 + s_n b_0)$$

factoring out $a_0$ and $b_0$, we see that
$$b_n = (p_n - \lfloor \frac{a_n}{b_n} \rfloor r_n)a_0 + (q_n - \lfloor \frac{a_n}{b_n} \rfloor s_n)b_0 $$

so we see that
$$ r_{n + 1} = p_n - \lfloor \frac{a_n}{b_n} \rfloor r_n $$

$$ s_{n + 1} = q_n - \lfloor \frac{a_n}{b_n} \rfloor s_n $$


### Implementation

Normally I try to give an implementation that works in C-style languages. However, the C-style languages are rather primitive in the sense that they provide no uniform and comfortable way to use tuples, so I will use Python for now.

Like in the implementation for Euclids algorithm, we have a wrapper that ensures that the first argument is always the biggest. The wrapper returns a triple `(gcd, p, q)`, such that `gcd` is the greatest common divisor, and we have $\gcd(a, b) = pa + qb$.

	def gcd_extended(a, b):
		if a < b:
			(gcd, p, q) = gcd_extended_helper(b, 1, 0, a, 0, 1)
			return (gcd, q, p)
		else: return gcd_extended_helper(a, 1, 0, b, 0, 1)


Like for Euclids algorithm, we can use a recursive implementation

	def gcd_extended_helper(a, p, q, b, r, s):
		if b == 0: return (a, p, q)
		k = a // b;
		return gcd_extended_helper(b, r, s, a - k * b, p - k * r, q - k * s)

or an iterative one

	def gcd_extended_helper(a, p, q, b, r, s):
		while b != 0:
			(a, p, q, b, r, s) = (b, r, s, a - k * b, p - k * r, q - k * s)
		return (a, p, q)


### Applications

When modular arithmetic modulo some number $n$, we may want to find a multiplicative inverse $a^{-1}$ of the element $a$. That is, we want to find $a^{-1}$ such that
$$ a a^{-1}  \equiv 1 \pmod{n}$$

Now, such an element only exists if $\gcd(a, n) = 1$, which is why it is often convenient to take $n$ prime (we can take any $a = 1, 2, ..., n - 1$). Now, note that if $pa + rn = 1$, then we have
$ap \equiv 1 \pmod{n}$. So $a^{-1} \equiv p \pmod{n}$ is the element we’re looking for.

Now we can define a function that computes the multiplicative inverse modulo $n$ as follows:

	def inverse_modulo(a, n):
		(gcd, p, q) = gcd_extended(a, n)
		return p
