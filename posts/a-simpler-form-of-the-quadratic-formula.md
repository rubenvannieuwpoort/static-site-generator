# A simpler form of the quadratic formula

In high school, I had to learn the famous quadratic formula by heart. It states that a quadratic polynomial $p$ defined as
$$p(x) = ax^2 + bx +c$$
has roots $x_{1, 2}$ of the form
$$x_{1, 2} = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

I think remembering formulae is a prime example of how math should not be taught. I think the proper way to solve quadratic equations is to [complete the square](https://en.wikipedia.org/wiki/Completing_the_square):

First, rewrite the equation to the form
$$x^2 + bx + c = 0$$

We can rewrite this as
$$ (x - \frac{b}{2})^2 - (\frac{b}{2})^2 + c = 0$$

From there, it is easy to take it to
$$(x - \frac{b}{2})^2 = (\frac{b}{2})^2 - c $$

and solve the resulting equation, remembering that $x^2 = c$ has **two** solutions: $x = \sqrt{c}$ and $x = -\sqrt{c}$:

$$x - \frac{b}{2} = \pm \sqrt{(\frac{b}{2})^2 - c}$$

So $x_{1, 2} = \frac{b}{2} \pm \sqrt{(\frac{b}{2})^2 - c}$.

If you, for some reason, insist on learning a formula (for example, because it is easier or faster to apply), there is an alternative that I find to be preferable to the classical quadratic formula. By setting $a = -\frac{q}{2p}$ and $b = -\frac{r}{p}$, any quadratic equation of the form $px^2 + qx + r = 0$ can be reduced to the form
$$ x^2 = 2ax + b $$

which has the solution
$$ x_{1, 2} = a \pm \sqrt{a^2 + b} $$

and is far more elegant, in my opinion.

In conclusion, I think it’s preferable to *not* teach the quadratic formula in high school, and instead teach how to complete the square. Not only does this relieve you of the burden of remembering a formula, it is also much more instructive and opens doors to more elaborate algebraic manipulation.
