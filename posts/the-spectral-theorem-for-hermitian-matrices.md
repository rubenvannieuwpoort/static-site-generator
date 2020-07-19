# The spectral theorem for Hermitian matrices

A [spectral theorem](https://en.wikipedia.org/wiki/Spectral_theorem) is a theorem about the diagonalization of a matrix or linear operator. A matrix is [diagonalizable](https://en.wikipedia.org/wiki/Diagonalizable_matrix#Definition) if it can be written in the form $MDM^{-1}$ where $D$ is a diagonal matrix. In this article, I will explain what a Hermitian matrix is, derive some properties, and use them to prove a spectral theorem for Hermitian matrices.

In the rest of the article, I will use the usual inner product on the complex vector space $\mathbb{C}^n$:
$$ \left< u, v \right> = u^\top \overline{v} = \sum_{k = 1}^n u_k \overline{v_k} $$

and the corresponding norm:
$$ || z || = \sqrt{ \left< z, z \right> } = \sqrt{ \sum_{k = 1}^n z_k \overline{z_k} } $$

We will often use that the inner product is linear in its first argument, and conjugate linear in its second:
$$ \left< \lambda u, v \right> = \lambda \left< u, v \right> $$

$$ \left< u, \lambda v \right> = \overline{\lambda} \left< u, v \right> $$

Here, $\overline{z}$ denotes the *complex conjugate*, which is defined by $\overline{x + iy} = x - iy$ for real $x, y \in \mathbb{R}$. These are straightforward generalizations of the normal Euclidian inner product and norm on real vector spaces. In particular, this inner product equals the ‘normal’ inner product for real vectors.


## Hermitian operators

Now, we are ready to define Hermitian operators:

**Definition**: *A **Hermitian** or **self-adjoint** operator $A$ on a space $X$ with an inner product $\left< \cdot, \cdot \right> : X \times X \rightarrow \mathbb{R}$ is an operator for which*
$$ \left< Ax, y \right> = \left< x, Ay \right> $$

*for all $ x, y \in X $*

By this definition, symmetric matrices with real elements are Hermitian. However, for matrices with complex elements, the condition is slightly different due to the complex conjugation in the second argument of the inner product.

The *conjugate transpose* $A^*$ of a complex matrix $A$ is defined by $A^* = \overline{A^\top}$.

**Theorem**: *A matrix $A$ with complex elements is Hermitian if and only if*
$$ A = A^* $$

**Proof**: We have $\left< Ax, y \right> = x^\top A^\top \overline{y}$ and $\left< x, Ay \right> = x^\top \overline{A} \overline{y}$, so $\left< Ax, y \right> = \left< x, Ay \right> \iff x^\top A^\top \overline{y} = x^\top \overline{A} \overline{y}$. This equality can only hold for all $x, y \in X$ if $A^\top = \overline{A}$. Taking transposes from both sides, we see that this holds if and only if $A = A^*$. $\square$

I want to emphasize that Hermicity can be seen as a generalization of symmetry: We have $\overline{A} = A$ if $A$ is a matrix with real elements, so every symmetric matrix with real elements is Hermitian.



## The spectral theorem for Hermitian matrices

Hermitian matrices have some pleasing properties, which can be used to prove a spectral theorem.

**Lemma**: *The eigenvectors of a Hermitian matrix $A \in \mathbb{C}^{n \times n}$ have real eigenvalues.*

**Proof**: Let $v$ be an eigenvector with eigenvalue $\lambda$. Then $\lambda \left< v, v \right> = \left< \lambda v, v \right> = \left<Av, v \right> = \left< v, Av \right> = \left< v, \lambda v \right> = \overline{\lambda} \left< v, v \right>$. It follows that $\lambda = \overline{\lambda}$, so $\lambda$ must be real. $\square$

Recall that two vectors $x$ and $y$ are **orthogonal** if their inner product is zero, that is, $\left< x, y \right> = 0$, that a set of vectors $V$ is orthogonal if every pair $v_1, v_2$ with $v_1 \not= v_2$ is orthogonal, and that it is orthonormal if it is orthogonal and every vector $v \in V$ has unit norm, that is, $||v|| = 1$.

We will need some lemmas to prove the main result later on. The first is a simple result that states that vectors orthogonal to eigenvectors stay orthogonal when multiplied by $A$.

**Lemma**: *If $x$ is orthogonal to an eigenvector $v$ of a Hermitian matrix $A$, then $Ax$ is orthogonal to $v$ as well.*

**Proof**: Suppose that $\lambda$ is the eigenvalue associated to $v$. Then $\left< Ax, v \right> = \left< x, Av \right> = \left< x, \lambda v \right> = \overline{\lambda} \left< x, v \right> = 0$. So $\left< Ax, v \right> = 0$, which means that $Ax$ and $v$ are orthogonal. $\square$

The second lemma is about the behavior of matrices with orthogonal rows.

**Lemma**: *Let $U \in \mathbb{C}^{m \times n}$ be a matrix with $m \leq n$ orthonormal rows $u_1, u_2, ..., u_m$, and $S$ be the space spanned by these vectors. Then*

  1. $U U^* = I_m$
  2. $U^* U v = v$ for all $v \in S$

**Proof**: Interpret the vectors $u_1, u_2, ..., u_m$ as column vectors. Then the element at $i, j$ of $U U^*$ is $u_i^\top \overline{u_j} = \left< u_i, u_j \right>$. By the orthonormality of $u_1, u_2, ..., u_n$ it follows that this expression is $1$ when $i = j$ (that is, the element is on the diagonal), and $0$ otherwise. So $UU^*$ equals $I_m$, the identity matrix of size $m \times m$.

For the second result, assume that $v \in S$. Then $v$ is a linear combination of the rows in $U$, or, equivalently, a linear combination of the columns of $U^*$. So we can write $v = U^* w$ for some $w \in \mathbb{C}^m$. Then, using the first part of the lemma, we have:
$$U^* U v = U^* U U^* w = U^* I_m w = U^* w = v$$

$\square$

With these results we are finally ready to prove the existence of an orthogonal basis of eigenvectors.

**Theorem**: *A Hermitian matrix $A \in \mathbb{C}^{n \times n}$ has $n$ orthogonal eigenvectors.*

**Proof**: We use induction on the number of eigenvalues of $A \in \mathbb{C}^{n \times n}$. The characteristic equation $\det(A - \lambda I) = 0$ is a complex polynomial equation of order $n$, and has a solution in $\lambda$. That implies that for this $\lambda$, $A - \lambda$ is singular, so there exists a $v$ such that $(A - \lambda I)v = 0$. This implies that $Av = \lambda v$, so we have a set of one eigenvector $v$, which is orthogonal. This proves the base case.

For the induction step, assume the existence of $n - m$ (with $m < n$) orthogonal eigenvectors $v_1, v_2, ..., v_{n - m}$. We then need to prove the existence of another eigenvector $v$, which is orthogonal to $v_1, v_2, ..., v_{n - m}$. Let $u_1, u_2, ...,  u_m$ be an orthonormal basis of the space that is orthogonal to all the eigenvectors $v_1, v_2, ..., v_{n - m}$, and $U$ be the matrix with $u_1, u_2, ..., u_m$ as its rows. Now, $U A U^*$ is Hermitian, so as we just proved for the base case, it must have at least one eigenvector $w$ with eigenvalue $\lambda$. So we have
$$U A U^* w = \lambda w$$

Multiplying both sides by $U^*$ on the left gives $U^* U A v = \lambda U^* w$. Now define $v := U^*w$ and substitute to get
$$ U^* U A v = \lambda v $$

Now, since $v = U^* w$ is a linear combination of the columns of $U^*$, it is orthogonal to all the eigenvectors $v_1, v_2, ..., v_{n - m}$. So, by the first lemma, $A v$ is also orthogonal to all these eigenvalues. This means that $A v$ is a linear combination of $u_1, u_2, ..., u_m$ as well. By the second lemma, it follows that $U^* U Av = Av$. So we are left with
$$ Av = \lambda v $$

So $v$ is an eigenvector of $A$. Moreover, since $v = U^* w$, $v$ is a linear combination of $u_1, u_2, ..., u_m$, so it is orthogonal to the eigenvectors $v_1, v_2, ..., v_{n - m}$. So this completes the induction step. $\square$

Of course, it is now easy to make this basis orthonormal by scaling the vectors in the basis.

**Corollary**: *A Hermitian matrix $A$ has a basis of orthonormal eigenvectors.*

**Proof**: By the preceding theorem, there exists a basis of $n$ orthogonal eigenvectors of $A$. Denote this basis with $x_1, x_2, .., x_n$, and define $y_k = \frac{x_k}{||x_k||}$. Now, $\left< y_i, y_j \right> = \frac{\left< x_i, x_j \right>}{|| x_i || \ || x_j ||}$, which is $0$ when $i \not= j$ and $1$ when $i = j$. So this basis is orthonormal.


**Definition**: *A **unitary matrix** $U$ is a matrix for which* $U^{-1} = U^*$.

**Theorem (Spectral theorem for Hermitian matrices)**: *A Hermitian matrix $A \in \mathbb{C}^{n \times n}$ can be written as*
$$ A = U \Lambda U^* $$
*where $U$ is a unitary matrix, and $\Lambda$ is a diagonal matrix with nonnegative elements.*

**Proof**: Let $u_1, u_2, ..., u_n$ be an orthonormal basis of eigenvector, and $\lambda_1, \lambda_2, ..., \lambda_n$ be the corresponding eigenvalues. Now, take $U$ to be the matrix with $u_k$ as the $k$th column, and $\Lambda$ to be the matrix with $\lambda_k$ as the $k$th element on the diagonal.

To prove that $U$ is unitary, consider the element at position $i, j$ of the matrix $U U^*$. It is given by $\left< u_i, u_j \right>$, which is $1$ when $i = j$ and $0$ otherwise. So the elements on the diagonal of $U U^*$ are one and the others zero, which means that $U U^* = I$. Furthermore, we have $U^* U = (U U^*)^* = I$. So $U^{-1} = U^*$, and $U$ is unitary.

To prove that $A = U \Lambda U^*$, consider the effect of left multiplying an eigenvector by this expression:
$$ U \Lambda U^* v_k = U \Lambda e_k = U \lambda_k e_k = \lambda_k v_k = A v_k$$

Since $v_1, v_2, ..., v_n$ is a basis of $\mathbb{C}^n$,  every vector $x \in \mathbb{C}^n$ can be written as a linear combination of the vectors $v_1, v_2, ..., v_n$. So we have $U \Lambda U^* x = Ax$ for every $x \in \mathbb{C}^n$. It follows that $A = U \Lambda U^*$. $\square$

With this, we finally proved the spectral theorem for Hermitian matrices. While the theorem itself is certainly interesting enough to prove, the proof has other benefits as well. First, there is a spectral theorem for unitary matrices as well, and the proof is analogous to this proof. Secondly, the spectral theorem for Hermitian matrices can be used to easily prove the existence of the singular value decomposition.
