# The finite element method

This is an edited section from my thesis "[Solving Poisson’s equation with Dataflow computing](http://resolver.tudelft.nl/uuid:c5dfd1d4-6494-47e9-90d9-486d2a7b26b3)". It might be a bit more formal than most of my other posts.

## Introduction

The finite element method is a method to solve boundary value problems. Boundary value problems pose the problem of finding a function $u : \Omega \rightarrow \mathbb{R}$ that satisfies a given differential equation on $\Omega$ and given boundary conditions on the boundary $\partial \Omega$ of the domain. We will use Poisson’s problem on a two-dimensional domain with Dirichlet boundary conditions:

 For a given $f \in L^2(\Omega)$, $u_{\partial \Omega} : \partial \Omega \rightarrow \mathbb{R}$, and $\Omega$, find a function $u : \Omega \rightarrow \mathbb{R}$ such that

 - $\Delta u = f$ on $\Omega$
 - $u = u_{\partial \Omega}$ on $\partial \Omega$

The $\Delta$ represents a differential operator called the Laplace operator. For twice-differentiable functions $g : A \rightarrow \mathbb{R}$ on a domain $A \subset \mathbb{R}^d$, the Laplace operator is defined as
$$\Delta g = \sum_{i = 1}^d \frac{\partial^2 g}{\partial x_i^2}$$

The finite element method is a numerical method. This means that the solution $u$ is approximated by a function $u^h \approx u$. The function $u^h$ is taken to be in some finite-dimensional *approximation space* $V^h$. The space $V^h$ is spanned by a basis $\psi_0, \psi_1, ..., \psi_{N - 1} : \Omega \rightarrow \mathbb{R}$. When the basis functions $\psi_0$, ..., $\psi_{N - 1}$ are fixed, $u^h$ can be expressed by a vector $\mathbf{u} = (u_0, u_1, ... u_{N - 1})^\top \in \mathbb{R}^N$:
$$u^h(\boldsymbol{\xi}) = \sum_{i = 0}^{N - 1} u_i \psi_i(\boldsymbol{\xi}) \quad \text{for $\boldsymbol{\xi} \in \Omega$}$$
The elements $u_0, u_1, ..., u_{N - 1} \in \mathbb{R}$ are known as *degrees of freedom*.

Conceptually, the finite element method can be separated into several stages:
1. A method to convert the boundary value problem to a discrete system of symbolic equations. The most popular method is the Bubnov-Galerkin method, which is often simply called the *Galerkin method*.
2. The discretization strategy, which describes how to obtain an actual system of equations for a given symbolic system of equations. This involves picking the basis functions, and evaluating or approximating the integrals in the symbolic system. Also, one or more methods of refinement are usually provided, which can be used to increase the number of basis functions and thus the dimension of $V^h$, so that $u^h \in V^h$ can approximate $u$ better.
3. The solver, which solves the system of equations. If the boundary value problem is linear, the system of equations will be linear too, and linear solvers like the conjugate gradient method, the generalized minimum-residual method, or the stabilized biconjugate gradient method are popular choices. Nonlinear systems are harder to solve, and require more advanced methods like the Newton-Rhapson method or the Picard method. Typical nonlinear solvers iteratively linearize the system, and solve the linearized system with a linear solver.


## Galerkin method

The Galerkin method derives a system of symbolic equations for a given boundary value problem. The Galerkin method is based on the weak formulation of the boundary value problem. First, let us define the Sobolev space $H^1(\Omega)$ of functions $f : \Omega \rightarrow \mathbb{R}$ for which the first partial derivatives are square-integrable. The weak formulation of a differential equation can be obtained by multiplying both sides by a test function $v \in V = \{\ v \in H^1(\Omega) : v|_{\partial \Omega} = 0\ \}$, integrating over $\Omega$, and demanding equality regardless of the choice of $v \in V$. Applying this to $\alpha \Delta u + \beta u = f$ gives
$$\forall v \in V: \int_\Omega \alpha(\Delta u)v + \beta uv\ \text{d}\Omega = \int_\Omega f v\ \text{d}\Omega$$

One can then apply integration by parts and use $v|_{\partial \Omega} = 0$ to make the left-hand side symmetric:
$$\forall v \in V: \int_\Omega -\alpha (\nabla u \cdot \nabla v) + \beta u v\ \text{d}\Omega = \int_\Omega f v\ \text{d}\Omega$$

With this equation, the complete weak formulation becomes:

For a given $f : \Omega \rightarrow \mathbb{R}$, $u_0 : \partial \Omega \rightarrow \mathbb{R}$, and $\Omega$, find a function $u \in H^1(\Omega)$ such that:
$$\forall v \in V: \int_\Omega -\alpha (\nabla u \cdot \nabla v) + \beta u v\ \text{d}\Omega = \int_\Omega f v\ \text{d}\Omega$$
$$u = u_0 \text{ on } \partial \Omega$$

The Galerkin method replaces $V$ by a finite-dimensional approximation $V^h$, spanned by basis functions $\{ \psi_0, \psi_1, ..., \psi_{N - 1} \}$, and seeks an approximate solution $u^h \in V^h$. Ignoring the boundary conditions for now, we get the system

$$\forall i = 0, 1, ..., N - 1: \int_\Omega -\alpha (\nabla u^h \cdot \nabla \psi_i) + \beta u^h \psi_i\ \text{d}\Omega = \int_\Omega f \psi_i\ \text{d}\Omega$$

So $u^h \in V^h$ can be expressed as $u^h = \sum_{j = 0}^{N - 1} u_j \psi_j$. Using this, we get
$$\forall i = 0, 1, ..., N - 1: \int_\Omega -\alpha (\nabla (\sum_{j = 0}^{N - 1} u_j \psi_j) \cdot \nabla \psi_i) + \beta (\nabla (\sum_{j = 0}^{N - 1} u_j \psi_j) \psi_i\ \text{d}\Omega = \int_\Omega f \psi_i\ \text{d}\Omega$$

Bringing the summation outside the integral yields
$$\forall i = 0, 1, ..., N - 1: \sum_{j = 0}^{N - 1} \left( \int_\Omega -\alpha (\nabla \psi_i \cdot \nabla \psi_j) + \beta \psi_i \psi_j\ \text{d}\Omega \right) u_j = \int_\Omega f \psi_i\ \text{d}\Omega$$

Which can be written as a linear system $\mathbf{A} \mathbf{u} = \mathbf{b}$ of size $N \times N$, where the *finite element matrix* $\mathbf{A} \in \mathbb{R}^{N \times N}$ is defined as
$$\mathbf{A}_{i, j} = \int_\Omega -\alpha (\nabla \psi_i \cdot \nabla \psi_j) + \beta \psi_i \psi_j\ \text{d}\Omega$$

and the *right-hand side vector* $\mathbf{b} \in \mathbb{R}^N$ is defined as
$$b_i = \int_\Omega f \psi_i\ \text{d}\Omega$$

Furthermore, we define the *stiffness matrix* $\mathbf{S}$ as
$$\mathbf{S}_{i, j} = \int_\Omega \nabla \psi_i \cdot \nabla \psi_j\ \text{d}\Omega$$

and the *mass matrix* $\mathbf{M}$ as
$$\mathbf{M}_{i, j} = \int_\Omega \psi_i \psi_j\ \text{d}\Omega$$

We can now express the finite element matrix $\mathbf{A}$ in terms of the stiffness matrix $\mathbf{S}$ and mass matrix $\mathbf{M}$ as
$$\mathbf{A} = -\alpha \mathbf{S} + \beta \mathbf{M}$$

The Dirichlet boundary conditions can be implemented by a *Dirichlet lift*. Each degree of freedom $u_{i_0}$, $u_{i_1}$, ..., $u_{i_{m - 1}}$ which corresponds to a basis function which is nonzero on the boundary $\partial \Omega$ is prescribed in such a way that $\sum_{k = 0}^{m - 1} u_{i_k} \psi_{i_k} \approx u_{\partial \Omega}$ on $\partial \Omega$. As such, the boundary condition is approximately satisfied. To pick $u_0, u_1, ..., u_{m - 1}$ in such a way, one can use $L^2$ projection on the boundary, or make sure that $u^h$ interpolates $u_{\partial \Omega}$ in a set of points $\mathbf{x_0}$, $\mathbf{x_1}$, ... on the boundary.


## Assembly

Suppose that the mass matrix $\mathbf{M}$ is to be assembled. One could separately evaluate the integrals $\int_\Omega \psi_i \psi_j\ \text{d}\Omega$. However, the basis functions are usually defined on sections of the domain called *elements*. The domain can be partitioned into $M$ elements $e_0, e_1, ..., e_{M - 1}$ so that we have
$$\int_\Omega \psi_i \psi_j\ \text{d}\Omega = \sum_{k = 0}^{M - 1} \int_{e_k} \psi_i \psi_j\ \text{d}\Omega$$
The usual approach is to loop over the elements and evaluate $\int_{e_k} \psi_i \psi_j\ \text{d}\Omega$ for the basis functions $\psi_i, \psi_j$ which are nonzero on that element. Typically, the basis functions will have local support, and there will be a small number of nonzero basis functions on each element. For an element on which there are $n$ nonzero basis functions $\psi_{k_0}, \psi_{k_1}, ..., \psi_{k_{n - 1}}$, an *element matrix* $\mathbf{E} \in \mathbb{R}^{n \times n}$ with entries $\mathbf{E}_{i, j} = \int \psi_{k_i} \psi_{k_j}\ \text{d}\Omega$ is assembled. After the element matrix is assembled, each entry $\mathbf{E}_{i, j}$ is added to $\mathbf{M}_{k_i, k_j}$.
