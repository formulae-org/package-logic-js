/*
Fōrmulæ logic package. Module for edition.
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

"use strict";

export class Logic extends Formulae.Package {}

Logic.editionPredicate = function(n) {
	let s = "";
	do {
		s = prompt(Logic.messages.enterPredicate, s);
	}
	while (s == "");
	
	if (s == null) return;
	
	let newExpression = Formulae.createExpression("Logic.Predicate");
	newExpression.set("Name", s);
	
	for (let i = 0; i < n; ++i) newExpression.addChild(new Expression.Null());
	
	Formulae.sExpression.replaceBy(newExpression);
	Formulae.sHandler.prepareDisplay();
	Formulae.sHandler.display();
	Formulae.setSelected(Formulae.sHandler, n == 0 ? newExpression : newExpression.children[0], false);
}

Logic.actionPredicate = {
	isAvailableNow: () => Formulae.sHandler.type != Formulae.ROW_OUTPUT,
	getDescription: () => Logic.messages.actionPredicate,
	doAction: () => {
		let s = Formulae.sExpression.get("Name");
		do {
			s = prompt(Logic.messages.updatePredicate, s);
		}
		while (s == "");
		
		if (s == null) return;
		
		Formulae.sExpression.set("Name", s);
		
		Formulae.sHandler.prepareDisplay();
		Formulae.sHandler.display();
		Formulae.setSelected(Formulae.sHandler, Formulae.sExpression, false);
	}
};

Logic.setEditions = function() {
	// Truth values (replacing) — the colored literals rendered through the engine
	Formulae.addEdition(this.messages.pathLogic, '<expression tag="Logic.True"/>',  this.messages.leafTrue,  () => Expression.replacingEdition("Logic.True"));
	Formulae.addEdition(this.messages.pathLogic, '<expression tag="Logic.False"/>', this.messages.leafFalse, () => Expression.replacingEdition("Logic.False"));

	// Negation (wrapper) — ¬▮ / not ▮, depending on the operator style
	Formulae.addWrapperEditions(this.messages, "Logic", "Logic", [ "Negation" ]);

	// Binary connectives — ▮ ∘ ▯, operator style-dependent
	[ "Conjunction", "Disjunction", "Implication", "Equivalence", "ExclusiveDisjunction" ].forEach(
		tag => Formulae.addBinaryEdition(this.messages, "Logic", tag, "Logic." + tag)
	);

	// Big (iterated) connectives — SummationLikeSymbol with child 0 highlighted; type 4 = range, type 3 = list.
	// Replaces the former big_*.png icons with engine-rendered SVG previews.
	[ "Conjunction", "Disjunction", "Equivalence", "ExclusiveDisjunction" ].forEach(op => {
		let tag = "Logic.Big" + op;
		[ [ 4, "Range" ], [ 3, "List" ] ].forEach(([ type, variant ]) => {
			let icon = `<expression tag="${tag}"><expression tag="Visualization.Selected"><expression tag="Null"/></expression>`
				+ '<expression tag="Null"/>'.repeat(type - 1)
				+ '</expression>';
			Formulae.addEdition(
				this.messages["pathBig" + op],
				icon,
				this.messages["leafBig" + op + variant],
				() => Expression.multipleEdition(tag, type, 0)
			);
		});
	});

	// Predicates (replacing) — atomic P and P(▯); the actual name is prompted on creation
	Formulae.addEdition(this.messages.pathLogic, '<expression tag="Logic.Predicate" Name="P"/>',                                     this.messages.leafPredicate0, () => Logic.editionPredicate(0));
	Formulae.addEdition(this.messages.pathLogic, '<expression tag="Logic.Predicate" Name="P"><expression tag="Null"/></expression>', this.messages.leafPredicateN, () => Logic.editionPredicate(1));

	// First-order quantifiers — ∀ / ∃
	Formulae.addBinaryEdition(this.messages, "FirstOrder", "ForAll", "Logic.ForAll");
	Formulae.addBinaryEdition(this.messages, "FirstOrder", "Exists", "Logic.Exists");
};

Logic.setActions = function() {
	Formulae.addAction("Logic.Predicate", Logic.actionPredicate);
};
