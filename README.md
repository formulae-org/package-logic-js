# package-logic-js

Complex arithmetic package for the [Fōrmulæ](https://formulae.org) programming language.

Fōrmulæ is also a software framework for visualization, edition and manipulation of complex expressions, from many fields. The code for an specific field —i.e. arithmetics— is encapsulated in a single unit called a Fōrmulæ **package**.

This repository contains the source code for the **logic package**. It is intended to the computation of logical operations.

The GitHub organization [formulae-org](https://github.com/formulae-org) encompasses the source code for the rest of packages, as well as the [web application](https://github.com/formulae-org/formulae-js).

<!--
Take a look at this [tutorial](https://formulae.org/?script=tutorials/Complex) to know the capabilities of the Fōrmulæ arithmetic package.
-->

### Capabilities ###

* Visualization of the [truth values](https://en.wikipedia.org/wiki/Truth_value) *true* and *false*
* Visualization of the logical [negation](https://en.wikipedia.org/wiki/Negation), [conjunction](https://en.wikipedia.org/wiki/Logical_conjunction), [disyunction](https://en.wikipedia.org/wiki/Logical_disjunction), [conditional](https://en.wikipedia.org/wiki/Material_conditional), [equivalence](https://en.wikipedia.org/wiki/Logical_biconditional) and [exclusive disjunction](https://en.wikipedia.org/wiki/Exclusive_or)
  * As $\neg P$, $P \land Q$, $P \lor Q$, $P \to Q$, $P \leftrightarrow Q$ and $P \oplus Q$
  * As $\text{NOT } P$, $P \text{ AND } Q$, $P \text{ OR } Q$, $P \text{ IF } Q$, $P \text{ IFF } Q$ and $P \text{ XOR } Q$
* Visualization of the [predicate](https://en.wikipedia.org/wiki/Predicate_(mathematical_logic)) expressions
    * Nullary or 0-arity predicates, visualized as its own name, e.g. $P$
    * [First order logic](https://en.wikipedia.org/wiki/First-order_logic) predicates, with a given number of [terms](https://en.wikipedia.org/wiki/Term_(logic)), visualized as $P(t_1, t_2, ..., t_n)$
