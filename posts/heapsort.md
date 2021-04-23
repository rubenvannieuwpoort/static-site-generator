# Heapsort

Heapsort is an in-place sorting algorithm that runs in $O(n \log(n))$ and uses constant memory (i.e. $O(1)$). In practice, quicksort is often preferred, because it is somewhat faster.

Heapsort uses a datastructure called a *heap*. Algorithms exist to

1. Convert an unsorted array to a max-heap
2. Extract the biggest element from an array

First, a heap is a special kind of *binary tree*:

**Definition**: *A **binary tree** is a tree in which each node has at most two children. We call these children, if they exist, the nodes **left** and **right** children.*

Further, a heap satisfies the *heap property*:

**Definition**: *A **heap** is a binary tree where a value is associated to each node. These values satisfy the **heap property**. Every heap satisfies either*
  - *The **max-heap property**: The value of each node is greater of equal than the value of both of its children*
  
*or*
  - *The **min-heap property**: The value of each node is smaller of equal than the value of both of its children*

*A **max-heap** is a heap that satisfies the max-heap property. A **min-heap** is a heap that satisfies the min-heap property.*

Now, we use a trick to store a binary tree in an array. For this, the tree has to be a *complete binary tree*.

**Definition**: *The **depth** of a node is the number of edges between the node and the root of the tree. All nodes with the same depth are said to be on the same **layer**.*

**Definition**: *A **complete binary tree** is a binary tree where*
1. *All layers except possibly the last one are completely filled (i.e. contain $2^n$ nodes, where $n$ is the depth of the layer)*
2. *In the last layer, all the nodes are as far to the left as possible*

The second property is informally phrased. The following picture should illustrate the idea:

![](/images/complete_binary_tree.png)

It is possible to store complete binary trees efficiently in an array. The number in the previous image represents the index in the array.

For zero-based arrays, it works as follows: Take the element at index 0 as the root of the binary tree. Now, the left child of a node at index $i$ can be found at index $2i + 1$:

	// returns the index of the left child of the node at index i
	int left(int i) { return 2 * i + 1; }

The right child is at index $2i + 2$:

	// returns the index of the right child of the node at index i
	int right(int i) { return 2 * i + 2; }

If any of these indices lies outside the bounds of the array, the node does not have the corresponding child. The parent of the node at index $i$ can be found at $\lfloor \frac{i - 1}{2} \rfloor$, if it exists.

	// returns the index of the parent of the node at index i
	int parent(int i) { return (i - 1) / 2; }

For one-based arrays, the system works similar, but the left child of the node at index $i$ is stored at index $2i$, and the right child at index $2i + 1$. Accordingly, the parent of the node at index $i$ is at index $\lfloor \frac{i}{2} \rfloor$.

**Definition**: *A **binary heap** is a heap that is also a complete binary tree.*

Having defined the datastructure behind heaps, we now define the algorithms that work on heaps:
1. `void build_max_heap(double *array, int n)`, which has a runtime of $O(n \log(n))$, and builds a max-heap from `array` in-place, using the previously discussed trick.
2. `double extract_max(double *array, int n)` which has a runtime of $O(\log(n))$, extracts the largest element from the max-heap (notice that the largest element is the root of the binary tree `array[0]`), and ensures that upon returning, `array[0]` up to `array[n - 2]` represents a valid max-tree of size $n - 1$. That is, the last element in the array is now free for use.

Once we have built a max-tree, it is easy to use `extract_max` to repeatedly extract the largest element, and put it in the last position of the array, which has been freed up recently. This is the essential idea behind heapsort:

	// sorts the array 'array' with length n, using heapsort
	void heapsort(double *array, int n) {
		build_max_heap(array, n);
		for (int i = n - 1; i >= 1; i--) {
			// place largest element just after the end of the max-heap
			array[i] = extract_max(array, n);
			n--;
		}
	}

Now, `build_max_heap` and `extract_max` rely on a procedure `max_heapify` that makes a max-heap from a binary tree, for which both children are the roots of a max-heap if they exist. This makes the implementation of the `extract_max` function simple: we just have to return the first element. After that, we can place the node with the largest index at the root (so we can consider the root as removed, and the last index is now free). Now, we call the `max_heapify` to restore the max-heap property:

	// extracts the largest element of a max-heap
	double extract_max(double *array, int n) {
		// store largest element (since we will overwrite it)
		double largest = array[0];

		// free up last index by placing the node there at the root
		array[0] = array[n - 1];

		// restore max-heap property
		max_heapify(0, array, n - 1);

		// return the element that was found at the root
		// (this is the largest by the max-heap property)
		return largest;
	}

Notice that `max_heapify` relies on the children of the root being max-heaps, so we can’t use this function to build a max-heap directly. This is easily fixed by working bottom-up: call `max-heapify` on leafs, then on the nodes one layer above that, and so on... Since the index of the left and right children of a node are always higher than the index of the node, we can ensure that we work bottom-up by starting at the largest index. Now, since the leafs are already max-heaps (consisting of a single node), we can actually skip them, by starting with the parent of the last element:

	void build_max_heap(double *array, int n) {
		// if n <= 1, the max-heap consists of a single node and is already sorted
		if (n <= 1) return;

		// max-heapify, from the bottom up
		for (int i = parent(n - 1); i >= 0; i--)
			max_heapify(i, array, n);
	}

Now, we finally get to the meat: the `max_heapify` function. As mentioned before, this function relies on the children of the root being max-heaps. So we almost have a max-heap: the only problem is that the root might be smaller than one or both of its children. If this is the case, we can swap the root with the largest of its children. Then, we look at the subtree of which we just replaced the root. It is not necessarily a max-heap, but both of the children, if they exist, are roots of a max-heap. But this is the task that `max_heapify` handles! So we can call `max_heapify` recursively until we encounter a node that is larger than both of its children, in which case the function terminates:

	// makes a max-heap of the binary subtree with array[i] as its root
	// assumes that left and right nodes of this element are roots of max-heaps
	void max_heapify(int i, double *array, int n) {
		// index of largest element of array[i], array[left(i)], array[right(i)]
		// for now we assume it’s the root of the subtree, array[i])
		int idx_largest = i;

		// set idx_largest to the index of the largest element
		// only consider children if they exist (i.e. are within the bounds of the array)
		if (right(i) < n && array[right(i)] > array[idx_largest]) idx_largest = right(i);
		if (left(i) < n && array[left(i)] > array[idx_largest]) idx_largest = left(i);

		// if the root is not the largest, swap it with the largest of its children
		// after that, call max_heapify to maintain the max-heap property
		if (idx_largest != i) {
			swap(&array[i], &array[idx_largest]);
			max_heapify(idx_largest, array, n);
		}
	}

For example code, see [this github repository I made](https://github.com/benoncoffee/heapsort).

## Runtime analysis

The runtime of the algorithm can now be analyzed by using that the `max_heapify` function has a runtime linear in the depth of the binary tree, which is $\log(n)$ in the number of node $n$. The loops in `build_max_heap` and `heapsort` call this function $n$ times, so we have a total runtime of $O(n \log(n))$.

Since we constantly jump around from a node at index $i$ to its children, which haves indices near $2i$, we have to access memory at different locations when $i$ is large. I suspect that this is the reason that heapsort is a bit slower than quicksort in practice. Trees are just not very good at cache coherency. Quicksort, in contrast, typically accessess memory that is closed to memory that was recently accessed. Still heapsort is an elegant algorithm, which is in-place, uses constant memory, and has the theoretically best runtime possible for a sorting algorithm (under some assumptions).


## References

[1] Cormen, Leiserson, Rivest, Stein. *Introduction to algorithms, 3rd edition*. The MIT Press, 2009.

[2] The wikipedia pages on [heapsort](https://en.wikipedia.org/wiki/Heapsort), [heaps](https://en.wikipedia.org/wiki/Heap_(data_structure)), [binary trees](https://en.wikipedia.org/wiki/Binary_tree), and [binary heaps](https://en.wikipedia.org/wiki/Binary_heap).
