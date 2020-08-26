# The normal equation

A linear system is a system of the form
$$ \begin{matrix} a_{1, 1} x_1 & + & a_{1, 2} x_2 & + & ... & + & a_{1, n} x_n & = & y_1 \\ a_{2, 1} x_1 & + & a_{2, 2} x_2 & + & ... & + & a_{2, n} x_n & = & y_2 \\ \vdots &  & & &\ddots & & & & \vdots \\ a_{m, 1} x_1 & + & a_{m, 2}x_2 & + & ... & + & a_{m, n} x_n & = & y_m \end{matrix} $$
where there are $n$ *unknowns* $x_1, ..., x_n$. The $m$ values $y_1, y_2, ..., y_m$ are given, just like the $mn$ coefficients $a_{1, 1}, a_{1, 2}, ..., a_{1, n}, a_{2, 1}, a_{2, 2}, ..., a_{m, n}$. Such linear systems are often written in matrix form as
$$ A \textbf{x} = \textbf{y} $$

where $A \in \mathbb{R}^{n \times m}$ is an $n \times m$ matrix, $\textbf{x} = (x_1, x_2, ..., x_n)^\top \in \mathbb{R}^n$ is a column vector of size $n$, and $\textbf{y} = (y_1, y_2, ..., y_m)^\top \in \mathbb{R}^m$ is a column vector of size $m$.

Solving such a linear system is a well-known and studied problem, and many different algorithms exist for solving these kind of linear systems. A particularly famous result is that this kind of system has exactly one solution when the matrix $M$ is square (i.e. $m = n$), and the determinant of the matrix $M$ is nonzero.

I want to focus on the case where there are more equations than unknowns. In terms of the matrix formula above, this means that $m > n$. In this case, we can’t always ensure that there exists an $x \in \mathbb{R}^n$ such that $A \textbf{x} = \textbf{y}$.

However, we can still find an $x \in \mathbb{R}^n$ so that $Ax$ approximates $y$. In this case, we have $Ax \approx y$, or, equivalently $Ax - y \approx 0$. Often, we want to minimize the distance with respect to some norm. Here, we take the 2-norm $||\cdot||_2$, which is defined as
$$ || \textbf{x} ||_2 := \sum_{k = 1}^n x_k^2 $$

That is, we look for $\textbf{x}$ that minimizes the 2-norm of $A\textbf{x} - \textbf{y}$:
$$ || A \textbf{x} - \textbf{y} ||_2 = \min_{\textbf{x*} \in \mathbb{R}^n} || A \textbf{x} - \textbf{y} ||_2 $$

The 2-norm is convenient because its square can be written in terms of an inner product:
$$ ||A \textbf{x} - \textbf{y}||^2_2 = (A \textbf{x} - \textbf{y}) \cdot (A \textbf{x} - \textbf{y}) $$

We can use analytic methods to minimize the square of the 2-norm (which is equivalent to minimizing the 2-norm itself). For a function of a single variable, we would set the derivative to 0. For a multivariate function, we take the gradient, denoted by $\nabla_{\textbf{x}} = (\frac{\partial}{\partial x_1}, \frac{\partial}{\partial x_2}, ...\frac{\partial}{\partial x_n})$, of the expresssion, and set that to zero. Then, we can use the inner product rule for gradients:
$$ \nabla (f \cdot g) = (D f)^\top g + (D g)^\top f $$

It is also possible to set every partial derivative of the 2-norm to zero, and work this out. This is a bit messier, but you will end up with the same equation. Setting the 2-norm of $A \textbf{x} - \textbf{y}$ to $0$, and applying this rule yields
$$ 2(D (Ax))^\top (A\textbf{x} - \textbf{y}) = 0 $$

Now, since $Ax$ is just a linear function of $\textbf{x}$, it follows that $D (A\textbf{x}) = A$. Substituting this yields
$$ A^\top A \textbf{x} = A^\top \textbf{y} $$

which is the normal equation. This is a square linear system of size $m \times m$. It follows that this system has a unique solution whenever $\det(A^\top A) = \not 0$.

An interesting consideration is what happens when $m < n$. This is called the *underdetermined* linear system, since there are typically an infinite number of solutions (so the solution is not uniquely determined). In this case, one might try to find try to find a solution $x$ that is minimal with respect to some norm (often the 2-norm). This is a topic for another post.
{% endkatexmm %}
