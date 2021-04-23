# Newton’s method

Newton’s method, sometimes called the Newton-Rhapson method, is a surprisingly simple and effective method for finding solutions to an equation of the form:
$$f(x) = 0$$

where $f$ is a differentiable function

Newton’s method is an iterative method, which means that we pick some starting point $x_0$, and we follow some procedure to find $x_1$, which is closer to the real root $x_r$ that satisfies $f(x_r) = 0$. Then, we apply this method again and again, until we find some $x_n \approx x_r$ that approximates the real root $x_r$ with satisfactory accuracy.

I will illustrate the method on a function real-valued function $f : \mathbb{R} \rightarrow \mathbb{R}$. First, we pick a starting point $x_0$. We then compute the linearized approximation to $f$ at this point (this is just the first-order Taylor expansion at $x_0$):
$$ f_{\text{approx}}(x_0 + \Delta x) = f(x_0) + \Delta x \cdot f'(x_0) $$
Now, we find the root of this approximation $f_{\text{approx}}$ by solving for $\Delta x$ in
$$ f(x_0) + \Delta x \cdot f'(x_0) = 0$$

and we find $\Delta x = -\frac{f(x_0)}{f'(x_0)}$. So $f_{\text{approx}}(x) = 0$ implies $x = x_0 + \Delta x = x - \frac{f(x_0}{f'(x_0)}$. So, we have a new, supposedly better, approximation of the real root $x_r$. Applying this iteratively gives:
$$x_{k + 1} = x_k - \frac{f(x_k)}{f'(x_k)}$$

which is the basic scheme behind Newton’s method.

We haven’t proved anything about the convergence of this method, and indeed, in general, the method might diverge. Note that it’s also possible to use an approximation $f_{\text{approx}}$ of higher order, e.g.
$$f_{\text{approx}}(x) = f(x_0) + f'(x_0) (x - x_0) + \frac{f''(x_0)}{2} (x - x_0)^2$$

However, using this method requires solving a more complicated solution. Instead of a simple linear equation we end up with a quadratic one.

Further, this method also works for multi-valued functions $f$, with the restriction that $f$ should be an $\mathbb{R}^n \rightarrow \mathbb{R}^n$ function. We can simply replace the factor $\frac{1}{f'(x_0)}$ by $(D f(x_0))^{-1}$:
$$x_{k + 1} = x_k - (Df(x_0))^{-1}f(x_k)$$


## Convergence analysis

I will only consider the case where $f : \mathbb{R} \rightarrow \mathbb{R}$. I believe the general case where $f : \mathbb{R}^n \rightarrow \mathbb{R}^n$ is messier, but the idea is essentially the same.

Take $x$ to be the root of $f$, e.g. $f(x) = 0$. Suppose that we have an estimate $x_k = x + \epsilon$. We then have
$$x_{k + 1} = x_k - \frac{f(x_k)}{f'(x_k)}\\=x + \epsilon - \frac{f(x + \epsilon)}{f'(x + \epsilon)}$$

Using the Taylor expansion of $f$ at $x$, $f(x) = 0$, and asymptotic notation gives:
$$f(x + \epsilon) = \epsilon f'(x) + \epsilon^2 \frac{f''(x)}{2} + O(\epsilon^3)$$

From the first-order Taylor expansion of $f'$ at $x$ we find
$$ f'(x + \epsilon) = f'(x) + O(\epsilon) $$

From the above two equalities we find
$$x_{k + 1} = x + \epsilon - \frac{\epsilon f'(x) + O(\epsilon^2)}{f'(x) + O(\epsilon)}$$

$$= x + \frac{O(\epsilon^2)}{f'(x) + O(\epsilon)}$$

$$= x + O(\epsilon^2)$$

So, if $\epsilon$ is sufficiently small, each iteration of Newton’s method reduces the error to the square of the error of the previous iteration. We say that Newton’s method has *quadratic convergence*.

In practice, this is also observed:

| $k$ | $x_k$ | $\epsilon_k$  |
|--|--|--|
| 0 | 1 | 0.414213562373095 |
| 1 | 1.5 | 0.085786437626905 |
| 2 | 1.416666666666667 | 0.002453104293572 |
| 3 | 1.414215686274510 | 0.000002123901415 |
| 4 | 1.414213562374690 | 0.000000000001595 |

The number of leading zeros in the error roughly doubles each iteration, leading to 11 correct decimal digits after just four iterations.

## Picking initial values

One problem with Newton’s method is that it’s sensitive to the initial value. Sometimes it’s possible to make an educated guess, but often not. If this is a problem, one might consider using a *homotopy method*. This description is based on the description given in the book "Numerical Methods in Scientific Computing", by J. van Kan, A. Segal, and F. Vermolen. In this method, one picks an equation $g(x) = 0$ with a known solution $x = x_g$, and considers the problem
$$ (1 - \lambda) g(x) + \lambda f(x) = 0$$

And now one increases $\lambda$ in small steps. Every time, Newton’s method is used to find the solution of $(1 - \lambda) g(x) + \lambda f(x) = 0$. The solution found this way is then used as an initial estimate for the next step.
