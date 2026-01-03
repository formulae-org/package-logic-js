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

'use strict';

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
	Formulae.addEdition(this.messages.pathLogic, null, this.messages.leafTrue,  () => Expression.replacingEdition("Logic.True"));
	Formulae.addEdition(this.messages.pathLogic, null, this.messages.leafFalse, () => Expression.replacingEdition("Logic.False"));
	
	Formulae.addEdition(this.messages.pathLogic, null, this.messages.leafNegation, () => Expression.wrapperEdition("Logic.Negation"));
	
	[ "Conjunction", "Disjunction", "Implication", "Equivalence", "ExclusiveDisjunction" ].forEach(
		tag => Formulae.addEdition(
			Logic.messages.pathLogic,
			null,
			Logic.messages["leaf" + tag],
			() => Expression.binaryEdition("Logic." + tag, false)
		)
	);
	
	[ 4, 3 ].forEach(type => {
		Formulae.addEdition(
			Logic.messages.pathBigConjunction,
			"packages/org.formulae.logic/img/big_conjunction" + type + ".png",
			null,
			() => Expression.multipleEdition("Logic.BigConjunction", type, 0)
		);
		Formulae.addEdition(
			Logic.messages.pathBigDisjunction,
			"packages/org.formulae.logic/img/big_disjunction" + type + ".png",
			null,
			() => Expression.multipleEdition("Logic.BigDisjunction", type, 0)
		);
		Formulae.addEdition(
			Logic.messages.pathBigEquivalence,
			"packages/org.formulae.logic/img/big_equivalence" + type + ".png",
			null,
			() => Expression.multipleEdition("Logic.BigEquivalence", type, 0)
		);
		Formulae.addEdition(
			Logic.messages.pathBigExclusiveDisjunction,
			"packages/org.formulae.logic/img/big_exclusive_disjunction" + type + ".png",
			null,
			() => Expression.multipleEdition("Logic.BigExclusiveDisjunction", type, 0)
		);
	});
	
	Formulae.addEdition(this.messages.pathLogic, null, this.messages.leafPredicate0, () => Logic.editionPredicate(0));
	Formulae.addEdition(this.messages.pathLogic, null, this.messages.leafPredicateN, () => Logic.editionPredicate(1));
	
	Formulae.addEdition(this.messages.pathFirstOrder, null, this.messages.leafForAll, () => Expression.binaryEdition("Logic.ForAll", false));
	Formulae.addEdition(this.messages.pathFirstOrder, null, this.messages.leafExists, () => Expression.binaryEdition("Logic.Exists", false));
};

Logic.setActions = function() {
	Formulae.addAction("Logic.Predicate", Logic.actionPredicate);
};
