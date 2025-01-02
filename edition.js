/*
Fōrmulæ logic package. Module for edition.
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

	Formulae.addEdition(this.messages.pathLogic, null, this.messages.leafPredicate0, () => Logic.editionPredicate(0));
	Formulae.addEdition(this.messages.pathLogic, null, this.messages.leafPredicateN, () => Logic.editionPredicate(1));

	Formulae.addEdition(this.messages.pathFirstOrder, null, this.messages.leafForAll, () => Expression.binaryEdition("Logic.ForAll", false));
	Formulae.addEdition(this.messages.pathFirstOrder, null, this.messages.leafExists, () => Expression.binaryEdition("Logic.Exists", false));
};

Logic.setActions = function() {
	Formulae.addAction("Logic.Predicate", Logic.actionPredicate);
};
