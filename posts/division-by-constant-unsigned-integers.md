# Division by constant unsigned integers

The code accompanying this article can be found in a [github repository](https://github.com/rubenvannieuwpoort/division-by-constant-integers).

Most modern processors have an integer divide instruction which, for technical reasons, is very slow compared to other integer arithmetic operations. When the divisor is constant, it is possible to evaluate the result of the division without using the slow division instruction. Most optimizing compilers perform this optimization, as can be seen on [Matt Godbolt’s compiler explorer](https://godbolt.org/z/9G1fE7). This article tries to be a self-contained reference for optimizing division by constant unsigned divisors.

There are tricks to make division by some special divisors fast: A division by one can be ignored, a division by a power of two can be replaced by a bit shift. A more general trick exists: By using fixed-point arithmetic, we can speed up division by all constant divisors. However, this is not simple to explain, and for this reason I will focus only on positive (or 'unsigned') divisors in this article. For a number $n$ (also called the *dividend*) and a divisor $d$, I assume that we are interested in the *quotient* $\lfloor \frac{n}{d} \rfloor$.

When it is necessary to repeatedly divide floating-point numbers by the same constant $c$, it is often preferred to precompute the floating-point number $\frac{1}{c}$ and multiply by this instead. This is usually a lot more efficient. We can do something similar for integers by using [fixed point arithmetic](https://en.wikipedia.org/wiki/Fixed-point_arithmetic).

The basic idea is to pick a large constant of the form $2^k$. Now, if $m \approx \frac{2^k}{d}$ we expect that $\lfloor \frac{m \cdot n}{2^k} \rfloor \approx \lfloor \frac{n}{d} \rfloor$. The expression $\lfloor \frac{m \cdot n}{2^k} \rfloor$ can be evaluated with just a multiplication and a bit shift, and is more efficient to evaluate than a division by $d$.

The idea might be a little less mysterious after seeing an example in the decimal system. Take $d = 3$. Instead of taking a large constant of the form $2^k$, we take $10^4$. Now we have $m = 3333 \approx \frac{10^5}{3}$. Now we have $\lfloor \frac{m \cdot n}{10^4} \rfloor = \lfloor n \cdot 0.3333 \rfloor$. We certainly expect that $\lfloor n \cdot 0.3333 \rfloor \approx \lfloor \frac{n}{3} \rfloor$ since $0.3333 \approx \frac{1}{3}$.

In the following section, I'll discuss the mathematical background. In the sections after that, I'll discuss optimization of division by unsigned integers.


## Mathematical background

### Preliminaries

I will assume that we are working on an $N$-bit machine which can efficiently compute the full $2N$-bit product of two $N$-bit unsigned integers. I will denote $\mathbb{N}_0 = \{ 0, 1, 2, ... \}$ for the set of natural numbers including zero, $\mathbb{N}_+ = \{ 1, 2, 3, ... \}$ for the set of positive natural numbers, and $\mathbb{Z} = \{ ..., -1, 0, 1, ... \}$ for the set of integers. Further, I will use the notation $\mathbb{U}_N$ for the set of unsigned integers that can be represented with $N$ bits:
$$ \mathbb{U}_N = \{ 0, 1, ..., 2^N - 1 \} $$

I will use the notation $\text{mod}_d(n)$ to denote the integer in the range $\{ 0, 1, ..., d - 1 \}$ that is equivalent to $n$ modulo $d$. That is, $\text{mod}_d(n)$ is the unique integer such that
$$ 0 \leq \text{mod}_d(n) < d $$

$$ \text{mod}_d(n) = n + m \cdot d $$

for some $m \in \mathbb{Z}$.


### Unsigned division

For a given divisor $d$, we now want to have an expression that evaluates to $\lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$. We have two demands for this expression:
  1. It should be *correct*, that is, the expression is equal to $\lfloor \frac{n}{d} \rfloor$
  2. It should be *efficient* to evaluate. For our purposes, this means that we want to multiply numbers of at most $N$ bits, so that they fit in a single register on our $N$-bit machine, and that we implement the division by $2^k$ with a bit shift.

Guided by these demands, we can start our analysis. The following lemma will be useful:

**Lemma 1**: *Suppose that $n \in \mathbb{Z}$, $d \in \mathbb{N}_+$. If $\frac{n}{d} \leq x < \frac{n + 1}{d}$ then $\lfloor x \rfloor = \lfloor \frac{n}{d} \rfloor$.*

**Proof**: We have $\frac{n + 1}{d} = \lfloor \frac{n}{d} \rfloor + \frac{k}{d}$ for some nonnegative integer $k \leq d$. So $\frac{n + 1}{d} = \lfloor \frac{n}{d} \rfloor + \frac{k}{d} \leq \lfloor \frac{n}{d} \rfloor + 1$. It follows that $x \in [ \lfloor \frac{n}{d} \rfloor, \lfloor \frac{n}{d} \rfloor + 1)$, so that $\lfloor x \rfloor = \lfloor \frac{n}{d} \rfloor$.
$\square$

At this point, we have decided that we want an expression that evaluates to $\lfloor \frac{n}{d} \rfloor$. In the introduction, we have established that we should have $\frac{n \cdot m}{2^k} \approx \frac{n}{d}$ whenever $m \approx \frac{2^k}{d}$. So, it is natural to take $\lfloor \frac{m \cdot n}{2^k} \rfloor$ with $m \approx \frac{2^k}{d}$ as our starting point, since we expect that $\frac{m \cdot n}{2^k} \approx \frac{n}{d}$.

We now need to decide how exactly to pick $m$ and $k$. The obvious choice for $m$ are the integers that minimize the error to $\frac{2^k}{d}$, which are $m_\text{down} = \lfloor \frac{2^k}{d} \rfloor$ and $m_\text{up} = \lceil \frac{2^k}{d} \rceil$. Note that when $d$ is not a power of two and put $n = d$, we have $\lfloor \frac{m_\text{down} \cdot d}{2^k} \rfloor = 0$, so this is not a viable method. So, let's round up instead.

This gives us the **round-up method**, which approximates $\lfloor \frac{n}{d} \rfloor$ by $\lfloor \frac{m_\text{up} \cdot n}{2^k} \rfloor$ with $m_\text{up} = \lceil \frac{2^k}{d} \rceil$.

First, we determine the conditions under which the round-up method produces the correct result. Note that from this point on we will assume that $k$ is larger than $N$. We will assume $k = N + \ell$ and use $k$ and $N + \ell$ interchangeably.

First, we would like to know when the round-up method is correct. The following theorem states a condition under which the round-up method is correct, that is, $\lfloor \frac{m_\text{up} \cdot n}{2^k} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.

**Lemma 2**: *Let $d, m, N \in \mathbb{N}_+$ and $\ell \in \mathbb{N}_0$. If*
$$ 2^{N + \ell} \leq m \cdot d \leq 2^{N + \ell} + 2^\ell $$

*then $\lfloor \frac{m \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$*.

**Proof**: Multiplying the inequality by $\frac{n}{d \cdot 2^{N + \ell}}$ we get
$$ \frac{n}{d} \leq \frac{m \cdot n}{2^{N + \ell}} \leq \frac{n}{d} + \frac{1}{d} \cdot \frac{n}{2^N} $$

For all $n \in \mathbb{U}_N$ we have $n < 2^N$, so that $\frac{n}{2^N} < 1$. It follows that we have
$$ \frac{n}{d} \leq \frac{m \cdot n}{2^{N + \ell}} \leq \frac{n}{d} + \frac{1}{d} $$

for all $n \in \mathbb{U}_N$. By lemma 1, it follows that $\lfloor \frac{m \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.
$\square$

Lemma 2 essentially says that if there is a multiple of $d$ in the interval $[ 2^{N + \ell}, 2^{N + \ell} + 2^\ell ]$, there exists some constant $m$ such that $\lfloor \frac{m \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.

The following theorem provides us with a practical choice for $m$, by simply rounding up $\frac{2^{N + k}}{d}$.

**Theorem 3 (round-up method)**: *Let $d, N \in \mathbb{N}_+$ and $\ell \in \mathbb{N}_0$, and let $m_\text{up} = \left \lceil \frac{2^{N + \ell}}{d} \right \rceil$. If $m_\text{up} \cdot d \leq 2^{N + \ell} + 2^\ell$ then $\lfloor \frac{m_\text{up} \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.*

**Proof**: Considering that $\lceil \frac{2^{N + \ell}}{d} \rceil \cdot d$ is the smallest multiple of $d$ that is larger than $2^{N + \ell}$, we have $2^{N + \ell} \leq m_\text{up}$. So if $m_\text{up} \leq 2^{N + \ell} + 2^\ell$ we have $2^{N + \ell} \leq m_\text{up} \leq 2^{N + \ell} + 2^\ell$. So by lemma 2 we have $\lfloor \frac{m \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.
$\square$

For the efficient evaluation of the product $m_\text{up} \cdot n$ it is necessary that $m_\text{up}$ and $n$ fit in a single $N$-bit register. So it is natural to wonder whether we can always find $\ell, m$ such that $\lfloor \frac{m_\text{up} \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$ and $m_\text{up}$ is an $N$-bit unsigned constant.

First, let's do some examples.

**Example**: Let's take $N = 8$, $d = 3$. First, we try $\ell = 0$ and compute $m_\text{up} = \lceil \frac{2^8}{3} \rceil = 86$. We have $86 \cdot 3 = 258 > 257 = 2^8 + 2^0$. So we increase $\ell$ to one and try again. This time we get $m_\text{up} = \lceil \frac{2^9}{3} \rceil = 171$. We have $171 \cdot 3 = 513 \leq 514= 2^9 + 2^1$. So the condition of theorem 3 is satisfied and for any 8-bit unsigned integer $n \in \mathbb{U}_8$ we have $\lfloor \frac{171 \cdot n}{2^9} \rfloor = \lfloor \frac{n}{3} \rfloor$.

**Example**: Let's take $N = 8$, $d = 7$. First, we try $\ell = 0$ and compute $m_\text{up} = \lceil \frac{2^8}{7} \rceil = 37$. We see that $37 \cdot 7 = 259 > 257 = 2^8 + 2^0$. So we increase $\ell$ to one and try again. This time we get $m_\text{up} = \lceil \frac{2^9}{7} \rceil = 74$. We see that $74 \cdot 7 = 518 > 514 = 2^9 + 2^1$. Again, we increase $\ell$ to two and check the bound again: $m_\text{up} = \lceil \frac{2^{10}}{7} \rceil = 147$, and $147 \cdot 7 = 1029 > 1028 = 2^{10} + 2^2$. Increasing $\ell$ to four, we get $m_\text{up} = \lceil \frac{2^{11}}{7} \rceil = 293$, and $293\cdot 7 = 2051 \leq 2056 = 2^{11} + 2^3$. So the condition of theorem 3 is satisfied and for any 8-bit unsigned integer $n \in \mathbb{U}_8$ we can have $\lfloor \frac{293 \cdot n}{2^9} \rfloor = \lfloor \frac{n}{7} \rfloor$.

This last example shows that $m_\text{up}$ does not always fit in $N$ bits. The following theorem shows that $m_\text{up}$ always fits in $N + 1$ bits.

**Theorem 4**: *Let $N \in \mathbb{N}_+$, $d \in \mathbb{U}_N$ with $d > 0$ and define $\ell = \lceil \log_2(d) \rceil, m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil$. Then $m_\text{up} \in \mathbb{U}_{N + 1} \setminus \mathbb{U}_N$ and $\lfloor \frac{m_\text{up} \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.*

**Proof**: The range $\{ 2^{N + \ell}, 2^{N + \ell} + 1, ..., 2^{N + \ell} + 2^\ell \}$ consists of $2^\ell + 1$ consecutive numbers. We have $\ell = \lceil \log_2(d) \rceil$, so $2^\ell + 1 > d$ and there must be a multiple of $d$ in this range. Since $d \cdot m_\text{up} = d \cdot \lceil \frac{2^{N + \ell}}{d} \rceil$ is simply the first multiple greater than or equal to $2^{N + \ell}$, this is a multiple of $d$ in this range. So $m_\text{up}$ satisfies the condition of lemma 2, and it follows that $\lfloor \frac{m_\text{up} \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$. By using lemma 8 with $N + 1$ instead of $N$, we see that $2^N \leq m_\text{up} < 2^{N + 1}$, so $m_\text{up} \in \mathbb{U}_{N + 1} \setminus \mathbb{U}_N$.
$\square$

One way to handle the case when $m$ does not fit in $N$ bits, is to use the following trick from [1] to multiply by an $(N + 1)$-bit constant: We can evaluate $\lfloor \frac{m \cdot n}{2^{N + \ell}} \rfloor$ by defining $p = m - 2^N$ and using the following code:
```
uint high_word = (((big_uint)p) * n) >> N;
uint result = (high_word + ((n - high_word) >> 1)) >> (l - 1);
```

This trick is used by some compilers to handle divisors for which $m_\text{up}$ does not fit in $N$ bits.

Now, let's focus on the round-down method. If, instead of using $m_\text{up}$ we round down and use $m_\text{down} = \lfloor \frac{2^{N + \ell}}{d} \rfloor$, we run into some problems. When we take any $d$ that is not a power of two, we see that $d \cdot m < 2^{N + \ell}$ so that $\lfloor \frac{m \cdot d}{2^{N + \ell}} \rfloor = 0$ while $\lfloor \frac{n}{d} \rfloor = 1$ when $n = d$. So, we find that the value of $m_\text{down} \cdot n$ is too low. Instead of rounding up $\frac{2^{N + \ell}}{d}$ to get $m$, we can round down but increase $n$. This gives us the **round-down method**, which approximates $\lfloor \frac{n}{d} \rfloor$ by $\lfloor \frac{m_{down} \cdot (n + 1)}{2^{N + \ell}} \rfloor$ with $m_\text{down} = \lfloor \frac{2^{N + \ell}}{d} \rfloor$.

We proceed as we did for the round-up method, by deriving a condition under which the method is correct.

**Lemma 5**: *Let $d, m, N \in \mathbb{N}_+$ and $\ell \in \mathbb{N}_0$. If*
$$ 2^{N + \ell} - 2^\ell \leq m \cdot d < 2^{N + \ell}$$

*then $\lfloor \frac{m \cdot (n + 1)}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$*.

**Proof**: Multiply the inequality by $\frac{n + 1}{d \cdot 2^{N + \ell}}$ to get
$$ \frac{n}{d} + \frac{1}{d} \cdot \left( 1 - \frac{n + 1}{2^N} \right) \leq \frac{m \cdot (n + 1)}{2^{N + \ell}} < \frac{n + 1}{d} $$

Looking at the expression on the left side, we have $1 \leq n + 1 \leq 2^N$, so that $0 \leq 1 - \frac{n + 1}{2^N} < 1$. It follows that $\frac{n}{d} \leq \frac{n}{d} + \frac{1}{d} \cdot (1 - \frac{n + 1}{2^N})$, so
$$ \frac{n}{d} \leq \frac{m \cdot (n + 1)}{2^{N + \ell}} < \frac{n + 1}{d} $$

for all $n \in \mathbb{U}_N$. So lemma 1 applies and we have $\lfloor \frac{m \cdot (n + 1)}{2^{N + \ell}} \rfloor$ for all $n \in \mathbb{U}_N$.
$\square$

This lemma is obviously an analogue of lemma 2 for the round-down method. It is also possible to prove an analogue of theorem 3 for the round-down method. We will not use this result in the rest of the article and proving it is left as an exercise for the reader.

**Exercise**: *Prove the following theorem.*

**Theorem 6**: *Let $d, N, \ell \in \mathbb{N}_0$ with $d > 0$, and let $m_\text{down} = \left \lfloor \frac{2^{N + \ell}}{d} \right \rfloor$. If $m_\text{down} \cdot d \geq 2^{N + \ell} - 2^\ell$ then $\lfloor \frac{m \cdot (n + 1)}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.*

When using the round-up or round-down method, we want $m$ to be an $N$-bit number in order for the multiplication to be efficient. As we have seen, such an $m$ does not always exist. Let us call divisors for which such an $m$ exists *efficient*. The following definition makes this rigorous.

**Definition 7**: *We call a positive divisor $d \in \mathbb{U}_N$ efficient for the $N$-bit round-up method if there exists a tuple $(\ell, m) \in \mathbb{N}_+ \times \mathbb{U}_N$ such that $\lfloor \frac{m \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$. Likewise, we call a positive divisor $d \in \mathbb{U}_N$ efficient for the $N$-bit round-down method if there exists a tuple $(\ell, m) \in \mathbb{N}_+ \times \mathbb{U}_N$ such that $\lfloor \frac{m \cdot (n + 1)}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.*

The following result tells us that $\ell = \lceil \log_2(d) \rceil - 1$ is the biggest value for $\ell$ that we can pick so that $m_\text{up}$ and $m_\text{down}$ still fit in $N$ bits.

**Lemma 8**: *Let $N \in \mathbb{N}_+$, $d \in \mathbb{U}_N$ with $d > 0$ and define $m' = \frac{2^{N + \lceil \log_2(d) \rceil - 1}}{d}, m_\text{down} = \lfloor m' \rfloor, m_\text{up} = \lceil m' \rceil$. Now $m_\text{down}, m_\text{up} \in \mathbb{U}_N$ with*
$$2^{N - 1} \leq m_\text{down} \leq m_\text{up} \leq 2^N - 1$$

*That is, the binary representations of $m_\text{down}$ and $m_\text{up}$ have exactly $N$ bits.*

**Proof**: We have $2^{N - 1} = \frac{2^{N - 1} \cdot d}{d} = \frac{2^{N - 1 + \log_2(d)}}{d} \leq \frac{2^{N - 1 + \lceil \log_2(d) \rceil}}{d} = m'$. Since the floor function is a nondecreasing function and $\lfloor m' \rfloor \leq \lceil m' \rceil$ we have $2^{N - 1} \leq m_\text{down} \leq m_\text{up}$. It remains to show that $m_\text{up} \leq 2^N - 1$.

When $N = 1$, it follows that $d = 1$ and the bound holds. When $N > 1$, the ratio $\frac{2^{\lceil \log_2(d) \rceil}}{d}$ is maximized over $d \in \mathbb{U}_N$ by $d = 2^{N - 1} + 1$, so $\frac{2^{\lceil \log_2(d) \rceil}}{d} \leq \frac{2^N}{2^{N - 1} + 1} < \frac{2^N - 1}{2^{N - 1}}$ (this last inequality can be seen by multiplying both sides by $2^{N - 1} \cdot (2^{N - 1} + 1)$). So we have $\frac{2^{\lceil \log_2(d) \rceil}}{d} < \frac{2^N - 1}{2^{N - 1}}$; multiplying both sides by $2^{N - 1}$ gives $m' = \frac{2^{N + \lceil \log_2(d) \rceil - 1}}{d} < 2^N - 1$. After rounding up both sides, it follows that $m_\text{up} \leq 2^N - 1$.
$\square$

The following result states that we can combine the round-up and round-down method to a method that works for any positive divisor. So this finally concludes our quest for an efficient method to calculate the quotient $\lfloor \frac{n}{d} \rfloor$.

**Theorem 9**: *Any positive divisor $d \in \mathbb{U}_N$ is either efficient for the $N$-bit round-up method, or efficient for the $N$-bit round-down method.*

**Proof**: Set $\ell = \lceil \log_2(d) \rceil - 1$ and define $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil, m_\text{down} = \lfloor \frac{2^{N + \ell}}{d} \rfloor$. From lemma 8, we know that $m_\text{up}, m_\text{down} \in \mathbb{U}_N$. Now consider the range $\{ 2^N - 2^\ell, 2^N - 2^\ell + 1, ..., 2^N + \ell \}$. This is a range of $2\ell + 1$ numbers. Since $d < 2\ell + 1$ there must be at least one multiple $m$ of $d$ in this range. When this multiple $m$ satisfies $2^N - 2^\ell \leq m < 2^{N + \ell}$ the condition for the round-down method is satisfied. Since $m_\text{down} \in \mathbb{U}_N$, $d$ is efficient for the $N$-bit round-down method. Otherwise, we have $2^{N + \ell} \leq m \leq 2^{N + \ell} + 2^\ell$ and the condition for the round-up method is satisfied. Again, since $m_\text{up} \in \mathbb{U}_N$ we have that $d$ is efficient for the $N$-bit round-up method.
$\square$

This theorem also implies that we never need to check if a divisor is efficient for the $N$-bit round-down method. We can simply test if a divisor is efficient for the $N$-bit round-up method, and use the round-down method if it is not. Indeed, when both methods can be used we prefer to use the round-up method, since it is slightly more efficient.

The following result gives us a more intuitive understanding of the conditions of lemma 2 and 5.

**Theorem 10**: *Let $N \in \mathbb{N}_+, d \in \mathbb{U}_N$ with $d > 0$. Define $\ell = \lfloor \log_2(d) \rfloor$, $x = \frac{2^{N + \ell}}{d}$, $m_\text{down} = \lfloor x \rfloor$, and $m_\text{up} = \lceil x \rceil$. Now:*
  - *If $m_\text{up} - x \leq \frac{1}{2}$, then $d$ is efficient for the round-up method*
  - *If $0 < x - m_\text{down} \leq \frac{1}{2}$, then $d$ is efficient for the round-down method*

**Proof**: Suppose $m_\text{up} - x \leq \frac{1}{2}$. This implies $m_\text{up} \leq x + \frac{1}{2}$ and $x \leq m_\text{up}$, so we have
$$ x \leq m_\text{up} \leq x + \frac{1}{2} $$

Substituting $x = \frac{2^{N + \ell}}{d}$, multiplying by $d$, and using $\frac{d}{2} \leq 2^\ell$ gives
$$ 2^{N + \ell} \leq m_\text{up} \cdot d \leq 2^{N + \ell} + \frac{d}{2} \leq 2^{N + \ell} + 2^\ell $$

So the condition of lemma 2 is satisfied and we have $\lfloor \frac{m_\text{up} \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$. Using lemma 8, we see that $m_\text{up}$ can be represented with $N$ bits. We see that $d$ is efficient for the round-up method by definition 7.

Similarly, suppose $0 < x - m_\text{down} \leq \frac{1}{2}$. Then we have $x - \frac{1}{2} \leq m_\text{down}$ and $m_\text{down} < x$. Combining this gives
$$ x - \frac{1}{2} \leq m < x $$

Substituting $x = \frac{2^{N + \ell}}{d}$, multiplying by $d$, and using $\frac{d}{2} \leq 2^\ell$ gives
$$ 2^{N + \ell} - 2^\ell \leq 2^{N + \ell} - \frac{d}{2} \leq m_\text{down} \cdot d < 2^{N + \ell} + \frac{d}{2} $$

So the condition of lemma 5 is satisfied and we have $\lfloor \frac{m_\text{down} \cdot (n + 1)}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$. Using lemma 8, we see that $m_\text{down}$ can be represented with $N$ bits. We see that $d$ is efficient for the round-down method by definition 7.
$\square$

The following result gives a more efficient condition to check if a given divisor is efficient for the round-up method.

**Lemma 11**: *Let $N \in \mathbb{N}_+$, $d \in \mathbb{U}_N$, and define $\ell = \lceil \log_2(d) \rceil - 1$ and $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil$. If $\text{mod}_{2^N}(m_\text{up} \cdot d) \leq 2^\ell$ then $d$ is efficient for the round-up method.*

**Proof**: The product $m_\text{up} \cdot d = \lceil \frac{2^{N + \ell}}{d} \rceil \cdot d$ is the first multiple of $d$ that is equal to or larger than $2^{N + \ell}$. This product will be of the form $2^{N + \ell} + q$ for some $q < d \leq 2^{\ell + 1}$, so we have $\text{mod}_{2^N}(m_\text{up} \cdot d) = q$. So if $\text{mod}_{2^N}(m_\text{up} \cdot d) \leq 2^\ell$, we have $2^{N + \ell} \leq m_\text{up} \cdot d \leq 2^{N + \ell} + 2^\ell$. So the condition of lemma 2 is satisfied and we have $\lfloor \frac{m \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$. By lemma 8 it follows that $m_\text{up} \in \mathbb{U}_N$, so by definition 7 $d$ is efficient for the round-up method.
$\square$

Armed with these results, let's do the examples from before again:

**Example**: We set $\ell = \lfloor \log_2(3) \rfloor = 1$ and compute $m_\text{up} = \lceil \frac{2^9}{3} \rceil = 171$. We have $\text{mod}_{256}(171 \cdot 3) = 1 \leq 2 = 2^\ell$. So $3$ is efficient for the 8-bit round-up method and we have $\lfloor \frac{171 \cdot n}{2^9} \rfloor = \lfloor \frac{n}{3} \rfloor$ for all $n \in \mathbb{U}_8$.

**Example**: We set $\ell = \lfloor \log_2(7) \rfloor = 2$ and compute $m_\text{up} = \lceil \frac{2^{10}}{7} \rceil = 147$. We have $\text{mod}_{256}(147 \cdot 7) = 5 > 4 = 2^\ell$. So $7$ is not efficient for the 8-bit round-up method. According to theorem 9, it must be efficient for the 8-bit round-down method, so we have $\lfloor \frac{147 \cdot (n + 1)}{2^{10}} \rfloor = \lfloor \frac{n}{7} \rfloor$ for all $n \in \mathbb{U}_8$.

As mentioned before, the round-up method is more efficient. For even divisors that are not efficient for the roundup method, there exists a trick. Say $d = 2^p d'$. Then we can put $n' = \lfloor \frac{n}{2^p} \rfloor$ and evaluate $\lfloor \frac{n}{d} \rfloor$ as $\lfloor \frac{n'}{d'} \rfloor$. This has the benefit that $n'$ has at most $N - p$ bits. So $n' \in \mathbb{U}_{N - p}$ and we can use theorem 4 with $N - p$ instead of $N$.

**Lemma 12**: *Let $N \in \mathbb{N}_+$, $d \in \mathbb{U}_N$ with $d > 0$ and $d = 2^p d'$. Let $n' = \frac{n}{2^p}$, $N' = N - p$, $\ell' = \lceil \log_2(d') \rceil$, and $m' = \lfloor \frac{2^{N' + \ell'}}{d'} \rfloor$. Then*
$$\left \lfloor \frac{m' \cdot n'}{2^{N' + \ell}} \right \rfloor = \left \lfloor \frac{n}{d} \right \rfloor$$

*for all $n \in \mathbb{U}_N$.*

**Proof**: Use theorem 4 with $n'$ instead of $n$, $N' = N - p$ instead of $N$, and $d'$ instead of $d$.
$\square$

**Note**: It can be useful to express $\ell'$ in terms of $\ell = \lfloor \log_2(d) \rfloor$, and $m'$ in terms of $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil$. In this case, we get $\ell' = \ell + 1 - p$ and $m' = \lceil \frac{m_\text{up}}{2^{p - 1}} \rceil$.

**Example**: Take $N = 8$, $d = 14$. Setting $\ell = \lfloor \log_2(d) \rfloor = 3$ we get $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil = 147$. We see that $\text{mod}_{256}(14 \cdot 147) = 10 > 8 = 2^\ell$. So $14$ is not efficient for the roundup method. However, it is even, so using lemma 12 with $p = 1$ we get $n' = \lfloor \frac{n}{2} \rfloor$, $m' = m_\text{up}$. We see that $\lfloor \frac{147 \cdot n'}{2^{10}} \rfloor = \lfloor \frac{n}{d} \rfloor$ with $n' = \lfloor \frac{n}{2} \rfloor$ for all $n \in \mathbb{U}_N$.

On some architectures it is faster to shift by fewer bits. So, for the purpose of optimization, we might be interested in finding the smallest $m \in \mathbb{U}_N$ that satisfies the condition

Luckily, if we have found a single $m$ that satisfies the condition of the round-up or the round-down method, it is simple to find out if there is a smaller $m$ that satisfies the same condition.

**Lemma 13**: *Let $N \in \mathbb{N}_+$, $d, m \in \mathbb{U}_N$ with $d > 0$, and let $\ell \in \mathbb{N}_0$ be such that $\ell \leq \lceil \log_2(d) \rceil - 1$. Suppose that the tuple $(\ell, m) \in \mathbb{N}_0 \times \mathbb{U}_N$ satisfies either the condition of lemma 2:*
$$ 2^{N + \ell} \leq m \cdot d \leq 2^{N + \ell} + 2^\ell $$

*or the condition of lemma 5:*
$$ 2^{N + \ell} - 2^\ell \leq m \cdot d < 2^{N + \ell}$$

*If $m$ is even, then the tuple $(\ell', m') = (\ell - 1, \frac{m}{2})$ satisfies the same condition. If $m$ is odd, then there exists no smaller $m$ that satisfies the condition.*

**Proof**: Suppose that $m$ satisfies the condition of lemma 2. In this case, we have $2^{N + \ell} \leq m \cdot d \leq 2^{N + \ell} + 2^\ell$. It is easy to see that when $m$ is even all expressions in the inequality are even, so we can divide by two and see that $2^{N + \ell - 1} \leq \frac{m}{2} \cdot d \leq 2^{N + \ell - 1} + 2^{\ell - 1}$. The case for the condition of lemma 5 is analogous.

Suppose that there is a smaller pair $\ell', m'$ that satisfies the condition $2^{N + \ell'} \leq m' \cdot d \leq 2^{N + \ell'} + 2^{\ell'}$. By multiplying the whole thing by $2^{\ell - \ell'}$, we see that $2^{N + \ell} \leq 2^{\ell - \ell'} \cdot m' \cdot d \leq 2^{N + \ell} + 2^\ell$. The set $\{ 2^{N + \ell}, 2^{N + \ell} + 1, ..., 2^{N + \ell} + 2^\ell \}$ has $2^\ell + 1$ elements. We have $2^\ell + 1 \leq 2^{\lceil \log_2(d) \rceil - 1} + 1 \leq d$, so there can only be one multiple of $d$ in this set, which is $m \cdot d$. So we have $m = 2^{\ell - \ell'} \cdot m'$, so $m$ must be even.
$\square$

Basically, we can set $\ell = \lceil \log_2(d) \rceil$, and see if TODO

once we have found an $m$ that satisfies the condition of lemma 2 or lemma 5, we can keep dividing it by two (and decreasing $\ell$ by one) as long as it is even. Once the result is odd, we have find the smallest $m$ that satisfies the condition.

The following examples illustrate this.

**Example**: Take $N = 8$, $d = 36$. We compute $\ell = \lceil \log_2(d) \rceil - 1= 5$ so $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil = 228$. We see that $\text{mod}_{256}(228 \cdot 36) = 16 \leq 32 = 2^\ell$. So $36$ is efficient for the round-up method and we have $\lfloor \frac{228 \cdot n}{2^{13}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_8$. However, we see that $m_\text{up}$ is even, so we can use lemma 13 and reduce $m_\text{up}$ by dividing it by two and decrementing $\ell$. We get $m_\text{up} = 114$, $\ell = 4$. Now $m_\text{up}$ is still even, so again we divide $m_\text{up}$ by two and decrement $\ell$. We get $m_\text{up} = 57$ and $\ell = 3$. So we have $\lfloor \frac{57 \cdot n}{2^{11}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_8$.

**Example**: Take $N = 8$, $d = 11$. We set $\ell = \lceil \log_2(d) \rceil - 1 = 3$ so that $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil = 187$. Now $\text{mod}_{2^N}(187 \cdot 11) = 7 \leq 2^9$, so $11$ is not efficient for the $N$-bit round-up method. Since 11 is odd, we use the round-down method. Using theorem 9, we see that 11 is efficient for the $N$-bit round-down method. We have $m_\text{down} = 186$. Since $m_\text{down}$ is even, we can use lemma 13. We divide by two to get $m = 93$ and have $\lfloor \frac{93 \cdot n}{2^{10}} \rfloor = \lfloor \frac{n}{11} \rfloor$.

**Example**: Take $N = 32$, $d = 641$. We set $\ell = \lceil \log_2(d) \rceil - 1= 9$ so that $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil = 3430613504$. Now $\text{mod}_{2^N}(3430613504 \cdot 641) = 512 \leq 512 = 2^\ell$, so $641$ is efficient for the round-up method. Now write $3430613504 = 2^9 \cdot 6700417$. Using lemma 12 we see that we have $\lfloor \frac{m_\text{up}' \cdot n}{2^{N + \ell'}} \rfloor = \lfloor \frac{n}{641} \rfloor$ with $\ell' = \ell - 9$ and $m_\text{up}' = \frac{m_\text{up}}{2^9}$ for all $n \in \mathbb{U}_{32}$. So we see that $\lfloor \frac{6700417 \cdot n}{2^{32}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_{32}$. The division by $2^{32}$ can be implemented by taking the upper $32$ bits of the product $6700417 \cdot n$.

**Example**: Take $N = 8$, $d = 28$. Taking $\ell = \lceil \log_2(28) \rceil - 1 = 4$ and $m_\text{up} = \lceil \frac{2^{N + \ell}}{28} \rceil = 147$, we see that $\text{mod}_{2^N}(m_\text{up} \cdot 28) = 20 > 16 = 2^\ell$. So 28 is not efficient for the 8-bit round-up method. Applying lemma 12 gives us that $\lfloor \frac{74 \cdot n'}{2^9} \rfloor = \lfloor \frac{n}{d} \rfloor$ with $n' = \lfloor \frac{n}{4} \rfloor$ for all $n \in \mathbb{U}_8$. We can now apply lemma 13 to see that $\lfloor \frac{37 \cdot n'}{2^8} \rfloor = \lfloor \frac{n}{d} \rfloor$ with $n' = \lfloor \frac{n}{4} \rfloor$ for all $n \in \mathbb{U}_8$. This means that we only have to look at the upper 8 bits, and we need just one shift instruction to compute $n' = \lfloor \frac{n}{4} \rfloor$. So this ends up as efficient as the round-up method, which also needs just one shift and a multiplication.


## Implementation

We distinguish between compile-time optimization and runtime optimization of constant unsigned integers. To illustrate, the divisor `d` in the following code is a compile-time constant:
```
const unsigned int d = 61;

for (int i = 0; i < size; i++) {
	quotient[i] = dividend[i] / d;
}
```

The divisor `d` in the following code is a runtime constant:
```
unsigned int d = read_divisor();

for (int i = 0; i < size; i++) {
	quotient[i] = dividend[i] / d;
}
```

In case of a runtime constant divisor, most compilers will not optimize the division. However, we can do it ourselves, by doing something like:
```
unsigned int d = read_divisor();
divdata_t divisor_data = precompute(divisor);

for (int i = 0; i < size; i++) {
	quotient[i] = fast_divide(dividend[i], divisor_data);
}
```

In this section, we will discuss both how a compiler can generated optimized code and how to efficiently implement the `precompute` and `fast_divide` functions for runtime constant divisors. The [libdivide](https://libdivide.com/) library, which was started by the author of [3] and [4], is a mature implementation that can optimize division by runtime constant integers. The library is conveniently included in a single header file, contains a nice C++ interface, and also implements vector implementations of integer division, which can make division even faster.

During compilation, there is a lot of room for optimizations. Typically, programmers are OK with waiting a fraction of a second longer for their programs to compile if this means that their code executes faster. So for division by compile-time constants, there is time for extensive optimizations and it pays of to distinguish many special cases in which small improvements are possible. At runtime, time is more precious, so we want to keep the precomputation reasonably efficient. We'd like the `fast_divide` function to have a single codepath for all divisors, to keep it efficient.


### Runtime optimization

Let's take the example from before as a starting point. I will assume that we have a constant `N` which denotes the number of bits in the unsigned integer datatype `uint`. I'll also assume the existence of `big_uint`, an unsigned integer datatype with $2N$ bits. Using these datatypes, the example from before becomes:
```
uint divisor = get_number_from_user();
divdata_t divisor_data = precompute(divisor);

for (int i = 0; i < size; i++) {
	quotient[i] = fast_divide(dividend[i], divisor_data);
}
```

Both the round-up and the round-down method can be implemented using an expression of the form `(n * m + add) >> (N + shift)` to compute $\lfloor \frac{n}{d} \rfloor$, so it is natural to define the struct `divdata_t` with these fields:
```
typedef struct {
	uint mul, add, shift;
} divdata_t;
```

The `fast_divide` function is now straightforward to write:
```
uint fast_divide(uint n, divdata_t dd) {
	big_uint full_product = ((big_uint)n) * dd.mul + dd.add;
	return (full_product >> N) >> dd.shift;
}
```

Let's continue with the implementation of the `precompute` function. First, we define a variable `divdata` to hold the result. I'll save you the trouble and note that the case $d = 1$ needs to be handled separately. If we work out this case by hand we see that when we set $\ell = \lceil \log_2(1) \rceil - 1$ we get $m = 2^{N - 1}$ and $\frac{m \cdot n}{2^{N - 1}} = n$. While this is mathematically correct, we can't use the `fast_divide` function to evaluate this expression, because it divides by $2^{N - 1}$ while the `fast_divide` function implements this as a right shift by $N$, followed by another right shift. This last right shift would have to be a right shift by negative one. Technically, you could say that this is a right shift by one, but most architectures don't work this way and even if it would, we would lose a bit that has been shifted out by the first shift.

Luckily, we can use a trick. If we set both `divdata.mul` and `divdata.add` to $2^N - 1$, things will work out since
$$ n \cdot 2^N \leq n \cdot (2^N - 1) + 2^N - 1 < (n + 1) \cdot 2^N $$

So let's write a skeleton for the `precompute` function. For now, it only handles the case $d = 1$:
```
divdata_t precompute(uint d) {
	divdata_t divdata;
	
	// d = 1 is a special case
	if (d == 1) {
		divdata.mul = max;
		divdata.add = max;
		divdata.shift = 0;
		return divdata;
	}
	
	// normal path
	...
	
	return divdata;
}
```

For the normal path (that is, all the cases except $d = 1$) we can use the test from lemma 11:
```
// normal path
uint l = ceil_log2(d) - 1;
uint m_down = (((big_uint)1) << (N + l)) / d;
uint m_up = (is_power_of_two(d)) ? m_down : m_down + 1;
uint temp = m_up * d;
bool use_round_up_method = temp <= (1 << l);

// set fields of divdata
...
```

Note that the `temp` variable is an $N$-bit unsigned integer. It is just used to compute $m_\text{up} \cdot d$ modulo $2^N$. Also note that we need a special case for the computation of $m_\text{up}$ for when $d$ is a power of two for rounding.

Setting the `mul`, `add`, and `shift` fields of `divdata` is straightforward. For the round-up method we evaluate the expression $m \cdot n$, so we need to multiply by $m_\text{up}$ and don't need to add anything. For the round-down method we evaluate the expression $m_\text{down} \cdot (n + 1)$ as $m_\text{down} \cdot n + m_\text{down}$, so need to multiply by $m_\text{down}$ and add $m_\text{down}$.
```
// set fields of divdata
if (use_round_up_method) {
	divdata.mul = m_up;
	divdata.add = 0;
}
else {
	divdata.mul = m_down;
	divdata.add = m_down;
}

divdata.shift = l;
```

When you stitch the snippets together and include `bits.h` from the appendix you should get a working implementation of `precompute`. However, we can make it a bit more efficient. Note that we have a special case for $d = 1$ and also special cases for when $d$ is a power of two. The trick we used for $d = 1$ actually can be generalized to handle all powers of two. 

We can set `mul = max` and `add = max` so that the high word contains the dividend. Then we only need need to shift the high word right by $\log_2(d)$ bits. Now, we can also compute $\ell = \lfloor \log_2(d) \rfloor$ instead of $\lceil \log_2(d) \rceil - 1$ (which is slightly more efficient), since there is only a difference for powers of two.
```
divdata_t precompute(uint d) {
	divdata_t divdata;
	uint l = floor_log2(d);
	
	if (is_power_of_two(d)) {
		divdata.mul = max;
		divdata.add = max;
	}
	else {
		uint m_down = (((big_uint)1) << (N + l)) / d;
		uint m_up = m_down + 1;
		uint temp = m_up * d;
		bool use_round_up_method = temp <= (1 << l);
		
		if (use_round_up_method) {
			divdata.mul = m_up;
			divdata.add = 0;
		}
		else {
			divdata.mul = m_down;
			divdata.add = m_down;
		}
	}

	divdata.shift = l;
	return divdata;
}
```

There are probably lots of optimizations possible, but this is a reasonably simple and efficient version. It is adapted from [2].


### Compile-time optimization

Here, I will show a sample implementation of the idea. I use a hacked-together framework which is meant to resemble the part of a compiler backend that does code generation. The `uint` datatype is an $N$-bit unsigned integer, where $N$ is 8, 16, or 32. The datatype `expression_t` is used to denote an expression tree, which can be used for code generation. This is all implemented in `compiler.h`, which is included in the appendix. For simplicity, I have not implemented register allocation -- every expression is stored from and to `r0`. This means that only really simple expressions can be used, but this turns out to be enough for our purpose.

We will implement a function `div_by_const_uint` that takes a constant divisor `const uint d` and an expression `expression_t n` that represents the dividend. It will return an expression that represents the instructions that will be executed. As an example, the expression $a \cdot (b + 5)$ can be written as `mul(a, add(b, constant(5))` in this way.

I will use `constant(n)` where `n` is an `uint` to denote a constant, `shr(a, b)` to denote a right shift of `a` by `b` bits, `umulhi(a, b)` to denote the high $N$ bits of a multiplication, `add(a, b)` to denote the sum of `a` and `b`, `sbb(a, b)` to denote a subtraction with a borrow if the carry bit is set, and `gte(a, b)` which returns 1 if `a` is greater than or equal to `b` and 0 if `a` is less than `b`. Here, `a` and `b` can be expressions themselves. All nodes in an expression correspond directly to an instruction.

The parameters to a function are passed in `r0`, `r1`, etc. So a function `evaluate` that has a single parameter `a` and returns $3a + 5$ can be implemented by the expression tree `add(mul(a, 3), 5)`. This will generate the following instructions:
```
evaluate:
	mul r0, r0, 3
	add r0, r0, 5
	ret
```

Admittedly, I picked the instructions and calling conventions to be convenient for my use case. In practice, the assembly emitted by the compiler is typically a bit longer. Still, for most cases the instructions are similar to those that compilers emit. You can see the instructions that clang 11.0 outputs for some divisors on [godbolt.org](https://godbolt.org/z/bKq7Wa). Note that clang 11.0 still produces suboptimal instructions for the case of an odd divisor that is not efficient for the round-up method, because it uses the method mentioned after theorem 4. Benchmarks from [4] show that using the round-down method is faster.

As mentioned before, for compile-time optimization we can distinguish a lot of cases to squeeze out every last bit of performance. Some special cases that can be implemented particularly efficient are:
  - Division by one, which can be handled by setting the quotient equal to the dividend.
  - Division by a power of two, which can be implement by a bit shift.
  - Division by an integer larger than half of the maximum value of the dividend, which can be implemented by setting the quotient to zero if it is smaller than the divisor, and to one otherwise.

For divisors that do not fall in one of these special cases, we use fixed-point arithmetic to efficiently implement the division. 

```
expression_t div_by_const_uint(const uint d, expression_t n) {
	if (d == 1) return n;
	if (is_power_of_two(d)) return shr(n, constant(floor_log2(d)));
	if (d > MAX / 2) return gte(n, constant(d));
	return div_fixpoint(d, n);
}
```

We first test if the divisor is efficient for the $N$-bit round-up method. For divisors that are efficient for the $N$-bit round-up method, we use the round-up method. For even divisors that are not efficient for the round-up method, we use a modified version of the round-up method. Finally, for odd divisors that are not efficient for the round-up method, we use the round-down method, which is slightly less efficient.
```
expression_t div_fixpoint(uint d, expression_t n) {
	// test if d is efficient for round-up method
	...
	
	if (use_round_up_method) {
		// round-up method
		...
	}
	
	if ((d & 1) == 0) {
		// even divisors which are not efficient for round-up method
		// handled by doing a preshift and using round-up method
		...
	}
	
	// round-down method
	...
}
```

To test if a divisor is efficient for the round-up method we simply implement the condition from lemma 11:
```
// test if d is efficient for round-up method

uint l = floor_log2(d);
uint m_down = (((big_uint)1) << (N + l)) / d;
uint m_up = m_down + 1;
uint product_mod_2N = m_up * d;
bool use_round_up_method = product_mod_2N <= (1 << l);
```

The round-up method is pretty straightforward to implement. For efficiency, we reduce $m$ and $\ell$ using lemma 13.
```
// round-up method

// find smallest m
while ((m_up & 1) == 0 && l > 0) {
	m_up >>= 1;
	l--;
}
return shr(umulhi(n, constant(m_up)), constant(l));
```


For even divisors which are not efficient for the round-up method, we can use lemma 12. First, we compute $n'$ from $n$ by a right shift. The `preshift` variable holds the number of bits of this first shift. Then, we multiply $n'$ by $m_\text{up}'$, and shift the result by `postshift`. You should convince yourself that the following implementation computes `preshift` and `postshift` in accordance to lemma 12. In particular, note that this implementation can increment `preshift` too often, so that `postshift` becomes negative, and that a separate correction step for this is needed.

```
// even divisors which are not efficient for round-up method
// handled by doing a preshift and using round-up method

// pre-shift as much as possible; postshift might
// become negative, this is corrected later
d >>= 1;
int preshift = 1, postshift = l - 1;
while ((d & 1) == 0 && postshift > 0) {
	d >>= 1;
	preshift++;
	postshift -= 2;
	m_up = (m_up + 1) >> 1;
}

// optimize m
while ((m_up & 1) == 0 && postshift > 0) {
	m_up >>= 1;
	postshift--;
}

// correct if preshift is too large and
// postshift has become negative
if (postshift < 0) {
	m_up = m_up << 1;
	postshift++;
}

expression_t n_prime = shr(n, constant(preshift));
return shr(umulhi(n_prime, constant(m_up)), constant(postshift));
```

There is a subtle point we have to take into consideration when implementing the round-down method. When we naively implement the evaluation of the expression $\lfloor \frac{m_\text{down} \cdot (n + 1)}{2^{N + \ell}} \rfloor$, we would increment $n$. However, when $n$ has the maximum value of $2^N - 1$, the expression $n + 1$ will overflow. We can overcome this in a couple of different ways.

The first way is to use that $m_\text{down} \cdot (n + 1) = m_\text{down} \cdot n + m_\text{down}$. This latter expression has $2N$ bits when $n$ and $m_\text{down}$ have $N$ bits. Some architectures have integer fused multiply-add instructions which directly compute $a \cdot b + c$. For example, in [2], the `XMA.HU` instruction on Itanium is used, which computes the $N$ high bits of $a \cdot b + c$. Other architectures may have support for doing $2N$-bit arithmetic. For example, this is the case when doing a division by a 32-bit integer on a 64-bit machine.

An alternative is to use a combination of the following two instructions, which are supported by most processors:
  1. An instruction to add two values and set a carry flag if the sum has overflown
  2. An instruction to add with carry, which adds two values and increases the result by one if the carry flag is set

Suppose we have an instruction set with an `add` instruction which sets the carry flag on overflow, and an `adc` instruction which adds with carry. Adding a constant, say `12345` to a $2N$-bit value contained in registers `r0` (low $N$ bits) and `r1` (high $N$ bits) is as easy as:
```
add r0, r0, 12345
adc r1, r1, 0
```

In [4], it is suggested to do a *saturating increment* of $n$ instead of naively calculating $n + 1$. This is the same as only incrementing $n$ when $n < 2^N - 1$. So effectively, this calculates the expression
$$ \lfloor \frac{m_\text{down} \cdot \max(n + 1, 2^N - 1)}{2^{N + \ell}} \rfloor $$

When $n = 2^N - 1$ we do not increment and we are effectively computing $\lfloor \frac{2^N - 2}{d} \rfloor$ instead of $\lfloor \frac{2^N - 1}{d} \rfloor$. The only way that this difference can matter is when $\frac{2^N - 2}{d} = \lfloor \frac{2^N - 2}{d} \rfloor + \frac{d - 1}{d}$, so that $\frac{2^N - 1}{d} = \frac{2^N - 2}{d} + \frac{1}{d} = \lfloor \frac{2^N - 2}{d} \rfloor + 1$. In this case $d$ is a divisor of $2^N  - 1$, and according to the following result a divisor of $2^N - 1$ is efficient for the $N$-bit round-up method. So as long as we only use the round-down method for divisors which are not efficient for the round-up method, we will never get an incorrect result when we use a saturating increment.

**Lemma 14**: *Let $d \in \mathbb{U}_N$ with $d > 0$. Then*
  - *If $\text{mod}_d(-2^{N + \ell}) \leq 2^\ell$, then $\lfloor \frac{m_\text{up} \cdot d}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ with $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil$ for all $n \in \mathbb{U}_N$.*
  - *If $0 < \text{mod}_d(2^{N + \ell}) \leq 2^\ell$, then $\lfloor \frac{m_\text{down} \cdot (n + 1)}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ with $m_\text{down} = \lfloor \frac{2^{N + \ell}}{d} \rfloor$ for all $n \in \mathbb{U}_N$.*

**Proof**: The expression $m_\text{up} \cdot d = \lceil \frac{2^{N + \ell}}{d} \rceil \cdot d$ is just $2^{N + \ell}$ rounded up to the nearest multiple of $d$, so we have $2^{N + \ell} \leq m_\text{up} \cdot d$. Now, we write $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil = \frac{2^{N + \ell} + \text{mod}_d(-2^{N + \ell})}{d}$. Substituting this in $m_\text{up} \cdot d$ gives
$$ m_\text{up} \cdot d = \left( \frac{2^{N + \ell} + \text{mod}_d(-2^{N + \ell})}{d} \right) \cdot d = 2^{N + \ell} + \text{mod}_d(-2^{N + \ell}) $$

So the condition of lemma 2 is satisfied if and only if $\text{mod}_d(-2^{N + \ell}) \leq 2^\ell$.

Likewise, we have $m_\text{down} = \lfloor \frac{2^{N + \ell}}{d} \rfloor = \frac{2^{N + \ell} - \text{mod}_d(2^{N + \ell})}{d}$ and by substituting this in the condition of lemma 5 we see that the condition if satisfied if and only if $0 < \text{mod}_d(2^{N + \ell}) \leq 2^\ell$.
$\square$

**Exercise**: *Follow the more direct approach taken in [3] and [4] to prove lemma 14. Use $m_\text{up} = \frac{2^{N + \ell} + \text{mod}_d(-2^{N + \ell})}{d}$, $m_\text{down} = \lfloor \frac{2^{N + \ell}}{d} \rfloor = \frac{2^{N + \ell} - \text{mod}_d(2^{N + \ell})}{d}$, and lemma 1.*

**Lemma 15**: *If $d$ is a divisor of $2^N - 1$, then $d$ is efficient for the $N$-bit round-up method.*

**Proof**: Take $\ell = \lfloor \log_2(d) \rfloor$ and define $e = \text{mod}_d(-2^{N + \ell})$ and $e' = \text{mod}_d(2^{N + \ell})$. Using $\text{mod}_d(2^N) = 1$ and $2^{\lfloor \log_2(d) \rfloor} < d$, we see:
$$ e' = \text{mod}_d(2^{N + \ell}) = \text{mod}_d(2^N \cdot 2^{\lfloor \log_2(d) \rfloor}) = \text{mod}_d(2^{\lfloor \log_2(d) \rfloor}) = 2^{\lfloor \log_2(d) \rfloor} $$

Here, we used that $2^{\lfloor \log_2(d) \rfloor} < d$. Since $d$ is a divisor of $2^N - 1$, it can't be a power of two, so we have $e, e' \in \{ 1, 2, ..., d - 1 \}$. It follows that $e + e' = d$ since $e + e' \equiv 0 \mod d$. We find that
$$ e = d - e' \leq 2^{\lceil \log_2(d) \rceil} - 2^{\lfloor \log_2(d) \rfloor} = 2^{\lfloor \log_2(d) \rfloor} = 2^\ell $$

So the condition $e = \text{mod}_d(2^{N + \ell}) \leq 2^\ell$ of lemma 14 is satisfied. It follows that that when $m_\text{up} = \lceil \frac{2^{N + \ell}}{d} \rceil$ we have $\lfloor \frac{m_\text{up} \cdot d}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$.

Since $d$ is a divisor of $2^N - 1$, it can not be a power of two. So $\ell = \lfloor \log_2(d) \rfloor$ is not an integer, which implies $\ell = \lfloor \log_2(d) \rfloor = \lceil \log_2(d) \rceil - 1$. From lemma 8, it follows that $m_\text{up} \in \mathbb{U}_N$. So we have $\lfloor \frac{m_\text{up} \cdot n}{2^{N + \ell}} \rfloor = \lfloor \frac{n}{d} \rfloor$ for all $n \in \mathbb{U}_N$ for some $m_\text{up} \in \mathbb{U}_N$. It follows by definition 7 that $d$ is efficient for the $N$-bit roundup method.
$\square$

A saturating increment can be implemented as an increment by one, followed by a subtraction with borrow. A subtraction with borrow works similar to an addition with carry: it subtracts a value from another, and decrements the result when the carry flag is set. I have used the `sbb` instruction to denote a subtraction with borrow. In the following code, `n_inc` is the result of applying a saturating increment on `n`:

```
// round-down method

// find smallest m
while ((m_down & 1) == 0 && l > 0) {
	m_down >>= 1;
	l--;
}
expression_t n_inc = sbb(add(n, constant(1)), constant(0));
expression_t hiword = umulhi(n_inc, constant(m_down));
return shr(hiword, constant(l));
```


### Testing

When writing code for $N = 8$ or $N = 16$, I recommend that you check the result is correct for every pair $n, d \in \mathbb{U}_N$ with $d > 0$. This can be as simple as:
```
for (uint d = 1; true; d++) {
	divdata_t dd = precompute(d);
	for (uint n = 0; true; n++) {
		assert(fast_divide(n, dd) == n / d);
		if (n == UINT_MAX) break;
	}
	if (d == UINT_MAX) break;
}
```
For $N = 8$, this code will run more or less instantly, for $N = 16$ it will take a couple of minutes. For $N = 32$ this program will take far too long to run. However, what you can you is test, for every divisor $d \in \mathbb{U}_N$ with $d > 0$, all numbers of the form $n \cdot d, n \cdot d - 1 \in \mathbb{U}_N$:
```
for (uint d = 1; true; d++) {
	divdata_t dd = precompute(d);
	
	assert(fast_divide(0, dd) == 0);
	assert(fast_divide(1, dd) == 1 / d);
	assert(fast_divide(UINT_MAX, dd) == UINT_MAX / d);
	
	uint bound = UINT_MAX / d;
	for (uint k = 1, n = d; true; k++) {
		assert(fast_divide(n, dd) == k);
		assert(fast_divide(n - 1, dd) == k - 1);
		if (k == bound) break;
		n += d;
	}
	
	if (d == UINT_MAX) break;
}
```

This will still take a long time, but it is feasible; The above code took slightly over 40 minutes to run on my machine.

For $N = 64$, exhaustive testing is completely infeasible. I recommend making a set $S$ of special values containing at least all numbers from 0 up to 256, all numbers of the form $2^k - 1$, $2^k$, $2^k + 1$, the divisors of these numbers, and the divisors of $2^{64} + 1$. Then we can test if the result is correct for each $n \in S$, $d \in S \setminus \{ 0 \}$. On top of that, you can run some randomized testing. I recommend that you pick $n$ and $d$ uniformly random in $\mathbb{U}_{64}$ and then mask out each byte with some probability. Then, you can run random tests for some time. If you find a bug in the implementations, add $n$ and $d$ for which the result is not correct to $S$ and verify that your test set triggers the bug before you fix it.


## References and further reading

The classic reference for optimization of division by both signed and unsigned integers is [1], which states and proves theorem 3 (round-up method). In [2], the approach is extended to the round-down method. The resources [3] and [4] are by far the easiest to read, and cover essentially everything in this article in a more accessible way. They sacrifice some rigor and completeness, though. If you are interested in optimizing division, I recommend reading these articles as your starting point. Finally, in [5] it is shown that we can also use fixed point math to compute the modulo operation.

[1] [Division by Invariant Integers using Multiplication](https://gmplib.org/~tege/divcnst-pldi94.pdf), Torbjörn Granlund and Peter L. Montgomery, 1994.

[2] [N-Bit Unsigned Divison Via N-Bit Multiply-Add](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.512.2627&rep=rep1&type=pdf), Arch D. Robinson, 2005.

[3] [Labor of Divison (Episode I)](https://ridiculousfish.com/blog/posts/labor-of-division-episode-i.html), fish, 2010.

[4] [Labor of Divison (Episode III): Fast Unsigned Division by Constants](https://ridiculousfish.com/blog/posts/labor-of-division-episode-iii.html), fish, 2011.

[5] [Faster Remainder by Direct Computation: Applications to Compilers and Software Libraries](https://arxiv.org/pdf/1902.01961), Daniel Lemire, Owen Kaser, Nathan Kurz, 2019.
