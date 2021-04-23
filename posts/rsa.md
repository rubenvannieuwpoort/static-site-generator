# RSA

RSA is an encryption algorithm from 1977, named after the last names of its inventors Ron Rivest, Adi Shamir, and Leonard Adleman. RSA is a so-called asymmetric or public-key cryptosystem. In a public-key cryptosystem, the key that is used for encryption is public (i.e. not secret). Of course, the key that is used for decryption still needs to be secret to have a useful system.

I will now introduce the main principles behind RSA. You will need a good understanding of modular arithmetic.

Asymmetric cryptography demands that the encryption function $E_k$ is one-way: It should be feasible to compute, but infeasible to compute the inverse function (since this function is equivalent to the decryption function $D_{k'}$). For RSA, this one-way function is *modular exponentiation*: If we pick $n$ and $N$ under the right conditions, it is easy to compute $n^k$. On the other hand, the inverse problem of finding $n$ if only $n^k$ is given, is known as the *discrete log problem* and it is widely believed that no efficient algorithm exists to solve this. Now, if we can find exponents $r, s$ such that $n^{rs} \equiv n \pmod{N}$, we can use $r$ as the public key, and $s$ as the private key. In this case, it is infeasible to compute $n$ from $n^r$. However, is $s$ is known, one can simply compute $(n^r)^s \equiv n \pmod{N}$ and obtain $n$ this way. The trick is to construct $r$ and $s$ such that these properties hold. RSA uses the propery that it is easy to compute the product of two large primes, but hard to factorize the result into primes to construct such $r$ and $s$.

First, I will give a quick introduction to the number theory that is used. We will use arithmetic modulo some big number $N$. The set of numbers that are coprime to $N$ forms a group under multiplication modulo $N$. The size of this group will be given by *Euler’s totient function* $\phi(N)$. For this function, we have
$$\phi(N) = N \cdot \prod_{p | N} (1 - \frac{1}{p})$$

Further, we have Euler’s theorem, which states:
$$ n^{\phi(N)} \equiv 1 \pmod{N}$$
From this, we can derive the following lemma:

**Lemma**: $n^k \equiv n \pmod{N}$ whenever $k \equiv 1 \pmod{\phi(N)}$.

If $N$ is a product of two prime numbers, say $p$ and $q$, then we find $\phi(N) = (p - 1)(q - 1)$ from the formula for $\phi$. Finding $\phi(N)$ from $N$ requires that $N$ be factorized, which is a problem for which there is no efficient problem known. On the other hand, we need $\phi(N)$ to find, for a given $r$, an $s$ such that $rs \equiv 1 \pmod{\phi(N)}$.

Now the necessary background is covered, I now present the RSA cryptosystem.

1. Randomly pick big primes $p$ and $q$ in some interval.
2. Compute $N = pq$, and $\phi(N) = (p - 1)(q - 1)$
3. Randomly pick an $r$ in the interval $1, 2, ..., \phi(N) - 1$
4. Compute $s$ such that $rs \equiv 1 \pmod{\phi(N)}$ with the [extended Euclidian algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm)

Now, $(r, N)$ is the public key, and $(s, N)$ is the private key. Encryption is computed as
$$E_{(r, N)}(M) = M^r \pmod{N}$$

and decryption as
$$D_{(s, N)}(C) = C^s \pmod{N}$$

It is easily seen that decryption works properly by setting $C = E_{(r, N)}(M) = M^r$:
$$D_{(s, N)}(C) = (M^r)^s \pmod{N}$$

By step 4, we have that $rs \equiv 1 \pmod{\phi(N)}$. By our lemma, it follows that $M^{rs} \equiv M \pmod{N}$. So, we can conclude that decryption works.
