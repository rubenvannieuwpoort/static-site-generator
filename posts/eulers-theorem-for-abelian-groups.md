# Euler’s theorem for abelian groups

For *abelian groups*, that is, groups where addition is *commutative*, that is, $g_1 g_2 = g_2 g_1$ for any pair $g_1, g_2 \in G$, we have the following theorem due to Euler:

**Theorem**: Let $G$ be an abelian group with $n$ elements. Then
$$ g^n = e$$
for any $g \in G$.

**Proof**: Label the $n$ distinct elements of $G$ as $x_1, x_2, ... x_n$. Since multiplication by any element $g \in G$ is invertible, we have $gx_1 \not= gx_2$ whenever $x_1 \not= x_2$. So the set $gG = \{ gx_1, gx_2, ..., gx_n \}$ contains the same elements as $G$. So the products $\prod_{k = 1}^n x_k$ and $\prod_{k = 1}^n g x_k$ must be the same as well. Moreover, the same product can be written as $g^n \prod_{k=1}^n x_k$. So we have
$$\prod_{k = 1}^n x_k = \prod_{k = 1}^n gx_k = g^n \prod_{k = 1}^n x_k$$

It follows that $g^n = e$.
$\square$

As a corollary, we can now easily prove *Fermat’s little theorem*, which is often used in number theory:

**Corollary**: Let $p$ be a prime, and $n$ be a nonzero integer. For any $n$ that does not divide
$$ n^{p - 1} \equiv 1 \pmod{p}$$

**Proof**: The integers $1, 2, ..., p - 1$ form a commutative group of order $p - 1$ under multiplication modulo $p$.
$square$
