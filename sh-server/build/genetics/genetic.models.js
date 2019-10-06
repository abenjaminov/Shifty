"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
class Gene {
    constructor(roomId, profession, profile, importance, fitness = 0) {
        this.roomId = roomId;
        this.profession = profession;
        this.profile = profile;
        this.importance = importance;
        this.fitness = fitness;
    }
    clone() {
        return new Gene(this.roomId, this.profession, this.profile, this.importance);
    }
    isGood() {
        return this.profile.professions.find((x) => x.id == this.profession.id) != undefined;
    }
    get isEmpty() {
        return this.roomId === -1;
    }
    static Empty(number) {
        var gene = new Gene(-1, models_1.Tag.Empty(), undefined, undefined, 0);
        return gene;
    }
}
exports.Gene = Gene;
class Chromosome {
    constructor() {
        this.genes = [];
        this.fitness = 0;
    }
    findGeneForSwitch(geneToSwitch) {
        var availableGenes = this.genes.filter(g => !g.isGood());
        for (let gene of availableGenes) {
            if (gene != geneToSwitch) {
                var candidateHasProfession = gene.profile.professions.find((p) => geneToSwitch.profession.id == p.id);
                if ((gene.profile.isEmpty || candidateHasProfession)) {
                    return gene;
                }
            }
        }
        return undefined;
    }
    calculateFitness() {
        for (let gene of this.genes) {
            gene.fitness = 0;
            if (!gene.profile.isEmpty) {
                if (gene.profile.professions.find((p) => p.id == gene.profession.id)) {
                    if (gene.importance == models_1.ConditionImportance.Required) {
                        gene.fitness = 2;
                    }
                    else if (gene.importance == models_1.ConditionImportance.NiceToHave) {
                        gene.fitness = 1;
                    }
                }
            }
        }
        this.fitness = this.genes.map(x => x.fitness).reduce((total, number) => total += number);
    }
}
exports.Chromosome = Chromosome;
class Population {
    constructor(generation) {
        this.generation = generation;
        this.chromosomes = [];
        this.fitness = 0;
    }
    calculateFitness() {
        for (let chromosome of this.chromosomes) {
            chromosome.calculateFitness();
        }
        this.fitness = this.chromosomes.map(c => c.fitness).reduce((max, fitness) => {
            if (fitness > max) {
                max = fitness;
            }
            return max;
        });
    }
}
exports.Population = Population;
//# sourceMappingURL=genetic.models.js.map