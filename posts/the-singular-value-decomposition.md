# The singular value decomposition

In this article, I will prove that every matrix has a *singular value decomposition*. The singular value decomposition has numerous applications. It can be used to compute the pseudoinverse of a matrix, to perform principal component analysis, and it can be used to approximate a matrix $M$ by a low-rank approximation $\tilde{M}$.

**Theorem**: *Any matrix $M \in \mathbb{C}^{m \times n}$ of rank $r$ has a decomposition*
$$ M = U \Sigma V^* $$

*where $U \in \mathbb{C}^{m \times r}$ and $V \in \mathbb{C}^{n \times r}$ are semi-unitary matrices, and $\Sigma \in \mathbb{R}^{r \times r}$ is a diagonal matrix with positive elements on the diagonal.*

**Proof**: If $m > n$, we can look at the singular value decomposition $M^* = U \Sigma V^*$ of the conjugate transpose $M^*$ of $M$. Using $M = (M^*)^* = (U \Sigma V^*)^* = V \Sigma U^*$, we find the singular value decomposition of $M$. So we can assume $m \leq n$ without loss of generality.

Now consider the $n \times n$ matrix $M^* M$, which is Hermitian. Using the spectral theorem for Hermitian matrices, we have
$$ M^* M = W \Lambda W^* $$

where $W$ is a unitary matrix with $n$ orthonormal eigenvectors $v_1, v_2, ..., v_n$ of $M^* M$, and $\Lambda$ is a diagonal matrix, where the $k$th element $\lambda_k$ on the diagonal is the eigenvalue of $v_k$. According to the first lemma, all the $\lambda_k$ are nonnegative.

We can assume that $\lambda_1 \geq \lambda_2 \geq ... \geq \lambda_n$. If this is not the case, we can simply permute the columns of $V$ and $\Sigma$ so that this condition holds. Since all the eigenvectors are orthogonal, and the rank of $M^* M$ is $r$ by the second lemma, the eigenvalues $\lambda_1, \lambda_2, ..., \lambda_r$ are positive, and $\lambda_{r + 1}, \lambda_{r + 2}, \lambda_n$ are zero.

Now define
$$\sigma_k = \sqrt{\lambda_k}$$

$$ u_k = \frac{A v_k}{\sigma_k} $$

for
$$ k = 1, 2, ..., r $$

Let $U \in \mathbb{C}^{m \times r}$ be the matrix with $u_1, u_2, ..., u_r$, let $V \in \mathbb{C}^{n \times r}$ be the matrix with $v_1, v_2, ..., v_r$ as columns, and let $\Sigma \in \mathbb{R}^{r \times r}$ be the diagonal matrix with $\sigma_1, \sigma_2, ..., \sigma_r$ on the diagonal.

For $1 \leq k \leq r$, we have that $V^* v_k = e_k$. So $Mv_k = U \Sigma V^* v_k = U \sigma_k e_k =\sigma_k U e_k = \sigma_k u_k = A v_k$. On the other hand, if $r < k \leq n$, we have $V^* v_k = 0$, so $U \Sigma V^* v_k = 0$. It follows that $M v_k = U \Sigma V^* v_k$ for $k = 1, 2, ..., n$. Since the vectors $v_1, v_2, ..., v_n$ are orthonormal, they form a basis basis of $\mathbb{C}^n$. By linearity, it follows that $Mv = U \Sigma V v$ for any $v \in \mathbb{C}^n$. So we must have
$$ M = U \Sigma V^* $$

It remains to show that $\Sigma$ is a diagonal matrix with positive diagonal elements, and that $U$ and $V$ are semi-unitary. The first fact is obvious since we have defined $\Sigma$ to have the values $\sqrt{\lambda_1}, \sqrt{\lambda_2}, ... \sqrt{\lambda_r}$ on the diagonal.

To show that $U$ is semi-unitary we need to show that $U^* U = I$. Consider that the elements $U^* U$ are given by $u_i^* u_j = \frac{(Av_i)^* Av_j}{\sigma_i \sigma_j} = \frac{v_i^* (A^* A v_j)}{\sigma_i \sigma_j} = \lambda_j \frac{\left< v_i, v_j  \right>}{\sigma_i \sigma_j}$ for $1 \leq i, j \leq r$. This expression reduces to 1 if $i = j$ and to 0 otherwise (by the orthogonality of the vectors $v_1, v_2, ..., v_r$. So $U^* U = I_r$, which means that $U$ is semi-unitary.

$V$ is an $n \times r$ matrix with orthonormal columns. It follows that $V^* V = I_r$, so $V$ is semi-unitary. $\square$

**Lemma**: *$M^* M$ has only real, nonnegative eigenvalues.*

**Proof**: Let $v$ be any eigenvector of $M^* M$ and $\lambda$ be the corresponding eigenvalue, so that $M^* M v = \lambda v$. We have $|| M v ||^2 = v^* M^* M v = \lambda v^* v = \lambda || v ||^2$. Rearranging for $\lambda$, we get $\lambda = \frac{|| M v ||^2}{||v||^2}$, which is obviously real and nonnegative. $\square$


**Lemma**: *Let $r$ be the rank of a complex matrix $M$. Then $M^* M$ has rank $r$ as well.*

**Proof**: For a matrix $M \in \mathbb{C}^{m \times n}$ we have $\text{rank}(M) = n - \text{dim}(\text{null}(M))$, so it suffices to show that $Mv = 0 \iff M^* M v = 0$, since this implies that the null spaces are the same.

From $Mv = 0$ it follows that $M^* M v = M^* 0 = 0$. It is a property of the norm that $||v||^2 = 0$ implies $v = 0$. So $M^* M v = ||Mv||^2 = 0$ implies $v = 0$. $\square$

The theorem proves the existence of a variant of the singular value decomposition that is also known as the compact singular value decomposition. The existence of the 'full' singular value decomposition and other variants follows from the existence of the compact singular value decomposition, since we can just add extra zeroes to the diagonal, and add more orthonormal columns to $U$ and $V$, without changing the product $U \Sigma V^*$.

