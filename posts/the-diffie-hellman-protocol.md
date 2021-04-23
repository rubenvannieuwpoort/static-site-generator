# The Diffie-Hellman protocol

The Diffie-Hellman protocol is a method for two parties to agree on a number $k$. The cool thing about the exchange is that $k$ can not be derived from eavesdropping on the communication between the two parties. The number $k$ can then be used to communicate privately, by using it as a key for symmetric encryption.

The main idea behind the Diffie-Hellman key exchange protocol, is that it’s possible to efficiently compute $n \equiv g^k \pmod{N}$, but (under some assumptions) no efficient algorithm is known to find $k$ such that $g^k \equiv n \pmod{N}$, given $n$. The algorithm to compute $n \equiv b^k \pmod{N}$ is called *modular exponentiation*. The problem of finding $k$ such that $g^k \equiv n \pmod{N}$, given $n$, is known as the *discrete log problem*.

Alice and Bob can use this to their advantage. Alice can send $g^{k_A}$, and Bob can send $g^{k_B}$. Since Alice knows $k_A$ and Bob knows $k_B$, they now have enough information to compute $g^{k_A k_B} \pmod{N}$ by modular exponentiation. However, if Eve monitors their communication, she only knows $g^{k_A}$ and $g_{k_B}$, which is not enough information to efficiently compute $g^{k_A k_B} \pmod{N}$. This would require Eve to find either $k_A$ or $k_B$. For this, she has to solve the discrete log problem, for which no efficient algorithm seems to exist.

The Diffie-Hellman key exchange protocol is the basis behind the ElGamal cryptosystem, which is an asymmetric cryptosystem similar to RSA.

## Weaknesses

The order of the multiplicative group modulo $N$ needs to be big enough to ensure that the discrete log problem can not be solved easily. Further, the order of the group should have a large prime factor, since otherwise an efficient algorithm exists (the [Pohlig–Hellman algorithm](https://en.wikipedia.org/wiki/Pohlig%E2%80%93Hellman_algorithm)) to solve the discrete log problem. For this reason, a prime number $2p + 1$ is sometimes used (where $p$ is also prime). 

By using the [number field sieve](https://en.wikipedia.org/wiki/Number_field_sieve) algorithm, a large part of the computations that need to be done to solve the discrete log problem can be precomputed for a given $N$. Since many implementations of Diffie-Hellman do not use a unique prime number every time, these computations can be done for the most common values of $N$. It is commonly believed that there are parties such as the NSA that have enough computational power to make these computations. This vulnerability was described in [2].

## References

[1] https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange

[2] David Adrian, Karthikeyan Bhargavan, Zakir Durumeric, Pierrick Gaudry, Matthew Green, J. Alex Halderman, Nadia Heninger, Drew Springall, Emmanuel Thomé, Luke Valenta, Benjamin VanderSloot, Eric Wustrow, Santiago Zanella-Béguelin, Paul Zimmermann. [Imperfect Forward Secrecy: How Diffie-Hellman Fails in Practice.](https://weakdh.org/imperfect-forward-secrecy-ccs15.pdf)
