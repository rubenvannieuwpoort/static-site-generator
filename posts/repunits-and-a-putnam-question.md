# Repunits and a Putnam question

I solved some simple [Putnam](https://en.wikipedia.org/wiki/William_Lowell_Putnam_Mathematical_Competition) questions yesterday. One of them was the following question:

> *1989 A1 How many primes among the positive integer, written as usual in base 10, are alternating 1’s and 0’s, beginning and ending with 1?*

So, we need to count how many prime numbers there are among $1, 101, 10101, 1010101, ...$ Normally, it is a good idea to work through some of the smallest numbers, but these numbers grow in size so quickly that it’s hard to factorize enough of them to see a pattern. The number $1$ is not a prime by definition, but it is easy to check that $101$ is a prime number. On the other hand, $10101$ is divisible by $3$. The numbers $1, 101, 10101, 1010101, ...$ can be written as $100^0 + 100^1 + ... + 100^n$. Numbers that can be written like this are called *repunits*.

A *repunit*, short for ‘repeated unit’, is a number that, when written in a certain base, contains only the digit 1, repeated a number of times. So, 1, 11, 111, 1111, ..., are repunits in base 10. The numbers 1, 101, 10101 are repunits in base 100. I will mostly use base-10 numbers to illustrate concepts, but definitions and theorems handle the general case.

**Definition**: *A **rep-unit in base $b$** is a number that can be written as*
$$1 + b + b^2 + ... + b^n$$

In base 10, we can write a number that consists of $n$ 9’s as $10^n - 1$. So, a repunit that consists of $n$ ones, can be written as $\frac{10^n - 1}{9}$. The following theorem generalizes this results other bases.

**Theorem**: *A repunit in base $b$ can be written as*
$$ 1 + b + b^2 + ... + b^n = \frac{b^{n + 1} - 1}{b - 1} $$

**Proof**: Multiply both sides by $b - 1$ and simplify the result to see that the equality holds. $\square$

To answer the question, we have to find out when repunits can be prime. There are plenty of repunit prime, and quick search yields: $11$, which is a repunit prime in base $10$, and $3, 7$ and $31$, which are repunit primes in base 2.

If you check enough repunit primes, you might notice that all the repunit primes have a prime number of digits when they are represented in the corresponding base. For example, $11$ has two digits, and $31$ has five digits in the base $2$ representation:
$$31 = 2^0 + 2^1 + 2^2 + 2^3 + 2^4 = 11111_2$$

If you mess around further, you might notice that you can factorize repunits with $n$ digits when $n$ is composite. For example, for $n = 6$ we have
$$ 111111 = 10101 \cdot 11 $$

In this factorization the left number is a repunit in base 100 with three digits, and the right number is a repunit in base 10 with two digits. This factorization holds in any base, but I will assume that we are using base $10$ here. Note that $10101 = 100^2 + 100^1 + 100^0$ is a repunit in base $100$. So, if we have $n = pq$, we can factorize the repunit with $n$ digits in a repunit in base $10^q$ with $p$ digits, and a repunit in base $10$ with $q$ digits. The following theorem formalizes this for repunits in base $b$:

**Theorem**:
$$\frac{b^{pq} - 1}{b - 1} = \frac{b^{pq} - 1}{b^q - 1} \frac{b^q - 1}{b - 1}$$

**Proof**: This trivially follows from simplifying the fractions. $\square$

As a consequence, repunit primes are necessarily repunits with a prime number of digits in the corresponding base.

**Corollary**: *If*
$$ 1 + b + b^2 + ... + b^n = \frac{b^{n + 1} - 1}{b - 1} $$

is prime, then $n$ is prime.

**Proof**: If $n$ is composite, then $\frac{b^{pq} - 1}{b - 1}$ is composite, because it can be written as $\frac{b^{pq} - 1}{b - 1} = \frac{b^{pq} - 1}{b^q - 1} \frac{b^q - 1}{b - 1}$. $\square$

Note that if the base $b$ is composite, there still might be prime repunits in base $b$. For example, $5$ is a repunit prime in base 4 (it can be written as $1 + 4$, and $43$ is a repunit prime in base $6$ (it can be written as $1 + 6 + 36$).

While this last theorem might seem promising, we are still unable to answer the Putnam question. For that, we make the simple observation that
$$1 + 100 + 100^2 + ... + 100^n = \frac{100^{n + 1} - 1}{99} = \frac{(10^{n + 1} + 1)(10^{n + 1} - 1)}{99}$$

This means that $101$ is the only prime number in the sequence $1, 101, 10101, ...$ If $n > 2$, $99$ is smaller than both of the factors, which mean that the product of the two numbers is composite. We have now answered the Putnam question. We can also generalize to the following theorem:

**Theorem**: *If $b > 1$ is a perfect square, say $b = a^2$, then a repunit in base $b$*
$$\frac{b^n - 1}{b - 1}$$

*is composite when $n > 1$.*

**Proof**: Suppose $n > 1$. Let one of $u, v$ equal $a^n + 1$ and the other equal $a^n - 1$. The repunit can be written as $\frac{uv}{b - 1}$. Suppose that $p$ is a prime number that divides this number. Then $p$ must also divide $uv$ and by Euclid’s lemma, it must divide at least one of $u, v$. Suppose, without loss of generality, that it divides $v$, and set $v = kp$. Then $\frac{uv}{b - 1} = \frac{ukp}{b- 1}$. Since $b - 1 < u, v$ it follows that $\frac{u}{b - 1} > 1$ and we have
$$ \frac{uv}{b - 1} = \frac{ukp}{b - 1} > kp \geq p $$

Since $\frac{uv}{b - 1} > p$ it follows that $\frac{uv}{b - 1} =\not p$. Since we did not specify $p$, it follows that $\frac{uv}{b - 1}$ is not a prime number, so it must be composite. $\square$

We can now summarize the results in the following theorem:

**Theorem**: *A repunit in base $b$*
$$\frac{b^n - 1}{b - 1}$$

*is composite when $n$ is composite, or when $b$ is a perfect square and $n > 1$.*

Last, but not least, there is the following conjecture:

**Conjecture**: *For every integer $b$ that is not a perfect square, there are an infinite number of different values of $n$ so that the repunit in base $b$*
$$\frac{b^n - 1}{b - 1}$$

*is prime.*
