/*
Fōrmulæ logic package. Module for reduction.
Copyright (C) 2015-2025 Laurence R. Ugalde

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
	ReductionManager.addReducer("Logic.Disjunction", Logic.orReducer,  "Logic.orReducer", { special: true });
	
	ReductionManager.addReducer("Logic.Implication",          Logic.conditionalReducer, "Logic.conditionalReducer");
	ReductionManager.addReducer("Logic.Equivalence",          Logic.equivalenceReducer, "Logic.equivalenceReducer");
	ReductionManager.addReducer("Logic.ExclusiveDisjunction", Logic.exclusiveOrReducer, "Logic.exclusiveOrReducer");

	ReductionManager.addReducer("Math.Arithmetic.ToNumber", Logic.toNumber, "Logic.toNumber");
};
