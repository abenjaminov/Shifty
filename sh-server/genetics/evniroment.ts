import { Chromosome, Gene, Population } from "./genetic.models";
import { Profile, Room, ConditionImportance, Tag, Condition, ConditionType } from "../models/models";
import Enumerable, { IEnumerable, IGrouping } from "linq";
import { DbContext } from "../database/database";

class NormalizedFitness
{
    constructor(public value:number,public chromosomeIndex:number) {}
}

class ChromosomeCouple {
    chromosome1!: Chromosome;
    chromosome2!: Chromosome;
}

export class GeneticEnviroment {

    static test() {
        var GEV = new GeneticEnviroment();

        var Senior:Tag = { id: 1,name:"Senior"};
        var Intern:Tag = { id: 2,name:"Intern"};
        var SeniorA:Tag = { id: 3,name:"Senior A"};
        var SeniorB:Tag = { id: 4,name: "Senior B"};
        var SeniorC:Tag = { id: 5,name: "Senior C"};

        var rooms: Room[] = [];
        rooms.push({ id: 1, name: "Room 1", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(Senior, 1, ConditionImportance.Required));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Senior, 1, ConditionImportance.NiceToHave ));

        rooms.push({ id: 2, name: "Room 2", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorA, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.Required ));

        rooms.push({ id: 3, name: "Room 3", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorB, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.Required ));

        rooms.push({ id: 4, name: "Room 4", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorC, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorC, 1, ConditionImportance.NiceToHave ));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.Required ));

        rooms.push({ id: 5, name: "Room 5", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(Senior, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.NiceToHave ));

        rooms.push({ id: 6, name: "Room 6", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorA, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorA, 1, ConditionImportance.NiceToHave ));

        rooms.push({ id: 7, name: "Room 7", conditions: []});
        rooms[2].conditions.push(new Condition(SeniorB, 1, ConditionImportance.Required ));
        rooms[2].conditions.push(new Condition(Intern, 1, ConditionImportance.Required ));

        rooms.push({ id: 8, name: "Room 8", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorC, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Senior, 1, ConditionImportance.NiceToHave ));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.NiceToHave ));

        rooms.push({ id: 9, name: "Room 9", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(Senior, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Senior, 1, ConditionImportance.NiceToHave ));

        rooms.push({ id: 10, name: "Room 10", conditions: []});
        rooms[rooms.length - 1].conditions.push(new Condition(SeniorA, 1, ConditionImportance.Required ));
        rooms[rooms.length - 1].conditions.push(new Condition(Intern, 1, ConditionImportance.Required ));

        var profiles: Profile[] = [];

        var profile: Profile = new Profile();
        profile.id = "1";
        profile.name = "Profile 1"
        profile.professions.push(Senior);
        profiles.push(profile);

        //profile = new Profile();profile.id = "2"; profile.name = "Profile 2";
        //profile.professions.push(Senior);
        //profiles.push(profile);
        profile = new Profile();profile.id = "3"; profile.name = "Profile 3";
        profile.professions.push(Senior);
        profiles.push(profile);
        profile = new Profile();profile.id = "4"; profile.name = "Profile 4";
        profile.professions.push(Senior);
        profiles.push(profile);
        profile = new Profile();profile.id = "5"; profile.name = "Profile 5";
        profile.professions.push(Senior);
        profiles.push(profile);
        // profile = new Profile();profile.id = "6"; profile.name = "Profile 6";
        // profile.professions.push(Senior);
        // profiles.push(profile);

        profile = new Profile();profile.id = "7"; profile.name = "Profile 7";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "8"; profile.name = "Profile 8";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "9"; profile.name = "Profile 9";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "10"; profile.name = "Profile 10";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "11"; profile.name = "Profile 11";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "12"; profile.name = "Profile 12";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "13"; profile.name = "Profile 13";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "14"; profile.name = "Profile 14";
        profile.professions.push(Intern);
        profiles.push(profile);
        profile = new Profile();profile.id = "15"; profile.name = "Profile 15";
        profile.professions.push(Intern);
        profiles.push(profile);

        profile = new Profile();profile.id = "16"; profile.name = "Profile 16";
        profile.professions.push(SeniorA);
        profiles.push(profile);
        profile = new Profile();profile.id = "17"; profile.name = "Profile 17";
        profile.professions.push(SeniorA);
        profiles.push(profile);
        // profile = new Profile();profile.id = "18"; profile.name = "Profile 18";
        // profile.professions.push(SeniorA);
        // profiles.push(profile);
        profile = new Profile();profile.id = "19"; profile.name = "Profile 19";
        profile.professions.push(SeniorA);
        profiles.push(profile);

        profile = new Profile();profile.id = "20"; profile.name = "Profile 20";
        profile.professions.push(SeniorB);
        profiles.push(profile);
        profile = new Profile();profile.id = "21"; profile.name = "Profile 21";
        profile.professions.push(SeniorB);
        profiles.push(profile);

        profile = new Profile();profile.id = "22"; profile.name = "Profile 22";
        profile.professions.push(SeniorC);
        profiles.push(profile);
        profile = new Profile();profile.id = "23"; profile.name = "Profile 23";
        profile.professions.push(SeniorC);
        profiles.push(profile);
        // profile = new Profile();profile.id = "24"; profile.name = "Profile 24";
        // profile.professions.push(SeniorC);
        // profiles.push(profile);

        var solution = GEV.run(profiles, rooms);

        return solution;
    }

    start(context: DbContext) {
        var selectProfiles = context.select(Profile, true);
        var selectRooms = context.select(Room, true);
        var selectConditions = context.select(Condition, true);

        Promise.all([selectProfiles, selectRooms, selectConditions]).then(result => {
            var profiles = result[0];
            var rooms = result[1];
            var conditions = result[2];
        });
    }

    fixRooms(rooms: Array<Room>) {
        let roomsInternal = Object.assign([], rooms);

        for(let room of rooms) {
            room.conditions = room.conditions.filter(c => c.type != ConditionType.Permanent);
        }

        return roomsInternal;
    }



    run(profiles: Profile[], rooms: Room[]) : Chromosome | undefined {
        try {
            var crossoverProbability = 0.35;
        var mutationProbability = 1;
        var elitismRate = 0.2;

        let roomsInternal = this.fixRooms(rooms);

        var population = this.generatePopulation(profiles,roomsInternal,20);
        var maxPopulationFitness = this.calculateMaximumAvailableFitness(profiles, roomsInternal);

        population.calculateFitness();
        var bestPopulation = new Population(0);

        while(population.fitness < maxPopulationFitness) {
            var newPopulation = new Population(population.generation + 1);

            while(newPopulation.chromosomes.length < population.chromosomes.length) {
                var couple = this.selection(population);

                if(!couple) {
                    couple = { chromosome1: population.chromosomes[0], chromosome2: population.chromosomes[1] };
                }

                //couple = this.crossover(couple, crossoverProbability);

                this.mutation(couple.chromosome1, mutationProbability);
                this.mutation(couple.chromosome2, mutationProbability);

                newPopulation.chromosomes.push(couple.chromosome1, couple.chromosome2);
            }

            newPopulation.calculateFitness();

            newPopulation = this.elitism(population, newPopulation, elitismRate);

            population = newPopulation;

            population.calculateFitness();

            console.log("Generation : " + population.generation + " Fitness : " + population.fitness);

            if (population.fitness > bestPopulation.fitness)
                    bestPopulation = population;
        }

        var bestChromosome = Enumerable.from(population.chromosomes).orderByDescending((x: { fitness: any; }) => x.fitness).first()
        }
        catch(error) {
            console.log(error);
        }
        

        return bestChromosome;
    }

    elitism(oldPopulation: Population, newPopulation: Population, elitismRate: number): Population {
        var elitePopulation = new Population(newPopulation.generation);
        var nOfElites = Math.round(oldPopulation.chromosomes.length * elitismRate);
        var nOfChromosomes = newPopulation.chromosomes.length;

        var oldElites = Enumerable.from(oldPopulation.chromosomes).orderByDescending((x: { fitness: any; }) => x.fitness).take(nOfElites);
        var bestOfNew = Enumerable.from(newPopulation.chromosomes).orderByDescending((x: { fitness: any; }) => x.fitness).take(nOfChromosomes - nOfElites);

        elitePopulation.chromosomes.push(...oldElites);
        elitePopulation.chromosomes.push(...bestOfNew);

        return elitePopulation;
    }

    mutation(chromosome: Chromosome, mutationProbability: number) {
        var mutatedGenes: Gene[] = [];

        var notGoodOrNiceToHaveGenes = Enumerable.from(chromosome.genes).where((g: Gene) => !g.isGood() || g.importance == ConditionImportance.NiceToHave);

        for(let gene of notGoodOrNiceToHaveGenes) {
            var random = Math.random();

            if(random < mutationProbability && mutatedGenes.indexOf(gene) == -1) {
                var replacement = chromosome.findGeneForSwitch(gene);

                if(replacement) {
                    var temp = replacement.profile;
                     replacement.profile = gene.profile;
                    gene.profile = temp;

                    mutatedGenes.push(gene);
                    mutatedGenes.push(replacement);
                }
            }
        }
    }

    crossover(couple:ChromosomeCouple, crossoverProbability: number): ChromosomeCouple {
        var upperbound = couple.chromosome1.genes.length - 1;
        var lowerBound = 1;
        var firstCrossoverPoint = Math.round((upperbound - lowerBound) * Math.random() + lowerBound);
        lowerBound = firstCrossoverPoint + 1;
        var secondCrossoverPoint = Math.round((upperbound - lowerBound) * Math.random() + lowerBound);

        var chromosome1Enumerable = Enumerable.from(couple.chromosome1.genes);
        var chromosome2Enumerable = Enumerable.from(couple.chromosome2.genes);

        var parent1FirstPart = chromosome1Enumerable.where((g: any, i: number) => i <= firstCrossoverPoint).select((x: { clone: () => Gene; }) => x.clone()).toArray();
        var parent1SecondPart = chromosome1Enumerable.where((g: any, i: number) => i > firstCrossoverPoint && i <= secondCrossoverPoint).select((x: { clone: () => Gene; }) => x.clone()).toArray();
        var parent1ThirdPart = chromosome1Enumerable.where((g: any, i: number) => i > secondCrossoverPoint && i <= upperbound).select((x: { clone: () => Gene; }) => x.clone()).toArray();

        var parent2FirstPart = chromosome2Enumerable.where((g: any, i: number) => i <= firstCrossoverPoint).select((x: { clone: () => Gene; }) => x.clone()).toArray();
        var parent2SecondPart = chromosome2Enumerable.where((g: any, i: number) => i > firstCrossoverPoint && i <= secondCrossoverPoint).select((x: { clone: () => Gene; }) => x.clone()).toArray();
        var parent2ThirdPart = chromosome2Enumerable.where((g: any, i: number) => i > secondCrossoverPoint && i <= upperbound).select((x: { clone: () => Gene; }) => x.clone()).toArray();

        var child1 = new Chromosome();
        child1.genes.push(...parent1FirstPart);
        child1.genes.push(...parent2SecondPart);
        child1.genes.push(...parent1ThirdPart);

        var child2 = new Chromosome();
        child2.genes.push(...parent2FirstPart);
        child2.genes.push(...parent1SecondPart);
        child2.genes.push(...parent2ThirdPart);

        var doubleChild1Indexes = Enumerable.from(child1.genes).select((g,i) => {
            return {gene: g, index: i}
        }).groupBy((x: any ) => x.gene.profile.id).where((x: IGrouping<string, any>) => x.count() > 1).
            selectMany((x: IGrouping<string, any>) => x.toArray().map(a => a.index)).toArray();

        var doubleChild2Indexes = Enumerable.from(child2.genes).select((g,i) => {
            return {gene: g, index: i}
        }).groupBy((x: any ) => x.gene.profile.id).where((x: IGrouping<string, any>) => x.count() > 1).
            selectMany((x: IGrouping<string, any>) => x.toArray().map(a => a.index)).toArray();

        var firstChildIndex = 0;
        var secondChildIndex = 0;

        for (let i = 0; i < doubleChild1Indexes.length; i++)
        {
            firstChildIndex = doubleChild1Indexes[i];
            secondChildIndex = doubleChild2Indexes[i];

            var temp = child2.genes[secondChildIndex].profile;
            child2.genes[secondChildIndex].profile = child1.genes[firstChildIndex].profile;
            child1.genes[firstChildIndex].profile = temp;
        }

        var item1: Chromosome;
        var item2: Chromosome

        var randomNumber = Math.random();

        if (randomNumber > crossoverProbability)
        {
            item1 = couple.chromosome1;
        }
        else
        {
            item1 = child1;
        }

        randomNumber = Math.random();

        if (randomNumber > crossoverProbability)
        {
            item2 = couple.chromosome2;
        }
        else
        {
            item2 = child2;
        }

        return { chromosome1: item1, chromosome2: item2 };
    }

    selection(population: Population): ChromosomeCouple | undefined {
        var sortedChromosomes = Enumerable.from(population.chromosomes).orderBy((x: { fitness: any; }) => x.fitness).distinct((c: { fitness: any; }) => c.fitness).toArray();

        if(sortedChromosomes.length == 1) {
            return undefined;
        }

        var fitnessSum = Enumerable.from(sortedChromosomes).sum((c: { fitness: any; }) => c.fitness);

        var normalizedFitnesses = Enumerable.from(sortedChromosomes).select((c: { fitness: number; },index: number) => {return new NormalizedFitness(c.fitness / fitnessSum, index)}).
                                            orderBy((x: { value: any; }) => x.value).toArray();
        var normalizedFitnessSum = 0.0;
        var cumilatedSum: number[] = [];

        for(let normalizedFitness of normalizedFitnesses) {
            normalizedFitnessSum += normalizedFitness.value;
            cumilatedSum.push(normalizedFitnessSum);
        }

        var firstChromosomeIndex = this.getChromosomeIndexForSelection(normalizedFitnesses, cumilatedSum);
        var secondChromosomeIndex = firstChromosomeIndex;

        while (secondChromosomeIndex == firstChromosomeIndex)
        {
            secondChromosomeIndex = this.getChromosomeIndexForSelection(normalizedFitnesses, cumilatedSum);
        }

        return { chromosome1: sortedChromosomes[firstChromosomeIndex], chromosome2: sortedChromosomes[secondChromosomeIndex] };
    }

    getChromosomeIndexForSelection(normalizedFitnesses: NormalizedFitness[], cumilatedSum: number[]) {
        var chromosomeIndex = -1;
        var randomDouble = Math.random();

        for(let index = 0; index < normalizedFitnesses.length && chromosomeIndex == -1; index++) {
            if(randomDouble <= cumilatedSum[index]) {
                return index;
            }
        }

        return -1;
    }

    generatePopulation(profiles: Profile[], rooms: Room[], numberOfChromosomes: number) {
        var result = new Population(0);

        var geneTemplates = this.getGeneTemplates(rooms);

        var missingProfiles = geneTemplates.length - profiles.length;
        var emptyProfiles: Profile[] = [];

        for (let i = 0; i < missingProfiles; i++)
        {
            emptyProfiles.push(Profile.Empty(i + 1));
        }

        for (let i = 0; i < numberOfChromosomes; i++) {
            let chromosome = new Chromosome();

            let randomProfiles = Enumerable.from(profiles).orderBy((p: any) => Math.random()).toArray();

            for(let j = 0; j < geneTemplates.length; j++) {
                let newGene = new Gene(
                    geneTemplates[j].roomId,
                    geneTemplates[j].profession,
                    geneTemplates[j].profile,
                    geneTemplates[j].importance
                );

                if (j < randomProfiles.length)
                {
                    newGene.profile = randomProfiles[j];
                }
                else
                {
                    newGene.profile = emptyProfiles[j - randomProfiles.length];
                }

                chromosome.genes.push(newGene);
            }

            result.chromosomes.push(chromosome);
        }

        return result;
    }

    getGeneTemplates(rooms: Room[]) {
        var geneTemplates: Gene[] = [];

        for(let room of rooms) {
            for(let condition of room.conditions) {
                for (let index = 0; index < condition.amount; index++) {
                    let geneTemplate = new Gene(room.id, condition.profession, Profile.Empty(-1), condition.importance);

                    geneTemplates.push(geneTemplate);
                }
            }
        }

        return geneTemplates;
    }

    calculateMaximumAvailableFitness(profiles: Profile[], rooms: Room[]) {
        var maxFitness = 0;
        var countByTags = Enumerable.from(rooms).selectMany((r: Room) => r.conditions).
                                    groupBy((x: Condition ) => {return { tagId: x.profession.id, importance: x.importance }}, (x: Condition) => x, (key: { tagId: number; importance: ConditionImportance; }, elements: IEnumerable<Condition>) => {
                                        return Enumerable.from(elements).where((c: Condition) => c.profession.id == key.tagId && c.importance == key.importance).toArray()
                                    }).toDictionary((x: Condition[]) => {return { tag: x[0].profession, importance: x[0].importance }}, (c: { length: any; }) => c.length);

        for(let valuePair of countByTags.toEnumerable()) {
            if (valuePair.key.importance == ConditionImportance.Required)
            {
                maxFitness += 2 * valuePair.value;
            }
            else if (valuePair.key.importance == ConditionImportance.NiceToHave)
            {
                maxFitness += 1 * valuePair.value;
            }
        }

        var usedProfiles: Profile[] = [];
        var requiredConditions = countByTags.toEnumerable().where((x: { key: { importance: ConditionImportance; }; }) => x.key.importance == ConditionImportance.Required);
        var niceToHaveConditions = countByTags.toEnumerable().where((x: { key: { importance: ConditionImportance; }; }) => x.key.importance == ConditionImportance.NiceToHave);

        var profilesEnumerable = Enumerable.from(profiles);

        for(let reqCondition of requiredConditions) {
            var relevantProfiles = profilesEnumerable.where((x: { professions: { find: (arg0: (x: any) => boolean) => any; }; id: string; }) => x.professions.find((x: { id: any; }) => x.id == reqCondition.key.tag.id) != undefined && !usedProfiles.find(up => x.id == up.id)).take(reqCondition.value).toArray();

            var difference = reqCondition.value - relevantProfiles.length;

            if(difference > 0) {
                if(reqCondition.key.importance == ConditionImportance.Required) {
                    maxFitness -= 2 * difference;
                }
                else if(reqCondition.key.importance == ConditionImportance.NiceToHave) {
                    maxFitness -= 1 * difference;
                }
            }

            usedProfiles.push(...relevantProfiles);
        }

        for(let reqCondition of niceToHaveConditions) {
            var relevantProfiles = profilesEnumerable.where((x: { professions: { find: (arg0: (x: any) => boolean) => any; }; id: string; }) => x.professions.find((x: { id: any; }) => x.id == reqCondition.key.tag.id) != undefined && !usedProfiles.find(up => x.id == up.id)).take(reqCondition.value).toArray();

            var difference = reqCondition.value - relevantProfiles.length;

            if(difference > 0) {
                if(reqCondition.key.importance == ConditionImportance.Required) {
                    maxFitness -= 2 * difference;
                }
                else if(reqCondition.key.importance == ConditionImportance.NiceToHave) {
                    maxFitness -= 1 * difference;
                }
            }

            usedProfiles.push(...relevantProfiles);
        }

        return maxFitness;
    }
}
