import { Tag, ConditionImportance, Profile } from "../models/models";
import { totalmem } from "os";

export class Gene {
    constructor(public roomId: number,
                public profession: Tag,
                public profile: Profile,
                public importance: ConditionImportance,
                public fitness = 0) {}

    clone() {
        return new Gene(this.roomId, this.profession, this.profile, this.importance);
    }

    isGood() {
        return this.profile.professions.find((x:Tag) => x.id == this.profession.id) != undefined;
    }
}

export class Chromosome {
    genes: Gene[] = [];
    fitness: number = 0;

    findGeneForSwitch(geneToSwitch: Gene): Gene | undefined {
        var availableGenes = this.genes.filter(g => !g.isGood() || g.importance == ConditionImportance.NiceToHave);

        for(let gene of availableGenes) {
            if(gene != geneToSwitch) {
                var sourceHasProfession = geneToSwitch.profile.professions.find((p:Tag) => gene.profession.id == p.id);
                var candidateHasProfession = gene.profile.professions.find((p:Tag) => geneToSwitch.profession.id == p.id);

                if((geneToSwitch.profile.isEmpty || sourceHasProfession) && 
                    (gene.profile.isEmpty || candidateHasProfession)) {
                        return gene;
                    }
            }
        }

        return undefined;
    }

    calculateFitness() {
        for(let gene of this.genes) {
            gene.fitness = 0;

            if(!gene.profile.isEmpty) {
                if (gene.profile.professions.find((p:Tag) => p.id == gene.profession.id))
                {
                    if (gene.importance == ConditionImportance.Required)
                    {
                        gene.fitness = 2;
                    }
                    else if (gene.importance == ConditionImportance.NiceToHave)
                    {
                        gene.fitness = 1;
                    }
                }
            }
        }

        this.fitness = this.genes.map(x => x.fitness).reduce((total, number) => total += number);
    }
}

export class Population {
    chromosomes: Chromosome[] = [];
    fitness: number = 0;

    constructor(public generation: number) {

    }

    calculateFitness() {
        for(let chromosome of this.chromosomes) {
            chromosome.calculateFitness();
        }

        this.fitness = this.chromosomes.map(c => c.fitness).reduce((max, fitness) => {
            if(fitness > max) {
                max = fitness;
            }

            return max;
        });
    }
}