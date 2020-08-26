# The rational root theorem and a Putnam question

I came across the following Putnam question yesterday:

> **B1** Let $P(x) = c_n x^n + c_{n - 1} x^{n - 1} _ ... + c_0$ be a polynomial with integer coefficients. Suppose that $r$ is a rational number such that $P(r) = 0$. Show that the $n$ numbers
$$c_nr, c_nr^2 + c_{n - 1}r, c_nr^3 + c_{n - 1}r^2 + c_{n - 2}r, ..., c_nr^n + c_{n - 1} r^{n - 1} + ... + c_1r$$
>
>are integers.

If you’re familiar with the *rational root theorem* you will probably see a connection. Indeed, the proof that the question asks for is along the same lines.

I have to admit I didn’t remember the proof of the rational root theorem. It’s one of those proofs that’s not very hard once you know the trick, but if you don’t know the trick, you can spend quite some time without finding the proof. It took me a while to find it again, so I will document it here for myself.

**Definition:** *A fraction $\frac{p}{q}$ is called **reduced** if $p \in \mathbb{Z}$, $q \in \mathbb{N}$, and $\gcd(p, q) = 1$.*

**Theorem (rational root theorem):** *Suppose that $f$ is a polynomial with integer coefficients $c_0, c_1, ..., c_n \in \mathbb{Z}$*:
$$f(x) = c_0 + c_1 x + ... c_n x^n $$

*If the reduced fraction $\frac{p}{q}$ is a root of $f$, then $p | c_0$ and $q | c_n$.*

**Proof:** Since $\frac{p}{q}$ is a root of $f$, we have
$$c_0 + c_1 \frac{p}{q} + ... + c_n (\frac{p}{q})^n = 0$$

After multiplying by $q^n$ we obtain

$$c_0 q^n + c_1 q^{n - 1}p + ... + c_n p^n = 0$$

Now subtract $c_0 q^n$ and factor out the factor $p$ on the left side:

$$p(c_1q^{n - 1} + c_2 q^{n - 2} p + ... c_n p^{n - 1}) = -c_0 q^n$$

Since the left-hand side is a product of two integers, $p$ is a divisor of the left-hand side, so it is also a divisor of the right hand side. So we have $p | c_0 q^n$. Since $\frac{p}{q}$ is a reduced fraction, we have $\gcd(p, q) = 1$. It follows that $p | c_0$. Switching the roles of $p$ and $q$, and $c_0$ and $c_n$, we can deduce that $q | c_n$ in an analogous way. $\square$

**Note:** If the polynomial $f$ has rational coefficients, it can easily transformed to a polynomial with the same roots and integer coefficients by multiplying it by the least common multiple of all the denominators.

The proof that the Putnam question asks for can be derived in a similar way. In the proof we will use the following lemma:

**Lemma:** *If $\frac{a}{b}$ and $\frac{c}{d}$ are fractions with $\frac{a}{b} = \frac{c}{d}$ and $\gcd(b,d) = 1$, then $\frac{a}{b}$ and $\frac{c}{d}$ are integers.*

**Proof:** Let $\frac{p}{q}$ be the reduced form of $\frac{a}{b}$, so that we have $\frac{p}{q} = \frac{a}{b} = \frac{c}{d}$. Since $\frac{p}{q}$ is the reduced form of $\frac{a}{b}$, there exists an $m \in \mathbb{N}$ such that $a = mp$ and $b = mq$. Likewise, there exists an $n \in \mathbb{N}$ such that $c = np$ and $d = nq$. Now we have $\gcd(b, d) = \gcd(mq, nq) = 1$. Since $q | \gcd(mq, nq)$, it follows that $q = 1$. So we have $\frac{a}{b} = \frac{c}{d} = \frac{p}{q} = p$. $\square$

Now, we’re ready to provide the proof that the question asks for.

**Theorem:** *Suppose that $f$ is a polynomial with integer coefficients $c_0, c_1, ..., c_n \in \mathbb{Z}$*:
$$f(x) = c_0 + c_1 x + ... c_n x^n $$

*If $r$ is a rational root of the $f$, then the numbers*
$$c_n r, c_n r^2 + c_{n - 1} r, c_n r^3 + c_{n - 1} r^2 + c_{n - 2} r, ..., c_n r^n + c_{n - 1} r^{n - 1} + ... + c_1 r$$

*are integers.*

**Proof:** We prove that $\sum^m_{k = 1} c_{n + 1 - k} r^k$ is an integer using induction. The base case $m = 1$ holds by the rational root theorem. For the induction step, assume that $c_n r^m + ... + c_{n + 1 - m} r$ is an integer for all $m \leq M$. Write $r$ as a reduced fraction $\frac{p}{q}$. Since $\frac{p}{q}$ is a root of $f$ we have
$$c_0 + c_1 \frac{p}{q} + ... + c_n (\frac{p}{q})^n = 0$$

Multiply by $(\frac{q}{p})^{n - M}$ and subtract $c_n r^M + c_{n - 1} r^{M - 1} + ... + c_{n + 1 - M}r$ from both sides, and we get:
$$\frac{c_0 q^{n - M} + c_1 p q^{n - M - 1} + ... + c_{n - M - 1}p^{n - M - 1}q + c_{n - M}p^{n - M}}{p^{n - M}}$$
$$= -(c_n r^M + c_{n - 1} r^{M - 1} + ... + c_{n + 1 - M}r)$$

By the induction assumption, the right side is an integer. To emphasize this, substitute $k := c_n r^M + c_{n - 1} r^{M - 1} + ... + c_{n + 1 - M}r$. Then, subtract $c_{n - M}$ from both sides and multiply by $r = \frac{p}{q}$:
$$\frac{c_0 q^{n - M} + c_1 p q^{n - M - 1} + ... + c_{n - M - 1}p^{n - M - 1}q}{p^{n - M}} = -\frac{(k + c_{n - M})p}{q} $$

We now invoke the lemma, and conclude that the right-hand side, which equals $c_n r^{M + 1} + c_{n - 1} r^M + ... + c_{n - M}r$ must also be an integer. This completes the induction step. $\square$
