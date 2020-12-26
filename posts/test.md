# Example

Hello. Welcome to this article.


## Computation of pi

The *following program* computes pi.

```
#include <stdio.h>
#include <stdlib.h>

float float_rand( float min, float max )
{
	float scale = rand() / (float) RAND_MAX; /* [0, 1.0] */
	return min + scale * ( max - min );      /* [min, max] */
}

int main(int argc, char *argv[]) {
	int number_of_samples = 100000000, hits = 0;
	for (int i = 0; i < number_of_samples; i++) {
		float x = float_rand(0, 1);
		float y = float_rand(0, 1);
		if (x * x + y * y <= 1.0) hits++;
	}
	printf("Pi approximately equals %f\n", hits / number_of_samples);
}
```

We can also do **formulas**. The following is true whenever either $X_k = 1$ or $X_k = 0$ and $\frac{\mathbb{P}[X_k = 1]}{\mathbb{P}[X_k = 0]} = \pi$ for all $k$:
$$ \frac{\sum_{k = 1}^N X_k}{N} \approx \pi $$

Cheers!


