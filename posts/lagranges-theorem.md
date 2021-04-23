# Lagrange’s theorem

Lagrange’s theorem is a useful theorem in group and number theory. I will state and prove Lagrange’s theorem, and use it to prove Euler’s theorem.

**Lagrange’s theorem**: *Suppose that $G$ is a group with a subgroup $S$. Then the order of $S$ divides the order of $G$.*

**Proof**: Label the elements in $S$ as $s_1, s_2, ..., s_n$, with $s_{k_1} =\not s_{k_2}$ whenever $k_1 =\not k_2$. Now consider the set $\{ a s_1, a s_2, ..., a s_n \}$ that is obtained by left-multiplying all the elements in $S$ by some element $a \in G$. Note that this set, which I’ll denote as $aS$, is not necessarily a group since it will not contain the identity element $e$ in case $g^{-1} \in \not S$. I now claim that
1. For every $a \in G$, $aS$ contains the same number of elements as $S$
2. For every $a, b \in G$, where have either $aS = bS$ or $aS \cap bS = \emptyset$

The first claim is easy to see, since $s_{k_1} =\not s_{k_2}$ implies $a s_{k_1} =\not a s_{k_2}$. For the second claim, suppose that $a s_{k_1} = b s_{k_2}$ with $k_1 =\not k_2$. It follows that $a^{-1} b = s_{k_1} s_{k_2}^{-1}$. Since $s_{k_1} s_{k_2}^{-1} \in S$, this is impossible if $a^{-1} b \in\not S$, so in this case we have $aS \cap bS = \emptyset$. Otherwise, we have $a s_{k_1} s_{k_2}^{-1} = b$. It follows that $a S = a (s_{k_1} s_{k_2}^{-1} S) = (a s_{k_1} s_{k_2}^{-1}) S= b S$. Note that $s_{k_1} s_{k_2}^{-1} S = S$, since $s_{k_1}, s_{k_2}^{-1} \in S$, and multiplication of a group by an element in the group just permutes the elements.

We can conclude that we can divide $G$ in a number of sets with no overlap, all with $n$ number of elements. So $n$ must divide the order in $G$. $\square$

As a corollary, we can now easily prove Euler’s theorem.

**Euler’s theorem**: *Suppose that $g$ is an element of the group $G$, which has order $n$. Then
$$g^{n} = e$$
where $e$ is the identity element.*

**Proof**: Consider the sequence $e, g, g^2, ...$. Suppose that $g^m$ is the first element that occurs earlier in the sequence. Suppose that $g^m = g^{m'}$ for some $m' < m$. Then $g^{m - m'} = e$. If $m' > 0$ this is a contradiction, since in this case $m - m' < m$, but $g^{m - m'} = e$ occurs earlier in the sequence. So it follows that $m' = 0$ and $g^m = e$. Now $\{ e, g, g^2, ..., g^{m - 1} \}$ is a subgroup of $G$ with order $m$. By Lagrange’s theorem, we have that $m$ is a divisor of $n$, so $\frac{n}{m}$ is a positive integer number. Now we have
$$g^{n} = (g^m)^{\frac{n}{m}} = e^{\frac{n}{m}} = e$$

$\square$
