/*
Fōrmulæ logic package. Module for expression definition & visualization.
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

Logic.operatorType = 0; // 0: mnemonic (AND, OR, NOT, ...), 1: logic symbols (∧, ∨, ¬, ...)

Logic.Predicate = class extends Expression {
	constructor() {
		super();
		this.color = "#7F7F00";
	}

	getTag() { return "Logic.Predicate"; }
	getName() { return Logic.messages.namePredicate; }
	canHaveChildren(count) { return true; }
	getLiteral() { return this.literal; }
	getMnemonic() { return this.literal; }

	set(name, value) {
		if (name == "Name") {
			this.literal = value;
		}
		else {
			super.set(name, value);
		}
	}
	
	get(name) {
		if (name == "Name") {
			return this.literal;
		}
		
		super.get(name);
	}
	
	getSerializationNames() {
		return [ "Name" ];
	}
	
	async getSerializationStrings() {
		return [ this.literal ];
	}
	
	setSerializationStrings(strings, promises) {
		if (strings[0].length == 0) {
			throw "Invalid name of predicate";
		}
		
		this.set("Name", strings[0]);
	}
	
	prepareDisplay(context) {
		if (this.children.length == 0) {
			this.prepareDisplayAsLiteral(context);
		}
		else {
			this.prepareDisplayAsFunction(context);
		}
	}

	display(context, x, y) {
		if (this.children.length == 0) {
			this.displayAsLiteral(context, x, y);
		}
		else {
			this.displayAsFunction(context, x, y);
		}
	}
};

const Big = class extends Expression.SummationLikeSymbol {
	getChildName(index) {
		switch (index) {
			case 0: return Logic.messages.childBig0;
			case 1: return Logic.messages.childBig1;
			case 2: return this.children.length == 3 ? Logic.messages.childBig23 : Logic.messages.childBig2X;
			case 3: return Logic.messages.childBig3;
			case 4: return Logic.messages.childBig4;
		}
	}
}

const BigConjunction = class extends Big {
	constructor() {
		super();
		this.symbol = "∧";
	}
	
	getTag() { return "Logic.BigConjunction"; }
	getName() { return Logic.messages.nameBigConjunction; }
}

const BigDisjunction = class extends Big {
	constructor() {
		super();
		this.symbol = "∨";
	}
	
	getTag() { return "Logic.BigDisjunction"; }
	getName() { return Logic.messages.nameBigDisjunction; }
}

const BigEquivalence = class extends Big {
	constructor() {
		super();
		this.symbol = "⟺";
		//this.symbol = "⟺⇔≡☰";
	}
	
	getTag() { return "Logic.BigEquivalence"; }
	getName() { return Logic.messages.nameBigEquivalence; }
}

const BigExclusiveDisjunction = class extends Big {
	constructor() {
		super();
		this.symbol = "⊕";
	}
	
	getTag() { return "Logic.BigExclusiveDisjunction"; }
	getName() { return Logic.messages.nameBigExclusiveDisjunction; }
}

Logic.setExpressions = function(module) {
	Formulae.setExpression(module, "Logic.True", {
		clazz:      Expression.Literal,
		getTag:     () => "Logic.True", 
		getLiteral: () => this.messages.literalTrue, 
		getName:    () => this.messages.nameTrue,
		color:      "green"
	});
	
	Formulae.setExpression(module, "Logic.False", {
		clazz:      Expression.Literal,
		getTag:     () => "Logic.False",
		getLiteral: () => this.messages.literalFalse,
		getName:    () => this.messages.nameFalse,
		color:      "red"
	});
	
	// negation
	Formulae.setExpression(module, "Logic.Negation", {
		clazz:      Expression.PrefixedLiteral,
		getTag:     () => "Logic.Negation",
		getLiteral: () => Logic.operatorType == 0 ? this.messages.mnemonicNegation : this.messages.literalNegation,
		getName:    () => this.messages.nameNegation
	});
	
	[ "Conjunction", "Disjunction", "Implication", "Equivalence", "ExclusiveDisjunction" ].forEach(tag => Formulae.setExpression(module, "Logic." + tag, {
		clazz:       Expression.Infix,
		getTag:      () => "Logic." + tag,
		getOperator: () => Logic.operatorType == 0 ? Logic.messages["mnemonic" + tag] : Logic.messages["operator" + tag],
		getName:     () => Logic.messages["name" + tag],
		min:         tag === "Implication" ? 2 : -2,
		max:         2
	}));
	
	Formulae.setExpression(module, "Logic.BigConjunction",          BigConjunction);
	Formulae.setExpression(module, "Logic.BigDisjunction",          BigDisjunction);
	Formulae.setExpression(module, "Logic.BigEquivalence",          BigEquivalence);
	Formulae.setExpression(module, "Logic.BigExclusiveDisjunction", BigExclusiveDisjunction);
	
	Formulae.setExpression(module, "Logic.Predicate", Logic.Predicate);
	
	Formulae.setExpression(module, "Logic.ForAll", { clazz: Expression.Function, getTag: () => "Logic.ForAll", getMnemonic: () => this.messages.mnemonicForAll, getName: () => this.messages.nameForAll, min: -2, noParentheses: true });
	Formulae.setExpression(module, "Logic.Exists", { clazz: Expression.Function, getTag: () => "Logic.Exists", getMnemonic: () => this.messages.MnemonicExists, getName: () => this.messages.nameExists, min: -2, noParentheses: true });
};

Logic.isConfigurable = () => true;

Logic.onChangeOperatorStyle = function(pos) {
	Formulae.resetModal();
	
	Logic.operatorType = pos;
	Formulae.refreshHandlers();
};

Logic.onConfiguration = () => {
	let table = document.createElement("table");
	table.classList.add("bordered");
	let row = table.insertRow();
	let th = document.createElement("th"); th.setAttribute("colspan", "2"); th.appendChild(document.createTextNode(Formulae.messages.labelLogic)); row.appendChild(th);
	row = table.insertRow();
	let col = row.insertCell();
	col.appendChild(document.createTextNode(Formulae.messages.labelLogicalOperations));
	col = row.insertCell();
	
	let radio = document.createElement("input"); radio.type = "radio"; radio.addEventListener("click", () => Logic.onChangeOperatorStyle(0));
	col.appendChild(radio);
	col.appendChild(document.createTextNode(Formulae.messages.labelOperationsMnemonic));
	
	col.appendChild(document.createElement("br"));
	
	radio = document.createElement("input"); radio.type = "radio"; radio.addEventListener("click", () => Logic.onChangeOperatorStyle(1));
	col.appendChild(radio);
	col.appendChild(document.createTextNode(Formulae.messages.labelOperationsSymbol));
	
	Formulae.setModal(table);
};
