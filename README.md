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
* Visualization of logical operations. Users can choose between:

| Operation | Tradicional notation | Mnemonic notation |
| ----- | ----- | ----- |
| [Negation](https://en.wikipedia.org/wiki/Negation)                  | $\neg P$              | $\text{NOT } P$    |
| [Conjunction](https://en.wikipedia.org/wiki/Logical_conjunction)    | $P \land Q$           | $P \text{ AND } Q$ |
| [Disyunction](https://en.wikipedia.org/wiki/Logical_disjunction)    | $P \lor Q$            | $P \text{ OR } Q$  |
| [Conditional](https://en.wikipedia.org/wiki/Material_conditional)   | $P \to Q$             | $P \text{ IF } Q$  |
| [Equivalence](https://en.wikipedia.org/wiki/Logical_biconditional)  | $P \leftrightarrow Q$ | $P \text{ IFF } Q$ |
| [Exclusive disjunction](https://en.wikipedia.org/wiki/Exclusive_or) | $P \oplus Q$          | $P \text{ XOR } Q$ |

* Visualization of [predicate](https://en.wikipedia.org/wiki/Predicate_(mathematical_logic)) expressions
    * Nullary or 0-arity predicates, visualized as its own name, e.g. $P$
    * [First order logic](https://en.wikipedia.org/wiki/First-order_logic) predicates, with a given number of [terms](https://en.wikipedia.org/wiki/Term_(logic)), visualized as $P(t_1, t_2, ..., t_n)$
