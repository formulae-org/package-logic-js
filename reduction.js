/*
Fōrmulæ logic package. Module for reduction.
Copyright (C) 2015-2026 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

export class Logic extends Formulae.Package {}

Logic.notReducer = async (expr, session) => {
	let child = expr.children[0];
	
	switch (child.getTag()) {
		case "Logic.True":
			expr.replaceBy(Formulae.createExpression("Logic.False"));
			//session.log("Logical NOT");
			return true;
		
		case "Logic.False":
			expr.replaceBy(Formulae.createExpression("Logic.True"));
			//session.log("Logical NOT");
			return true;
		
		default:
			return false; // OK, symbolic
	}
};

Logic.notNot = async (not, session) => {
	let arg = not.children[0];
	
	if (arg.getTag() === ("Logic.Negation")) {
		not.replaceBy(arg.children[0]);
		//session.log("Negation of negaton is cancelled");
		return true;
	}
	
	return false; // OK, symbolic
};

Logic.andReducer = async (and, session) => {
	let child = null;
	
	for (let i = 0, n = and.children.length; i < n; ++i) {
		await session.reduce(and.children[i]);
		child = and.children[i];
		
		if (child.getTag() === "Logic.False") {
			and.replaceBy(child);
			
			//session.log("Any <false> reduces whole logic AND to <false>");
			return true;
		}
		
		if (child.getTag() === "Logic.True") {
			and.removeChildAt(i);
			--i;
			--n;
			//changed = true;
		}
	}
	
	if (and.children.length == 1) {
		// only one child
		and.replaceBy(and.children[0]);
		
		//session.log("All <true>'s reduce whole logic AND to be <true>");
		return true;
	}
	
	if (and.children.length == 0) {
		// all children were true necessarily, including the last one
		and.replaceBy(child);
		
		//session.log("All <true>'s reduce whole logic AND to be <true>");
		return true;
	}
	
	//if (changed) session.log("<true> elements in logic AND eliminated");
	
	and.setReduced();
	return false; // Ok, symbolic
};

Logic.orReducer = async (or, session) => {
	let child = null;
	
	for (let i = 0, n = or.children.length; i < n; ++i) {
		await session.reduce(or.children[i]);
		child = or.children[i];
		
		if (child.getTag() === "Logic.True") {
			or.replaceBy(child);
			
			//session.log("Any <true> reduces whole logical OR to <true>");
			return true;
		}
		
		if (child.getTag() === "Logic.False") {
			or.removeChildAt(i);
			--i;
			--n;
			//changed = true;
		}
	}
	
	if (or.children.length == 1) {
		// only one child
		or.replaceBy(or.children[0]);
		
		//session.log("All <false>'s reduce whole logic OR to be <false>");
		return true;
	}
	
	if (or.children.length == 0) {
		// all children were false necessarily, including the last one
		or.replaceBy(child);
		
		//session.log("All <false>'s reduce whole logic OR to be <false>");
		return true;
	}
	
	//if (changed) session.log("<false> elements in logic OR eliminated");
	
	or.setReduced();
	return false;
};

Logic.conditionalReducer = async (expr, session) => {
	let child;
	
	let changed = false;
	let n = expr.children.length;
	
	let previous;
	for (let i = n - 1; i >= 1; --i) {
		child = expr.children[i];
		previous = expr.children[i - 1];
		
		if (child.getTag() === "Logic.False") {
			if (previous.getTag() === "Logic.True") {
				expr.setChild(i - 1, child);
				expr.removeChildAt(i);
				changed = true;
			}
			else if (previous.getTag() === "Logic.False") {
				expr.setChild(i - 1, Formulae.createExpression("Logic.True"));
				expr.removeChildAt(i);
				changed = true;
			}
			else {
				break;
			}
		}
		else if (child.getTag() === "Logic.True") {
			expr.setChild(i - 1, Formulae.createExpression("Logic.True"));
			expr.removeChildAt(i);
			changed = true;
		}
		else {
			break;
		}
	}
	
	if (expr.children.length == 1) {
		expr.replaceBy(expr.children[0]);
		
		//session.log("Logical implication");
		return true;
	}
	
	if (changed) {
		//session.log("Logical implication");
		return true;
	}
	
	expr.setReduced();
	return false;
};

Logic.equivalenceReducer = async (expr, session) => {
	let child;
	let falses = 0;
	
	for (let i = 0, n = expr.children.length; i < n; ++i) {
		child = expr.children[i];
		
		if (child.getTag() === "Logic.False") {
			++falses;
		}
		else if (child.getTag() !== "Logic.True") {
			return false;
		}
	}
	
	expr.replaceBy(Formulae.createExpression(
		falses % 2 == 1 ?
		"Logic.False" :
		"Logic.True"
	));
	
	//session.log("Logical exclusive OR reduction");
	return true;
};

Logic.exclusiveOrReducer = async (xor, session) => {
	let child;
	let truths = 0;
	
	for (let i = 0, n = xor.children.length; i < n; ++i) {
		child = xor.children[i];
		
		if (child.getTag() === "Logic.True") {
			++truths;
		}
		else if (child.getTag() !== "Logic.False") {
			return false;
		}
	}
	
	xor.replaceBy(Formulae.createExpression(
		truths % 2 == 1 ?
		"Logic.True" :
		"Logic.False"
	));
	
	//session.log("Logical exclusive OR reduction");
	return true;
};

const bigConjunctionDisjunction = async (big, session) => {
	let n = big.children.length;
	if (n === 3) return false;
	
	let isBigConjunction = big.getTag() === "Logic.BigConjunction";
	let result;
	
	// symbol
	let symbol = big.children[1];
	if (symbol.getTag() !== "Symbolic.Symbol") {
		return false;
	}
	
	for (let i = 2; i < n; ++i) {
		await session.reduce(big.children[i]);
	}
	
	// from
	let from;
	if (n >= 4) {
		if (!big.children[2].isInternalNumber()) return false;
		from = big.children[2].get("Value");
		if (Arithmetic.isComplex(from)) return false;
	}
	else {
		from = Arithmetic.getIntegerOne(session);
	}
	
	// to
	if (!big.children[n == 3 ? 2 : 3].isInternalNumber()) return false;
	let to = big.children[n == 3 ? 2 : 3].get("Value");
	if (Arithmetic.isComplex(to)) return false;
	
	// step
	let step;
	if (n == 5) {
		if (!big.children[4].isInternalNumber()) return false;
		step = big.children[4].get("Value");
		if (Arithmetic.isComplex(step)) return false;
	}
	else {
		step = Arithmetic.getIntegerOne(session);
	}
	
	if (step.isZero()) return false;
	
	// sign
	let negative = step.isNegative();
	
	result = Formulae.createExpression(
		isBigConjunction ?
		"Logic.Conjunction" :
		"Logic.Disjunction"
	);
	
	//////////////////////////////////////
	
	result.createScope();
	let scopeEntry = new ScopeEntry();
	result.putIntoScope(symbol.get("Name"), scopeEntry, false);
	
	big.replaceBy(result);
	
	let arg = big.children[0];
	let clone, tag;
	
	filling: while (true) {
		if (negative) {
			if (Arithmetic.comparison(from, to, session) < 0) {
				break filling;
			}
		}
		else {
			if (Arithmetic.comparison(from, to, session) > 0) {
				break filling;
			}
		}
		
		scopeEntry.setValue(Arithmetic.createInternalNumber(from, session));
		
		result.addChild(clone = arg.clone());
		n = result.children.length;
		
		clone = await session.reduceAndGet(clone, n - 1);
		tag = clone.getTag();
		
		if (isBigConjunction) {
			if (tag === "Logic.True") {
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.False") {
				result.replaceBy(clone);
				return true;
			}
		}
		else {
			if (tag === "Logic.False") {
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.True") {
				result.replaceBy(clone);
				return true;
			}
		}
		
		from = Arithmetic.addition(from, step, session);
	}
	
	result.removeScope();
	
	n = result.children.length;
	if (n === 0) {
		result.replaceBy(Formulae.createExpression(isBigConjunction ? "Logic.True" : "Logic.False"));
	}
	else if (n === 1) {
		result.replaceBy(result.children[0]);
	}
	
	return true;
};

const bigConjunctionDisjunctionIn = async (big, session) => {
	let n = big.children.length;
	if (n !== 3) return false;
	
	let isBigConjunction = big.getTag() === "Logic.BigConjunction";
	
	let symbol = big.children[1];
	if (symbol.getTag() !== "Symbolic.Symbol") {
		return false;
	}
	
	let list = await session.reduceAndGet(big.children[2], 2);
	if (list.getTag() !== "List.List") {
		return false;
	}
	
	let arg = big.children[0];
	let clone, tag;
	
	let result = Formulae.createExpression(
		isBigConjunction ?
		"Logic.Conjunction" :
		"Logic.Disjunction"
	);
	
	big.replaceBy(result);
	
	result.createScope();
	let scopeEntry = new ScopeEntry();
	result.putIntoScope(symbol.get("Name"), scopeEntry, false);
	
	for (let i = 0, m = list.children.length; i < m; ++i) {
		scopeEntry.setValue(list.children[i].clone());
		
		result.addChild(clone = arg.clone());
		n = result.children.length;
		
		result.unlockScope();
		clone = await session.reduceAndGet(clone, n - 1);
		result.lockScope();
		tag = clone.getTag();
		
		if (isBigConjunction) {
			if (tag === "Logic.True") {
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.False") {
				result.replaceBy(clone);
				return true;
			}
		}
		else {
			if (tag === "Logic.False") {
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.True") {
				result.replaceBy(clone);
				return true;
			}
		}
	}
	
	result.removeScope();
	
	n = result.children.length;
	if (n === 0) {
		result.replaceBy(Formulae.createExpression(isBigConjunction ? "Logic.True" : "Logic.False"));
	}
	else if (n === 1) {
		result.replaceBy(result.children[0]);
	}
	
	return true;
};

const bigEquivalenceXOR = async (big, session) => {
	let n = big.children.length;
	if (n === 3) return false;
	
	let isBigEquivalence = big.getTag() === "Logic.BigEquivalence";
	let result;
	
	// symbol
	let symbol = big.children[1];
	if (symbol.getTag() !== "Symbolic.Symbol") {
		return false;
	}
	
	for (let i = 2; i < n; ++i) {
		await session.reduce(big.children[i]);
	}
	
	// from
	let from;
	if (n >= 4) {
		if (!big.children[2].isInternalNumber()) return false;
		from = big.children[2].get("Value");
		if (Arithmetic.isComplex(from)) return false;
	}
	else {
		from = Arithmetic.getIntegerOne(session);
	}
	
	// to
	if (!big.children[n == 3 ? 2 : 3].isInternalNumber()) return false;
	let to = big.children[n == 3 ? 2 : 3].get("Value");
	if (Arithmetic.isComplex(to)) return false;
	
	// step
	let step;
	if (n == 5) {
		if (!big.children[4].isInternalNumber()) return false;
		step = big.children[4].get("Value");
		if (Arithmetic.isComplex(step)) return false;
	}
	else {
		step = Arithmetic.getIntegerOne(session);
	}
	
	if (step.isZero()) return false;
	
	// sign
	let negative = step.isNegative();
	
	result = Formulae.createExpression(
		isBigEquivalence ?
		"Logic.Equivalence" :
		"Logic.ExclusiveDisjunction"
	);
	
	//////////////////////////////////////
	
	result.createScope();
	let scopeEntry = new ScopeEntry();
	result.putIntoScope(symbol.get("Name"), scopeEntry, false);
	
	big.replaceBy(result);
	
	let arg = big.children[0];
	let clone, tag;
	let count = 0;
	
	filling: while (true) {
		if (negative) {
			if (Arithmetic.comparison(from, to, session) < 0) {
				break filling;
			}
		}
		else {
			if (Arithmetic.comparison(from, to, session) > 0) {
				break filling;
			}
		}
		
		scopeEntry.setValue(Arithmetic.createInternalNumber(from, session));
		
		result.addChild(clone = arg.clone());
		n = result.children.length;
		
		clone = await session.reduceAndGet(clone, n - 1);
		tag = clone.getTag();
		
		if (isBigEquivalence) {
			if (tag === "Logic.False") {
				++count;
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.True") {
				result.removeChildAt(n - 1);
			}
		}
		else {
			if (tag === "Logic.True") {
				++count;
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.False") {
				result.removeChildAt(n - 1);
			}
		}
		
		from = Arithmetic.addition(from, step, session);
	}
	
	result.removeScope();
	
	n = result.children.length;
	if (n === 0) {
		if (isBigEquivalence) {
			result.replaceBy(Formulae.createExpression(count % 2 === 1 ? "Logic.False" : "Logic.True"));
		}
		else {
			result.replaceBy(Formulae.createExpression(count % 2 === 1 ? "Logic.True" : "Logic.False"));
		}
	}
	else if (n === 1) {
		if (count % 2 === 1) {
			result.replaceBy(
				Formulae.createExpression(
					"Logic.Negation",
					result.children[0]
				)
			);
		}
		else {
			result.replaceBy(result.children[0]);
		}
	}
	else {
		if (count % 2 === 1) {
			let other = Formulae.createExpression(isBigEquivalence ? "Logic.ExclusiveDisjunction" : "Logic.Equivalence");
			result.replaceBy(other);
			for (let i = 0; i < n; ++i) {
				other.addChild(result.children[i]);
			}
		}
	}
	
	return true;
};

const bigEquivalenceXORIn = async (big, session) => {
	let n = big.children.length;
	if (n !== 3) return false;
	
	let isBigEquivalence = big.getTag() === "Logic.BigEquivalence";
	
	let symbol = big.children[1];
	if (symbol.getTag() !== "Symbolic.Symbol") {
		return false;
	}
	
	let list = await session.reduceAndGet(big.children[2], 2);
	if (list.getTag() !== "List.List") {
		return false;
	}
	
	let arg = big.children[0];
	let clone, tag;
	let count = 0;
	
	let result = Formulae.createExpression(
		isBigEquivalence ?
		"Logic.Equivalence" :
		"Logic.ExclusiveDisjunction"
	);
	
	big.replaceBy(result);
	
	result.createScope();
	let scopeEntry = new ScopeEntry();
	result.putIntoScope(symbol.get("Name"), scopeEntry, false);
	
	for (let i = 0, m = list.children.length; i < m; ++i) {
		scopeEntry.setValue(list.children[i].clone());
		
		result.addChild(clone = arg.clone());
		n = result.children.length;
		
		result.unlockScope();
		clone = await session.reduceAndGet(clone, n - 1);
		result.lockScope();
		tag = clone.getTag();
		
		if (isBigEquivalence) {
			if (tag === "Logic.False") {
				++count;
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.True") {
				result.removeChildAt(n - 1);
			}
		}
		else {
			if (tag === "Logic.True") {
				++count;
				result.removeChildAt(n - 1);
			}
			else if (tag === "Logic.False") {
				result.removeChildAt(n - 1);
			}
		}
	}
	
	result.removeScope();
	
	n = result.children.length;
	if (n === 0) {
		if (isBigEquivalence) {
			result.replaceBy(Formulae.createExpression(count % 2 === 1 ? "Logic.False" : "Logic.True"));
		}
		else {
			result.replaceBy(Formulae.createExpression(count % 2 === 1 ? "Logic.True" : "Logic.False"));
		}
	}
	else if (n === 1) {
		if (count % 2 === 1) {
			result.replaceBy(
				Formulae.createExpression(
					"Logic.Negation",
					result.children[0]
				)
			);
		}
		else {
			result.replaceBy(result.children[0]);
		}
	}
	else {
		if (count % 2 === 1) {
			let other = Formulae.createExpression(isBigEquivalence ? "Logic.ExclusiveDisjunction" : "Logic.Equivalence");
			result.replaceBy(other);
			for (let i = 0; i < n; ++i) {
				other.addChild(result.children[i]);
			}
		}
	}
	
	return true;
};

Logic.toNumber = async (toNumber, session) => {
	let expr = toNumber.children[0];
	let tag = expr.getTag();
	
	if (tag === "Logic.True" || tag === "Logic.False") {
		toNumber.replaceBy(
			Arithmetic.createInternalNumber(
				tag === "Logic.True" ?
				Arithmetic.getIntegerOne(session) :
				Arithmetic.Zero(session),
				session
			)
		);
		//session.log("Conversion to number");
		return true;
	}
	
	return false; // Ok, other forms of ToNumber
};

Logic.setReducers = () => {
	ReductionManager.addReducer("Logic.Negation", Logic.notReducer, "Logic.notReducer");
	ReductionManager.addReducer("Logic.Negation", Logic.notNot,     "Logic.notNot");
	
	ReductionManager.addReducer("Logic.Conjunction", Logic.andReducer, "Logic.andReducer", { special: true });
	ReductionManager.addReducer("Logic.Disjunction", Logic.orReducer,  "Logic.orReducer",  { special: true });
	
	ReductionManager.addReducer("Logic.Implication",          Logic.conditionalReducer, "Logic.conditionalReducer");
	ReductionManager.addReducer("Logic.Equivalence",          Logic.equivalenceReducer, "Logic.equivalenceReducer");
	ReductionManager.addReducer("Logic.ExclusiveDisjunction", Logic.exclusiveOrReducer, "Logic.exclusiveOrReducer");
	
	ReductionManager.addReducer("Logic.BigConjunction", bigConjunctionDisjunction,   "bigConjunctionDisjunction",   { special: true });
	ReductionManager.addReducer("Logic.BigConjunction", bigConjunctionDisjunctionIn, "bigConjunctionDisjunctionIn", { special: true });
	
	ReductionManager.addReducer("Logic.BigDisjunction", bigConjunctionDisjunction,   "bigConjunctionDisjunction",   { special: true });
	ReductionManager.addReducer("Logic.BigDisjunction", bigConjunctionDisjunctionIn, "bigConjunctionDisjunctionIn", { special: true });
	
	ReductionManager.addReducer("Logic.BigEquivalence", bigEquivalenceXOR,   "bigEquivalenceXOR",   { special: true });
	ReductionManager.addReducer("Logic.BigEquivalence", bigEquivalenceXORIn, "bigEquivalenceXORIn", { special: true });
	
	ReductionManager.addReducer("Logic.BigExclusiveDisjunction", bigEquivalenceXOR,   "bigEquivalenceXOR",   { special: true });
	ReductionManager.addReducer("Logic.BigExclusiveDisjunction", bigEquivalenceXORIn, "bigEquivalenceXORIn", { special: true });
	
	ReductionManager.addReducer("Math.Arithmetic.ToNumber", Logic.toNumber, "Logic.toNumber");
};

