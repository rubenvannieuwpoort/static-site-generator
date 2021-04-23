# Covariance and contravariance

Suppose we are coding in some object-oriented programming language with generics, and there is a class `Dictionary` that depends on two type parameters `A` and `B`:

    Dictionary<A, B>

This class implements a lookup: If a variable `dictionary` of type `Dictionary<A, B>` is given a key `key` of type `A`, it returns a result `dictionary[key]` of type `B`.

Now, we might have an object of type `Dictionary<Dog, Dog>` and one of type `Dictionary<Animal, Animal>`. Suppose that `Dog` is a subclass of `Mammal`. As you might expect, `Dictionary<string, Dog>` is a subclass of `Dictionary<string, Mammal>`. So `Dictionary<A, B>` is a subclass of `Dictionary<A, B'>` when `B` is a subclass of `B'`.

However, is `Dictionary<Dog, string>` a subclass of `Dictionary<Mammal, string>`? This is not the case. If a variable `dogName` of type `Dictionary<Dog, string>` would also have type `Dictionary<Mammal, string>`, we should be able to look up the name of any animal[^Liskov] (not just dogs!). Clearly we aren't, since we can't look up `dogName[cat]`, since `dogName` only takes keys of type `Dog`.

On the other hand, when `Animal` is a superclass of `Mammal`, we could use an object `animalName` of type `Dictionary<Animal, string>` as an object with type `Dictionary<Mammal, string>`, since it is fine to use a `Mammal` as a key in `animalName` (since `Mammal` is a subclass of `Animal`). So, we conclude that `Dictionary<A, B>` is a subclass of `Dictionary<A', B>` when `A` is a *superclass* of `A'`.

We say that a type `T<A>` is *covariant* in `A` if `T<A>` is a subclass of `T<B>` when `A` is a subclass of `B`. On the other hand, `T<A>` is *contravariant* in `A` if `T<A>` is a subclass of `T<B>` when `B` is a subclass of `A`.

There are also more exotic notions like *invariance* (`T<A>` is never a subtype of `T<B>`) or *bivariance* (`T<A>` is always a subtype of `T<B>`), but these are rarely seen in practice.

[^Liskov]:This is known as the [Liskov substitution principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle)
